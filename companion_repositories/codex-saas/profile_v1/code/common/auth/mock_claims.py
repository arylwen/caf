# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-OPT-CAF-IAM-01-Q-CAF-IAM-01-AUTO-01-standard_platform_tenant_service

"""Mock Authorization bearer parser shared by AP and CP runtime scaffolds."""

import base64
import json
from collections.abc import Mapping
from dataclasses import dataclass


@dataclass(frozen=True)
class MockClaims:
    tenant_id: str
    principal_id: str
    policy_version: str


def _decode_base64url(value: str) -> str:
    padding = "=" * (-len(value) % 4)
    decoded = base64.urlsafe_b64decode((value + padding).encode("utf-8"))
    return decoded.decode("utf-8")


def _parse_legacy_keyvalue_payload(raw_payload: str) -> MockClaims:
    segments = [segment.strip() for segment in raw_payload.split(";") if "=" in segment]
    parsed: dict[str, str] = {}
    for segment in segments:
        key, value = segment.split("=", 1)
        parsed[key.strip().lower()] = value.strip()

    tenant_id = parsed.get("tenant_id")
    principal_id = parsed.get("principal_id")
    policy_version = parsed.get("policy_version")
    if not tenant_id or not principal_id or not policy_version:
        raise PermissionError("Bearer token must include tenant_id, principal_id, and policy_version")

    return MockClaims(tenant_id=tenant_id, principal_id=principal_id, policy_version=policy_version)


def parse_mock_claims(authorization_header: str | None) -> MockClaims:
    if not authorization_header:
        raise PermissionError("Authorization header is required")

    normalized = authorization_header.strip()
    if not normalized.lower().startswith("bearer "):
        raise PermissionError("Authorization header must use Bearer scheme")

    raw_payload = normalized[7:].strip()
    if raw_payload.startswith("mock.") and raw_payload.endswith(".token"):
        encoded_claims = raw_payload[len("mock.") : -len(".token")]
        try:
            parsed = json.loads(_decode_base64url(encoded_claims))
        except (ValueError, json.JSONDecodeError) as exc:
            raise PermissionError("Bearer token must contain valid mock claim JSON payload") from exc
        tenant_id = str(parsed.get("tenant_id", "")).strip()
        principal_id = str(parsed.get("principal_id", "")).strip()
        policy_version = str(parsed.get("policy_version", "")).strip()
        if not tenant_id or not principal_id or not policy_version:
            raise PermissionError("Bearer token must include tenant_id, principal_id, and policy_version")
        return MockClaims(tenant_id=tenant_id, principal_id=principal_id, policy_version=policy_version)

    return _parse_legacy_keyvalue_payload(raw_payload)


def parse_mock_claims_from_headers(headers: Mapping[str, str]) -> MockClaims:
    lowered = {str(key).lower(): str(value) for key, value in headers.items()}
    claims = parse_mock_claims(lowered.get("authorization"))

    conflict_pairs = (
        ("tenant_id", "x-tenant-id"),
        ("principal_id", "x-principal-id"),
        ("policy_version", "x-policy-version"),
    )
    for claim_key, alternate_header in conflict_pairs:
        alternate_value = lowered.get(alternate_header)
        if alternate_value and alternate_value != getattr(claims, claim_key):
            raise PermissionError(
                "Conflicting tenant/principal carriers detected; Authorization bearer claims are canonical"
            )

    return claims


def build_mock_authorization_header(claims: MockClaims) -> str:
    claim_payload = json.dumps(
        {
            "tenant_id": claims.tenant_id,
            "principal_id": claims.principal_id,
            "policy_version": claims.policy_version,
        },
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    encoded_payload = base64.urlsafe_b64encode(claim_payload).decode("utf-8").rstrip("=")
    return f"Bearer mock.{encoded_payload}.token"
