# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

"""AP composition root scaffold for api_service_http runtime shape."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .api.routes import router as ap_router
from .persistence.repository import bootstrap_schema
from ..common.config import RuntimeSettings


def create_app() -> FastAPI:
    settings = RuntimeSettings.for_plane("ap")
    app = FastAPI(title="codex-saas-ap", version="0.1.0")
    app.state.settings = settings
    app.include_router(ap_router)

    @app.on_event("startup")
    async def on_startup() -> None:
        bootstrap_schema()

    @app.exception_handler(PermissionError)
    async def permission_error_handler(_: Request, exc: PermissionError) -> JSONResponse:
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(ValueError)
    async def value_error_handler(_: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    return app


app = create_app()

