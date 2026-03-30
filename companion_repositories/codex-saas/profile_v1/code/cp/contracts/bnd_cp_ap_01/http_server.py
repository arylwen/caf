# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-CP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=contract_boundary_id:BND-CP-AP-01

"""CP-side HTTP handler scaffold for CP<->AP contract provision."""

from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def handle_contract_http(request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    action = str(request.payload.get("action", "")).strip()
    policy_version = str(request.payload.get("policy_version", "")).strip() or "v1"
    resource_id = request.payload.get("resource_id")

    if not action:
        payload = {
            "allowed": False,
            "reason": "action is required",
            "policy_version": policy_version,
            "resource_id": resource_id,
            "action": action,
        }
    elif policy_version != "v1":
        payload = {
            "allowed": False,
            "reason": "unsupported policy_version",
            "policy_version": policy_version,
            "resource_id": resource_id,
            "action": action,
        }
    elif action.endswith((".create", ".update", ".delete")) and not request.principal_id.endswith(":admin"):
        payload = {
            "allowed": False,
            "reason": "write actions require an admin principal in mock policy",
            "policy_version": policy_version,
            "resource_id": resource_id,
            "action": action,
        }
    else:
        payload = {
            "allowed": True,
            "reason": "policy decision allow",
            "policy_version": policy_version,
            "resource_id": resource_id,
            "action": action,
        }

    return ContractResponseEnvelope(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        correlation_id=request.correlation_id,
        payload=payload,
    )
