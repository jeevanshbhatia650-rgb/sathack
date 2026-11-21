import pytest
from shared.schemas import ExecutionPlan, TaskNode
from orchestrator.agents.planner import kahn_waves


def task(name, parents=()):
    return TaskNode(id=name, repo_url="https://github.com/example/repo", task_type="batch",
                    depends_on=list(parents))


def test_parallel_and_sequential():
    plan = ExecutionPlan(job_id="job", tasks=[task("aa"), task("bb"), task("cc", ["aa", "bb"])])
    assert kahn_waves(plan) == [["aa", "bb"], ["cc"]]


@pytest.mark.parametrize("tasks", [
    [task("aa", ["bb"]), task("bb", ["aa"])],
    [task("aa", ["aa"])], [task("aa", ["zz"])], [task("aa"), task("aa")],
])
def test_reject_invalid_graph(tasks):
    with pytest.raises(ValueError):
        kahn_waves(ExecutionPlan(job_id="job", tasks=tasks))
