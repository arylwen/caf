<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-CP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD -->

# Control Plane Runtime Scaffold

- Plane identifier: `cp`
- Runtime shape: `api_service_http` (selected by planner and guardrails)
- Intended ingress class: HTTP API

This scaffold provides package boundaries and composition-root seams only:

- `code/cp/boundary` for ingress and policy boundary models
- `code/cp/service` for policy orchestration seams
- `code/cp/persistence` for evidence/audit repository seams
- `code/cp/composition` for deterministic dependency wiring
- `code/cp/integration` for CP to AP contract client stubs

This scaffold intentionally does not provide production deployment wiring or provider-specific infrastructure decisions.
