# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-CP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=contract_boundary_id:BND-CP-AP-01

"""CP-side contract event scaffold for CP<->AP lifecycle and audit semantics."""

import json

from .envelope import ContractEventEnvelope


def publish_contract_event(event: ContractEventEnvelope) -> str:
    return json.dumps(
        {
            "tenant_id": event.tenant_id,
            "principal_id": event.principal_id,
            "correlation_id": event.correlation_id,
            "payload": event.payload,
        }
    )


def consume_contract_event(event_json: str) -> ContractEventEnvelope:
    payload = json.loads(event_json)
    return ContractEventEnvelope(
        tenant_id=payload["tenant_id"],
        principal_id=payload["principal_id"],
        correlation_id=payload["correlation_id"],
        payload=payload.get("payload", {}),
    )