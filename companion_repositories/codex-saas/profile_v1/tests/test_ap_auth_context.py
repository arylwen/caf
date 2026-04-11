# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-90-unit-tests
# CAF_TRACE: capability=unit_test_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-UNIT-TESTS

from __future__ import annotations

import unittest

from fastapi import HTTPException

from code.ap.api.auth_context import resolve_auth_context


class ApAuthContextTests(unittest.TestCase):
    def test_resolve_auth_context_accepts_case_insensitive_authorization_header(self) -> None:
        headers = {
            "AUTHORIZATION": "Bearer mock.eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtYWxwaGEiLCJwcmluY2lwYWxfaWQiOiJhZG1pbiIsInBvbGljeV92ZXJzaW9uIjoidjEifQ.token",
            "x-tenant-context-check": "tenant-alpha",
            "x-principal-context-check": "admin",
        }
        context = resolve_auth_context(headers)
        self.assertEqual(context["tenant_id"], "tenant-alpha")
        self.assertEqual(context["principal_id"], "admin")

    def test_resolve_auth_context_rejects_missing_authorization(self) -> None:
        with self.assertRaises(HTTPException) as error:
            resolve_auth_context({})
        self.assertEqual(error.exception.status_code, 401)

    def test_resolve_auth_context_rejects_claim_header_conflict(self) -> None:
        headers = {
            "Authorization": "Bearer mock.eyJ0ZW5hbnRfaWQiOiJ0ZW5hbnQtYWxwaGEiLCJwcmluY2lwYWxfaWQiOiJhZG1pbiIsInBvbGljeV92ZXJzaW9uIjoidjEifQ.token",
            "x-tenant-context-check": "tenant-beta",
        }
        with self.assertRaises(HTTPException) as error:
            resolve_auth_context(headers)
        self.assertEqual(error.exception.status_code, 401)
        self.assertIn("tenant context conflict", str(error.exception.detail))


if __name__ == "__main__":
    unittest.main()
