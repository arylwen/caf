# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=decision_option:CAF-PLANE-01/Q-CP-AP-SURFACE-01/mixed

"""AP-side async event envelope stubs for lifecycle and audit alignment."""

from __future__ import annotations

import json

from .envelope import ContractEventEnvelope


def publish_contract_event(event: ContractEventEnvelope) -> str:
    """Publish the event envelope as JSON for downstream event-bus adapters."""
    return json.dumps(
        {
            "tenant_id": event.tenant_id,
            "principal_id": event.principal_id,
            "correlation_id": event.correlation_id,
            "payload": event.payload,
        }
    )


def consume_contract_event(event_json: str) -> ContractEventEnvelope:
    """Parse event envelopes from the async boundary."""
    payload = json.loads(event_json)
    return ContractEventEnvelope(
        tenant_id=str(payload["tenant_id"]),
        principal_id=str(payload["principal_id"]),
        correlation_id=str(payload["correlation_id"]),
        payload=dict(payload.get("payload", {})),
    )
