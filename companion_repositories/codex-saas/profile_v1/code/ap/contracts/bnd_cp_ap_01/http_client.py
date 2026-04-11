# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CONTRACT-BND-CP-AP-01-AP
# CAF_TRACE: capability=contract_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=decision_option:CAF-TCTX-01/Q-CPAP-TCTX-CONFLICT-01/claim_over_header

"""AP-side synchronous CP policy evaluation client scaffold."""

from __future__ import annotations

import json
import uuid
import urllib.request
from dataclasses import asdict
import base64

from ....common.auth.mock_claims import decode_mock_bearer_token
from .envelope import ContractRequestEnvelope, ContractResponseEnvelope


def call_contract_http(base_url: str, request: ContractRequestEnvelope) -> ContractResponseEnvelope:
    """Invoke CP policy decision contract with the adopted Authorization/Bearer claim carrier."""
    token = _build_bearer_token(request)
    headers = {
        "Authorization": token,
        "Content-Type": "application/json",
        "X-Correlation-Id": request.correlation_id or str(uuid.uuid4()),
    }
    body = json.dumps(asdict(request)).encode("utf-8")
    http_request = urllib.request.Request(
        url=f"{base_url.rstrip('/')}/cp/policy-decisions/evaluate",
        data=body,
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(http_request, timeout=5) as response:
        payload = json.loads(response.read().decode("utf-8"))

    return ContractResponseEnvelope(
        tenant_id=str(payload.get("tenant_id", request.tenant_id)),
        principal_id=str(payload.get("principal_id", request.principal_id)),
        correlation_id=str(payload.get("correlation_id", request.correlation_id)),
        payload=dict(payload.get("payload", {})),
    )


def _build_bearer_token(request: ContractRequestEnvelope) -> str:
    """Use the canonical mock.<base64-json>.token contract during scaffolding."""
    claims_payload = {
        "tenant_id": request.tenant_id,
        "principal_id": request.principal_id,
        "policy_version": "v1",
    }
    encoded = base64.b64encode(json.dumps(claims_payload).encode("utf-8")).decode("utf-8").rstrip("=")
    return f"Bearer mock.{encoded}.token"


def validate_claim_over_header_contract(
    authorization: str,
    tenant_header: str | None,
    principal_header: str | None,
) -> dict[str, str]:
    """Enforce claim-over-header precedence and explicit conflict rejection."""
    claims = decode_mock_bearer_token(authorization)
    if tenant_header and tenant_header != claims["tenant_id"]:
        raise PermissionError("tenant context conflict between Authorization claim and tenant header")
    if principal_header and principal_header != claims["principal_id"]:
        raise PermissionError("principal context conflict between Authorization claim and principal header")
    return claims
