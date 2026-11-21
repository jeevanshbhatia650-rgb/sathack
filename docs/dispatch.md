# Dispatch and worker protocol

## Selecting ready work

On plan admission and every accepted lifecycle event, inspect pending children. A batch parent must be COMPLETED with its declared outputs published. A service parent must be HEALTHY on a live lease. Never require unrelated siblings to finish. Claim each ready task by compare-and-set from PENDING before emitting LangGraph Send("prepare_task", task_attempt). Send carries a small immutable identity. The node enqueues preparation and returns. Workers report completion to a fresh manager graph invocation so a LangGraph superstep cannot impose a batch-wide completion barrier.

Serialize updates per job or use optimistic revision checks. Recheck service readiness immediately before launch. A terminally failed required parent leaves its dependent BLOCKED with the parent ID.

## Allocation

Filter to live workers with fresh telemetry and compatible runtime and network capabilities. Subtract committed reservations and the configured host safety floor from usable capacity under one consistent accounting model. Charge each reservation once. Check CPU headroom, RAM and the task's ceilings, then atomically reserve against the worker capacity revision. A concurrent winner forces reevaluation. Insufficient capacity queues the task until capacity changes or its deadline expires. Agent estimates are inputs to admission. Release reservations on completion, abort or confirmed lease expiry.

## Handoff

A deploy blueprint binds job, task, attempt, epoch, worker, expiry, repo URL and commit, workload argv, build artifact digest, transport, limits, env binding names and input artifact references. Authenticate both peers over the Tailscale network and verify the manager's signed payload. Fetch only the authorized commit and check its SHA before building. Resolve env bindings on the worker at run time. Publish batch artifacts with integrity digests before reporting COMPLETED. A service registers its endpoint and health against the current epoch.

Use a durable outbox in the same transaction as the task claim. Replay unacknowledged deliveries by attempt ID. Workers persist acceptance before launch and reconcile by attempt label on restart. Accept status events only for the active epoch and monotonically advancing sequence. Stale events must never release the current reservation or re-enable a stale endpoint.
