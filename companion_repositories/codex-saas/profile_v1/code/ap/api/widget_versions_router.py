# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-20-api-boundary-widget_versions
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas

"""API boundary transport adapter for widget_versions resources."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from ..application.services import PolicyFacade, WidgetVersionsFacade
from .auth_context import resolve_auth_context
from .dependencies import policy_dependency, widget_versions_dependency

router = APIRouter(prefix="/ap/widget_versions", tags=["widget_versions"])


def _authorize(
    *,
    request: Request,
    policy: PolicyFacade,
    action: str,
    resource_id: str | None = None,
) -> str:
    claims = resolve_auth_context(request.headers)
    decision = policy.evaluate(
        action=action,
        tenant_id=claims.tenant_id,
        principal_id=claims.principal_id,
        policy_version=claims.policy_version,
        resource_id=resource_id,
    )
    if not decision.allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision.reason)
    return claims.tenant_id


@router.get("")
def list_widget_versions(
    request: Request,
    widget_id: str | None = Query(default=None),
    policy: PolicyFacade = Depends(policy_dependency),
    facade: WidgetVersionsFacade = Depends(widget_versions_dependency),
) -> dict[str, Any]:
    tenant_id = _authorize(request=request, policy=policy, action="widget_versions.list", resource_id=widget_id)
    items = facade.list_items(tenant_id=tenant_id)
    if widget_id:
        items = [item for item in items if item.get("widget_id") == widget_id]
    return {"items": items}

