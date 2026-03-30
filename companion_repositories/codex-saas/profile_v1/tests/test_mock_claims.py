# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-unit-tests
# CAF_TRACE: capability=unit_test_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from code.common.auth.mock_claims import MockClaims, build_mock_authorization_header, parse_mock_claims_from_headers


def test_parse_mock_claims_from_bearer_token_round_trip():
    claims = MockClaims(tenant_id="tenant-demo", principal_id="user:demo:admin", policy_version="v1")
    header = build_mock_authorization_header(claims)

    parsed = parse_mock_claims_from_headers({"Authorization": header})

    assert parsed == claims


def test_parse_mock_claims_rejects_conflicting_tenant_headers():
    claims = MockClaims(tenant_id="tenant-demo", principal_id="user:demo:admin", policy_version="v1")
    header = build_mock_authorization_header(claims)

    try:
        parse_mock_claims_from_headers({"Authorization": header, "X-Tenant-Id": "other-tenant"})
    except PermissionError as error:
        assert "Conflicting tenant/principal carriers" in str(error)
    else:
        raise AssertionError("expected conflicting tenant context to be rejected")