<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF); task_id=TG-00-AP-runtime-scaffold; capability=plane_runtime_scaffolding; instance=codex-saas; trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD -->

# Application Plane Runtime Scaffold

- Plane: `AP`
- Runtime shape: `api_service_http` (from `caf/profile_parameters_resolved.yaml`)
- Intended ingress class: HTTP API

This scaffold provides:
- explicit clean-architecture module seams
- a minimal AP composition root and inbound HTTP adapter hook
- application/domain/port boundaries for downstream API, service, and persistence tasks

This scaffold intentionally does not provide:
- production runtime/deployment wiring
- persistence implementations
- finalized contract integrations

Those are completed by downstream TBP/PBP-driven tasks.

