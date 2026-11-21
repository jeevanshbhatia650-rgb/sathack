import httpx


class LLMClient:
    def __init__(self, settings, role: str, client: httpx.AsyncClient) -> None:
        self.settings = settings
        self.role = role
        self.client = client

    async def complete(self, *, system: str, data: dict, schema: dict) -> str:
        import json
        if not self.settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is required for agent requests")
        response = await self.client.post(self.settings.llm_base_url.rstrip("/") + "/chat/completions",
            headers={"Authorization": "Bearer " + self.settings.gemini_api_key},
            json={"model": getattr(self.settings, self.role + "_model"),
                  "messages": [{"role": "system", "content": system},
                               {"role": "user", "content": json.dumps(data)}],
                  "response_format": {"type": "json_schema", "json_schema": {
                      "name": "offdock_result", "schema": schema}}},
            timeout=90)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
