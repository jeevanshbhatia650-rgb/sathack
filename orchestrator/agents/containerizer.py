import re
from manager.graph.client import propose
from shared.schemas import AgentError, ContainerizationResult


def security_gate(dockerfile: str) -> None:
    normalized = re.sub(r"\\\s*\n", " ", dockerfile)
    if re.search(r"--privileged|/var/run/docker.sock|(?:curl|wget)[^\n]*\|\s*(?:ba)?sh", normalized, re.I):
        raise ValueError("Prohibited Dockerfile operation")
    stages = re.split(r"(?im)^FROM\s+", normalized)[1:]
    if not stages:
        raise ValueError("Dockerfile lacks FROM")
    users = re.findall(r"(?im)^USER\s+(\S+)", stages[-1])
    if not users or users[-1].split(":")[0] in ("root", "0"):
        raise ValueError("Final stage must declare a non-root user")
    if re.search(r"(?im)^(ADD\s+https?://|RUN\s+--mount|ONBUILD\b)", normalized):
        raise ValueError("Unsupported build operation")


async def prepare(client, memory, task, scanned, cache: bool, railpack: bool, history: list[dict]) -> dict:
    key = [task.model_dump(), scanned["report"]["commit_sha"]]
    cached = await memory.get("dockerfile", key) if cache and not history else None
    if cached:
        security_gate(cached["dockerfile"])
        return cached
    if len(history) >= 3:
        raise ValueError("Three build attempts exhausted")
    existing = scanned["manifests"].get("Dockerfile")
    bridge = task.mcp_transport_native == "stdio"
    if existing and not bridge and not history:
        try:
            security_gate(existing)
            ports = re.findall(r"(?im)^EXPOSE\s+(\d+)", existing)
            return {"mode": "dockerfile", "dockerfile": existing,
                    "exposed_port": int(ports[0]) if len(ports) == 1 else None}
        except ValueError:
            pass
    if railpack and not bridge and not history:
        return {"mode": "railpack"}
    result = await propose(client, "containerizer", {
        "repository": scanned, "workload": task.model_dump(), "history": history,
        "transport": "streamable_http with bearer OFFDOCK_JOB_TOKEN" if bridge else "native",
    }, ContainerizationResult)
    if isinstance(result, AgentError):
        raise ValueError(result.reason)
    security_gate(result.dockerfile)
    if any(x.get("dockerfile") == result.dockerfile for x in history):
        raise ValueError("Repeated failed Dockerfile")
    payload = {"mode": "dockerfile", **result.model_dump()}
    if cache:
        await memory.put("dockerfile", key, payload)
    return payload
