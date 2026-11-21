import hashlib
import json
from typing import Any
from shared.redis_layer import Store


def digest(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


class Memory:
    TTLS = {"planner": 1800, "scan": 21600, "dockerfile": 86400, "recovery": 86400, "exec": 900}

    def __init__(self, store: Store) -> None:
        self.store = store

    def key(self, kind: str, inputs: Any) -> str:
        prefix = "offdock:exec_cache:" if kind == "exec" else f"offdock:cache:{kind}:"
        return prefix + digest(inputs)

    async def get(self, kind: str, inputs: Any) -> Any:
        return await self.store.get(self.key(kind, inputs))

    async def put(self, kind: str, inputs: Any, result: Any) -> None:
        await self.store.put(self.key(kind, inputs), result, self.TTLS[kind])
