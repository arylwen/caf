# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-CONTRACT-BND-CP-AP-01-AP; capability=contract_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-CONTRACT-BND-CP-AP-01-AP
import json
from urllib import request as urllib_request

from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def call_contract_http(base_url: str, request_envelope: ContractRequestEnvelope) -> ContractResponseEnvelope:
    body = json.dumps(
        {
            "tenant_id": request_envelope.tenant_id,
            "principal_id": request_envelope.principal_id,
            "correlation_id": request_envelope.correlation_id,
            "payload": request_envelope.payload,
        }
    ).encode("utf-8")
    http_request = urllib_request.Request(
        url=f"{base_url.rstrip('/')}/cp-ap/contracts/bnd-cp-ap-01/sync",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib_request.urlopen(http_request, timeout=5) as response:
        decoded = json.loads(response.read().decode("utf-8"))
    return ContractResponseEnvelope(
        tenant_id=str(decoded.get("tenant_id", request_envelope.tenant_id)),
        principal_id=str(decoded.get("principal_id", request_envelope.principal_id)),
        correlation_id=str(decoded.get("correlation_id", request_envelope.correlation_id)),
        payload=decoded.get("payload") if isinstance(decoded.get("payload"), dict) else {},
    )
