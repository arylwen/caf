# CAF_TRACE: task_id=TG-20-api-boundary-workspaces capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
# CAF_TRACE: task_id=TG-20-api-boundary-submissions capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
# CAF_TRACE: task_id=TG-20-api-boundary-reviews capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
# CAF_TRACE: task_id=TG-20-api-boundary-reports capability=api_boundary_implementation trace_anchor=pattern_obligation_id:O-TBP-AUTH-MOCK-01-boundary-adapter
from fastapi import HTTPException, Request

from ..boundary.auth_context import VerifiedAuthClaim, parse_mock_auth_claim


def resolve_auth_context(request: Request) -> VerifiedAuthClaim:
    try:
        return parse_mock_auth_claim(request.headers)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
