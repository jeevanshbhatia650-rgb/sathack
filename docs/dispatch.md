# Dispatch and worker protocol

## Selecting ready work

On plan admission and every accepted lifecycle event, inspect pending children. A batch parent must be COMPLETED with its declared outputs published. A service parent must be HEALTHY on a live lease. Never require unrelated siblings to finish. Claim each ready task by compare-and-set from PENDING before emitting LangGraph Send("prepare_task", task_attempt). Send carries a small immutable identity. The node enqueues preparation and returns. Workers report completion to a fresh manager graph invocation so a LangGraph superstep cannot impose a batch-wide completion barrier.

Serialize updates per job or use optimistic revision checks. Recheck service readiness immediately before launch. A terminally failed required parent leaves its dependent BLOCKED with the parent ID.
