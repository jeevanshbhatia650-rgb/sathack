import base64
import json


def registry_auth(username: str, token: str) -> str:
    if not username or not token or any(c.isspace() for c in username + token):
        raise ValueError("Docker Hub username and PAT are required")
    return base64.urlsafe_b64encode(json.dumps({
        "username": username, "password": token,
        "serveraddress": "https://index.docker.io/v1/",
    }).encode()).decode()


async def validate_credentials(client, username: str, token: str) -> None:
    registry_auth(username, token)
    response = await client.get("https://auth.docker.io/token", params={
        "service": "registry.docker.io",
    }, auth=(username, token))
    response.raise_for_status()


async def pull_credentials(client, username: str, token: str, image: str) -> dict[str, str]:
    registry_auth(username, token)
    name = image.split("@")[0].split(":")[0]
    parts = name.split("/")
    if parts[0] in ("docker.io", "index.docker.io"):
        parts = parts[1:]
    elif "." in parts[0] or ":" in parts[0] or parts[0] == "localhost":
        raise ValueError("dockerhub mode accepts only Docker Hub images")
    if len(parts) == 1:
        parts.insert(0, "library")
    if len(parts) != 2 or any(not part for part in parts):
        raise ValueError("Invalid Docker Hub repository")
    response = await client.get("https://auth.docker.io/token", params={
        "service": "registry.docker.io", "scope": "repository:" + "/".join(parts) + ":pull",
    }, auth=(username, token))
    response.raise_for_status()
    return {"registrytoken": response.json()["token"]}
