# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-20-api-boundary-workspaces; capability=api_boundary_implementation; instance=codex-saas; trace_anchor=pattern_obligation_id:O-TBP-FASTAPI-01-composition-root
from fastapi import FastAPI

from .interfaces.inbound.http_router import router as ap_router

app = FastAPI(title="codex-saas-ap", version="0.1.0-candidate")
app.include_router(ap_router, prefix="/ap")
