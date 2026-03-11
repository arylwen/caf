# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-AP-runtime-scaffold; capability=plane_runtime_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD
from fastapi import FastAPI

from ..interfaces.inbound.http_router import router as ap_router

app = FastAPI(title="codex-saas-ap", version="0.1.0-candidate")
app.include_router(ap_router, prefix="/ap")

