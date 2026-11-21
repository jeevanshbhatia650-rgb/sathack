from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from .state import WorkflowState


def ready_tasks(state):
    tasks = {task.id: task for task in state["plan"].tasks}
    statuses = state["statuses"]
    return [
        task for task in tasks.values()
        if statuses.get(task.id, "PENDING") == "PENDING"
        and all(statuses.get(parent) == (
            "HEALTHY" if tasks[parent].task_type == "service" else "COMPLETED"
        ) for parent in task.depends_on)
    ]


def create_workflow(claim_and_enqueue):
    """Adapter atomically claims a task and enqueues work using a durable outbox."""
    async def dispatch(state):
        return {}

    def route(state):
        return [Send("enqueue", {"task": task}) for task in ready_tasks(state)] or END

    async def enqueue(state):
        await claim_and_enqueue(state["task"])
        return {}

    graph = StateGraph(WorkflowState)
    graph.add_node("dispatch", dispatch)
    graph.add_node("enqueue", enqueue)
    graph.add_edge(START, "dispatch")
    graph.add_conditional_edges("dispatch", route)
    graph.add_edge("enqueue", END)
    return graph.compile()
