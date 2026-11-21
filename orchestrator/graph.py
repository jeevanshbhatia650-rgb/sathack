import asyncio
import secrets
from manager.graph.workflow import create_workflow, ready_tasks
from shared.schemas import RepositoryReport, ExecutionPlan
from .allocator import Lease
from shared.docker_auth import pull_credentials
from .agents.planner import create_plan, kahn_waves
from .agents.containerizer import prepare
from .agents.recovery import recover, signature
from .agents.llm_client import LLMClient
from .repo_scanner import scan


async def run_job(app, job_id: str, request) -> None:
    s = app.state
    state = await s.store.state(job_id) or {}
    if state.get("status") in ("COMPLETED", "FAILED"):
        return
    state.setdefault("job_id", job_id)
    state.setdefault("statuses", {})
    state.setdefault("assignments", {})
    for task_id, status in list(state["statuses"].items()):
        if status in ("BUILDING", "DISPATCHED", "INTERRUPTED"):
            state["statuses"][task_id] = "PENDING"
    state["status"] = "PLANNING"
    lock = asyncio.Lock()
    running: dict[str, asyncio.Task] = {}

    async def save() -> None:
        await s.store.checkpoint(job_id, state)
        await s.tunnels.broadcast({"type": "JOB_STATE", **state})

    async def execute(task) -> None:
        outbox_key = f"offdock:outbox:{job_id}:{task.id}"
        pending = await s.store.get(outbox_key)
        attempt = pending["attempt_id"] if pending else secrets.token_hex(16)
        node = None
        try:
            scanned = next(x for x in scans if x["report"]["repo_url"] == task.repo_url)
            item = next(x for x in request.repos if str(x.repo_url) == task.repo_url)
            cache_key = [task.model_dump(), item.env_vars, scanned["report"]["commit_sha"]]
            # Service readiness and external side effects cannot be restored from stdout.
            cached = await s.memory.get("exec", cache_key) if request.use_exec_cache and task.task_type == "batch" and not task.depends_on else None
            if cached:
                state["statuses"][task.id] = "COMPLETED"
                await s.store.log(job_id, task.id, cached["stdout"])
                return
            history = []
            retries = 0
            remediation = None
            ram = task.est_ram_mb
            while True:
                if pending:
                    node = pending["node_id"]
                    ram = pending["mem_limit_mb"]
                    async with s.allocator.lock:
                        s.allocator.leases[attempt] = Lease(node, ram)
                else:
                    node = await s.allocator.reserve(attempt, ram)
                state["assignments"][task.id] = node
                artifact = pending if pending else ({"mode": "image", "image_ref": item.docker_image_override} if item.docker_image_override else await prepare(
                    LLMClient(s.settings, "containerizer", s.http), s.memory, task, scanned,
                    request.use_agent_cache, s.allocator.workers[node].telemetry.railpack, history))
                if request.image_transport == "dockerhub" and not item.docker_image_override:
                    raise ValueError("dockerhub transport requires docker_image_override")
                state["statuses"][task.id] = "BUILDING"
                await save()
                job_token = pending["job_token"] if pending else secrets.token_urlsafe(32)
                await s.store.put(f"offdock:proxy:{node}:{task.id}", {"token": job_token, "job_id": job_id}, 3600)
                payload = pending or {
                    **artifact, "job_id": job_id, "task_id": task.id, "attempt_id": attempt,
                    "repo_url": task.repo_url, "commit_sha": task.commit_sha,
                    "task_type": task.task_type, "start_cmd": task.start_cmd_override,
                    "node_id": node, "mem_limit_mb": ram, "cpus": task.est_cpus, "env": item.env_vars,
                    "job_token": job_token, "timeout_sec": task.timeout_sec,
                }
                if request.image_transport == "dockerhub":
                    payload["registry_auth"] = await pull_credentials(
                        s.http, s.settings.dockerhub_username, s.settings.dockerhub_token,
                        item.docker_image_override)
                inputs = {}
                for parent in task.depends_on:
                    records = await s.store.redis.xrange(f"offdock:stream:{job_id}:{parent}")
                    inputs[parent] = [row["text"] for _, row in records]
                payload["inputs"] = inputs
                await s.store.put(outbox_key, payload, 3600)
                await s.store.put("offdock:attempt:" + attempt,
                                  {"node_id": node, "job_id": job_id, "task_id": task.id,
                                   "task_type": task.task_type}, 3600)
                result = await s.tunnels.execute(node, payload, task.timeout_sec + 180)
                await s.store.redis.delete(outbox_key)
                pending = None
                if result.get("phase") == "build":
                    history.append({"dockerfile": artifact.get("dockerfile"),
                                    "stderr": "\n".join(result.get("stderr", "").splitlines()[-40:])})
                    if len(history) >= 3:
                        raise ValueError("Build failed after three attempts")
                elif result.get("healthy"):
                    state["statuses"][task.id] = "HEALTHY"
                    return
                elif result.get("exit_code") == 0:
                    if remediation and request.use_agent_cache:
                        await s.memory.put("recovery", remediation[0], remediation[1])
                    state["statuses"][task.id] = "COMPLETED"
                    if request.use_exec_cache and task.task_type == "batch" and not task.depends_on:
                        await s.memory.put("exec", cache_key, {"stdout": result.get("stdout", "")[:500000]})
                    return
                else:
                    decision = await recover(s.memory, result, ram, retries,
                        LLMClient(s.settings, "recovery", s.http), request.use_agent_cache)
                    if not decision.retry_allowed:
                        raise ValueError(decision.reason)
                    remediation = (signature(result, ram), decision.model_dump())
                    ram = decision.new_est_ram_mb or ram
                    retries += 1
                await s.allocator.release(attempt)
                attempt = secrets.token_hex(16)
        except asyncio.CancelledError:
            state["statuses"][task.id] = "INTERRUPTED"
            raise
        except Exception as exc:
            state["statuses"][task.id] = "FAILED"
            await s.store.log(job_id, task.id, str(exc)[:1000])
        finally:
            # Healthy services continue to own capacity until stopped.
            if state["statuses"].get(task.id) != "HEALTHY":
                await s.allocator.release(attempt)
            await save()

    async def claim(task) -> None:
        async with lock:
            if state["statuses"].get(task.id, "PENDING") != "PENDING":
                return
            state["statuses"][task.id] = "DISPATCHED"
            await save()
            running[task.id] = asyncio.create_task(execute(task))

    try:
        scans = await asyncio.gather(*(scan(s.http, s.memory, item, s.settings.github_token) for item in request.repos))
        reports = [RepositoryReport.model_validate(x["report"]) for x in scans]
        plan = ExecutionPlan.model_validate(state["plan"]) if state.get("plan") else await create_plan(LLMClient(s.settings, "planner", s.http), s.memory, request, reports, job_id)
        state.update(plan=plan.model_dump(), waves=kahn_waves(plan), status="RUNNING")
        graph = create_workflow(claim)
        while True:
            await graph.ainvoke({"plan": plan, "statuses": dict(state["statuses"])})
            active = [task for task in running.values() if not task.done()]
            if not active:
                if ready_tasks({"plan": plan, "statuses": state["statuses"]}):
                    continue
                break
            await asyncio.wait(active, return_when=asyncio.FIRST_COMPLETED)
        for task in plan.tasks:
            state["statuses"].setdefault(task.id, "BLOCKED")
        state["status"] = "FAILED" if any(x in ("FAILED", "BLOCKED") for x in state["statuses"].values()) else "COMPLETED"
    except asyncio.CancelledError:
        for pending_task in running.values():
            pending_task.cancel()
        await asyncio.gather(*running.values(), return_exceptions=True)
        raise
    except Exception as exc:
        state.update(status="FAILED", error=str(exc)[:1000])
    finally:
        await save()
