# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-CP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas

"""CP-side async event envelope helpers for BND-CP-AP-01."""

from __future__ import annotations

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
        tenant_id=str(payload["tenant_id"]),
        principal_id=str(payload["principal_id"]),
        correlation_id=str(payload["correlation_id"]),
        payload=dict(payload.get("payload", {})),
    )
