import json
from urllib import request as urllib_request

from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def call_contract_http(base_url: str, request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    endpoint = base_url.rstrip("/") + "/cp-ap/policy-evaluate"
    payload = {
        "tenant_id": request.tenant_id,
        "principal_id": request.principal_id,
        "correlation_id": request.correlation_id,
        "payload": request.payload,
    }
    body = json.dumps(payload).encode("utf-8")
    http_request = urllib_request.Request(
        endpoint,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer tenant_id={request.tenant_id};principal_id={request.principal_id};policy_version=v1",
            "X-Tenant-Id": request.tenant_id,
        },
        method="POST",
    )
    with urllib_request.urlopen(http_request) as response:
        response_payload = json.loads(response.read().decode("utf-8"))
    return ContractResponseEnvelope(
        tenant_id=response_payload.get("tenant_id", request.tenant_id),
        principal_id=response_payload.get("principal_id", request.principal_id),
        correlation_id=response_payload.get("correlation_id", request.correlation_id),
        payload=response_payload.get("payload", {}),
    )

