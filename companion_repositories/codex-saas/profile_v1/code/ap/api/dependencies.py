# CAF_TRACE: task_id=TG-20-api-boundary-workspaces capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
# CAF_TRACE: task_id=TG-20-api-boundary-submissions capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
# CAF_TRACE: task_id=TG-20-api-boundary-reviews capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
# CAF_TRACE: task_id=TG-20-api-boundary-reports capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-dependency-provider-boundary
from fastapi import HTTPException, Request

from ..boundary.contracts import PolicyDecisionRequest
from ..composition.root import ApplicationRuntimeContext


def get_runtime_context(request: Request) -> ApplicationRuntimeContext:
    return request.app.state.runtime_context


def enforce_policy(
    runtime_context: ApplicationRuntimeContext,
    action: str,
    resource: str,
    tenant_context,
    tenant_header: str | None,
) -> None:
    try:
        runtime_context.policy_bridge.enforce(
            PolicyDecisionRequest(
                action=action,
                resource=resource,
                tenant_context=tenant_context,
                tenant_header=tenant_header,
            )
        )
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
