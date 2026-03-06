# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-contract-BND-CP-AP-01 | capability=contract_scaffolding | instance=codex-saas | trace_anchor=contract_surface:synchronous_http
import json
import urllib.request

from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def call_contract_http(base_url: str, request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    body = json.dumps(
        {
            "tenant_id": request.tenant_id,
            "principal_id": request.principal_id,
            "correlation_id": request.correlation_id,
            "payload": request.payload,
        }
    ).encode("utf-8")
    url = f"{base_url.rstrip('/')}/policy/evaluate"
    http_request = urllib.request.Request(
        url,
        data=body,
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(http_request, timeout=3.0) as response:
        response_payload = json.loads(response.read().decode("utf-8"))
    return ContractResponseEnvelope(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        correlation_id=request.correlation_id,
        payload=response_payload,
    )

