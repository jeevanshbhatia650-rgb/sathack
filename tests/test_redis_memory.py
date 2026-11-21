import pytest
from shared.redis_layer import Store
from orchestrator.agents.memory import Memory


@pytest.mark.asyncio
async def test_caches_checkpoint_and_stream():
    store = Store()
    memory = Memory(store)
    for kind in ("planner", "scan", "dockerfile", "recovery", "exec"):
        await memory.put(kind, ["sha", "command"], {"value": kind})
        assert await memory.get(kind, ["sha", "command"]) == {"value": kind}
        assert await memory.get(kind, ["different-sha", "command"]) is None
        assert await store.redis.ttl(memory.key(kind, ["sha", "command"])) > 0
    await store.checkpoint("job", {"status": "RUNNING"})
    assert (await store.state("job"))["status"] == "RUNNING"
    await store.log("job", "task", '{"answer":42}')
    records = await store.redis.xread({"offdock:stream:job:task": "0"})
    assert records[0][1][0][1]["text"] == '{"answer":42}'
    with pytest.raises(ValueError):
        await memory.put("exec", "large", "x" * 1_000_001)
    await store.close()
