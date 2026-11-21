"""Pydantic v2 wire contracts shared between the Sandbox Node and the Orchestrator.

Every frame that crosses the control plane (registration webhook, heartbeat,
execution request, proxy frames, NDJSON records) is defined here so both sides
validate the exact same schema.
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

HEARTBEAT_MAX_BYTES: int = 1024
_ID_PATTERN = r"^[A-Za-z0-9][A-Za-z0-9_.\-]{0,63}$"
MAX_INLINE_FILES_BYTES: int = 256 * 1024
MAX_DOCKERFILE_BYTES: int = 64 * 1024


def utc_now_iso() -> str:
    """Return an RFC 3339 UTC timestamp with millisecond precision."""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


class ExecutionMode(str, Enum):
    DOCKER_NATIVE = "docker_native"
    RENDER_SANDBOX_FALLBACK = "render_sandbox_fallback"


class NetworkMode(str, Enum):
    TAILSCALE_NATIVE = "tailscale_native"
    TAILSCALE_SIMULATED_RENDER = "tailscale_simulated_render"


class WorkloadKind(str, Enum):
    BATCH = "batch"
    SERVICE = "service"


class TaskState(str, Enum):
    PENDING = "pending"
    BUILDING = "building"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CACHED = "cached"
    STOPPED = "stopped"
    EVICTED = "evicted"
    ACKED = "acked"


TERMINAL_STATES: frozenset[TaskState] = frozenset(
    {TaskState.SUCCEEDED, TaskState.FAILED, TaskState.CACHED, TaskState.STOPPED, TaskState.EVICTED, TaskState.ACKED}
)


class FrameType(str, Enum):
    # outbound (node -> orchestrator)
    NODE_HELLO = "NODE_HELLO"
    HEARTBEAT = "HEARTBEAT"
    LOG_CHUNK = "LOG_CHUNK"
    JOB_ACCEPTED = "JOB_ACCEPTED"
    JOB_REJECTED = "JOB_REJECTED"
    JOB_RESULT = "JOB_RESULT"
    CACHE_HIT = "CACHE_HIT"
    PRESSURE_WARNING = "PRESSURE_WARNING"
    CONTAINER_EVICTED = "CONTAINER_EVICTED"
    ARTIFACT_READY = "ARTIFACT_READY"
    PROXY_RESPONSE = "PROXY_RESPONSE"
    PONG = "PONG"
    # inbound (orchestrator -> node)
    EXECUTE_JOB = "EXECUTE_JOB"
    STOP_CONTAINER = "STOP_CONTAINER"
    PROXY_REQUEST = "PROXY_REQUEST"
    PING = "PING"


class RegistrationWebhook(BaseModel):
    """Payload of ``POST {ORCHESTRATOR_URL}/v1/webhooks/node-register``."""

    model_config = ConfigDict(use_enum_values=True)

    shared_node_id: str
    session_token_hint: str
    tailscale_ip: str
    tailscale_dns: str
    network_mode: NetworkMode
    public_render_url: str | None = None
    outbound_public_ip: str | None = None
    execution_mode: ExecutionMode
    total_ram_mb: int
    host_floor_mb: int
    cpu_cores: int
    platform: str
    telemetry_mode: str = "live_psutil"
    node_version: str = "1.0.0"
    ts: float = Field(default_factory=lambda: round(time.time(), 3))


class ContainerSummary(BaseModel):
    task_id: str
    state: str
    mem_mb: int = 0
    rows_written: int = 0
    bytes_written: int = 0


class HeartbeatPayload(BaseModel):
    """Strictly control-plane machine telemetry; must serialize below 1 KB."""

    shared_node_id: str
    ts: float
    tailscale_ip: str
    total_ram_mb: int
    available_ram_mb: int
    host_floor_mb: int
    pending_leased_mb: int
    allocatable_ram_mb: int
    readiness_score: float
    cpu_percent_raw: float
    cpu_percent_ema: float
    cpu_cores: int
    load_avg_1m: float
    disk_free_mb: int
    net_rx_kbps_ema: float
    net_tx_kbps_ema: float
    on_battery: bool
    cache_used_mb: int
    cached_base_images: list[str] = Field(default_factory=list)
    containers: list[ContainerSummary] = Field(default_factory=list)
    execution_mode: str | None = None
    telemetry_mode: str | None = None
    net_rtt_ms: float | None = None
    latency_penalty_ratio: float | None = None
    truncated: int | None = None

    def to_wire(self) -> bytes:
        """Compact JSON bytes as sent on the wire (no None fields)."""
        return self.model_dump_json(exclude_none=True).encode("utf-8")


class ExecuteJob(BaseModel):
    """Execution request delivered via ``EXECUTE_JOB`` frame or ``POST /v1/execute``."""

    model_config = ConfigDict(use_enum_values=False)

    job_id: str = Field(pattern=_ID_PATTERN)
    task_id: str = Field(pattern=_ID_PATTERN)
    prompt: str = Field(default="", max_length=8000)
    image_ref: str | None = Field(default=None, max_length=255)
    dockerfile: str | None = Field(default=None, max_length=MAX_DOCKERFILE_BYTES)
    repo_url: str | None = Field(default=None, max_length=512)
    commit_sha: str | None = Field(default=None, max_length=64)
    start_cmd: str | None = Field(default=None, max_length=4096)
    env: dict[str, str] = Field(default_factory=dict)
    inline_files: dict[str, str] = Field(default_factory=dict)
    workload_kind: WorkloadKind = WorkloadKind.BATCH
    requested_ram_mb: int = Field(default=256, ge=16, le=65536)
    cpus: float = Field(default=1.0, gt=0.0, le=64.0)
    exposed_port: int = Field(default=8080, ge=1, le=65535)
    idle_ttl_sec: int = Field(default=900, ge=10, le=86400)
    priority: int = Field(default=5, ge=0, le=10)
    timeout_sec: int = Field(default=600, ge=1, le=86400)
    retry_idx: int = Field(default=0, ge=0, le=2)
    use_exec_cache: bool = True
    job_token: str | None = Field(default=None, max_length=256)
    dry_run: bool = False

    @field_validator("env")
    @classmethod
    def _validate_env(cls, value: dict[str, str]) -> dict[str, str]:
        for key in value:
            if not key or not key.replace("_", "a").isalnum() or key[0].isdigit():
                raise ValueError(f"invalid env var name: {key!r}")
        return value

    @field_validator("inline_files")
    @classmethod
    def _validate_inline_files(cls, value: dict[str, str]) -> dict[str, str]:
        total = 0
        for name, content in value.items():
            normalized = name.replace("\\", "/")
            if not normalized or normalized.startswith("/") or ".." in normalized.split("/") or ":" in normalized:
                raise ValueError(f"unsafe inline file path: {name!r}")
            total += len(content.encode("utf-8"))
        if total > MAX_INLINE_FILES_BYTES:
            raise ValueError("inline_files exceed 256 KB")
        return value


class ExecuteResponse(BaseModel):
    accepted: bool
    job_id: str
    task_id: str
    status: str
    execution_mode: str
    cache_hit: bool = False
    cache_key: str | None = None
    job_token: str | None = None
    terminal_ws: str | None = None
    proxy_path: str | None = None
    admission: dict[str, Any] = Field(default_factory=dict)
    security: dict[str, Any] = Field(default_factory=dict)
    detail: str | None = None


class MeteringResult(BaseModel):
    alloc_ram_mb: float
    active_sec: float
    gb_ram_hours: float
    unit_rate_inr: float
    compute_cost_inr: float
    peer_host_payout_inr: float
    platform_fee_inr: float


class ArtifactReady(BaseModel):
    """Claim Check posted to ``/v1/webhooks/artifact-ready``."""

    shared_node_id: str
    job_id: str
    task_id: str
    manifest_url: str
    data_url: str
    sha256: str
    size_bytes: int
    rows: int
    job_token: str
    cache_hit: bool = False


class JobResult(BaseModel):
    shared_node_id: str
    job_id: str
    task_id: str
    state: str
    exit_code: int | None = None
    oom_killed: bool = False
    next_ram_mb: int | None = None
    simulated: bool = False
    cache_hit: bool = False
    cache_key: str | None = None
    duration_sec: float = 0.0
    rows_written: int = 0
    bytes_written: int = 0
    metering: MeteringResult | None = None
    artifact: ArtifactReady | None = None
    error: str | None = None


class PressureWarning(BaseModel):
    shared_node_id: str
    level: Literal["warning", "critical"]
    available_ram_mb: int
    host_floor_mb: int
    critical_floor_mb: int
    breach_count: int
    victim_task_id: str | None = None
    action: str = "none"


class ProxyFrame(BaseModel):
    """``PROXY_REQUEST`` / ``PROXY_RESPONSE`` frame tunnelled over the node WebSocket."""

    request_id: str
    task_id: str
    method: str = "GET"
    path: str = ""
    query: str = ""
    headers: dict[str, str] = Field(default_factory=dict)
    body_b64: str = ""
    status: int | None = None
    job_token: str | None = None


class NDJSONRecord(BaseModel):
    seq: int
    ts: str
    type: Literal["record", "log"]
    payload: dict[str, Any]

    def to_line(self) -> str:
        return json.dumps(self.model_dump(), separators=(",", ":"), ensure_ascii=False)


class WSFrame(BaseModel):
    type: FrameType
    payload: dict[str, Any] = Field(default_factory=dict)
    ts: float = Field(default_factory=lambda: round(time.time(), 3))

    def to_json(self) -> str:
        return self.model_dump_json()
