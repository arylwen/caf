# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-CONTRACT-BND-CP-AP-01-AP; capability=contract_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
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
    decoded = json.loads(event_json)
    return ContractEventEnvelope(
        tenant_id=str(decoded.get("tenant_id", "")),
        principal_id=str(decoded.get("principal_id", "")),
        correlation_id=str(decoded.get("correlation_id", "")),
        payload=decoded.get("payload") if isinstance(decoded.get("payload"), dict) else {},
    )
