# CAF_TRACE: task_id=TG-35-policy-enforcement-core capability=policy_enforcement trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-claim-contract
from dataclasses import dataclass
from typing import Mapping


def lookup_header_case_insensitive(headers: Mapping[str, str], target: str) -> str | None:
    for key, value in headers.items():
        if key.lower() == target.lower():
            return value
    return None


def parse_bearer_claim_payload(token: str) -> dict[str, str]:
    parsed: dict[str, str] = {}
    for chunk in token.split(";"):
        if "=" not in chunk:
            continue
        key, value = chunk.split("=", 1)
        parsed[key.strip()] = value.strip()
    return parsed


@dataclass(frozen=True)
class MockBearerClaim:
    tenant_id: str
    principal_id: str
    policy_version: str
    tenant_header: str | None


def parse_mock_claim_from_headers(headers: Mapping[str, str]) -> MockBearerClaim:
    authorization = lookup_header_case_insensitive(headers, "Authorization")
    if not authorization:
        raise PermissionError("missing Authorization header for mock auth contract")

    scheme, separator, token = authorization.partition(" ")
    if not separator or scheme.lower() != "bearer":
        raise PermissionError("Authorization header must use Bearer claim contract")

    claim = parse_bearer_claim_payload(token)
    tenant_id = claim.get("tenant_id", "")
    principal_id = claim.get("principal_id", "")
    policy_version = claim.get("policy_version", "")
    if not tenant_id or not principal_id or not policy_version:
        raise PermissionError(
            "Authorization claim must include tenant_id, principal_id, and policy_version"
        )

    tenant_header = lookup_header_case_insensitive(headers, "X-Tenant-Id")
    if tenant_header and tenant_header != tenant_id:
        raise PermissionError(
            "tenant context conflict: verified claim takes precedence over header"
        )

    return MockBearerClaim(
        tenant_id=tenant_id,
        principal_id=principal_id,
        policy_version=policy_version,
        tenant_header=tenant_header,
    )
