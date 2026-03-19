from code.cp.boundary.auth_context import parse_mock_auth_claim


def test_parse_mock_auth_claim_maps_platform_principal_kind():
    claim = parse_mock_auth_claim(
        {
            "Authorization": (
                "Bearer tenant_id=tenant-a;principal_id=platform-admin;policy_version=v1"
            ),
        }
    )

    principal = claim.to_principal_context()
    assert principal.principal_kind == "platform_user"
    assert principal.tenant_id == "tenant-a"
    assert principal.policy_version == "v1"


def test_parse_mock_auth_claim_maps_service_principal_kind():
    claim = parse_mock_auth_claim(
        {
            "Authorization": "Bearer tenant_id=tenant-a;principal_id=service-cp;policy_version=v1",
        }
    )

    assert claim.principal_kind == "service_principal"


def test_parse_mock_auth_claim_defaults_to_tenant_user_principal_kind():
    claim = parse_mock_auth_claim(
        {
            "Authorization": "Bearer tenant_id=tenant-a;principal_id=reviewer-12;policy_version=v1",
        }
    )

    assert claim.principal_kind == "tenant_user"
