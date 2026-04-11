# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-unit-tests
# CAF_TRACE: capability=unit_test_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS

from __future__ import annotations

import unittest

from code.common.auth.mock_claims import decode_mock_bearer_token, enforce_claim_over_header_conflict


class MockClaimsTests(unittest.TestCase):
    def test_decode_mock_bearer_token_returns_canonical_claims(self) -> None:
        authorization = "Bearer mock.eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtYWxwaGEiLCJwcmluY2lwYWxfaWQiOiJhZG1pbiIsInBvbGljeV92ZXJzaW9uIjoidjEifQ.token"
        claims = decode_mock_bearer_token(authorization)
        self.assertEqual(claims["tenant_id"], "tenant-alpha")
        self.assertEqual(claims["principal_id"], "admin")
        self.assertEqual(claims["policy_version"], "v1")

    def test_decode_mock_bearer_token_rejects_wrong_prefix(self) -> None:
        with self.assertRaises(PermissionError):
            decode_mock_bearer_token("Token not-a-bearer")

    def test_enforce_claim_over_header_conflict_rejects_mismatched_tenant(self) -> None:
        claims = {"tenant_id": "tenant-alpha", "principal_id": "admin", "policy_version": "v1", "token": "t"}
        with self.assertRaises(PermissionError):
            enforce_claim_over_header_conflict(claims, tenant_header="tenant-beta", principal_header="admin")


if __name__ == "__main__":
    unittest.main()
