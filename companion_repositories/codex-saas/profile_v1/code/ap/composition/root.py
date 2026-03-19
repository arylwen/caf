# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: task_id=TG-30-service-facade-workspaces
# CAF_TRACE: task_id=TG-30-service-facade-submissions
# CAF_TRACE: task_id=TG-30-service-facade-reviews
# CAF_TRACE: task_id=TG-30-service-facade-reports
# CAF_TRACE: task_id=TG-40-persistence-reports
# CAF_TRACE: task_id=TG-40-persistence-workspaces
# CAF_TRACE: task_id=TG-40-persistence-submissions
# CAF_TRACE: task_id=TG-40-persistence-reviews
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REPORTS-PERSISTENCE
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WORKSPACES-PERSISTENCE
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-SUBMISSIONS-PERSISTENCE
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-REVIEWS-PERSISTENCE

from dataclasses import dataclass

from ..boundary.contracts import PolicyDecisionRequest, PolicyDecisionResult, TenantContext
from ..persistence.repository_factory import (
    build_reports_access,
    build_reviews_access,
    build_submissions_access,
    build_workspaces_access,
)
from ..service.policy_bridge import PolicyBridge
from ..service.resource_services import (
    ReportsService,
    ReviewsService,
    SubmissionsService,
    WorkspacesService,
)
from ...cp.boundary.models import PolicyDecisionRequestModel, PrincipalContextModel
from ...cp.service.policy_service import PolicyService


class _ControlPlanePolicyClient:
    def __init__(self):
        self._policy_service = PolicyService()

    def evaluate(self, request: PolicyDecisionRequest) -> PolicyDecisionResult:
        cp_request = PolicyDecisionRequestModel(
            action=request.action,
            resource=request.resource,
            principal=PrincipalContextModel(
                tenant_id=request.tenant_context.tenant_id,
                principal_id=request.tenant_context.principal_id,
                policy_version=request.tenant_context.policy_version,
                principal_kind=request.tenant_context.principal_kind,
            ),
            tenant_header=request.tenant_header,
        )
        decision = self._policy_service.evaluate(cp_request)
        return PolicyDecisionResult(
            allow=decision.allow,
            reason=decision.reason,
        )


@dataclass
class ApplicationRuntimeContext:
    policy_bridge: PolicyBridge
    workspaces_service: WorkspacesService
    submissions_service: SubmissionsService
    reviews_service: ReviewsService
    reports_service: ReportsService


def default_tenant_context() -> TenantContext:
    return TenantContext(
        tenant_id="tenant-scaffold",
        principal_id="principal-scaffold",
        policy_version="v1",
        principal_kind="service_principal",
    )


def build_runtime_context() -> ApplicationRuntimeContext:
    reports_access = build_reports_access()
    reviews_access = build_reviews_access()
    submissions_access = build_submissions_access()
    workspaces_access = build_workspaces_access()
    return ApplicationRuntimeContext(
        policy_bridge=PolicyBridge(client=_ControlPlanePolicyClient()),
        workspaces_service=WorkspacesService(access=workspaces_access),
        submissions_service=SubmissionsService(access=submissions_access),
        reviews_service=ReviewsService(access=reviews_access),
        reports_service=ReportsService(access=reports_access),
    )