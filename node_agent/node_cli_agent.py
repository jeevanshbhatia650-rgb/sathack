"""Outbound Docker worker. Install dependencies from node_agent/requirements.txt."""
import argparse
import asyncio
import base64
import json
import os
from pathlib import Path
import random
import shlex
import shutil
import signal
import subprocess
import tempfile
import time
from urllib.parse import urlparse
import docker
import httpx
import psutil
from websockets.asyncio.client import connect
from websockets.exceptions import ConnectionClosed


class Agent:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.docker = docker.from_env()
        self.socket = None
        self.connected = asyncio.Event()
        self.stop = asyncio.Event()
        self.tasks: dict[str, asyncio.Task] = {}
        self.results: dict[str, dict] = {}
        self.containers: dict[str, object] = {}
        self.ports: dict[str, int] = {}
        self.job_tokens: dict[str, str] = {}
        self.send_lock = asyncio.Lock()

    async def send(self, frame: dict) -> None:
        while not self.stop.is_set():
            await self.connected.wait()
            async with self.send_lock:
                try:
                    await self.socket.send(json.dumps(frame))
                    return
                except ConnectionClosed:
                    self.connected.clear()

    async def heartbeat(self) -> None:
        while not self.stop.is_set():
            memory = psutil.virtual_memory()
            await self.send({"type": "HEARTBEAT", "telemetry": {
                "total_ram_mb": memory.total / 1048576, "available_ram_mb": memory.available / 1048576,
                "cpu_percent": psutil.cpu_percent(), "cpu_cores": psutil.cpu_count() or 1,
                "running_containers": len(self.containers), "ip": "", "railpack": bool(shutil.which("railpack") and os.getenv("BUILDKIT_HOST")),
                "node_type": os.getenv("OFFDOCK_NODE_TYPE", "REMOTE DOCKER"),
            }})
            await asyncio.sleep(5)

    def build(self, frame: dict) -> str:
        if frame.get("image_ref"):
            self.docker.images.pull(frame["image_ref"], auth_config=frame.get("registry_auth"))
            return frame["image_ref"]
        parsed = urlparse(frame["repo_url"])
        if parsed.scheme != "https" or parsed.hostname != "github.com":
            raise ValueError("Only HTTPS GitHub repositories are permitted")
        with tempfile.TemporaryDirectory(prefix="offdock-") as folder:
            subprocess.run(["git", "init", folder], check=True, capture_output=True)
            subprocess.run(["git", "-C", folder, "fetch", "--depth", "1", frame["repo_url"], frame["commit_sha"]],
                           check=True, capture_output=True, timeout=120)
            subprocess.run(["git", "-C", folder, "checkout", "--detach", "FETCH_HEAD"], check=True, capture_output=True)
            sha = subprocess.check_output(["git", "-C", folder, "rev-parse", "HEAD"], text=True).strip()
            if sha != frame["commit_sha"]:
                raise ValueError("Commit mismatch")
            if frame.get("mode") == "railpack":
                image_name = "offdock:" + frame["attempt_id"]
                subprocess.run(["railpack", "build", "--name", image_name, folder],
                               check=True, capture_output=True, timeout=180)
                self.docker.images.get(image_name)
                return image_name
            Path(folder, "Dockerfile.offdock").write_text(frame["dockerfile"])
            image, _ = self.docker.images.build(path=folder, dockerfile="Dockerfile.offdock", rm=True,
                                                timeout=120, network_mode="default")
            return image.id

    async def execute(self, frame: dict) -> None:
        attempt = frame["attempt_id"]
        result = {"type": "JOB_RESULT", "attempt_id": attempt}
        container = None
        input_dir = tempfile.TemporaryDirectory(prefix="offdock-inputs-")
        try:
            try:
                image = await asyncio.to_thread(self.build, frame)
            except Exception as exc:
                error = exc.stderr.decode(errors="replace") if isinstance(exc, subprocess.CalledProcessError) and exc.stderr else str(exc)
                result.update(phase="build", stderr="\n".join(error.splitlines()[-40:])[-8000:])
                return
            port = frame.get("exposed_port")
            for parent, rows in frame.get("inputs", {}).items():
                if not parent.replace("_", "").replace("-", "").isalnum():
                    raise ValueError("Invalid input task ID")
                Path(input_dir.name, parent + ".ndjson").write_text("\n".join(rows))
            os.chmod(input_dir.name, 0o755)
            environment = {**frame.get("env", {}), "OFFDOCK_JOB_TOKEN": frame["job_token"],
                           "OFFDOCK_INPUT_DIR": "/offdock/inputs"}
            container = await asyncio.to_thread(
                self.docker.containers.run, image,
                command=shlex.split(frame["start_cmd"]) if frame.get("start_cmd") else None,
                detach=True, user="1000", cap_drop=["ALL"], read_only=True,
                security_opt=["no-new-privileges:true"], pids_limit=128,
                mem_limit=f'{frame["mem_limit_mb"]}m', memswap_limit=f'{frame["mem_limit_mb"]}m',
                nano_cpus=int(frame.get("cpus", 1) * 1e9),
                tmpfs={"/tmp": "rw,noexec,nosuid,size=64m"}, environment=environment,
                log_config=docker.types.LogConfig(type="json-file", config={"max-size": "10m", "max-file": "1"}),
                ports={f"{port}/tcp": ("127.0.0.1", None)} if port else None,
                volumes={input_dir.name: {"bind": "/offdock/inputs", "mode": "ro"}},
                labels={"offdock.attempt": attempt, "offdock.task": frame["task_id"]},
            )
            self.containers[frame["task_id"]] = container
            self.job_tokens[frame["task_id"]] = frame["job_token"]
            await asyncio.to_thread(container.reload)
            if port:
                binding = container.attrs["NetworkSettings"]["Ports"][f"{port}/tcp"][0]
                self.ports[frame["task_id"]] = int(binding["HostPort"])
            if frame["task_type"] == "service":
                if not port:
                    raise ValueError("Service needs an exposed port and readiness path")
                async with httpx.AsyncClient(timeout=3) as client:
                    for _ in range(30):
                        try:
                            response = await client.get(
                                f'http://127.0.0.1:{self.ports[frame["task_id"]]}'
                                + (frame.get("healthcheck_path") or "/healthz"),
                                headers={"Authorization": "Bearer " + frame["job_token"]})
                            if response.is_success:
                                healthy = {**result, "healthy": True}
                                self.results[attempt] = healthy
                                await self.send(healthy)
                                break
                        except httpx.HTTPError:
                            pass
                        await asyncio.sleep(1)
                    else:
                        raise ValueError("Service readiness timeout")
            started = time.monotonic()
            stdout = ""
            while True:
                await asyncio.to_thread(container.reload)
                logs = await asyncio.to_thread(container.logs, tail=500)
                text = logs.decode(errors="replace")[-500000:]
                if text != stdout:
                    chunk = text[len(stdout):] if text.startswith(stdout) else text
                    await self.send({"type": "LOG_CHUNK", "attempt_id": attempt,
                                     "job_id": frame["job_id"], "task_id": frame["task_id"], "text": chunk[-8192:]})
                    stdout = text
                if container.status in ("exited", "dead"):
                    break
                if time.monotonic() - started > frame["timeout_sec"]:
                    await asyncio.to_thread(container.kill)
                await asyncio.sleep(1)
            result.update(exit_code=container.attrs["State"]["ExitCode"],
                          oom_killed=container.attrs["State"].get("OOMKilled", False), stdout=stdout)
        except Exception as exc:
            result.update(exit_code=1, stderr=str(exc)[:1000])
        finally:
            if container is not None and not result.get("healthy"):
                await asyncio.to_thread(container.remove, force=True)
                self.containers.pop(frame["task_id"], None)
                self.ports.pop(frame["task_id"], None)
            input_dir.cleanup()
            self.results[attempt] = result
            if len(self.results) > 100:
                self.results.pop(next(iter(self.results)))
            await self.send(result)

    async def proxy(self, frame: dict) -> None:
        response = {"type": "PROXY_RESPONSE", "request_id": frame["request_id"], "status": 502, "body": ""}
        port = self.ports.get(frame["task_id"])
        if port:
            path = "/" + frame.get("path", "").lstrip("/")
            try:
                async with httpx.AsyncClient(timeout=25, follow_redirects=False) as client:
                    async with client.stream(frame["method"], f"http://127.0.0.1:{port}{path}",
                                             params=frame.get("query", ""), headers={**frame.get("headers", {}), "Authorization": "Bearer " + self.job_tokens.get(frame["task_id"], "")},
                                             content=base64.b64decode(frame.get("body", ""))) as upstream:
                        body = bytearray()
                        async for chunk in upstream.aiter_bytes():
                            body.extend(chunk)
                            if len(body) > 500000:
                                raise ValueError("Proxy response exceeds 500 KB")
                        response.update(status=upstream.status_code, headers=dict(upstream.headers),
                                        body=base64.b64encode(body).decode())
            except (httpx.HTTPError, ValueError):
                pass
        await self.send(response)

    async def run(self) -> None:
        username, token = os.getenv("DOCKERHUB_USERNAME"), os.getenv("DOCKERHUB_TOKEN")
        if username and token:
            await asyncio.to_thread(self.docker.login, username=username, password=token)
        delay = 1
        while not self.stop.is_set():
            try:
                async with connect(self.args.orchestrator.rstrip("/") + "/ws/node/" + self.args.node_id,
                                   additional_headers={"Authorization": "Bearer " + self.args.token},
                                   ping_interval=20, ping_timeout=20, max_size=1500000) as ws:
                    self.socket = ws
                    self.connected.set()
                    delay = 1
                    heartbeat = asyncio.create_task(self.heartbeat())
                    try:
                        for result in list(self.results.values()):
                            await self.send(result)
                        async for raw in ws:
                            frame = json.loads(raw)
                            if frame["type"] == "EXECUTE_JOB":
                                attempt = frame["attempt_id"]
                                if attempt in self.results:
                                    await self.send(self.results[attempt])
                                elif attempt not in self.tasks:
                                    self.tasks[attempt] = asyncio.create_task(self.execute(frame))
                            elif frame["type"] == "PROXY_REQUEST":
                                asyncio.create_task(self.proxy(frame))
                            elif frame["type"] == "STOP_CONTAINER":
                                container = self.containers.get(frame["task_id"])
                                if container:
                                    await asyncio.to_thread(container.stop, timeout=10)
                    finally:
                        self.connected.clear()
                        heartbeat.cancel()
                        await asyncio.gather(heartbeat, return_exceptions=True)
            except Exception:
                self.connected.clear()
                try:
                    await asyncio.wait_for(self.stop.wait(), delay + random.random())
                except asyncio.TimeoutError:
                    pass
                delay = min(60, delay * 2)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--orchestrator", required=True)
    parser.add_argument("--node-id", required=True)
    parser.add_argument("--token", required=True)
    args = parser.parse_args()
    if not args.orchestrator.startswith(("wss://", "ws://localhost", "ws://127.0.0.1")):
        parser.error("Use wss:// for remote connections")
    asyncio.run(Agent(args).run())


if __name__ == "__main__":
    main()
