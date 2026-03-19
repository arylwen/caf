from code.common.auth.mock_claims import parse_mock_claim_from_headers


def test_parse_mock_claim_accepts_case_insensitive_authorization_header():
    claim = parse_mock_claim_from_headers(
        {
            "authorization": "Bearer tenant_id=tenant-a;principal_id=operator-a;policy_version=v1",
            "X-Tenant-Id": "tenant-a",
        }
    )

    assert claim.tenant_id == "tenant-a"
    assert claim.principal_id == "operator-a"
    assert claim.policy_version == "v1"
    assert claim.tenant_header == "tenant-a"


def test_parse_mock_claim_rejects_conflicting_tenant_header():
    headers = {
        "Authorization": "Bearer tenant_id=tenant-a;principal_id=operator-a;policy_version=v1",
        "X-Tenant-Id": "tenant-b",
    }

    try:
        parse_mock_claim_from_headers(headers)
    except PermissionError as exc:
        assert "tenant context conflict" in str(exc)
    else:
        raise AssertionError("expected tenant header conflict to raise PermissionError")


def test_parse_mock_claim_requires_all_required_claim_keys():
    headers = {
        "Authorization": "Bearer tenant_id=tenant-a;principal_id=operator-a",
    }

    try:
        parse_mock_claim_from_headers(headers)
    except PermissionError as exc:
        assert "tenant_id, principal_id, and policy_version" in str(exc)
    else:
        raise AssertionError("expected missing claim keys to raise PermissionError")
