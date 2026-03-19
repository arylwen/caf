<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-AP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD -->

# Application Plane Runtime Scaffold

- Plane identifier: `ap`
- Runtime shape: `api_service_http` (selected by planner and guardrails)
- Intended ingress class: HTTP API

This scaffold provides package boundaries and composition-root seams only:

- `code/ap/boundary` for AP ingress and contract-facing surfaces
- `code/ap/service` for orchestration seams
- `code/ap/persistence` for repository seams
- `code/ap/composition` for deterministic dependency wiring

This scaffold intentionally does not provide production deployment wiring or provider-specific infrastructure decisions.
