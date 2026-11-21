import base64
import json
import re
import shlex
import tomllib
from urllib.parse import quote
from orchestrator.agents.memory import Memory
from shared.schemas import RepositoryReport, RepoSubmissionItem


async def scan(client, memory: Memory, item: RepoSubmissionItem, token: str = "") -> dict:
    repo = str(item.repo_url).removesuffix("/").removesuffix(".git")
    owner_repo = repo.split("github.com/")[1]
    base = "https://api.github.com/repos/" + owner_repo
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    commit = await client.get(base + "/commits/" + quote(item.branch, safe=""), headers=headers)
    commit.raise_for_status()
    sha = commit.json()["sha"]
    key = [repo, sha]
    cached = await memory.get("scan", key)
    if cached:
        return cached
    response = await client.get(base + "/git/trees/" + sha, params={"recursive": "1"}, headers=headers)
    response.raise_for_status()
    tree = response.json()
    if tree.get("truncated"):
        raise ValueError("Repository tree is truncated")
    files = [entry["path"] for entry in tree["tree"]
             if entry["type"] == "blob" and entry.get("mode") != "120000"
             and entry["path"].count("/") < 3
             and not set(entry["path"].split("/")) & {"node_modules", "vendor", ".git", "dist"}]
    manifests = {}
    budget = 10000
    for name in ("package.json", "pyproject.toml", "requirements.txt", "Cargo.toml", "go.mod", "Dockerfile", "README.md"):
        if name not in files:
            continue
        response = await client.get(base + "/contents/" + name, params={"ref": sha}, headers=headers)
        response.raise_for_status()
        content = response.json()
        if content.get("size", 0) > 100_000:
            continue
        value = base64.b64decode(content["content"]).decode("utf-8", errors="replace")
        limit = 1500 if name == "README.md" else min(3000, budget)
        if len(value) > limit and name != "README.md":
            continue
        manifests[name] = value[:limit]
        budget -= len(manifests[name])
    commands = []
    if "package.json" in manifests:
        scripts = json.loads(manifests["package.json"]).get("scripts", {})
        commands.extend("npm run " + name for name in ("start", "serve") if name in scripts)
    if "pyproject.toml" in manifests:
        project = tomllib.loads(manifests["pyproject.toml"]).get("project", {})
        commands.extend(project.get("scripts", {}).keys())
    if "Dockerfile" in manifests:
        for command in re.findall(r"(?im)^CMD\s+(\[.*\])$", manifests["Dockerfile"]):
            argv = json.loads(command)
            if isinstance(argv, list) and all(isinstance(x, str) for x in argv):
                commands.append(shlex.join(argv))
    for command in re.findall(r"(?m)^\s*(python(?:3)?\s+(?:-m\s+)?[\w./-]+)\s*$",
                              manifests.get("README.md", "")):
        parts = shlex.split(command)
        entry = parts[-1].replace(".", "/") + ".py" if "-m" in parts else parts[-1]
        if entry in files:
            commands.append(command.strip())
    commands = sorted(set(commands))
    context = json.dumps({"files": files[:100], "manifests": manifests})[:14000]
    report = RepositoryReport(repo_url=str(item.repo_url), commit_sha=sha, commands=commands,
                              env_keys=list(item.env_vars), context=context)
    result = {"report": report.model_dump(), "manifests": manifests}
    await memory.put("scan", key, result)
    return result
