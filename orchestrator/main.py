import asyncio
import base64
import hashlib
import hmac
import json
import secrets
import shlex
from contextlib import asynccontextmanager
from pathlib import Path
import httpx
from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, StreamingResponse, Response
from shared.schemas import JobSubmissionRequest, Telemetry
from shared.redis_layer import Store
from .config import Settings
from .allocator import Allocator
from .tunnel_manager import Tunnels, Connection
from .agents.memory import Memory
from .graph import run_job
from .sandbox_launcher import spawn


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        settings.warn_missing()
        app.state.settings = settings
        app.state.store = Store(settings.redis_url)
        app.state.memory = Memory(app.state.store)
        app.state.allocator = Allocator(settings.host_floor_min_mb)
        app.state.tunnels = Tunnels()
        app.state.jobs = set()
        app.state.http = httpx.AsyncClient(timeout=30)
        app.state.draining = False
        async for key in app.state.store.redis.scan_iter(match="offdock:request:*"):
            stored = await app.state.store.get(key)
            if stored:
                task = asyncio.create_task(run_job(app, key.rsplit(":", 1)[1], JobSubmissionRequest.model_validate(stored)))
                app.state.jobs.add(task)
                task.add_done_callback(app.state.jobs.discard)
        yield
        app.state.draining = True
        for connection in list(app.state.tunnels.nodes.values()):
            await connection.socket.close(code=1012)
        for task in app.state.jobs:
            task.cancel()
        await asyncio.gather(*app.state.jobs, return_exceptions=True)
        await app.state.http.aclose()
        await app.state.store.close()

    app = FastAPI(lifespan=lifespan)

    def authenticated(value: str) -> bool:
        return bool(settings.admin_dashboard_key) and hmac.compare_digest(value, settings.admin_dashboard_key)

    async def admin(request: Request) -> None:
        if not authenticated(request.headers.get("authorization", "").removeprefix("Bearer ")):
            raise HTTPException(401, "Admin bearer key required")

    @app.get("/healthz")
    async def health():
        return {"status": "ok"}

    @app.get("/")
    async def dashboard():
        return FileResponse(Path(__file__).parent / "static/index.html")

    @app.get("/node-agent.py")
    async def agent_download():
        return FileResponse(Path(__file__).parent.parent / "node_agent/node_cli_agent.py", media_type="text/x-python")

    async def pair(origin: str) -> dict:
        if not settings.mesh_master_secret:
            raise HTTPException(503, "MESH_MASTER_SECRET is required")
        node = "node-" + secrets.token_hex(4)
        nonce = secrets.token_urlsafe(24)
        signature = hmac.new(settings.mesh_master_secret.encode(), (node + nonce).encode(), hashlib.sha256).hexdigest()
        token = nonce + "." + signature
        await app.state.store.put("offdock:pair:" + node, hashlib.sha256(token.encode()).hexdigest(), 86400)
        ws_origin = origin.replace("https://", "wss://").replace("http://", "ws://")
        command = ("curl -fsS " + shlex.quote(origin + "/node-agent.py") + " -o node_cli_agent.py && "
                   "python -m pip install 'websockets>=14,<16' docker psutil httpx && python node_cli_agent.py "
                   "--orchestrator " + shlex.quote(ws_origin) + " --node-id " + node + " --token " + shlex.quote(token))
        return {"node_id": node, "session_token": token, "command": command}

    @app.post("/v1/nodes/pair", dependencies=[Depends(admin)])
    async def pairing(request: Request):
        return await pair(str(request.base_url).rstrip("/"))

    @app.post("/v1/nodes/spawn-sandbox", dependencies=[Depends(admin)])
    async def sandbox(request: Request):
        if not settings.e2b_api_key or not settings.e2b_template:
            raise HTTPException(503, "Configure E2B_API_KEY and a Docker-capable E2B_TEMPLATE")
        origin = str(request.base_url).rstrip("/")
        credentials = await pair(origin)
        try:
            result = await spawn(settings, app.state.http, credentials["node_id"], credentials["session_token"], origin)
            return {"node_id": credentials["node_id"], "sandbox": result}
        except (ValueError, httpx.HTTPError) as exc:
            raise HTTPException(502, "Sandbox creation failed") from exc

    @app.post("/v1/jobs", dependencies=[Depends(admin)])
    async def submit(body: JobSubmissionRequest):
        if app.state.draining:
            raise HTTPException(503, "Server draining")
        job_id = secrets.token_hex(12)
        await app.state.store.checkpoint(job_id, {"job_id": job_id, "status": "QUEUED"})
        await app.state.store.put("offdock:request:" + job_id, body.model_dump(mode="json"), 3600)
        task = asyncio.create_task(run_job(app, job_id, body))
        app.state.jobs.add(task)
        task.add_done_callback(app.state.jobs.discard)
        return {"job_id": job_id}

    @app.get("/v1/jobs/{job_id}", dependencies=[Depends(admin)])
    async def job(job_id: str):
        result = await app.state.store.state(job_id)
        if result is None:
            raise HTTPException(404, "Job absent or expired")
        return result

    @app.get("/v1/jobs/{job_id}/stream", dependencies=[Depends(admin)])
    async def stream(job_id: str, request: Request):
        async def events():
            cursors = {}
            while not await request.is_disconnected():
                state = await app.state.store.state(job_id)
                for task_id in (state or {}).get("statuses", {}):
                    cursors.setdefault(f"offdock:stream:{job_id}:{task_id}", "0-0")
                if cursors:
                    rows = await app.state.store.redis.xread(cursors, count=100, block=1000)
                    for key, entries in rows:
                        for entry_id, data in entries:
                            cursors[key] = entry_id
                            yield "data: " + json.dumps(data) + "\n\n"
                yield ": ping\n\n"
                await asyncio.sleep(1)
        return StreamingResponse(events(), media_type="text/event-stream")

    @app.websocket("/ws/cluster")
    async def cluster(ws: WebSocket):
        await ws.accept()
        try:
            auth = await asyncio.wait_for(ws.receive_json(), 10)
            if not authenticated(auth.get("token", "")):
                await ws.close(1008)
                return
            for node_id, worker in app.state.allocator.workers.items():
                await ws.send_json({"type": "TELEMETRY", "node_id": node_id, **worker.telemetry.model_dump()})
            queue = asyncio.Queue(maxsize=100)
            app.state.tunnels.subscribers.add(queue)
            try:
                while True:
                    try:
                        frame = await asyncio.wait_for(queue.get(), 10)
                    except asyncio.TimeoutError:
                        frame = {"type": "PING"}
                    await ws.send_json(frame)
            finally:
                app.state.tunnels.subscribers.discard(queue)
        except (WebSocketDisconnect, asyncio.TimeoutError):
            return

    @app.websocket("/ws/node/{node_id}")
    async def node_socket(ws: WebSocket, node_id: str):
        token = ws.headers.get("authorization", "").removeprefix("Bearer ") or ws.query_params.get("token", "")
        expected = await app.state.store.get("offdock:pair:" + node_id)
        if not expected or not hmac.compare_digest(expected, hashlib.sha256(token.encode()).hexdigest()):
            await ws.close(1008)
            return
        await ws.accept()
        tunnels = app.state.tunnels
        old = tunnels.nodes.get(node_id)
        connection = Connection(ws)
        tunnels.nodes[node_id] = connection
        if old:
            await old.socket.close(1012)
        try:
            while True:
                raw = await asyncio.wait_for(ws.receive_text(), 20)
                if len(raw.encode()) > 1_500_000:
                    await ws.close(1009)
                    break
                frame = json.loads(raw)
                kind = frame.get("type")
                if kind == "HEARTBEAT":
                    if len(raw.encode()) >= 1024:
                        raise ValueError("Heartbeat exceeds 1 KB")
                    telemetry = Telemetry.model_validate(frame["telemetry"])
                    await app.state.allocator.update(node_id, telemetry)
                    await app.state.store.put("offdock:node:" + node_id, telemetry.model_dump(), 15)
                    await tunnels.broadcast({"type": "TELEMETRY", "node_id": node_id, **telemetry.model_dump()})
                    await connection.send({"type": "PONG"})
                elif kind == "PROXY_RESPONSE":
                    tunnels.resolve(tunnels.pending, node_id, frame["request_id"], frame)
                elif kind == "JOB_RESULT":
                    attempt = frame["attempt_id"]
                    binding = await app.state.store.get("offdock:attempt:" + attempt)
                    if binding and binding["node_id"] == node_id:
                        if binding["task_type"] == "service" and not frame.get("healthy"):
                            await app.state.allocator.release(attempt)
                            state = await app.state.store.state(binding["job_id"])
                            if state and state.get("statuses", {}).get(binding["task_id"]) == "HEALTHY":
                                state["statuses"][binding["task_id"]] = "FAILED"
                                state["status"] = "FAILED"
                                await app.state.store.checkpoint(binding["job_id"], state)
                                await tunnels.broadcast({"type": "JOB_STATE", **state})
                        tunnels.resolve(tunnels.results, node_id, attempt, frame)
                elif kind == "LOG_CHUNK":
                    entry = tunnels.results.get(frame.get("attempt_id"))
                    if entry and entry[0] == node_id:
                        await app.state.store.log(frame["job_id"], frame["task_id"], frame.get("text", ""))
                        await tunnels.broadcast({k: frame[k] for k in ("type", "job_id", "task_id", "text")})
                elif kind == "PRESSURE_WARNING":
                    await tunnels.broadcast({"type": kind, "node_id": node_id})
        except (WebSocketDisconnect, asyncio.TimeoutError, ValueError, KeyError):
            pass
        finally:
            if tunnels.nodes.get(node_id) is connection:
                tunnels.nodes.pop(node_id, None)

    @app.api_route("/proxy/{node_id}/{task_id}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def proxy(node_id: str, task_id: str, path: str, request: Request):
        binding = await app.state.store.get(f"offdock:proxy:{node_id}:{task_id}")
        token = request.headers.get("authorization", "").removeprefix("Bearer ")
        if not binding or not hmac.compare_digest(token, binding["token"]):
            raise HTTPException(401, "Job bearer token required")
        body = await request.body()
        if len(body) > 500_000:
            raise HTTPException(413, "Proxy request too large")
        try:
            response = await app.state.tunnels.proxy(node_id, {
                "task_id": task_id, "path": "/" + path, "query": request.url.query,
                "method": request.method, "body": base64.b64encode(body).decode(),
                "headers": {k: v for k, v in request.headers.items() if k.lower() in ("content-type", "accept", "mcp-session-id")},
            })
        except (RuntimeError, asyncio.TimeoutError) as exc:
            raise HTTPException(502, "Node proxy unavailable") from exc
        headers = {k: v for k, v in response.get("headers", {}).items()
                   if k.lower() in ("content-type", "mcp-session-id")}
        return Response(base64.b64decode(response.get("body", "")), status_code=response.get("status", 502), headers=headers)

    return app


app = create_app()
