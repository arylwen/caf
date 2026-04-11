# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-CP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas

"""CP-side HTTP handler scaffold for BND-CP-AP-01."""

from __future__ import annotations

from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def handle_contract_http(request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    action = str(request.payload.get("action", "")).strip()
    principal = request.principal_id
    allow = action.startswith("read") or principal.endswith("admin-user")
    return ContractResponseEnvelope(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        correlation_id=request.correlation_id,
        payload={
            "allow": allow,
            "action": action,
            "resource": str(request.payload.get("resource", "")),
            "reason": "allowed by CP policy decision" if allow else "denied by CP policy decision",
            "decision_source": "cp_central_decision_ap_enforces",
        },
    )
