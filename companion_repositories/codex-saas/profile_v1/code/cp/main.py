# CAF_TRACE: generated_by=Contura Architecture Framework (CAF)
# CAF_TRACE: task_id=TG-00-CP-runtime-scaffold
# CAF_TRACE: task_id=TG-35-policy-enforcement-core
# CAF_TRACE: capability=plane_runtime_scaffolding
# CAF_TRACE: instance=codex-saas
# CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD

from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, HTTPException, Request

from .boundary.auth_context import parse_mock_auth_claim
from .boundary.models import PolicyDecisionRequestModel, PolicyDecisionResponseModel
from .composition.root import build_runtime_context
from .runtime.bootstrap import bootstrap_schema
from .service.policy_service import PolicyService


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.runtime_context = build_runtime_context()
    bootstrap_schema()
    yield


app = FastAPI(title="codex-saas control plane", lifespan=lifespan)


@app.exception_handler(PermissionError)
async def permission_error_handler(_request, exc: PermissionError):
    raise HTTPException(status_code=403, detail=str(exc)) from exc


router = APIRouter(prefix="/cp", tags=["control-plane"])


@router.get("/health")
def health():
    return {
        "plane": "cp",
        "runtime_shape": "api_service_http",
        "principal_taxonomy": [
            "platform_user",
            "tenant_user",
            "service_principal",
        ],
    }


@router.post("/policy/evaluate", response_model=PolicyDecisionResponseModel)
def evaluate_policy(payload: PolicyDecisionRequestModel, request: Request):
    claim = parse_mock_auth_claim(request.headers)
    if (
        payload.principal.tenant_id != claim.tenant_id
        or payload.principal.principal_id != claim.principal_id
        or payload.principal.policy_version != claim.policy_version
    ):
        raise PermissionError(
            "policy payload principal does not match Authorization claim contract"
        )

    normalized_payload = PolicyDecisionRequestModel(
        action=payload.action,
        resource=payload.resource,
        principal=claim.to_principal_context(),
        tenant_header=claim.tenant_header,
    )
    service = PolicyService()
    return service.evaluate(normalized_payload)


app.include_router(router)
