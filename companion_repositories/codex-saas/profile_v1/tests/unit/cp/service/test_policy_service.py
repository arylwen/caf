from code.cp.boundary.models import PolicyDecisionRequestModel, PrincipalContextModel
from code.cp.service.policy_service import PolicyService


def _payload(
    *,
    action: str = "list",
    resource: str = "workspaces",
    principal_id: str = "operator-demo",
    policy_version: str = "v1",
    tenant_header: str | None = None,
):
    return PolicyDecisionRequestModel(
        action=action,
        resource=resource,
        principal=PrincipalContextModel(
            tenant_id="tenant-a",
            principal_id=principal_id,
            policy_version=policy_version,
            principal_kind="tenant_user",
        ),
        tenant_header=tenant_header,
    )


def test_policy_service_allows_supported_action_for_operator_with_v1_policy():
    decision = PolicyService().evaluate(_payload(action="create"))

    assert decision.allow is True
    assert "policy-allow:create:workspaces:tenant_user:v1" == decision.reason


def test_policy_service_rejects_unsupported_actions():
    try:
        PolicyService().evaluate(_payload(action="publish"))
    except PermissionError as exc:
        assert "unsupported policy action" in str(exc)
    else:
        raise AssertionError("expected unsupported action to raise PermissionError")


def test_policy_service_denies_write_actions_for_non_operator_principals():
    decision = PolicyService().evaluate(
        _payload(action="update", principal_id="reviewer-demo")
    )

    assert decision.allow is False
    assert decision.reason == "policy-deny:write-actions-require-operator-principal"


def test_policy_service_rejects_conflicting_tenant_header():
    try:
        PolicyService().evaluate(_payload(tenant_header="tenant-b"))
    except PermissionError as exc:
        assert "tenant context conflict" in str(exc)
    else:
        raise AssertionError("expected tenant conflict to raise PermissionError")
