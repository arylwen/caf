# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: capability=policy_enforcement
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-claim-contract

"""AP auth-context adapter for the mock Authorization/Bearer claim contract."""

from __future__ import annotations

from typing import Mapping

from fastapi import HTTPException

from ...common.auth.mock_claims import decode_mock_bearer_token, enforce_claim_over_header_conflict


def _header_value(headers: Mapping[str, str], key: str) -> str | None:
    for existing_key, value in headers.items():
        if existing_key.lower() == key.lower():
            return value
    return None


def resolve_auth_context(headers: Mapping[str, str]) -> dict[str, str]:
    """Resolve tenant/principal context from claim carrier and reject conflicting headers."""
    authorization = _header_value(headers, "authorization")
    if not authorization:
        raise HTTPException(status_code=401, detail="missing Authorization bearer token")

    try:
        claims = decode_mock_bearer_token(authorization)
        return enforce_claim_over_header_conflict(
            claims,
            tenant_header=_header_value(headers, "x-tenant-context-check"),
            principal_header=_header_value(headers, "x-principal-context-check"),
        )
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
