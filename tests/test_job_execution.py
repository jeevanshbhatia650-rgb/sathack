import asyncio
from types import SimpleNamespace
import pytest
from shared.schemas import JobSubmissionRequest, Telemetry
from shared.redis_layer import Store
from orchestrator.agents.memory import Memory
from orchestrator.allocator import Allocator
from orchestrator.config import Settings
from orchestrator.graph import run_job
import orchestrator.graph as graph


@pytest.mark.asyncio
async def test_job_runs_dependency_after_parent_and_persists(monkeypatch):
    report = {"repo_url": "https://github.com/example/repo", "commit_sha": "a" * 40,
              "commands": ["npm run start"], "env_keys": [], "context": "verified package scripts"}
    async def scanner(*args):
        return {"report": report, "manifests": {"Dockerfile": "FROM python:3.11-slim\nUSER 1000\n"}}
    async def planner(*args):
        from shared.schemas import ExecutionPlan
        return ExecutionPlan.model_validate({"job_id": "job", "tasks": [
            {"id": "aa", "repo_url": report["repo_url"], "commit_sha": report["commit_sha"],
             "task_type": "batch", "start_cmd_override": "npm run start"},
            {"id": "bb", "repo_url": report["repo_url"], "commit_sha": report["commit_sha"],
             "task_type": "batch", "start_cmd_override": "npm run start", "depends_on": ["aa"]},
        ]})
    monkeypatch.setattr(graph, "scan", scanner)
    monkeypatch.setattr(graph, "create_plan", planner)
    seen = []
    class Tunnel:
        async def broadcast(self, frame):
            pass
        async def execute(self, node, payload, timeout):
            seen.append(payload["task_id"])
            return {"exit_code": 0, "stdout": '{"ok": true}'}
    store = Store()
    allocator = Allocator()
    await allocator.update("node", Telemetry(total_ram_mb=8192., available_ram_mb=8192.,
                                             cpu_percent=0., cpu_cores=4, running_containers=0))
    app = SimpleNamespace(state=SimpleNamespace(store=store, memory=Memory(store), allocator=allocator,
        tunnels=Tunnel(), settings=Settings(_env_file=None), http=None))
    request = JobSubmissionRequest(prompt="Run two ordered tasks",
                                   repos=[{"repo_url": report["repo_url"]}], use_exec_cache=False)
    await run_job(app, "job", request)
    assert seen == ["aa", "bb"]
    state = await store.state("job")
    assert state["statuses"] == {"aa": "COMPLETED", "bb": "COMPLETED"}
    assert not allocator.leases
    await run_job(app, "job", request)
    assert seen == ["aa", "bb"]
    await store.close()
