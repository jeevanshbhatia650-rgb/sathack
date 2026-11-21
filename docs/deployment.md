# Run the Offdock server

Use Python 3.11 or newer.

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
pytest -v
uvicorn orchestrator.main:app --host 0.0.0.0 --port 8000 --ws-ping-interval 20 --ws-ping-timeout 20
```

GET /healthz works with empty credentials. Protected endpoints require ADMIN_DASHBOARD_KEY.
Pairing also requires MESH_MASTER_SECRET. Generate each locally with
`python -c "import secrets; print(secrets.token_urlsafe(32))"` and enter the values in .env.
Keep .env out of Git. The dashboard keeps the entered key in page memory and sends
it in an Authorization header or the first authenticated browser WebSocket frame.

Render can import the root render.yaml Blueprint from this repository. Review the
free Web Service and Key Value selections, enter the sync:false variables in the
Render Dashboard, then apply the Blueprint. Render supplies REDIS_URL and generates
MESH_MASTER_SECRET. Only one web process is supported by the in-process allocator.
The node agent needs a separate Docker host. LLM provider usage, Docker Hub quotas,
and optional sandbox usage follow those providers' terms.

## Credentials

| Variable | Requirement | Source |
| --- | --- | --- |
| LLM_API_KEY | Required for agents | Google AI Studio Gemini API key |
| LLM_BASE_URL | Required configuration | Gemini OpenAI-compatible endpoint |
| PLANNER_MODEL | Required configuration | Gemini model ID |
| CONTAINERIZER_MODEL | Required configuration | Gemini model ID |
| RECOVERY_MODEL | Required configuration | Gemini model ID |
| DOCKERHUB_USERNAME | Required for authenticated Docker Hub mode | Docker Hub account |
| DOCKERHUB_TOKEN | Required for authenticated Docker Hub mode | Docker Hub personal access tokens, Read/Write |
| GITHUB_TOKEN | Required for higher API limits and private repository scans | Fine-grained token with repository Contents read permission |
| ADMIN_DASHBOARD_KEY | Required for public deployment | Random secret generated locally |
| E2B_API_KEY | Optional | E2B dashboard |
| E2B_TEMPLATE | Required when using E2B | Your Docker-capable template ID |
| RENDER_API_KEY | Optional CLI deployment credential | Render account settings |

All three agents default to `gemini-2.5-flash` through Google's
OpenAI-compatible Gemini endpoint. Create `LLM_API_KEY` in Google AI Studio and
enter it in .env locally or Render environment settings. The endpoint and model
IDs remain configurable so they can be upgraded without changing application code.

## Connect a worker

Install Docker Engine, Git and Python on the remote machine. The Docker daemon must
be accessible to the worker account. On the dashboard, enter the admin key and
generate a node join command. Execute it on the worker. Keep the node ID and session
token when restarting the connection. Pairing tokens expire after 24 hours.

Worker dependency versions are in node_agent/requirements.txt. Set DOCKERHUB_USERNAME
and DOCKERHUB_TOKEN on the worker for authenticated default pulls. Docker Hub image
mode additionally obtains a repository-scoped pull token on the server. The PAT
stays on the configured host. Railpack is advertised only when its executable and
BUILDKIT_HOST are configured. Provision an isolated BuildKit environment separately.

For E2B, prepare a Docker-capable template whose startup process runs the node agent
using SHARED_NODE_ID, SESSION_TOKEN and ORCHESTRATOR_URL. Generic E2B templates may
lack Docker capabilities. The spawn button reports absent configuration clearly.

## Workload contract

Provide repository-backed executable commands, a supported manifest or Dockerfile,
and sufficient details to identify each workload. The scanner accepts npm start/serve
scripts, Python project scripts, JSON Dockerfile CMD and verified README Python commands.
Ambiguous entrypoints fail admission. Worker Git access to private repositories must
be configured separately from the server's GitHub API token.

Batch stdout is retained as bounded Redis stream chunks. Dependent tasks receive
the retained parent chunks in /offdock/inputs/<parent>.ndjson, with
OFFDOCK_INPUT_DIR pointing to that directory. Workloads must explicitly consume this
contract. Large artifacts require an external artifact store. Execution cache keys
include the resolved commit, command, task settings and environment values. Enable
execution caching only for repeatable workloads whose result is represented by stdout.

Services need an exposed port and HTTP readiness endpoint. Workers enforce non-root,
read-only filesystems, dropped capabilities, a temporary /tmp filesystem, PID and
resource limits. Existing Dockerfiles with a single EXPOSE use /healthz by default.
Generated configurations can supply a healthcheck_path. Service lifetime currently
uses timeout_sec. The proxy accepts a per-job bearer token stored in
offdock:proxy:<node>:<task>; authenticated application integrations can retrieve it
from the server's internal state. Requests and responses are bounded to 500 KB.
The current HTTP proxy buffers each response and supports finite HTTP/MCP requests.

## Persistence and operating limits

Redis stores jobs, attempts, pairing, checkpoints, caches and bounded streams using
standard primitives. With REDIS_URL absent, fakeredis supplies process-local state.
Pending execution payloads use stable attempt IDs across server reconnection.
Workers replay recent results and retain running tasks during a WebSocket reconnect.
A restart can resume pending jobs while their Redis records and worker process survive.
The free allkeys-lru configuration can evict coordination records. This tier cannot
provide durable execution guarantees after eviction or a worker process loss.

The regex Dockerfile gate rejects the specified unsafe patterns. Build isolation
must be provided by the worker environment. It is unsuitable as the sole boundary
for hostile builds. HTTP readiness is currently used for MCP service health.
A stateful streaming MCP integration and reconnect semantics need validation with
the selected gateway and model-generated image before live use.

Automated tests use fake Redis, fake model/workload outcomes and WebSocket test
clients. A live Render deployment, Docker build, E2B template, model call and Docker
Hub authentication require credentials and remain outside local fixture validation.
