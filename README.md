# OFFDOCK (RAMMesh) — Distributed Agentic Container & MCP Offloading Architecture

OFFDOCK turns natural-language orchestration requests over one or more pinned GitHub repositories into a validated **Directed Acyclic Graph (DAG)** of hardened container workloads, scheduled across remote peer workers and cloud sandboxes.

Modern AI coding and research workflows routinely launch **8–15 concurrent Model Context Protocol (MCP) servers**, headless scrapers, and data pipelines. Consumer laptops (8–16 GB RAM) hit hard memory ceilings after 2–3 local containers alongside an IDE and browser—triggering Linux OOM kills (`Exit 137`) and severe SSD swap thrashing.

True Distributed Shared Memory (DSM) over consumer Wi-Fi violates latency physics: local DRAM access takes **~100 ns**, whereas campus Wi-Fi round-trip latency takes **~10 ms** (**a $100,000\times$ latency penalty**). OFFDOCK solves this at the **isolated container boundary** by keeping the lightweight LLM control plane and atomic RAM scheduler on the **Orchestrator Server** while dispatching **~5 KB JSON execution blueprints** over outbound encrypted WebSocket tunnels to **Sandboxed Execution Nodes**.

---

## 1. End-to-End Architecture

```mermaid
flowchart TD
  UI["Frontend Console (rammesh_orchestrator_console.tsx)"] -->|POST /v1/jobs| API["FastAPI Orchestrator (orchestrator/main.py)"]
  API --> Scanner["Read-Only GitHub Repo Scanner (orchestrator/repo_scanner.py)"]
  Scanner -->|Pinned 40-hex SHA + Manifests| Planner["Agent 1: Planner Agent (orchestrator/agents/planner.py)"]
  Planner -->|ExecutionPlan JSON| Validate["Deterministic DAG & Evidence Gate (validate_plan + kahn_waves)"]
  Validate -->|LangGraph StateGraph + Send()| Dispatch["Wave-Front Parallel Dispatcher (manager/graph/workflow.py)"]

  Dispatch --> ExecCache{"Redis Exec Cache Hit?\n(batch & in_degree == 0)"}
  ExecCache -->|HIT| Complete["Restore Cached Output (0 Containers Spawned)"]
  ExecCache -->|MISS| Allocator["Atomic asyncio.Lock RAM Allocator (orchestrator/allocator.py)"]

  Allocator -->|Lease Reserved| BuildRoute{"3-Tier Build Router\n(orchestrator/agents/containerizer.py)"}
  BuildRoute -->|Tier 0| Existing["Verified Root Dockerfile (0 LLM Tokens)"]
  BuildRoute -->|Tier 1| Railpack["Railpack Deterministic OCI Builder (0 LLM Tokens)"]
  BuildRoute -->|Tier 2| Containerizer["Agent 2: Containerizer LLM + Supergateway MCP Bridge"]

  Existing --> SecGate["Deterministic AST/Regex Security Gate (security_gate)"]
  Railpack --> Blueprint["5 KB Execution Blueprint + Per-Job Bearer Token"]
  Containerizer --> SecGate
  SecGate --> Blueprint

  Blueprint -->|WSS /ws/node/{node_id}| Worker["Agent 4: Sandboxed Worker Daemon (node_agent/node_cli_agent.py)"]
  Worker -->|Build Failure (Attempt < 3)| Containerizer
  Worker -->|Runtime Fault / Exit 137| Recovery["Agent 3: Recovery Agent (orchestrator/agents/recovery.py)"]
  Recovery -->|Deterministic Decision Gate| Decision{"Admitted Retry?"}
  Decision -->|INCREASE_MEMORY / REROUTE| Allocator
  Decision -->|ABORT| Failed["Terminal FAILED State"]
  Worker -->|Exit 0 or /healthz 200 OK| Stream["Redis Streams (XADD) + Live Reverse Proxy (/proxy/{node}/{task})"]
  Stream --> Dispatch
```

