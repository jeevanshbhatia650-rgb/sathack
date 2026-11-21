import asyncio
import time
from dataclasses import dataclass
from shared.schemas import Telemetry


@dataclass
class Worker:
    telemetry: Telemetry
    seen: float


@dataclass
class Lease:
    node_id: str
    ram_mb: int


class Allocator:
    def __init__(self, floor_mb: int = 512) -> None:
        self.floor_mb = floor_mb
        self.workers: dict[str, Worker] = {}
        self.leases: dict[str, Lease] = {}
        self.lock = asyncio.Lock()

    async def update(self, node: str, telemetry: Telemetry) -> None:
        async with self.lock:
            self.workers[node] = Worker(telemetry, time.monotonic())

    async def reserve(self, attempt: str, ram_mb: int, image: str = "") -> str:
        async with self.lock:
            if attempt in self.leases:
                return self.leases[attempt].node_id
            candidates = []
            for node, worker in self.workers.items():
                t = worker.telemetry
                pending = sum(x.ram_mb for x in self.leases.values() if x.node_id == node)
                usable = t.available_ram_mb - max(self.floor_mb, .30 * t.total_ram_mb) - pending
                if time.monotonic() - worker.seen > 15 or t.cpu_percent >= 85 or usable < 1.15 * ram_mb:
                    continue
                score = .7 * usable / t.total_ram_mb + .2 * (1 - t.cpu_percent / 100)
                score += .1 * (image in t.cached_base_images)
                candidates.append((score, node))
            if not candidates:
                raise RuntimeError("No node has sufficient fresh capacity")
            node = max(candidates)[1]
            self.leases[attempt] = Lease(node, ram_mb)
            return node

    async def release(self, attempt: str) -> None:
        async with self.lock:
            self.leases.pop(attempt, None)
