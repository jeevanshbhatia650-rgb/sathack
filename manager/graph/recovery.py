from math import ceil
from shared.schemas import AgentError, RecoveryDecision
from .client import propose


async def recover(client, incident: dict, attempts: int, retry_limit: int, current_ram_mb: int):
    if incident.get("exit_code") == 0:
        return None
    if attempts >= retry_limit:
        return RecoveryDecision(action="ABORT", reason="Retry budget exhausted", retry_allowed=False)
    result = await propose(client, "recovery", {
        "incident": incident, "attempts": attempts, "retry_limit": retry_limit,
        "current_ram_mb": current_ram_mb,
    }, RecoveryDecision)
    if isinstance(result, AgentError):
        return result
    if result.retry_allowed != (result.action != "ABORT"):
        raise ValueError("Inconsistent retry decision")
    if result.action == "INCREASE_MEMORY":
        expected = min(ceil(current_ram_mb * 1.5), 4096)
        if not incident.get("oom_killed") or expected <= current_ram_mb or result.new_est_ram_mb != expected:
            raise ValueError("Unjustified memory increase")
    elif result.new_est_ram_mb is not None:
        raise ValueError("Unexpected memory change")
    return result