---

## 2. Large Language Models (LLMs) Used & Determinism Architecture

OFFDOCK restricts LLM usage strictly to **structured proposal generation** across three bounded control-plane call sites. All LLM calls are routed through an OpenAI-compatible JSON-Schema inference client ([orchestrator/agents/llm_client.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/llm_client.py) and [manager/graph/client.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/client.py)).

### 2.1 Configured Model Matrix

| Control-Plane Role | Setting Key | Default Model (Gemini OpenAI Gateway) | OpenRouter / Multi-Provider Alternative | Primary Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Planner LLM** | `PLANNER_MODEL` | `gemini-2.5-flash` | `google/gemini-2.5-flash` | Multi-repository dependency analysis and topological `ExecutionPlan` DAG synthesis |
| **Containerizer LLM** | `CONTAINERIZER_MODEL` | `gemini-2.5-flash` | `qwen/qwen3-coder` | Single-stage hardened `Dockerfile` synthesis, Supergateway stdio-to-HTTP MCP wrapping, and build-error repair |
| **Recovery LLM** | `RECOVERY_MODEL` | `gemini-2.5-flash` | `google/gemini-2.5-flash` | Runtime `stderr` / exit-code root-cause triage when non-OOM container faults occur |

### 2.2 Strict LLM Guardrails & Why LLMs Never Make Policy Decisions

1. **Hardware-Enforced JSON Schema Output (`response_format`)**:
   Every request in [orchestrator/agents/llm_client.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/llm_client.py) enforces `response_format: {"type": "json_schema", "json_schema": {"name": "offdock_result", "schema": ...}}` with a 90-second timeout.
2. **Closed-World Pydantic Validation (`extra="forbid", strict=True`)**:
   In [manager/graph/client.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/client.py), raw model output is parsed against either the target Pydantic contract (`ExecutionPlan`, `ContainerizationResult`, `RecoveryDecision`) or the refusal contract (`AgentError`). Any extraneous key, type coercion, or schema deviation immediately raises a validation error.
3. **First-Class Refusal Contract (`AgentError`)**:
   Instead of guessing missing commands or fabricating base images, every system prompt ([prompts/planner.txt](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/prompts/planner.txt), [prompts/containerizer.txt](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/prompts/containerizer.txt), [prompts/recovery.txt](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/prompts/recovery.txt)) instructs the LLM to emit an `AgentError` (`error: "missing_evidence" | "invalid_proposal" | "unrepairable"`, `reason`, `missing_facts[]`) whenever repository facts are insufficient.
4. **Separation of Proposal vs. Policy**:
   LLMs **never** compute RAM headroom, **never** bypass the Dockerfile security gate, **never** invent shell commands outside the repository scan report, and **never** approve their own retry budgets. Every LLM output passes through a deterministic Python verifier before any state transition occurs.

---

## 3. In-Depth Guide to All Agents Used

OFFDOCK coordinates **four specialized agents** plus a **deterministic pre-agent repository scanner**:

### 3.0 Pre-Agent Stage: Read-Only Repository Scanner ([orchestrator/repo_scanner.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/repo_scanner.py))
Before any LLM is invoked, `scan()` inspects each submitted GitHub repository over HTTPS using the GitHub REST API:
- Resolves the target branch (`main` by default) to an immutable **40-character lowercase hexadecimal commit SHA** (`^[a-f0-9]{40}$`).
- Fetches repository manifests (`Dockerfile`, `package.json`, `pyproject.toml`, `requirements.txt`, `.env.example`, `README.md`) without executing untrusted code.
- Extracts verified candidate entrypoints (`commands: list[str]`), required environment variable keys (`env_keys: list[str]`), and manifest context into a `RepositoryReport` cached in Redis for **6 hours (`21,600s`)** under `offdock:cache:scan:{sha256}`.

---

