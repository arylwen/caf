# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-10-OPTIONS-api_boundary_implementation
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-CP-POLICY-SURFACE

"""CP route surface with explicit policy and repository-health seams."""

from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

from ...common.auth.mock_claims import decode_mock_bearer_token, enforce_claim_over_header_conflict
from ...common.observability import observability_event
from ..application.services import ControlPlaneRuntimeService, RepositoryHealthService
from ..contracts.bnd_cp_ap_01.envelope import ContractRequestEnvelope
from ..contracts.bnd_cp_ap_01.http_server import handle_contract_http

router = APIRouter(prefix="/cp", tags=["control-plane"])
runtime_service = ControlPlaneRuntimeService()
repository_health_service = RepositoryHealthService()


class RuntimeAssumptionsResponse(BaseModel):
    policy_surface: str
    persistence_surface: str
    tenant_carrier: str
    auth_mode: str


class PolicyDecisionRequest(BaseModel):
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict[str, str]


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "plane": "cp"}


@router.get("/runtime/assumptions", response_model=RuntimeAssumptionsResponse)
def runtime_assumptions(authorization: str = Header(..., alias="Authorization")) -> RuntimeAssumptionsResponse:
    return RuntimeAssumptionsResponse(**runtime_service.runtime_assumptions(authorization))


@router.get("/repository/health")
def repository_health() -> dict[str, str]:
    return repository_health_service.readiness()


@router.post("/policy-decisions/evaluate")
def evaluate_policy_decision(payload: PolicyDecisionRequest, request: Request) -> dict[str, object]:
    authorization = request.headers.get("authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="missing Authorization bearer token")

    try:
        claims = decode_mock_bearer_token(authorization)
        claims = enforce_claim_over_header_conflict(
            claims,
            tenant_header=request.headers.get("x-tenant-context-check"),
            principal_header=request.headers.get("x-principal-context-check"),
        )
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    if payload.tenant_id != claims["tenant_id"] or payload.principal_id != claims["principal_id"]:
        raise HTTPException(status_code=401, detail="claim context does not match request envelope")

    action = str(payload.payload.get("action", "")).strip()
    resource = str(payload.payload.get("resource", "")).strip()
    if not action or not resource:
        raise HTTPException(status_code=400, detail="action and resource are required for policy evaluation")

    correlation_id = payload.correlation_id or request.headers.get("x-correlation-id") or str(uuid4())
    contract_response = handle_contract_http(
        ContractRequestEnvelope(
            tenant_id=claims["tenant_id"],
            principal_id=claims["principal_id"],
            correlation_id=correlation_id,
            payload={"action": action, "resource": resource},
        )
    )
    response = {
        "tenant_id": contract_response.tenant_id,
        "principal_id": contract_response.principal_id,
        "correlation_id": contract_response.correlation_id,
        "payload": contract_response.payload,
    }
    response["observability"] = observability_event(
        "cp_policy_decision",
        tenant_id=claims["tenant_id"],
        principal_id=claims["principal_id"],
        correlation_id=correlation_id,
        action=action,
    )
    return response
