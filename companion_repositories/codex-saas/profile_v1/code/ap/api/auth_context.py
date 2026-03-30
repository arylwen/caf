# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-10-OPTIONS-api_boundary_implementation
# CAF_TRACE: capability=api_boundary_implementation
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter

"""AP boundary auth-context adapter for canonical mock bearer claim resolution."""

from collections.abc import Mapping

from fastapi import HTTPException, status

from ...common.auth.mock_claims import MockClaims, parse_mock_claims_from_headers


def resolve_auth_context(headers: Mapping[str, str]) -> MockClaims:
    try:
        return parse_mock_claims_from_headers(headers)
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc