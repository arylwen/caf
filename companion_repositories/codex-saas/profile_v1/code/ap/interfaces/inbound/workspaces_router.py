# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-90-runtime-wiring; capability=runtime_wiring; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-RUNTIME-WIRING
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from ...application.policy_client import PolicyClientError
from ...application.resource_service_facades import WorkspaceCreateInput, WorkspaceUpdateInput
from ...bootstrap.runtime_wiring import workspaces_service

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


class WorkspaceCreateRequest(BaseModel):
    name: str


class WorkspaceUpdateRequest(BaseModel):
    name: str


class WorkspaceResponse(BaseModel):
    workspace_id: str
    tenant_id: str
    name: str


@router.get("/", response_model=list[WorkspaceResponse])
def list_workspaces(
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> list[WorkspaceResponse]:
    try:
        items = workspaces_service.list_workspaces(tenant_id=x_tenant_id, principal_id=x_principal_id)
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return [WorkspaceResponse(**item) for item in items]


@router.post("/", response_model=WorkspaceResponse)
def create_workspace(
    payload: WorkspaceCreateRequest,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> WorkspaceResponse:
    try:
        created = workspaces_service.create_workspace(
            tenant_id=x_tenant_id,
            principal_id=x_principal_id,
            payload=WorkspaceCreateInput(name=payload.name),
        )
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return WorkspaceResponse(**created)


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
def update_workspace(
    workspace_id: str,
    payload: WorkspaceUpdateRequest,
    x_tenant_id: str = Header(..., alias="X-Tenant-Id"),
    x_principal_id: str = Header(..., alias="X-Principal-Id"),
) -> WorkspaceResponse:
    try:
        updated = workspaces_service.update_workspace(
            tenant_id=x_tenant_id,
            principal_id=x_principal_id,
            workspace_id=workspace_id,
            payload=WorkspaceUpdateInput(name=payload.name),
        )
    except Exception as exc:
        status_code, detail = _map_error(exc)
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return WorkspaceResponse(**updated)


def _map_error(exc: Exception) -> tuple[int, str]:
    if isinstance(exc, PermissionError):
        return 403, str(exc)
    if isinstance(exc, KeyError):
        return 404, str(exc)
    if isinstance(exc, PolicyClientError):
        return 502, "policy evaluation unavailable"
    return 400, str(exc)
