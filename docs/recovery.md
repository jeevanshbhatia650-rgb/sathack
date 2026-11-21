# Runtime recovery

The worker emits attempt ID, event sequence, exit status, OOMKilled, recent bounded memory samples, health results and redacted log tail. For a batch exit of zero, publish outputs and mark completion. For a service's clean exit, remove readiness and apply its declared lifecycle policy without a model call. Route a build failure to build repair. Repeated failed probes, exit 1 or 2, runtime exceptions and unexplained exit 137 can open a runtime incident. Deduplicate by task attempt and incident identity.

Gather the last accepted decisions, remaining retry budget, env binding presence and current limits. The recovery agent proposes one enumerated action. The manager validates the reason against incident evidence. An invocation failure leaves the incident stopped for review.

## Action admission

| Proposal | Manager decision |
| --- | --- |
| RETRY_SAME_WORKER | Require a live worker, credible transient cause and remaining budget. |
| INCREASE_MEMORY | Require confirmed memory pressure, such as OOMKilled plus the enforced limit. Propose min(ceil(1.5 × current MB), 4096). At or above 4096 MB reject the increase. Send the proposal through normal allocation. |
| REROUTE_WORKER | Fence the old attempt, verify restart safety and acquire a fresh eligible lease. |
| PATCH_RUNTIME | Resolve a correction from previously verified argv or a configured env binding reference. The decision schema carries no patch payload. If no unique validated correction exists, abort. |
| ABORT | Record reason, release the lease and propagate failure to blocked descendants. |

Require retry_allowed=false for ABORT and true for admitted retry actions. Require new_est_ram_mb only for a memory increase. Count runtime attempts atomically against a separately configured finite retry limit. Reject a repeat of the same action and parameters on unchanged evidence. Never reissue a task with external side effects unless it has an idempotency or restart contract.

## Worker loss

The registry expires a worker after the configured heartbeat deadline, increments its lease epoch and invalidates service discovery. Stop new dependents while the service lacks a healthy endpoint. Reconcile already-running consumers according to their declared service-loss policy. Requeue restart-safe tasks from the verified image and persisted inputs once the prior attempt is fenced. If an offline attempt could still write externally and the destination cannot enforce fencing, hold the job for reconciliation. Routine offline routing needs no model. Restarting a service creates a new process and MCP sessions must reconnect.
