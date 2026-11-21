import asyncio
import secrets
from dataclasses import dataclass, field
from fastapi import WebSocket


@dataclass
class Connection:
    socket: WebSocket
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    async def send(self, frame: dict) -> None:
        async with self.lock:
            await self.socket.send_json(frame)


class Tunnels:
    def __init__(self) -> None:
        self.nodes: dict[str, Connection] = {}
        self.pending: dict[str, tuple[str, asyncio.Future]] = {}
        self.completed: dict[str, tuple[str, dict]] = {}
        self.results: dict[str, tuple[str, asyncio.Future]] = {}
        self.subscribers: set[asyncio.Queue] = set()

    async def broadcast(self, frame: dict) -> None:
        for queue in tuple(self.subscribers):
            if queue.full():
                queue.get_nowait()
            queue.put_nowait(frame)

    async def send(self, node: str, frame: dict) -> None:
        connection = self.nodes.get(node)
        if connection is None:
            raise RuntimeError("Node disconnected")
        await connection.send(frame)

    async def proxy(self, node: str, frame: dict) -> dict:
        request_id = secrets.token_hex(16)
        future = asyncio.get_running_loop().create_future()
        self.pending[request_id] = (node, future)
        try:
            await self.send(node, {**frame, "type": "PROXY_REQUEST", "request_id": request_id})
            return await asyncio.wait_for(future, 30)
        finally:
            self.pending.pop(request_id, None)

    def resolve(self, table: dict, node: str, key: str, frame: dict) -> None:
        if table is self.results:
            self.completed[key] = (node, frame)
            if len(self.completed) > 100:
                self.completed.pop(next(iter(self.completed)))
        entry = table.get(key)
        if entry and entry[0] == node and not entry[1].done():
            entry[1].set_result(frame)

    async def execute(self, node: str, frame: dict, timeout: float) -> dict:
        attempt = frame["attempt_id"]
        completed = self.completed.get(attempt)
        if completed and completed[0] == node:
            return completed[1]
        for _ in range(60):
            if node in self.nodes:
                break
            await asyncio.sleep(1)
        future = asyncio.get_running_loop().create_future()
        self.results[attempt] = (node, future)
        try:
            await self.send(node, {**frame, "type": "EXECUTE_JOB"})
            return await asyncio.wait_for(asyncio.shield(future), timeout)
        finally:
            self.results.pop(attempt, None)
