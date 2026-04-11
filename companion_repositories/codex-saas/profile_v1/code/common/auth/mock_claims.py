# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-PY-01-python-package-markers

"""Mock Authorization claim contract shared by policy and boundary surfaces."""

from __future__ import annotations

import base64
import json


def decode_mock_bearer_token(authorization: str) -> dict[str, str]:
    """Decode `Bearer mock.<base64-json>.token` into canonical tenant/principal claims."""
    if not authorization:
        raise PermissionError("missing Authorization header")
    prefix = "bearer "
    if not authorization.lower().startswith(prefix):
        raise PermissionError("Authorization header must start with Bearer")

    token = authorization[len("Bearer ") :].strip()
    if not token.startswith("mock.") or not token.endswith(".token"):
        raise PermissionError("mock auth token must use mock.<base64-json>.token form")

    encoded_claims = token.removeprefix("mock.").removesuffix(".token")
    padding = "=" * ((4 - len(encoded_claims) % 4) % 4)
    try:
        decoded = base64.b64decode(encoded_claims + padding).decode("utf-8")
        payload = json.loads(decoded)
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise PermissionError("mock auth token payload must be valid base64-encoded JSON") from exc

    tenant_id = str(payload.get("tenant_id", "")).strip()
    principal_id = str(payload.get("principal_id", "")).strip()
    policy_version = str(payload.get("policy_version", "")).strip()
    if not tenant_id or not principal_id or not policy_version:
        raise PermissionError("mock auth token must include tenant_id, principal_id, and policy_version")

    return {
        "tenant_id": tenant_id,
        "principal_id": principal_id,
        "policy_version": policy_version,
        "token": token,
    }


def enforce_claim_over_header_conflict(
    claims: dict[str, str],
    tenant_header: str | None,
    principal_header: str | None,
) -> dict[str, str]:
    """Reject conflicting alternate carriers; claim remains authoritative when no conflict exists."""
    normalized_tenant = (tenant_header or "").strip()
    normalized_principal = (principal_header or "").strip()

    if normalized_tenant and normalized_tenant != claims["tenant_id"]:
        raise PermissionError("tenant context conflict between claim and header carrier")
    if normalized_principal and normalized_principal != claims["principal_id"]:
        raise PermissionError("principal context conflict between claim and header carrier")
    return claims
