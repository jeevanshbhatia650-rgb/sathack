async def spawn(settings, client, node_id: str, token: str, origin: str) -> dict:
    if not settings.e2b_api_key:
        raise ValueError("E2B_API_KEY is not configured. Pair an existing Docker host instead.")
    if not settings.e2b_template:
        raise ValueError("E2B_TEMPLATE must identify a Docker-capable template with the node agent installed.")
    response = await client.post("https://api.e2b.dev/sandboxes",
        headers={"X-API-Key": settings.e2b_api_key},
        json={"templateID": settings.e2b_template, "timeout": 300,
              "envVars": {"SHARED_NODE_ID": node_id, "SESSION_TOKEN": token, "ORCHESTRATOR_URL": origin}})
    response.raise_for_status()
    return response.json()
