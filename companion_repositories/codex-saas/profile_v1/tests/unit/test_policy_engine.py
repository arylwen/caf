# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-90-unit-tests | capability=unit_test_scaffolding | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS
from code.cp.policy_engine import evaluate_policy


def test_policy_engine_denies_missing_context() -> None:
    allow, reason = evaluate_policy(
        tenant_id="",
        principal_id="user-1",
        action="widget:list",
        correlation_id="corr-1",
    )
    assert allow is False
    assert reason == "missing_required_context"


def test_policy_engine_allows_widget_action() -> None:
    allow, reason = evaluate_policy(
        tenant_id="tenant-a",
        principal_id="user-1",
        action="widget:list",
        correlation_id="corr-2",
    )
    assert allow is True
    assert reason == "allowed_for_widget_scope"

