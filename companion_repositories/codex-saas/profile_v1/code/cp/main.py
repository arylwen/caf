# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

"""Control-plane FastAPI composition root scaffold."""

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..common.auth.mock_claims import parse_mock_claims_from_headers
from ..common.persistence.bootstrap import bootstrap_schema_if_needed
from .application.services import PolicyDecisionService, RepositoryHealthOwner

router = APIRouter(prefix="/cp")
health_owner = RepositoryHealthOwner()
policy_service = PolicyDecisionService()


class PolicyDecisionRequest(BaseModel):
    action: str
    tenant_id: str | None = None
    principal_id: str | None = None
    policy_version: str | None = None
    resource_id: str | None = None


@router.get("/health")
def cp_health() -> dict[str, str]:
    return {"status": "ok", "plane": "control"}


@router.get("/runtime-health")
def cp_runtime_health(request: Request) -> dict[str, str]:
    claims = parse_mock_claims_from_headers(request.headers)
    snapshot = health_owner.read_runtime_health()
    return {
        "status": snapshot.status,
        "plane": snapshot.plane,
        "detail": snapshot.detail,
        "tenant_id": claims.tenant_id,
        "principal_id": claims.principal_id,
        "policy_version": claims.policy_version,
    }


@router.post("/contract/BND-CP-AP-01/policy-decision")
def cp_policy_decision(request: Request, body: PolicyDecisionRequest) -> dict[str, str | bool | None]:
    claims = parse_mock_claims_from_headers(request.headers)

    if body.tenant_id and body.tenant_id != claims.tenant_id:
        raise PermissionError("tenant_id conflict between body and Authorization claims")
    if body.principal_id and body.principal_id != claims.principal_id:
        raise PermissionError("principal_id conflict between body and Authorization claims")
    if body.policy_version and body.policy_version != claims.policy_version:
        raise PermissionError("policy_version conflict between body and Authorization claims")

    decision = policy_service.evaluate(
        action=body.action,
        tenant_id=claims.tenant_id,
        principal_id=claims.principal_id,
        policy_version=claims.policy_version,
        resource_id=body.resource_id,
    )
    return {
        "allowed": decision.allowed,
        "reason": decision.reason,
        "tenant_id": claims.tenant_id,
        "principal_id": claims.principal_id,
        "policy_version": claims.policy_version,
        "action": body.action,
        "resource_id": body.resource_id,
    }


def create_app() -> FastAPI:
    app = FastAPI(title="codex-saas-cp-runtime-scaffold")
    bootstrap_schema_if_needed()

    @app.exception_handler(PermissionError)
    async def permission_error_handler(_: Request, exc: PermissionError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(ValueError)
    async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    app.include_router(router)
    return app


app = create_app()
