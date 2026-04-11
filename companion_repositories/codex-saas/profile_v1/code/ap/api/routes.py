# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-30-service-facade-widgets
# CAF_TRACE: capability=service_facade_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-AP-RESOURCE-WIDGETS-SERVICE

"""AP route surface kept thin by delegating to application service facades."""

from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from pydantic import BaseModel

from ...common.observability import observability_event
from ..application.services import (
    ApplicationPolicyEnforcementService,
    ApplicationRuntimeService,
    ResourceServiceFacadeRegistry,
)
from .auth_context import resolve_auth_context
from .dependencies import get_policy_service, get_resource_facade_registry, get_runtime_service

router = APIRouter(prefix="/ap", tags=["application-plane"])


class RuntimeAssumptionsResponse(BaseModel):
    api: str
    service: str
    persistence: str
    ui: str
    tenant_carrier: str
    auth_mode: str


class PolicyPreviewRequest(BaseModel):
    action: str
    resource: str


class PolicyPreviewResponse(BaseModel):
    tenant_id: str
    principal_id: str
    policy_version: str
    correlation_id: str
    decision: dict[str, object]
    observability: dict[str, object]


class ResourcePayload(BaseModel):
    attributes: dict[str, object]


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "plane": "ap"}


@router.get("/runtime/assumptions", response_model=RuntimeAssumptionsResponse)
def runtime_assumptions(
    authorization: str = Header(..., alias="Authorization"),
    runtime_service: ApplicationRuntimeService = Depends(get_runtime_service),
) -> RuntimeAssumptionsResponse:
    return RuntimeAssumptionsResponse(**runtime_service.runtime_assumptions(authorization))


@router.post("/policy/preview", response_model=PolicyPreviewResponse)
def preview_policy_decision(
    payload: PolicyPreviewRequest,
    request: Request,
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
) -> PolicyPreviewResponse:
    claims = resolve_auth_context(request.headers)
    correlation_id = request.headers.get("x-correlation-id", str(uuid4()))
    decision = policy_service.evaluate_operation(
        claims=claims,
        action=payload.action,
        resource=payload.resource,
        correlation_id=correlation_id,
    )
    decision["observability"] = observability_event(
        "ap_policy_preview",
        tenant_id=claims["tenant_id"],
        principal_id=claims["principal_id"],
        correlation_id=correlation_id,
        action=payload.action,
        resource=payload.resource,
    )
    return PolicyPreviewResponse(**decision)


def _authorize_resource_action(
    request: Request,
    policy_service: ApplicationPolicyEnforcementService,
    resource: str,
    action: str,
) -> tuple[dict[str, str], str, dict[str, object]]:
    claims = resolve_auth_context(request.headers)
    correlation_id = request.headers.get("x-correlation-id", str(uuid4()))
    decision = policy_service.evaluate_operation(
        claims=claims,
        action=action,
        resource=resource,
        correlation_id=correlation_id,
    )
    if not bool(decision.get("decision", {}).get("allow")):
        raise HTTPException(status_code=403, detail=f"policy denied for {action}:{resource}")
    return claims, correlation_id, decision


def _build_resource_context(
    claims: dict[str, str],
    correlation_id: str,
    policy_decision: dict[str, object],
    resource: str,
) -> dict[str, object]:
    return {
        "tenant_id": claims["tenant_id"],
        "principal_id": claims["principal_id"],
        "policy_version": claims["policy_version"],
        "correlation_id": correlation_id,
        "resource": resource,
        "policy_decision": policy_decision.get("decision", {}),
    }


@router.get("/resources/{resource}")
def list_resource(
    resource: str,
    request: Request,
    facade_registry: ResourceServiceFacadeRegistry = Depends(get_resource_facade_registry),
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
) -> dict[str, object]:
    claims, correlation_id, decision = _authorize_resource_action(request, policy_service, resource, "list")
    context = _build_resource_context(claims, correlation_id, decision, resource)
    try:
        payload = facade_registry.get(resource).list(context)
    except (PermissionError, ValueError) as exc:
        raise HTTPException(status_code=405, detail=str(exc)) from exc
    return {"items": payload, "correlation_id": correlation_id}


@router.get("/resources/{resource}/{resource_id}")
def get_resource(
    resource: str,
    resource_id: str,
    request: Request,
    facade_registry: ResourceServiceFacadeRegistry = Depends(get_resource_facade_registry),
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
) -> dict[str, object]:
    claims, correlation_id, decision = _authorize_resource_action(request, policy_service, resource, "get")
    context = _build_resource_context(claims, correlation_id, decision, resource)
    try:
        payload = facade_registry.get(resource).get(context, resource_id)
    except (PermissionError, ValueError) as exc:
        raise HTTPException(status_code=405, detail=str(exc)) from exc
    if payload is None:
        raise HTTPException(status_code=404, detail=f"{resource} '{resource_id}' not found")
    return {"item": payload, "correlation_id": correlation_id}


@router.post("/resources/{resource}")
def create_resource(
    resource: str,
    body: ResourcePayload,
    request: Request,
    facade_registry: ResourceServiceFacadeRegistry = Depends(get_resource_facade_registry),
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
) -> dict[str, object]:
    claims, correlation_id, decision = _authorize_resource_action(request, policy_service, resource, "create")
    context = _build_resource_context(claims, correlation_id, decision, resource)
    try:
        payload = facade_registry.get(resource).create(context, body.attributes)
    except (PermissionError, ValueError) as exc:
        raise HTTPException(status_code=405, detail=str(exc)) from exc
    return {"item": payload, "correlation_id": correlation_id}


@router.put("/resources/{resource}/{resource_id}")
def update_resource(
    resource: str,
    resource_id: str,
    body: ResourcePayload,
    request: Request,
    facade_registry: ResourceServiceFacadeRegistry = Depends(get_resource_facade_registry),
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
) -> dict[str, object]:
    claims, correlation_id, decision = _authorize_resource_action(request, policy_service, resource, "update")
    context = _build_resource_context(claims, correlation_id, decision, resource)
    try:
        payload = facade_registry.get(resource).update(context, resource_id, body.attributes)
    except (PermissionError, ValueError) as exc:
        raise HTTPException(status_code=405, detail=str(exc)) from exc
    if payload is None:
        raise HTTPException(status_code=404, detail=f"{resource} '{resource_id}' not found")
    return {"item": payload, "correlation_id": correlation_id}


@router.delete("/resources/{resource}/{resource_id}")
def delete_resource(
    resource: str,
    resource_id: str,
    request: Request,
    facade_registry: ResourceServiceFacadeRegistry = Depends(get_resource_facade_registry),
    policy_service: ApplicationPolicyEnforcementService = Depends(get_policy_service),
) -> dict[str, object]:
    claims, correlation_id, decision = _authorize_resource_action(request, policy_service, resource, "delete")
    context = _build_resource_context(claims, correlation_id, decision, resource)
    try:
        deleted = facade_registry.get(resource).delete(context, resource_id)
    except (PermissionError, ValueError) as exc:
        raise HTTPException(status_code=405, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=404, detail=f"{resource} '{resource_id}' not found")
    return {"deleted": True, "correlation_id": correlation_id}
