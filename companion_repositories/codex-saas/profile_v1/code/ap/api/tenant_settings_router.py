# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_settings
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas

"""API boundary transport adapter for tenant_settings resources."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status

from ..application.services import PolicyFacade, TenantSettingsFacade
from .auth_context import resolve_auth_context
from .dependencies import policy_dependency, tenant_settings_dependency

router = APIRouter(prefix="/ap/tenant_settings", tags=["tenant_settings"])


def _authorize(
    *,
    request: Request,
    policy: PolicyFacade,
    action: str,
) -> tuple[str, str]:
    claims = resolve_auth_context(request.headers)
    decision = policy.evaluate(
        action=action,
        tenant_id=claims.tenant_id,
        principal_id=claims.principal_id,
        policy_version=claims.policy_version,
    )
    if not decision.allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision.reason)
    return claims.tenant_id, claims.principal_id


@router.get("")
def get_tenant_settings(
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: TenantSettingsFacade = Depends(tenant_settings_dependency),
) -> dict[str, Any]:
    tenant_id, _ = _authorize(request=request, policy=policy, action="tenant_settings.get")
    return facade.get_settings(tenant_id=tenant_id)


@router.put("")
def update_tenant_settings(
    payload: dict[str, Any],
    request: Request,
    policy: PolicyFacade = Depends(policy_dependency),
    facade: TenantSettingsFacade = Depends(tenant_settings_dependency),
) -> dict[str, Any]:
    tenant_id, principal_id = _authorize(request=request, policy=policy, action="tenant_settings.update")
    try:
        return facade.update_settings(
            tenant_id=tenant_id,
            actor_user_id=principal_id,
            payload=dict(payload),
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

