# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_users_roles
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas

"""API boundary transport adapter for tenant_users_roles resources."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..application.services import PolicyFacade, TenantUsersRolesFacade
from .auth_context import resolve_auth_context
from .dependencies import policy_dependency, tenant_users_roles_dependency

router = APIRouter(prefix="/ap/tenant_users_roles", tags=["tenant_users_roles"])


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
def list_tenant_users_roles(
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: TenantUsersRolesFacade = Depends(tenant_users_roles_dependency),
) -> dict[str, Any]:
    tenant_id, _ = _authorize(request=request, policy=policy, action="tenant_users_roles.list")
    return {"items": facade.list_items(tenant_id=tenant_id)}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_tenant_user_role(
    payload: dict[str, Any],
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: TenantUsersRolesFacade = Depends(tenant_users_roles_dependency),
) -> dict[str, Any]:
    tenant_id, principal_id = _authorize(request=request, policy=policy, action="tenant_users_roles.create")
    payload_copy = dict(payload)
    payload_copy.pop("tenant_id", None)
    payload_copy.pop("tenant_user_role_id", None)
    return facade.create_item(
        tenant_id=tenant_id,
        actor_user_id=principal_id,
        payload=payload_copy,
    )


@router.delete("/{tenant_user_role_id}")
def delete_tenant_user_role(
    tenant_user_role_id: str,
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: TenantUsersRolesFacade = Depends(tenant_users_roles_dependency),
) -> dict[str, str]:
    tenant_id, _ = _authorize(
        request=request,
        policy=policy,
        action="tenant_users_roles.delete",
        resource_id=tenant_user_role_id,
    )
    try:
        return facade.delete_item(tenant_id=tenant_id, item_id=tenant_user_role_id)
    except KeyError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

