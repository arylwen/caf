# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-90-runtime-wiring; capability=runtime_wiring; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from ...application.policy_client import PolicyClientError
from ...bootstrap.runtime_wiring import reports_service

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportResponse(BaseModel):
    report_id: str
    workspace_id: str
    summary: str
    status: str


@router.get("/", response_model=list[ReportResponse])
def list_reports(
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> list[ReportResponse]:
    try:
        items = reports_service.list_reports(tenant_id=x_tenant_id, principal_id=x_principal_id)
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return [ReportResponse(**item) for item in items]


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> ReportResponse:
    try:
        item = reports_service.get_report(
            tenant_id=x_tenant_id,
            principal_id=x_principal_id,
            report_id=report_id,
        )
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return ReportResponse(**item)


def _map_error(exc: Exception) -> tuple[int, str]:
    if isinstance(exc, PermissionError):
        return 403, str(exc)
    if isinstance(exc, KeyError):
        return 404, str(exc)
    if isinstance(exc, PolicyClientError):
        return 502, "policy evaluation unavailable"
    return 400, str(exc)