### 3.1 Agent 1: The Planner Agent ([orchestrator/agents/planner.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/planner.py) & [manager/graph/planner.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/planner.py))
- **System Prompt**: [prompts/planner.txt](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/prompts/planner.txt)
- **Wire Contract**: [contracts/plan.schema.json](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/contracts/plan.schema.json) (`ExecutionPlan` containing `TaskNode` objects)
- **Role**: Translates the user's natural-language prompt and the list of `RepositoryReport` snapshots into a minimal, topologically ordered task graph.
- **Task Classification Rules**:
  - `task_type = "batch"`: Finite jobs (scrapers, ETL scripts, test runners, aggregators) that run to completion (`Exit 0`) and emit structured NDJSON/stdout records.
  - `task_type = "service"`: Long-lived HTTP APIs or MCP servers (`is_mcp_server = True`, `mcp_transport_native in {"stdio", "streamable_http", "sse", "none"}`) that must pass a readiness probe before downstream dependent tasks start.
- **Deterministic Post-LLM Gate (`validate_plan`)**:
  1. Verifies `plan.job_id == job_id`, non-empty `tasks`, and globally unique task IDs matching `^[a-z0-9_-]{2,32}$`.
  2. Rejects self-dependencies, duplicate parent edges, or references to unknown parent task IDs.
  3. Pins every task's `commit_sha` to the exact 40-hex commit SHA from its matching `RepositoryReport`.
  4. Enforces **Command & Environment Grounding**: `start_cmd_override` must exist verbatim in `report.commands`, and `set(task.env_keys_required) <= set(report.env_keys)`.
  5. Runs Kahn's topological sort to guarantee the plan is a cycle-free DAG.

---

### 3.2 Agent 2: The 3-Tier Containerizer Agent ([orchestrator/agents/containerizer.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/containerizer.py) & [manager/graph/containerizer.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/containerizer.py))
- **System Prompt**: [prompts/containerizer.txt](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/prompts/containerizer.txt)
- **Wire Contract**: [contracts/containerization.schema.json](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/contracts/containerization.schema.json) (`ContainerizationResult`)
- **Role**: Produces a hardened container build specification for each scheduled `TaskNode` using a **3-tier zero-waste cascade**:
  1. **Tier 0 — Verified Root `Dockerfile` Reuse (0 LLM Tokens)**:
     If the repository already contains a root `Dockerfile`, no stdio MCP bridge is required, and no prior build attempt failed, OFFDOCK runs `security_gate(existing)`. If it passes, the existing `Dockerfile` and its `EXPOSE` port are used immediately.
  2. **Tier 1 — Deterministic Railpack OCI Builder (0 LLM Tokens)**:
     If the assigned worker node advertises `railpack = True` (BuildKit + Railpack CLI installed) and the workload does not require stdio MCP bridging, OFFDOCK dispatches `{"mode": "railpack"}` for zero-LLM deterministic image construction.
  3. **Tier 2 — LLM Containerizer & Bounded 3-Attempt Repair Loop**:
     Invokes the Containerizer LLM with the repository manifests, `TaskNode` requirements, transport mode, and `history` (up to 2 previous failed Dockerfiles + last 40 lines of `docker build` `stderr`).
     - **Supergateway MCP Bridging**: When `task.mcp_transport_native == "stdio"`, the Containerizer wraps the local stdio MCP server into an authenticated Streamable HTTP service (`transport: "streamable_http with bearer OFFDOCK_JOB_TOKEN"`), exposing an HTTP port and readiness path.
     - **Anti-Loop Guard**: If the LLM proposes a `Dockerfile` identical to any previous failed attempt in `history`, or if `len(history) >= 3`, `prepare()` aborts immediately.

---

