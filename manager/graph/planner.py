from collections import deque
from shared.schemas import AgentError, ExecutionPlan, RepositoryReport
from .client import propose


def validate_plan(plan: ExecutionPlan, reports: list[RepositoryReport], job_id: str) -> ExecutionPlan:
    if plan.job_id != job_id or not plan.tasks:
        raise ValueError("Invalid job or empty plan")
    tasks = {task.id: task for task in plan.tasks}
    if len(tasks) != len(plan.tasks):
        raise ValueError("Duplicate task ID")
    children = {key: [] for key in tasks}
    degrees = {}
    resolved = []
    for task in plan.tasks:
        parents = task.depends_on
        if len(set(parents)) != len(parents) or task.id in parents or any(p not in tasks for p in parents):
            raise ValueError("Invalid dependency")
        matches = [r for r in reports if r.repo_url == task.repo_url and
                   task.commit_sha in (None, "HEAD", r.commit_sha)]
        if len(matches) != 1:
            raise ValueError("Repository revision is ambiguous or unverified")
        report = matches[0]
        command = task.start_cmd_override
        if command is None and len(report.commands) == 1:
            command = report.commands[0]
        if command not in report.commands or not set(task.env_keys_required) <= set(report.env_keys):
            raise ValueError("Unverified command or environment key")
        resolved.append(task.model_copy(update={"commit_sha": report.commit_sha, "start_cmd_override": command}))
        degrees[task.id] = len(parents)
        for parent in parents:
            children[parent].append(task.id)
    ready = deque(key for key, degree in degrees.items() if degree == 0)
    visited = 0
    while ready:
        parent = ready.popleft()
        visited += 1
        for child in children[parent]:
            degrees[child] -= 1
            if degrees[child] == 0:
                ready.append(child)
    if visited != len(tasks):
        raise ValueError("Cyclic plan")
    return plan.model_copy(update={"tasks": resolved})


async def plan(client, request: str, reports: list[RepositoryReport], job_id: str):
    result = await propose(client, "planner", {
        "job_id": job_id, "user_request": request,
        "repositories": [r.model_dump() for r in reports],
    }, ExecutionPlan)
    return result if isinstance(result, AgentError) else validate_plan(result, reports, job_id)
