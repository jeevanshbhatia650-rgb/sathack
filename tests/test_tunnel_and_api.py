import base64
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
from orchestrator.main import create_app
from orchestrator.config import Settings


def test_health_and_denied_pairing():
    with TestClient(create_app(Settings(_env_file=None))) as client:
        assert client.get("/healthz").status_code == 200
        assert client.post("/v1/nodes/pair").status_code == 401


def test_pair_telemetry_proxy_and_wrong_token():
    settings = Settings(_env_file=None, admin_dashboard_key="test-admin", mesh_master_secret="test-mesh")
    app = create_app(settings)
    with TestClient(app) as client:
        response = client.post("/v1/nodes/pair", headers={"Authorization": "Bearer test-admin"})
        assert response.status_code == 200
        pair = response.json()
        node = pair["node_id"]
        assert node.startswith("node-")
        with client.websocket_connect("/ws/cluster") as browser:
            browser.send_json({"token": "test-admin"})
            with client.websocket_connect("/ws/node/" + node,
                    headers={"Authorization": "Bearer " + pair["session_token"]}) as worker:
                worker.send_json({"type": "HEARTBEAT", "telemetry": {
                    "total_ram_mb": 4096, "available_ram_mb": 3000, "cpu_percent": 10,
                    "cpu_cores": 4, "running_containers": 0}})
                assert worker.receive_json()["type"] == "PONG"
                assert browser.receive_json()["node_id"] == node
                client.portal.call(app.state.store.put, f"offdock:proxy:{node}:task", {"token": "job-token"}, 60)
                assert client.get(f"/proxy/{node}/task/").status_code == 401
                with ThreadPoolExecutor() as pool:
                    future = pool.submit(client.post, f"/proxy/{node}/task/mcp",
                        headers={"Authorization": "Bearer job-token"}, content=b'{"id":1}')
                    frame = worker.receive_json()
                    assert frame["type"] == "PROXY_REQUEST"
                    assert base64.b64decode(frame["body"]) == b'{"id":1}'
                    worker.send_json({"type": "PROXY_RESPONSE", "request_id": frame["request_id"],
                                      "status": 200, "body": base64.b64encode(b'{"ok":true}').decode(),
                                      "headers": {"content-type": "application/json"}})
                    result = future.result(timeout=5)
                    assert result.json() == {"ok": True}
