from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class TaskNode(Model):
    id: str = Field(pattern=r"^[a-z0-9_-]{2,32}$")
    repo_url: str
    commit_sha: str | None = "HEAD"
    task_type: Literal["batch", "service"]
    is_mcp_server: bool = False
    mcp_transport_native: Literal["stdio", "streamable_http", "sse", "none"] = "none"
    start_cmd_override: str | None = None
    env_keys_required: list[str] = Field(default_factory=list)
    depends_on: list[str] = Field(default_factory=list)
    est_ram_mb: int = Field(default=512, ge=128, le=16384)
    est_cpus: float = Field(default=1.0, ge=0.25, le=4.0)
    priority: int = Field(default=5, ge=1, le=10)
    idle_ttl_sec: int = 900
    timeout_sec: int = 600


class ExecutionPlan(Model):
    job_id: str
    tasks: list[TaskNode]


class ContainerizationResult(Model):
    dockerfile: str
    exposed_port: int | None = None
    healthcheck_path: str | None = None
    detected_runtime: str
    estimated_ram_mb: int = Field(ge=128)


class RecoveryDecision(Model):
    action: Literal["RETRY_SAME_WORKER", "INCREASE_MEMORY", "REROUTE_WORKER", "PATCH_RUNTIME", "ABORT"]
    reason: str
    new_est_ram_mb: int | None = None
    retry_allowed: bool


class AgentError(Model):
    error: Literal["missing_evidence", "invalid_proposal", "unrepairable"]
    reason: str
    missing_facts: list[str]


class RepositoryReport(Model):
    repo_url: str
    commit_sha: str = Field(pattern=r"^[a-f0-9]{40}$")
    commands: list[str]
    env_keys: list[str]
    context: str
