## Task Spec Digest
- task_id: `TG-00-CP-runtime-scaffold`
- title: `Scaffold Control Plane runtime`
- primary capability: `plane_runtime_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- required: `reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: CP runtime shape pin (`api_service_http`), fastapi/runtime constraints, and rails.
- `caf/control_plane_design_v1.md`: CP scope and CP/AP integration contract constraints (policy/safety outcomes, mixed contract surface).
- `caf/abp_pbp_resolution_v1.yaml`: CP scaffold root `code/CP/`, static `cp_entrypoint_stub`, and ABP-CLEAN-01 role paths.

## Step execution evidence
- Read CP runtime shape and verified `api_service_http` posture from `caf/profile_parameters_resolved.yaml`.
- Scaffolded CP composition root and inbound boundary in `code/CP/bootstrap/main.py` and `code/CP/interfaces/inbound/http_router.py`.
- Aligned CP paths with ABP role bindings under `code/CP/bootstrap/`, `code/CP/interfaces/inbound/`, `code/CP/application/`, `code/CP/domain/`, `code/CP/application/ports/`, and `code/CP/interfaces/outbound/`.
- Established CP seams for policy/governance via `code/CP/application/policy_gate.py` and CP entrypoint stub `code/CP/control_plane.py`.
- Documented CP runtime assumptions and downstream boundaries in `code/CP/README.md`.

## Outputs produced
- `code/CP/__init__.py`
- `code/CP/README.md`
- `code/CP/bootstrap/__init__.py`
- `code/CP/bootstrap/main.py`
- `code/CP/bootstrap/asgi.py`
- `code/CP/control_plane.py`
- `code/CP/interfaces/__init__.py`
- `code/CP/interfaces/inbound/__init__.py`
- `code/CP/interfaces/inbound/http_router.py`
- `code/CP/application/__init__.py`
- `code/CP/application/policy_gate.py`
- `code/CP/application/ports/__init__.py`
- `code/CP/domain/__init__.py`
- `code/CP/interfaces/outbound/__init__.py`

## Rails and TBP satisfaction
- Work stayed under companion repo rails: `companion_repositories/codex-saas/profile_v1/code/**`.
- No edits to `reference_architectures/**` or planner-owned `caf/*` inputs.
- No new architecture choices were introduced beyond AP/CP runtime shape and framework pins already resolved.
- Added `CAF_TRACE` headers to all created scaffold files.

