import json
from typing import Any
from redis.asyncio import Redis
from fakeredis.aioredis import FakeRedis


class Store:
    def __init__(self, url: str = "") -> None:
        self.redis = Redis.from_url(url, decode_responses=True) if url else FakeRedis(decode_responses=True)

    async def get(self, key: str) -> Any:
        value = await self.redis.get(key)
        return json.loads(value) if value else None

    async def put(self, key: str, value: Any, ttl: int) -> None:
        payload = json.dumps(value, separators=(",", ":"), allow_nan=False)
        if len(payload.encode()) > 1_000_000:
            raise ValueError("Cache payload exceeds 1 MB")
        await self.redis.setex(key, ttl, payload)

    async def checkpoint(self, job_id: str, state: dict) -> None:
        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.hset(f"offdock:job:{job_id}:state", mapping={"json": json.dumps(state)})
            pipe.expire(f"offdock:job:{job_id}:state", 3600)
            await pipe.execute()

    async def state(self, job_id: str) -> dict | None:
        value = await self.redis.hget(f"offdock:job:{job_id}:state", "json")
        return json.loads(value) if value else None

    async def log(self, job_id: str, task_id: str, text: str) -> str:
        key = f"offdock:stream:{job_id}:{task_id}"
        async with self.redis.pipeline(transaction=True) as pipe:
            pipe.xadd(key, {"task_id": task_id, "text": text[:8192]}, maxlen=500, approximate=True)
            pipe.expire(key, 3600)
            result = await pipe.execute()
        return result[0]

    async def close(self) -> None:
        await self.redis.aclose()
