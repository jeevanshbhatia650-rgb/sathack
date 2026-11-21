from typing import TypedDict
from shared.schemas import ExecutionPlan


class WorkflowState(TypedDict):
    plan: ExecutionPlan
    statuses: dict[str, str]