### 3.3 Agent 3: The Runtime Recovery Agent ([orchestrator/agents/recovery.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/recovery.py) & [manager/graph/recovery.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/recovery.py))
- **System Prompt**: [prompts/recovery.txt](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/prompts/recovery.txt)
- **Wire Contract**: [contracts/recovery.schema.json](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/contracts/recovery.schema.json) (`RecoveryDecision`)
- **Role**: Diagnoses container runtime failures (`exit_code != 0`, `oom_killed`, readiness timeout, or worker disconnect) and selects one of five actions: `INCREASE_MEMORY`, `RETRY_SAME_WORKER`, `REROUTE_WORKER`, `PATCH_RUNTIME`, or `ABORT`.
- **Hybrid Deterministic + LLM Execution**:
  - **Deterministic OOM Fast-Path**: When the worker's Docker daemon confirms `oom_killed == True` (`Exit 137`) and `ram_mb < 4096` with `retries < 2`, `recover()` deterministically computes `new_est_ram_mb = min(4096, ceil(ram_mb * 1.5))` and returns `INCREASE_MEMORY` without burning an LLM call.
  - **LLM Triage Path**: For non-OOM runtime faults, invokes the Recovery LLM with the incident signature (`[exit_code, oom_killed, stderr[-2000:], ram_mb]`) and current retry count.
  - **Post-LLM Policy Enforcement**: Even if the LLM proposes `INCREASE_MEMORY`, `recover()` rejects the proposal and forces `ABORT` unless `incident["oom_killed"] == True` and `new_est_ram_mb == min(4096, ceil(ram_mb * 1.5))`. Once `retries >= 2`, all failures deterministically `ABORT`.

---

### 3.4 Agent 4: The Outbound Sandboxed Worker Agent ([node_agent/node_cli_agent.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/node_agent/node_cli_agent.py))
- **Role**: Autonomous execution daemon running on peer laptops, Linux VMs, or E2B cloud sandboxes.
- **Capabilities**:
  - Establishes an outbound authenticated WebSocket tunnel (`WSS /ws/node/{node_id}`) to the Orchestrator so workers behind campus NAT or firewalls require zero inbound port forwarding.
  - Streams `<1 KB` `psutil` hardware telemetry (`total_ram_mb`, `available_ram_mb`, `cpu_percent`, `cpu_cores`, `running_containers`, `railpack`) every 5 seconds.
  - Performs commit-pinned shallow clones (`git fetch --depth 1 <repo_url> <commit_sha>` + `git rev-parse HEAD` verification) inside ephemeral temporary directories.
  - Builds images via Docker Engine or Railpack, injects parent task NDJSON outputs at `/offdock/inputs/{parent}.ndjson` (read-only), runs containers under strict kernel isolation, streams incremental `LOG_CHUNK` diffs, verifies service `/healthz` readiness, and reverse-proxies authenticated HTTP/MCP requests to `127.0.0.1:{ephemeral_port}`.

---

## 4. Every Algorithm & Mathematical Model Applied

### 4.1 Latency Physics & Offload Efficiency Invariant
Local DRAM random access latency is $L_{\text{local}} \approx 100\text{ ns}$, whereas campus Wi-Fi network RTT is $L_{\text{net}} \approx 10\text{ ms} = 10^7\text{ ns}$:

$$\text{PenaltyRatio} = \frac{L_{\text{net}} \times 10^6}{L_{\text{local}}} = \frac{10 \times 10^6\text{ ns}}{100\text{ ns}} = 100,000\times$$

Because page-faulting raw memory across Wi-Fi incurs a $100,000\times$ slowdown, OFFDOCK never transfers process memory pages. Instead, it offloads at the **container process boundary** whenever remote container execution plus RPC blueprint dispatch beats local swap-degraded execution:

$$T_{\text{remote\_exec}} + T_{\text{dispatch\_rpc}} < T_{\text{local\_swap\_exec}}$$

