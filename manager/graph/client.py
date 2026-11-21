import json
from importlib.resources import files
from typing import Protocol, TypeVar
from pydantic import TypeAdapter
from shared.schemas import AgentError

T = TypeVar("T")


class ModelClient(Protocol):
    async def complete(self, *, system: str, data: dict, schema: dict) -> str:
        """Return a complete JSON response. Implementations provide provider credentials."""


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


async def propose(client: ModelClient, role: str, data: dict, model: type[T]) -> T | AgentError:
    adapter = TypeAdapter(model | AgentError)
    prompt = files("manager.graph").joinpath("prompts", role + ".txt").read_text()
    response = await client.complete(system=prompt, data=data, schema=adapter.json_schema())
    return adapter.validate_python(json.loads(response, object_pairs_hook=unique_object), strict=True)
