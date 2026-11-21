from collections import deque
from manager.graph.planner import plan, validate_plan
from shared.schemas import AgentError, ExecutionPlan


def kahn_waves(plan: ExecutionPlan) -> list[list[str]]:
    tasks = {task.id: task for task in plan.tasks}
    if len(tasks) != len(plan.tasks):
        raise ValueError("Duplicate task ID")
    remaining = {key: set(task.depends_on) for key, task in tasks.items()}
    if any(not parents <= tasks.keys() for parents in remaining.values()):
        raise ValueError("Unknown dependency")
    waves = []
    while remaining:
        ready = sorted(key for key, parents in remaining.items() if not parents)
        if not ready:
            raise ValueError("Cyclic dependency")
        waves.append(ready)
        remaining = {key: parents - set(ready) for key, parents in remaining.items() if key not in ready}
    return waves


async def create_plan(client, memory, request, reports, job_id):
    inputs = [request.model_dump(mode="json", exclude={"repos"}), [r.model_dump() for r in reports]]
    cached = await memory.get("planner", inputs) if request.use_agent_cache else None
    if cached:
        cached["job_id"] = job_id
        return validate_plan(ExecutionPlan.model_validate(cached), reports, job_id)
    result = await plan(client, request.prompt, reports, job_id)
    if isinstance(result, AgentError):
        raise ValueError(result.reason)
    kahn_waves(result)
    if request.use_agent_cache:
        await memory.put("planner", inputs, result.model_dump())
    return result
