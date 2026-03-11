# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-AP-runtime-scaffold; capability=plane_runtime_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
from fastapi import APIRouter, Header
from pydantic import BaseModel

from ...application.service_facade import APServiceFacade
from .reports_router import router as reports_router
from .submissions_router import router as submissions_router
from .workspaces_router import router as workspaces_router

router = APIRouter()
service = APServiceFacade()


class APHealthResponse(BaseModel):
    status: str
    plane: str
    tenant_id: str


@router.get("/health", response_model=APHealthResponse)
def health(x_tenant_id: str = Header(..., alias="X-Tenant-Id")) -> APHealthResponse:
    return APHealthResponse(
        status="scaffolded",
        plane="AP",
        tenant_id=service.require_tenant_context(x_tenant_id),
    )


router.include_router(reports_router)
router.include_router(submissions_router)
router.include_router(workspaces_router)
