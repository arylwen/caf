from code.ap.boundary.contracts import PolicyDecisionRequest, PolicyDecisionResult, TenantContext
from code.ap.service.policy_bridge import PolicyBridge


class _StubClient:
    def __init__(self, allow: bool):
        self._allow = allow
        self.last_request = None

    def evaluate(self, request: PolicyDecisionRequest) -> PolicyDecisionResult:
        self.last_request = request
        if self._allow:
            return PolicyDecisionResult(allow=True, reason="policy-allow:list:workspaces")
        return PolicyDecisionResult(allow=False, reason="policy-deny:blocked")


def _request() -> PolicyDecisionRequest:
    return PolicyDecisionRequest(
        action="list",
        resource="workspaces",
        tenant_context=TenantContext(
            tenant_id="tenant-a",
            principal_id="operator-demo",
            policy_version="v1",
            principal_kind="tenant_user",
        ),
        tenant_header="tenant-a",
    )


def test_policy_bridge_returns_decision_and_preserves_request():
    client = _StubClient(allow=True)
    bridge = PolicyBridge(client=client)

    result = bridge.enforce(_request())

    assert result.allow is True
    assert result.reason == "policy-allow:list:workspaces"
    assert client.last_request is not None
    assert client.last_request.tenant_context.tenant_id == "tenant-a"


def test_policy_bridge_raises_permission_error_when_policy_denies():
    bridge = PolicyBridge(client=_StubClient(allow=False))

    try:
        bridge.enforce(_request())
    except PermissionError as exc:
        assert str(exc) == "policy-deny:blocked"
    else:
        raise AssertionError("expected deny decision to raise PermissionError")
