# CAF_TRACE: generated_by=Contura Architecture Framework (CAF) | task_id=TG-00-CP-runtime-scaffold | capability=plane_runtime_scaffolding | instance=codex-saas | trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD
from fastapi import FastAPI
from pydantic import BaseModel

from .policy_engine import evaluate_policy


class PolicyRequest(BaseModel):
    tenant_id: str
    principal_id: str
    action: str
    correlation_id: str


class PolicyDecision(BaseModel):
    allow: bool
    reason: str


app = FastAPI(title="codex-saas-control-plane")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "plane": "cp"}


@app.post("/policy/evaluate", response_model=PolicyDecision)
def policy_evaluate(request: PolicyRequest) -> PolicyDecision:
    allow, reason = evaluate_policy(
        tenant_id=request.tenant_id,
        principal_id=request.principal_id,
        action=request.action,
        correlation_id=request.correlation_id,
    )
    return PolicyDecision(allow=allow, reason=reason)
