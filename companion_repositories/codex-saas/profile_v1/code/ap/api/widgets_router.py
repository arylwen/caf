# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-20-api-boundary-widgets
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas

"""API boundary transport adapter for widgets resources."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..application.services import PolicyFacade, WidgetsFacade
from .auth_context import resolve_auth_context
from .dependencies import policy_dependency, widgets_dependency

router = APIRouter(prefix="/ap/widgets", tags=["widgets"])


def _authorize(
    *,
    request: Request,
    policy: PolicyFacade,
    action: str,
    resource_id: str | None = None,
) -> tuple[str, str]:
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
    return claims.tenant_id, claims.principal_id


@router.get("")
def list_widgets(
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: WidgetsFacade = Depends(widgets_dependency),
) -> dict[str, Any]:
    tenant_id, _ = _authorize(request=request, policy=policy, action="widgets.list")
    return {"items": facade.list_items(tenant_id=tenant_id)}


@router.get("/{widget_id}")
def get_widget(
    widget_id: str,
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: WidgetsFacade = Depends(widgets_dependency),
) -> dict[str, Any]:
    tenant_id, _ = _authorize(
        request=request,
        policy=policy,
        action="widgets.get",
        resource_id=widget_id,
    )
    try:
        return facade.get_item(tenant_id=tenant_id, item_id=widget_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", status_code=status.HTTP_201_CREATED)
def create_widget(
    payload: dict[str, Any],
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: WidgetsFacade = Depends(widgets_dependency),
) -> dict[str, Any]:
    tenant_id, principal_id = _authorize(request=request, policy=policy, action="widgets.create")
    payload_copy = dict(payload)
    payload_copy.pop("tenant_id", None)
    payload_copy.pop("widget_id", None)
    return facade.create_item(
        tenant_id=tenant_id,
        actor_user_id=principal_id,
        payload=payload_copy,
    )


@router.put("/{widget_id}")
def update_widget(
    widget_id: str,
    payload: dict[str, Any],
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: WidgetsFacade = Depends(widgets_dependency),
) -> dict[str, Any]:
    tenant_id, principal_id = _authorize(
        request=request,
        policy=policy,
        action="widgets.update",
        resource_id=widget_id,
    )
    try:
        return facade.update_item(
            tenant_id=tenant_id,
            actor_user_id=principal_id,
            item_id=widget_id,
            payload=dict(payload),
        )
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{widget_id}")
def delete_widget(
    widget_id: str,
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: WidgetsFacade = Depends(widgets_dependency),
) -> dict[str, str]:
    tenant_id, _ = _authorize(
        request=request,
        policy=policy,
        action="widgets.delete",
        resource_id=widget_id,
    )
    try:
        return facade.delete_item(tenant_id=tenant_id, item_id=widget_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

