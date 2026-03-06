# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-20-api-boundary-widget | capability=api_boundary_implementation | instance=codex-saas | trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
from fastapi import FastAPI

from .api.widget_router import router as widget_router

app = FastAPI(title="codex-saas-application-plane")
app.include_router(widget_router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "plane": "ap"}

