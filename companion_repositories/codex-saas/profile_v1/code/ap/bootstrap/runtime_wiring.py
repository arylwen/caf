# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-90-runtime-wiring; capability=runtime_wiring; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING
from __future__ import annotations

from ..application.policy_client import APPolicyClient, PolicyClientError
from ..application.resource_service_facades import (
    ReportsServiceFacade,
    SubmissionsServiceFacade,
    WorkspacesServiceFacade,
)
from ..persistence.repository_factory import (
    build_reports_repository,
    build_submissions_repository,
    build_workspaces_repository,
)


class APPolicyDecisionAdapter:
    def __init__(self, policy_client: APPolicyClient | None = None) -> None:
        self._policy_client = policy_client or APPolicyClient()

    def evaluate(self, *, tenant_id: str, principal_id: str, action: str) -> bool:
        decision = self._policy_client.evaluate(tenant_id=tenant_id, principal_id=principal_id, action=action)
        allow = decision.get("allow")
        if not isinstance(allow, bool):
            raise PolicyClientError("policy response payload must contain boolean allow")
        return allow


_policy_port = APPolicyDecisionAdapter()

reports_service = ReportsServiceFacade(
    policy_port=_policy_port,
    reports_port=build_reports_repository(),
)

submissions_service = SubmissionsServiceFacade(
    policy_port=_policy_port,
    submissions_port=build_submissions_repository(),
)

workspaces_service = WorkspacesServiceFacade(
    policy_port=_policy_port,
    workspaces_port=build_workspaces_repository(),
)
