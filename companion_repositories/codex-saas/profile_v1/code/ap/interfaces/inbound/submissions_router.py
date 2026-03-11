# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-90-runtime-wiring; capability=runtime_wiring; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from ...application.policy_client import PolicyClientError
from ...application.resource_service_facades import SubmissionCreateInput, SubmissionUpdateInput
from ...bootstrap.runtime_wiring import submissions_service

router = APIRouter(prefix="/submissions", tags=["submissions"])


class SubmissionCreateRequest(BaseModel):
    workspace_id: str
    title: str


class SubmissionUpdateRequest(BaseModel):
    status: str


class SubmissionResponse(BaseModel):
    submission_id: str
    workspace_id: str
    tenant_id: str
    title: str
    status: str


@router.get("/", response_model=list[SubmissionResponse])
def list_submissions(
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> list[SubmissionResponse]:
    try:
        items = submissions_service.list_submissions(tenant_id=x_tenant_id, principal_id=x_principal_id)
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return [SubmissionResponse(**item) for item in items]


@router.post("/", response_model=SubmissionResponse)
def create_submission(
    payload: SubmissionCreateRequest,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> SubmissionResponse:
    try:
        created = submissions_service.create_submission(
            tenant_id=x_tenant_id,
            principal_id=x_principal_id,
            payload=SubmissionCreateInput(workspace_id=payload.workspace_id, title=payload.title),
        )
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return SubmissionResponse(**created)


@router.put("/{submission_id}", response_model=SubmissionResponse)
def update_submission(
    submission_id: str,
    payload: SubmissionUpdateRequest,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> SubmissionResponse:
    try:
        updated = submissions_service.update_submission(
            tenant_id=x_tenant_id,
            principal_id=x_principal_id,
            submission_id=submission_id,
            payload=SubmissionUpdateInput(status=payload.status),
        )
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return SubmissionResponse(**updated)


def _map_error(exc: Exception) -> tuple[int, str]:
    if isinstance(exc, PermissionError):
        return 403, str(exc)
    if isinstance(exc, KeyError):
        return 404, str(exc)
    if isinstance(exc, PolicyClientError):
        return 502, "policy evaluation unavailable"
    return 400, str(exc)