To keep $T_{\text{dispatch\_rpc}}$ negligible, heartbeats are capped strictly below **$1024\text{ bytes}$** (`len(raw.encode()) >= 1024` raises `ValueError` in [orchestrator/main.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/main.py#L188-L189)).

---

### 4.2 Kahn's Topological Wave-Front Decomposition & Cycle Detection (`kahn_waves`)
Implemented in [orchestrator/agents/planner.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/planner.py#L6-L20) and [manager/graph/planner.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/planner.py#L6-L44):

Given a directed dependency graph $G = (V, E)$ where $(u, v) \in E$ means task $v$ depends on parent task $u$ ($u \in \text{depends\_on}(v)$):

1. **In-Degree Initialization**:
   For each vertex $v \in V$, compute its remaining parent set $P_0(v) = \text{depends\_on}(v)$ and initial in-degree $\text{deg}^-(v) = |P_0(v)|$.
2. **Wave-Front Extraction ($k = 1, 2, \dots$)**:
   At step $k$, collect the frontier of all unscheduled vertices with zero remaining dependencies, sorted lexicographically for deterministic execution order:
   $$W_k = \text{sort}\Big(\big\{\, v \in V_{\text{rem}} \;\big|\; |P_{k-1}(v)| = 0 \,\big\}\Big)$$
3. **Cycle Invariant Check**:
   If $V_{\text{rem}} \neq \emptyset$ and $W_k = \emptyset$, the graph contains a directed cycle (or deadlock), and `kahn_waves()` immediately raises `ValueError("Cyclic dependency")`.
4. **Edge Relaxation**:
   Remove $W_k$ from $V_{\text{rem}}$ and update $P_k(v) = P_{k-1}(v) \setminus W_k$ for all remaining vertices.
5. **Termination & Complexity**:
   Terminates when $\sum_k |W_k| = |V|$ in $O(|V| + |E|)$ time, producing parallel execution waves $W_1, W_2, \dots, W_m$.

---

### 4.3 LangGraph `StateGraph` + `Send()` Event-Driven Parallel Fan-Out
Implemented in [manager/graph/workflow.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/manager/graph/workflow.py) and driven by [orchestrator/graph.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/graph.py):

Rather than blocking an entire wave on its slowest task (bulk-synchronous barrier stall), OFFDOCK re-evaluates the LangGraph `StateGraph` on `asyncio.FIRST_COMPLETED`:

$$\text{Ready}(v) \iff \text{Status}(v) = \texttt{PENDING} \;\land\; \forall u \in \text{depends\_on}(v): \text{Status}(u) = \begin{cases} \texttt{HEALTHY} & \text{if } \text{type}(u) = \texttt{service} \\ \texttt{COMPLETED} & \text{if } \text{type}(u) = \texttt{batch} \end{cases}$$

For every $v$ satisfying $\text{Ready}(v)$, the conditional router emits `Send("enqueue", {"task": v})`, spawning concurrent `asyncio.Task` coroutines guarded by an `asyncio.Lock` claim barrier and backed by a durable Redis outbox (`offdock:outbox:{job_id}:{task_id}`) so interrupted jobs resume idempotently on server restart.

---

### 4.4 Deterministic Atomic RAM Allocator & Multi-Factor Spread Score
Implemented in [orchestrator/allocator.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/allocator.py):

All capacity updates, reservations, and releases execute inside a single `asyncio.Lock()` mutex so 20+ simultaneous `Send()` branches cannot double-book the same physical RAM.

1. **Host Safety Floor (Non-Invasive OS Reserve)**:
   $$\text{HostFloor}(w) = \max\Big(M_{\min},\; 0.30 \cdot \text{TotalRAM}(w)\Big)$$
   where $M_{\min} = \texttt{host\_floor\_min\_mb}$ (default `512 MB`, configurable to `4096 MB` for 16 GB+ peer laptops), reserving at least 30% of total RAM for the host OS.
2. **Pending Lease Accounting & Net Usable RAM**:
   $$\text{Pending}(w) = \sum_{\substack{\ell \in \mathcal{L}_{\text{active}} \\ \text{node}(\ell) = w}} R(\ell)$$
   $$\text{UsableRAM}(w) = \text{AvailableRAM}(w) - \text{HostFloor}(w) - \text{Pending}(w)$$
3. **3-Condition Admission Control Gate ($\beta = 1.15$)**:
   A worker $w$ is eligible to host a task requesting $R_t$ MB with base image $I_t$ if and only if:
   - **Freshness**: $t_{\text{now}} - t_{\text{seen}}(w) \le 15\text{ seconds}$
   - **CPU Headroom**: $\text{CPU\%}(w) < 85.0\%$
   - **Memory Headroom with 15% Safety Buffer**: $\text{UsableRAM}(w) \ge 1.15 \cdot R_t$
4. **Multi-Factor Spread & Cache-Locality Score**:
   Among all admitted workers, the allocator selects $w^* = \arg\max_w \text{Score}(w, t)$:
   $$\text{Score}(w, t) = 0.70 \cdot \frac{\text{UsableRAM}(w)}{\text{TotalRAM}(w)} + 0.20 \cdot \left(1 - \frac{\text{CPU\%}(w)}{100}\right) + 0.10 \cdot \mathbb{I}\big[I_t \in \text{CachedImages}(w)\big]$$
   Immediately upon selection, `self.leases[attempt] = Lease(w^*, R_t)` is recorded atomically before releasing the lock.

---

### 4.5 Deterministic AST/Regex Dockerfile Security Gate (`security_gate`)
Implemented in [orchestrator/agents/containerizer.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/containerizer.py#L6-L18):

Every candidate `Dockerfile` (whether from a repo, Redis cache, or the Containerizer LLM) must pass five deterministic checks before dispatch:
1. **Line-Continuation Normalization**: Collapses backslash-escaped newlines (`\\\s*\n`) into single logical lines so split tokens cannot evade inspection.
2. **Privilege & Remote-Code-Execution Blocklist**: Rejects `--privileged`, `/var/run/docker.sock`, and piped remote shell execution (`(curl|wget) ... | (ba)?sh`).
3. **Stage Verification**: Splits by `(?im)^FROM\s+` and verifies at least one valid build stage exists.
4. **Mandatory Non-Root Final User**: Extracts all `USER <spec>` directives in the final stage and rejects the image if no `USER` is declared or if the final user UID/name resolves to `root` or `0`.
5. **Unsupported Build Directive Filter**: Blocks remote URL `ADD https?://`, BuildKit host mounts (`RUN --mount`), and deferred `ONBUILD` triggers.

---

### 4.6 OOM (`Exit 137`) Geometric Memory Scaling & Bounded Retry Automaton
Implemented in [orchestrator/agents/recovery.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/recovery.py):

When a container fails at attempt $r \in \{0, 1\}$ with kernel-confirmed `oom_killed = True`:

$$R_{\text{next}} = \min\Big(4096\text{ MB},\; \lceil 1.5 \cdot R_{\text{current}} \rceil\Big)$$

- **Evidence Requirement**: An exit code of `137` *without* `oom_killed == True` is treated as an external `SIGKILL` and **aborts** (`test_recovery_bounds_and_oom_evidence`).
- **Ceiling & Retry Cap**: If $R_{\text{current}} \ge 4096\text{ MB}$ or $r \ge 2$, the automaton transitions deterministically to `ABORT`, preventing infinite retry loops.
- **Verified Remediation Learning**: When a retried container subsequently exits `0`, the Orchestrator persists `(signature(incident, ram), decision)` into Redis (`offdock:cache:recovery:{sha256}`, TTL 24h) so identical future failures heal in $O(1)$ without an LLM call.

---

### 4.7 Content-Addressable SHA-256 Redis 5-Namespace Cache & Stream Fan-In
Implemented in [orchestrator/agents/memory.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/agents/memory.py) and [shared/redis_layer.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/shared/redis_layer.py):

Every cache key is derived from the canonical, key-sorted JSON representation of its inputs:

$$K(\text{namespace}, x) = \texttt{prefix}(\text{namespace}) \,\Vert\, \text{SHA256}\Big(\texttt{json.dumps}(x,\; \texttt{sort\_keys=True},\; \texttt{separators=(",",":")})\Big)$$

| Namespace | Redis Key Prefix | TTL | Size / Policy Guard |
| :--- | :--- | :--- | :--- |
| **Planner Memory** | `offdock:cache:planner:{sha256}` | `1,800s` (30m) | Re-validates cached `ExecutionPlan` against live `RepositoryReport`s |
| **Repo Scan Cache** | `offdock:cache:scan:{sha256}` | `21,600s` (6h) | Keyed by `(repo_url, resolved_40_hex_commit_sha)` |
| **Containerizer Cache** | `offdock:cache:dockerfile:{sha256}` | `86,400s` (24h) | Re-runs `security_gate()` on every cache hit before use |
| **Recovery Memory** | `offdock:cache:recovery:{sha256}` | `86,400s` (24h) | Only populated after a remediated retry actually succeeds (`Exit 0`) |
| **Execution Cache** | `offdock:exec_cache:{sha256}` | `900s` (15m) | Restricted to root `batch` tasks (`depends_on == []`); capped at **$\le 1\text{ MB}$** |
| **Task Log Streams** | `offdock:stream:{job_id}:{task_id}` | `3,600s` (1h) | Redis Streams (`XADD` with `MAXLEN ~ 500`); read via `XRANGE` for Wave-2 fan-in and `XREAD` for live SSE |

*(When `REDIS_URL` is empty, `Store` transparently falls back to an in-process `fakeredis.aioredis.FakeRedis` instance with identical stream and TTL semantics.)*

---

### 4.8 Cryptographic Node Pairing, Hardened Sandbox & Reverse Tunnel Proxy
Implemented in [orchestrator/main.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/main.py), [orchestrator/tunnel_manager.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/orchestrator/tunnel_manager.py), and [node_agent/node_cli_agent.py](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/node_agent/node_cli_agent.py):

1. **HMAC-SHA256 Node Pairing (`POST /v1/nodes/pair`)**:
   - Generates `node_id = "node-" + secrets.token_hex(4)` and a 24-byte cryptographic `nonce`.
   - Computes $\text{sig} = \text{HMAC-SHA256}(\texttt{MESH\_MASTER\_SECRET},\; \text{node\_id} \,\Vert\, \text{nonce})$ and issues `session_token = f"{nonce}.{sig}"`.
   - Stores only the one-way hash $\text{SHA256}(\text{session\_token})$ in Redis under `offdock:pair:{node_id}` (TTL 24h) and verifies incoming `/ws/node/{node_id}` handshakes in constant time via `hmac.compare_digest`.
2. **Kernel & Cgroup Sandbox Enforcement (`node_cli_agent.py`)**:
   Every container runs with:
   - `user="1000"` (non-root execution)
   - `cap_drop=["ALL"]` and `security_opt=["no-new-privileges:true"]`
   - `read_only=True` root filesystem with `tmpfs={"/tmp": "rw,noexec,nosuid,size=64m"}`
   - Hard memory ceiling with swap disabled: `mem_limit=f"{mem_limit_mb}m"`, `memswap_limit=f"{mem_limit_mb}m"`
   - Fork-bomb protection: `pids_limit=128` and `nano_cpus=int(cpus * 1e9)`
   - Loopback-only service binding: `ports={f"{port}/tcp": ("127.0.0.1", None)}`
3. **Bounded WebSocket Reverse Proxy (`ANY /proxy/{node_id}/{task_id}/{path:path}`)**:
   - Authenticates callers against the per-task bearer token stored at `offdock:proxy:{node_id}:{task_id}`.
   - Multiplexes HTTP/MCP requests as base64-encoded `PROXY_REQUEST` / `PROXY_RESPONSE` frames over the worker's outbound WebSocket tunnel with a strict **500 KB payload cap** and 25-second timeout.
4. **Truncated Exponential Backoff with Jitter**:
   When a worker WebSocket disconnects, `node_cli_agent.py` reconnects after waiting:
   $$\text{Delay}(r) = \min(60,\; 2^r) + U(0, 1)\text{ seconds}$$

---

## 5. Repository Structure

```text
├── contracts/                        # JSON Schemas for Planner, Containerizer, Recovery & AgentError
├── docs/                             # Architecture specifications (planning, builds, dispatch, recovery, deployment)
├── examples/                         # Sample verified ExecutionPlan trace (plan.json)
├── manager/
│   └── graph/                        # Typed LLM proposal client, plan validator, and LangGraph Send() workflow
├── node_agent/
│   ├── node_cli_agent.py             # Outbound Docker/Railpack worker daemon, psutil heartbeat & loopback proxy
│   └── requirements.txt              # Worker dependencies (websockets, docker, psutil, httpx)
├── orchestrator/
│   ├── agents/                       # LLMClient, Redis 5-namespace Memory, Planner, Containerizer, Recovery
│   ├── static/index.html             # Built-in lightweight Orchestrator Web UI
│   ├── allocator.py                  # Atomic asyncio.Lock RAM allocator & multi-factor node scorer
│   ├── config.py                     # Pydantic Settings (Gemini / OpenRouter, Redis, Docker Hub, E2B, secrets)
│   ├── graph.py                      # Durable job state machine, Wave fan-in/fan-out & outbox recovery
│   ├── main.py                       # FastAPI server (/healthz, /v1/nodes/pair, /v1/jobs, /ws/cluster, /ws/node, /proxy)
│   ├── repo_scanner.py               # Read-only GitHub commit SHA & manifest scanner
│   ├── sandbox_launcher.py           # On-demand E2B cloud sandbox spawner
│   └── tunnel_manager.py             # Bidirectional WebSocket multiplexer & subscriber broadcaster
├── prompts/                          # System prompts for Planner, Containerizer, and Recovery agents
├── shared/
│   ├── docker_auth.py                # Docker Hub Registry v2 bearer token & pull credential helper
│   ├── redis_layer.py                # Async Redis / FakeRedis store, checkpoints & Redis Streams (XADD/XREAD)
│   └── schemas.py                    # Strict Pydantic v2 wire schemas
├── tests/                            # Pytest suite (DAG Kahn waves, 20-way allocator contention, OOM recovery, tunnels)
├── rammesh_orchestrator_console.tsx  # Full React Mission Control frontend integrated with Orchestrator endpoints
├── render.yaml                       # Render Blueprint (offdock-orchestrator Web Service + offdock-kv Redis)
└── requirements.txt                  # FastAPI + LangGraph + Redis production dependencies
```

---

## 6. Quickstart & Verification

### 6.1 Run the Verification Suite
```bash
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -v
```

### 6.2 Start the Orchestrator Server
```bash
uvicorn orchestrator.main:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 20
```
- `GET /healthz` returns `{"status": "ok"}` even with empty credentials.
- Pair a peer worker via `POST /v1/nodes/pair` (with `Authorization: Bearer <ADMIN_DASHBOARD_KEY>`) and run the generated `node_cli_agent.py` join command on any Docker-capable machine.
- Submit multi-repo jobs via `POST /v1/jobs`, stream live container logs via `GET /v1/jobs/{job_id}/stream`, and monitor real-time cluster telemetry over `WS /ws/cluster` or through [rammesh_orchestrator_console.tsx](file:///c:/Users/Shrestha%20Ranjan/Desktop/SatHack%20Frontend/rammesh_orchestrator_console.tsx).
