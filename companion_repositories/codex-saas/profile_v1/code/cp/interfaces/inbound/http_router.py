# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-35-policy-enforcement-core; capability=policy_enforcement; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-POLICY-ENFORCEMENT
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from ...application.policy_gate import ControlPlanePolicyGate

router = APIRouter()
policy_gate = ControlPlanePolicyGate()


class CPHealthResponse(BaseModel):
    status: str
    plane: str
    tenant_id: str
    policy_state: str


class ContractSyncRequest(BaseModel):
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict = {}


class ContractSyncResponse(BaseModel):
    tenant_id: str
    principal_id: str
    correlation_id: str
    payload: dict


class PolicyDecisionResponse(BaseModel):
    allow: bool
    reason: str
    action: str
    tenant_id: str
    principal_id: str


@router.get("/health", response_model=CPHealthResponse)
def health(x_tenant_id: str = Header(..., alias="X-Tenant-Id")) -> CPHealthResponse:
    decision = policy_gate.check_runtime_access(x_tenant_id)
    return CPHealthResponse(
        status="scaffolded",
        plane="CP",
        tenant_id=x_tenant_id,
        policy_state=decision,
    )


@router.post("/cp-ap/contracts/bnd-cp-ap-01/sync", response_model=ContractSyncResponse)
def cp_ap_contract_sync(
    payload: ContractSyncRequest,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> ContractSyncResponse:
    if payload.tenant_id != x_tenant_id:
        raise HTTPException(status_code=409, detail="tenant context conflict between header and body")
    if payload.principal_id != x_principal_id:
        raise HTTPException(status_code=409, detail="principal context conflict between header and body")
    action = str(payload.payload.get("action", "unknown")) if isinstance(payload.payload, dict) else "unknown"
    tenant_context = (
        str(payload.payload.get("tenant_context", payload.tenant_id))
        if isinstance(payload.payload, dict)
        else payload.tenant_id
    )
    decision = policy_gate.evaluate_ap_action(
        tenant_id=payload.tenant_id,
        principal_id=payload.principal_id,
        action=action,
        tenant_context=tenant_context,
    )
    return ContractSyncResponse(
        tenant_id=payload.tenant_id,
        principal_id=payload.principal_id,
        correlation_id=payload.correlation_id,
        payload={
            "allow": decision.allow,
            "reason": decision.reason,
            "action": decision.action,
            "tenant_id": decision.tenant_id,
            "principal_id": decision.principal_id,
        },
    )


@router.get("/policy/evaluate/{action}", response_model=PolicyDecisionResponse)
def evaluate_policy(
    action: str,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> PolicyDecisionResponse:
    decision = policy_gate.evaluate_ap_action(
        tenant_id=x_tenant_id,
        principal_id=x_principal_id,
        action=action,
        tenant_context=x_tenant_id,
    )
    return PolicyDecisionResponse(
        allow=decision.allow,
        reason=decision.reason,
        action=decision.action,
        tenant_id=decision.tenant_id,
        principal_id=decision.principal_id,
    )
