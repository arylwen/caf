# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-unit-tests
# CAF_TRACE: capability=unit_test_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from code.ap.application.services import PolicyFacade


class _FakeResponse:
    def __init__(self, payload_bytes):
        self._payload_bytes = payload_bytes

    def read(self):
        return self._payload_bytes

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_policy_facade_rejects_mismatched_tenant_in_cp_response(monkeypatch):
    payload = (
        b'{"allowed": true, "reason": "ok", "tenant_id": "other-tenant", '
        b'"principal_id": "user:demo:admin", "policy_version": "v1", "action": "widgets.read"}'
    )

    monkeypatch.setattr("code.ap.application.services.urllib_request.urlopen", lambda _request: _FakeResponse(payload))

    decision = PolicyFacade(cp_base_url="http://cp:8001").evaluate(
        action="widgets.read",
        tenant_id="tenant-demo",
        principal_id="user:demo:admin",
        policy_version="v1",
    )

    assert decision.allowed is False
    assert "tenant_id mismatch" in decision.reason