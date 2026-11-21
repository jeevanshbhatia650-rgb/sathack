from math import ceil
from manager.graph.client import propose
from shared.schemas import AgentError, RecoveryDecision


def signature(incident: dict, ram_mb: int) -> list:
    return [incident.get("exit_code"), bool(incident.get("oom_killed")),
            incident.get("stderr", "")[-2000:], ram_mb]


async def recover(memory, incident: dict, ram_mb: int, retries: int, client=None, use_cache: bool = True) -> RecoveryDecision:
    if retries >= 2:
        return RecoveryDecision(action="ABORT", reason="Runtime retry budget exhausted", retry_allowed=False)
    key = signature(incident, ram_mb)
    cached = await memory.get("recovery", key) if use_cache else None
    if cached:
        decision = RecoveryDecision.model_validate(cached)
    elif incident.get("oom_killed") and ram_mb < 4096:
        decision = RecoveryDecision(action="INCREASE_MEMORY", reason="Worker confirmed OOMKilled",
                                    new_est_ram_mb=min(4096, ceil(ram_mb * 1.5)), retry_allowed=True)
    elif client:
        candidate = await propose(client, "recovery", {
            "incident": incident, "ram_mb": ram_mb, "retries": retries, "maximum_retries": 2,
        }, RecoveryDecision)
        if isinstance(candidate, AgentError):
            return RecoveryDecision(action="ABORT", reason=candidate.reason, retry_allowed=False)
        decision = candidate
    else:
        return RecoveryDecision(action="ABORT", reason="Failure requires operator investigation", retry_allowed=False)
    if decision.action == "INCREASE_MEMORY":
        expected = min(4096, ceil(ram_mb * 1.5))
        if not incident.get("oom_killed") or expected <= ram_mb or decision.new_est_ram_mb != expected:
            return RecoveryDecision(action="ABORT", reason="Memory proposal violates limits", retry_allowed=False)
    elif decision.action not in ("ABORT", "RETRY_SAME_WORKER", "REROUTE_WORKER"):
        return RecoveryDecision(action="ABORT", reason="Runtime patch requires verified configuration", retry_allowed=False)
    if decision.retry_allowed != (decision.action != "ABORT"):
        raise ValueError("Inconsistent retry proposal")
    return decision
