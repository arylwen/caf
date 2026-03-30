<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-AP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD -->

# Application Runtime Scaffold

- Plane: `ap`
- Runtime shape: `api_service_http`
- Ingress class: HTTP API

## Provided by this scaffold
- FastAPI composition root at `code/ap/main.py`
- AP ASGI export at `code/ap/asgi.py`
- Explicit AP seams for policy and repository health in `code/ap/application/services.py`
- Shared claim and startup bootstrap seams consumed through package-root coherent imports

## Intentionally out of scope
- Production policy logic, persistence adapters, and full resource endpoints
- Deployment/runtime wiring details beyond composition seams
- Any framework/vendor choices not already fixed by resolved guardrails