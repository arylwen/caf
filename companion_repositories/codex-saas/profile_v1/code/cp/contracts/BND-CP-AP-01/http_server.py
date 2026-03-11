# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-35-policy-enforcement-core; capability=policy_enforcement; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-POLICY-ENFORCEMENT
from .envelope import ContractRequestEnvelope, ContractResponseEnvelope
from ...application.policy_gate import ControlPlanePolicyGate

policy_gate = ControlPlanePolicyGate()

def handle_contract_http(request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    payload = request.payload if isinstance(request.payload, dict) else {}
    action = str(payload.get("action", "unknown"))
    tenant_context = str(payload.get("tenant_context", request.tenant_id))
    decision = policy_gate.evaluate_ap_action(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        action=action,
        tenant_context=tenant_context,
    )
    return ContractResponseEnvelope(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        correlation_id=request.correlation_id,
        payload={
            "allow": decision.allow,
            "reason": decision.reason,
            "action": decision.action,
            "tenant_id": decision.tenant_id,
            "principal_id": decision.principal_id,
        },
    )
