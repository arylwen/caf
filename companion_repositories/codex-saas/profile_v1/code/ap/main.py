# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-AP-runtime-scaffold
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD

from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, HTTPException, Request
from pydantic import BaseModel, Field

from .api.resources import router as api_router
from .boundary.auth_context import parse_mock_auth_claim
from .boundary.contracts import PolicyDecisionRequest
from .composition.root import build_runtime_context
from .runtime.bootstrap import bootstrap_schema


@asynccontextmanager
async def lifespan(app: FastAPI):
    context = build_runtime_context()
    bootstrap_schema(context)
    app.state.runtime_context = context
    yield


app = FastAPI(title="codex-saas application plane", lifespan=lifespan)


@app.exception_handler(PermissionError)
async def permission_error_handler(_request, exc: PermissionError):
    raise HTTPException(status_code=403, detail=str(exc)) from exc


@app.exception_handler(ValueError)
async def value_error_handler(_request, exc: ValueError):
    raise HTTPException(status_code=400, detail=str(exc)) from exc


router = APIRouter(prefix="/ap", tags=["application-plane"])


class PolicyProbeRequest(BaseModel):
    action: str = Field(min_length=1)
    resource: str = Field(min_length=1)


@router.get("/health")
def health():
    return {
        "plane": "ap",
        "runtime_shape": "api_service_http",
        "principal_taxonomy": [
            "platform_user",
            "tenant_user",
            "service_principal",
        ],
    }


@router.post("/policy/probe")
def probe_policy(payload: PolicyProbeRequest, request: Request):
    runtime_context = request.app.state.runtime_context
    verified_claim = parse_mock_auth_claim(request.headers)
    decision = runtime_context.policy_bridge.enforce(
        PolicyDecisionRequest(
            action=payload.action,
            resource=payload.resource,
            tenant_context=verified_claim.to_tenant_context(),
            tenant_header=verified_claim.tenant_header,
        )
    )
    return {
        "allow": decision.allow,
        "reason": decision.reason,
        "tenant_id": verified_claim.tenant_id,
        "principal_id": verified_claim.principal_id,
        "policy_version": verified_claim.policy_version,
    }


app.include_router(router)
app.include_router(api_router)
