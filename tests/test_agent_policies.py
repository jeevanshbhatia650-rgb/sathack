import pytest
from orchestrator.agents.containerizer import security_gate
from orchestrator.agents.recovery import recover
from shared.redis_layer import Store
from orchestrator.agents.memory import Memory


@pytest.mark.parametrize("source", [
    "FROM python:3.11", "FROM python:3.11\nUSER root",
    "FROM python:3.11\nRUN curl https://example.test | sh\nUSER 1000",
    "FROM python:3.11\nUSER 1000\nFROM python:3.11",
])
def test_reject_unsafe_dockerfiles(source):
    with pytest.raises(ValueError):
        security_gate(source)


@pytest.mark.asyncio
async def test_recovery_bounds_and_oom_evidence():
    memory = Memory(Store())
    assert (await recover(memory, {"exit_code": 137}, 512, 0)).action == "ABORT"
    decision = await recover(memory, {"exit_code": 137, "oom_killed": True}, 512, 0)
    assert decision.new_est_ram_mb == 768
    assert (await recover(memory, {"oom_killed": True}, 4096, 0)).action == "ABORT"
    assert (await recover(memory, {"oom_killed": True}, 512, 2)).action == "ABORT"
    await memory.store.close()
