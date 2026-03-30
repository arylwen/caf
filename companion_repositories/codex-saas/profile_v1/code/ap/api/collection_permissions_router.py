# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-20-api-boundary-collection_permissions
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas

"""API boundary transport adapter for collection_permissions resources."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..application.services import CollectionPermissionsFacade, PolicyFacade
from .auth_context import resolve_auth_context
from .dependencies import collection_permissions_dependency, policy_dependency

router = APIRouter(prefix="/ap/collection_permissions", tags=["collection_permissions"])


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
def list_collection_permissions(
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: CollectionPermissionsFacade = Depends(collection_permissions_dependency),
) -> dict[str, Any]:
    tenant_id, _ = _authorize(request=request, policy=policy, action="collection_permissions.list")
    return {"items": facade.list_items(tenant_id=tenant_id)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_collection_permission(
    payload: dict[str, Any],
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: CollectionPermissionsFacade = Depends(collection_permissions_dependency),
) -> dict[str, Any]:
    tenant_id, principal_id = _authorize(request=request, policy=policy, action="collection_permissions.create")
    payload_copy = dict(payload)
    payload_copy.pop("tenant_id", None)
    payload_copy.pop("collection_permission_id", None)
    return facade.create_item(
        tenant_id=tenant_id,
        actor_user_id=principal_id,
        payload=payload_copy,
    )


@router.put("/{collection_permission_id}")
def update_collection_permission(
    collection_permission_id: str,
    payload: dict[str, Any],
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: CollectionPermissionsFacade = Depends(collection_permissions_dependency),
) -> dict[str, Any]:
    tenant_id, principal_id = _authorize(
        request=request,
        policy=policy,
        action="collection_permissions.update",
        resource_id=collection_permission_id,
    )
    try:
        return facade.update_item(
            tenant_id=tenant_id,
            actor_user_id=principal_id,
            item_id=collection_permission_id,
            payload=dict(payload),
        )
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

