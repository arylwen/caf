# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-unit-tests
# CAF_TRACE: capability=unit_test_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from code.cp.application.services import PolicyDecisionService


def test_policy_decision_service_rejects_non_admin_write_action():
    service = PolicyDecisionService()

    decision = service.evaluate(
        action="widgets.create",
        tenant_id="tenant-demo",
        principal_id="user:demo:viewer",
        policy_version="v1",
    )

    assert decision.allowed is False
    assert "admin" in decision.reason


def test_policy_decision_service_allows_admin_write_action():
    service = PolicyDecisionService()

    decision = service.evaluate(
        action="widgets.create",
        tenant_id="tenant-demo",
        principal_id="user:demo:admin",
        policy_version="v1",
    )

    assert decision.allowed is True
    assert decision.reason == "policy decision allow"