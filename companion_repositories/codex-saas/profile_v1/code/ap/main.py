# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
# CAF_TRACE: task_id=TG-20-api-boundary-widgets
# CAF_TRACE: task_id=TG-20-api-boundary-widget_versions
# CAF_TRACE: task_id=TG-20-api-boundary-collections
# CAF_TRACE: task_id=TG-20-api-boundary-tags
# CAF_TRACE: task_id=TG-20-api-boundary-collection_permissions
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_users_roles
# CAF_TRACE: task_id=TG-20-api-boundary-tenant_settings
# CAF_TRACE: task_id=TG-20-api-boundary-activity_events
# CAF_TRACE: capability=api_boundary_implementation

"""Application-plane FastAPI composition root scaffold."""

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse

from ..common.persistence.bootstrap import bootstrap_schema_if_needed
from .api import (
    activity_events_router,
    collection_permissions_router,
    collections_router,
    tags_router,
    tenant_settings_router,
    tenant_users_roles_router,
    widget_versions_router,
    widgets_router,
)
from .api.auth_context import resolve_auth_context
from .api.dependencies import get_policy_facade, get_widget_repository

router = APIRouter(prefix="/ap")
policy = get_policy_facade()
repository = get_widget_repository()


@router.get("/health")
def ap_health() -> dict[str, str]:
    return {"status": "ok", "plane": "application"}


@router.get("/runtime-health")
def ap_runtime_health(request: Request) -> dict[str, str]:
    claims = resolve_auth_context(request.headers)
    snapshot = repository.health_snapshot()
    decision = policy.evaluate(
        action="ap.runtime.health",
        tenant_id=claims.tenant_id,
        principal_id=claims.principal_id,
        policy_version=claims.policy_version,
    )
    if not decision.allowed:
        raise PermissionError(decision.reason)

    return {
        "status": snapshot["status"],
        "detail": snapshot["detail"],
        "tenant_id": claims.tenant_id,
        "principal_id": claims.principal_id,
        "policy_version": claims.policy_version,
        "policy_allowed": str(decision.allowed).lower(),
        "policy_reason": decision.reason,
    }


def create_app() -> FastAPI:
    app = FastAPI(title="codex-saas-ap-runtime-scaffold")
    bootstrap_schema_if_needed()

    @app.exception_handler(PermissionError)
    async def permission_error_handler(_: Request, exc: PermissionError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(ValueError)
    async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    app.include_router(router)
    app.include_router(widgets_router.router)
    app.include_router(widget_versions_router.router)
    app.include_router(collections_router.router)
    app.include_router(tags_router.router)
    app.include_router(collection_permissions_router.router)
    app.include_router(tenant_users_roles_router.router)
    app.include_router(tenant_settings_router.router)
    app.include_router(activity_events_router.router)
    return app


app = create_app()

