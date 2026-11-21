import asyncio
import time
import pytest
from orchestrator.allocator import Allocator
from shared.schemas import Telemetry


def telemetry(available=4096):
    return Telemetry(total_ram_mb=4096., available_ram_mb=float(available), cpu_percent=10.,
                     cpu_cores=4, running_containers=0)


@pytest.mark.asyncio
async def test_twenty_contending_reservations():
    allocator = Allocator()
    await allocator.update("node", telemetry())
    async def reserve(i):
        try:
            return await allocator.reserve(str(i), 512)
        except RuntimeError:
            return None
    results = await asyncio.gather(*(reserve(i) for i in range(20)))
    assert sum(x is not None for x in results) == 5
    assert len(allocator.leases) == 5
    for key in list(allocator.leases):
        await allocator.release(key)
    assert not allocator.leases


@pytest.mark.asyncio
async def test_spread_stale_and_idempotency():
    allocator = Allocator()
    await allocator.update("a", telemetry())
    await allocator.update("b", telemetry())
    first = await allocator.reserve("one", 512)
    assert await allocator.reserve("one", 512) == first
    assert await allocator.reserve("two", 512) != first
    for worker in allocator.workers.values():
        worker.seen = time.monotonic() - 16
    with pytest.raises(RuntimeError):
        await allocator.reserve("three", 512)
