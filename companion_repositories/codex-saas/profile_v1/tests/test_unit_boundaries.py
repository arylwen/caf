import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from code.AP.application.policy_client import APPolicyClient, PolicyClientError
from code.AP.application.resource_service_facades import (
    ReportsServiceFacade,
    WorkspacesServiceFacade,
    WorkspaceCreateInput,
)
from code.AP.application.resource_services import APResourceService


class _FakePolicyPort:
    def __init__(self, *, allow: bool = True) -> None:
        self.allow = allow
        self.calls: list[tuple[str, str, str]] = []

    def evaluate(self, *, tenant_id: str, principal_id: str, action: str) -> bool:
        self.calls.append((tenant_id, principal_id, action))
        return self.allow


class _FakeReportsPort:
    def __init__(self) -> None:
        self.last_tenant_id: str | None = None

    def list_reports(self, *, tenant_id: str) -> list[dict]:
        self.last_tenant_id = tenant_id
        return [{"report_id": "rep-1", "workspace_id": "ws-1", "summary": "s", "status": "ready"}]

    def get_report(self, *, tenant_id: str, report_id: str) -> dict:
        self.last_tenant_id = tenant_id
        return {"report_id": report_id, "workspace_id": "ws-1", "summary": "s", "status": "ready"}


class _FakeWorkspacesPort:
    def list_workspaces(self, *, tenant_id: str) -> list[dict]:
        return [{"workspace_id": "ws-1", "tenant_id": tenant_id, "name": "Alpha"}]

    def create_workspace(self, *, tenant_id: str, name: str) -> dict:
        return {"workspace_id": "ws-2", "tenant_id": tenant_id, "name": name}

    def update_workspace(self, *, tenant_id: str, workspace_id: str, name: str) -> dict:
        return {"workspace_id": workspace_id, "tenant_id": tenant_id, "name": name}


class _FakeHttpResponse:
    def __init__(self, payload: dict) -> None:
        self._payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self) -> bytes:
        return json.dumps(self._payload).encode("utf-8")


class ServiceFacadeTests(unittest.TestCase):
    def test_reports_facade_enforces_policy_and_propagates_trimmed_tenant(self) -> None:
        policy_port = _FakePolicyPort(allow=True)
        reports_port = _FakeReportsPort()
        facade = ReportsServiceFacade(policy_port=policy_port, reports_port=reports_port)

        items = facade.list_reports(tenant_id=" tenant-a ", principal_id=" principal-a ")

        self.assertEqual(1, len(items))
        self.assertEqual("tenant-a", reports_port.last_tenant_id)
        self.assertEqual([("tenant-a", "principal-a", "reports:list")], policy_port.calls)

    def test_workspaces_facade_rejects_blank_context(self) -> None:
        facade = WorkspacesServiceFacade(policy_port=_FakePolicyPort(), workspaces_port=_FakeWorkspacesPort())

        with self.assertRaises(ValueError):
            facade.list_workspaces(tenant_id=" ", principal_id="principal-a")
        with self.assertRaises(ValueError):
            facade.list_workspaces(tenant_id="tenant-a", principal_id=" ")

    def test_workspaces_facade_rejects_policy_denial(self) -> None:
        facade = WorkspacesServiceFacade(policy_port=_FakePolicyPort(allow=False), workspaces_port=_FakeWorkspacesPort())

        with self.assertRaises(PermissionError):
            facade.create_workspace(
                tenant_id="tenant-a",
                principal_id="principal-a",
                payload=WorkspaceCreateInput(name="Alpha"),
            )


class ResourceServiceTests(unittest.TestCase):
    def test_resource_service_create_workspace_keeps_tenant_context(self) -> None:
        class _AllowPolicyClient:
            def evaluate(self, tenant_id: str, principal_id: str, action: str) -> dict:
                self.last_call = (tenant_id, principal_id, action)
                return {"allow": True}

        policy_client = _AllowPolicyClient()
        service = APResourceService(policy_client=policy_client)

        created = service.create_workspace(tenant_id="tenant-a", principal_id="principal-a", name="Alpha")

        self.assertTrue(created["workspace_id"].startswith("ws-"))
        self.assertEqual("tenant-a", created["tenant_id"])
        self.assertEqual(("tenant-a", "principal-a", "workspaces:create"), policy_client.last_call)

    def test_resource_service_map_error_covers_policy_and_not_found_paths(self) -> None:
        self.assertEqual((502, "policy evaluation unavailable"), APResourceService.map_error(PolicyClientError("x")))
        self.assertEqual((404, "'missing'"), APResourceService.map_error(KeyError("missing")))


class PolicyClientTests(unittest.TestCase):
    def test_policy_client_sends_headers_and_returns_payload(self) -> None:
        captured = {}

        def _fake_urlopen(request, timeout=0):
            captured["url"] = request.full_url
            captured["tenant"] = request.headers.get("X-Tenant-Id")
            captured["principal"] = request.headers.get("X-Principal-Id")
            captured["timeout"] = timeout
            return _FakeHttpResponse({"payload": {"allow": True, "reason": "ok"}})

        client = APPolicyClient(base_url="http://cp:8000")
        with patch("code.AP.application.policy_client.urllib_request.urlopen", side_effect=_fake_urlopen):
            payload = client.evaluate(tenant_id="tenant-a", principal_id="principal-a", action="reports:list")

        self.assertEqual(True, payload["allow"])
        self.assertEqual("http://cp:8000/cp/cp-ap/contracts/bnd-cp-ap-01/sync", captured["url"])
        self.assertEqual("tenant-a", captured["tenant"])
        self.assertEqual("principal-a", captured["principal"])
        self.assertEqual(5, captured["timeout"])

    def test_policy_client_rejects_missing_payload(self) -> None:
        client = APPolicyClient(base_url="http://cp:8000")
        with patch(
            "code.AP.application.policy_client.urllib_request.urlopen",
            return_value=_FakeHttpResponse({"result": {"allow": True}}),
        ):
            with self.assertRaises(PolicyClientError):
                client.evaluate(tenant_id="tenant-a", principal_id="principal-a", action="reports:list")


if __name__ == "__main__":
    unittest.main()
