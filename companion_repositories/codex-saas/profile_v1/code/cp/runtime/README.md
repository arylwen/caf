<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-CP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD -->

# Control-Plane Runtime Scaffold

- Plane: `cp`
- Runtime shape: `api_service_http`
- Ingress class: HTTP API

## Provided by this scaffold
- FastAPI composition root at `code/cp/main.py`
- CP ASGI export at `code/cp/asgi.py`
- Explicit CP runtime consumer seam at `code/cp/application/services.py` (`cp_runtime_repository_health_owner`)
- Shared claim and startup bootstrap seams consumed through package-root coherent imports

## Intentionally out of scope
- Policy authoring/versioning implementation and governance workflow logic
- Contract/persistence/runtime-wiring details owned by downstream tasks
- Any framework/vendor choices not already fixed by resolved guardrails