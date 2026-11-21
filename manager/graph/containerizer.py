from dataclasses import dataclass, field
from hashlib import sha256
from shared.schemas import AgentError, ContainerizationResult
from .client import propose


@dataclass
class BuildHistory:
    attempts: int = 0
    failed_digests: set[str] = field(default_factory=set)

    def begin(self, artifact: str):
        digest = sha256(artifact.encode()).hexdigest()
        if self.attempts >= 3 or digest in self.failed_digests:
            raise ValueError("Build budget exhausted or unchanged failed artifact")
        self.attempts += 1
        return digest


async def containerize(client, report, workload, history, validate, existing=None, railpack=None):
    """Validation adapters must enforce policy and linting before returning an artifact."""
    if history.attempts >= 3:
        return AgentError(error="unrepairable", reason="Build budget exhausted", missing_facts=[])
    if history.attempts == 0:
        if existing is not None and await validate("dockerfile", existing):
            return ("dockerfile", existing)
        if railpack is not None:
            artifact = await railpack(report, workload)
            if artifact is not None and await validate("railpack", artifact):
                return ("railpack", artifact)
    result = await propose(client, "containerizer", {
        "repository": report.model_dump(), "workload": workload.model_dump(),
        "attempts": history.attempts, "failed_digests": sorted(history.failed_digests),
    }, ContainerizationResult)
    if isinstance(result, AgentError):
        return result
    if sha256(result.dockerfile.encode()).hexdigest() in history.failed_digests:
        raise ValueError("Repeated failed Dockerfile")
    if not await validate("dockerfile", result.dockerfile):
        raise ValueError("Dockerfile rejected by policy")
    return ("dockerfile", result.dockerfile)
