# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=contract_boundary_id:BND-CP-AP-01

"""AP-side HTTP client scaffold for CP<->AP contract consumption."""

import base64
import json
from urllib import request as urllib_request

from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def _build_authorization_header(tenant_id: str, principal_id: str, policy_version: str) -> str:
    payload = json.dumps(
        {
            "tenant_id": tenant_id,
            "principal_id": principal_id,
            "policy_version": policy_version,
        },
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    encoded = base64.urlsafe_b64encode(payload).decode("utf-8").rstrip("=")
    return f"Bearer mock.{encoded}.token"


def call_contract_http(base_url: str, request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    body = {
        "tenant_id": request.tenant_id,
        "principal_id": request.principal_id,
        "correlation_id": request.correlation_id,
        "payload": request.payload,
    }
    encoded_body = json.dumps(body).encode("utf-8")
    http_request = urllib_request.Request(
        url=f"{base_url.rstrip('/')}/cp/contract/BND-CP-AP-01",
        data=encoded_body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib_request.urlopen(http_request) as response:
        parsed = json.loads(response.read().decode("utf-8"))
    return ContractResponseEnvelope(
        tenant_id=parsed["tenant_id"],
        principal_id=parsed["principal_id"],
        correlation_id=parsed["correlation_id"],
        payload=parsed.get("payload", {}),
    )


def call_policy_decision(
    base_url: str,
    *,
    tenant_id: str,
    principal_id: str,
    policy_version: str,
    action: str,
    resource_id: str | None = None,
) -> dict[str, str | bool | None]:
    body = {
        "tenant_id": tenant_id,
        "principal_id": principal_id,
        "policy_version": policy_version,
        "action": action,
        "resource_id": resource_id,
    }
    encoded_body = json.dumps(body).encode("utf-8")
    http_request = urllib_request.Request(
        url=f"{base_url.rstrip('/')}/cp/contract/BND-CP-AP-01/policy-decision",
        data=encoded_body,
        headers={
            "Content-Type": "application/json",
            "Authorization": _build_authorization_header(tenant_id, principal_id, policy_version),
        },
        method="POST",
    )
    with urllib_request.urlopen(http_request) as response:
        return json.loads(response.read().decode("utf-8"))
