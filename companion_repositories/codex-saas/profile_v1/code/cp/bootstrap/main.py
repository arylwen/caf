# CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-CP-runtime-scaffold; capability=plane_runtime_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
from fastapi import FastAPI

from ..interfaces.inbound.http_router import router as cp_router

app = FastAPI(title="codex-saas-cp", version="0.1.0-candidate")
app.include_router(cp_router, prefix="/cp")

