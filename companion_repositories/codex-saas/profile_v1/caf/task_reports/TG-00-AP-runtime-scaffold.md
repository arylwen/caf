## Task Spec Digest
- task_id: `TG-00-AP-runtime-scaffold`
- title: `Scaffold Application Plane runtime`
- primary capability: `plane_runtime_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
- required: `reference_architectures/codex-saas/spec/guardrails/abp_pbp_resolution_v1.yaml`

## Inputs consumed
- `caf/profile_parameters_resolved.yaml`: runtime/framework pins (`python`, `fastapi`), AP runtime shape (`api_service_http`), and rails.
- `caf/application_design_v1.md`: AP scope and scaffold constraints (no new architecture decisions).
- `caf/abp_pbp_resolution_v1.yaml`: AP scaffold root `code/AP/` and ABP-CLEAN-01 role paths (`bootstrap/`, `interfaces/inbound/`, `application/`, `domain/`, `application/ports/`, `interfaces/outbound/`).

## Step execution evidence
- Read resolved AP runtime shape and confirmed `api_service_http` in `caf/profile_parameters_resolved.yaml`.
- Scaffolded AP composition root and inbound HTTP adapter in `code/AP/bootstrap/main.py` and `code/AP/interfaces/inbound/http_router.py`.
- Aligned AP paths to ABP role bindings by creating `code/AP/bootstrap/`, `code/AP/interfaces/inbound/`, `code/AP/application/`, `code/AP/domain/`, `code/AP/application/ports/`, `code/AP/interfaces/outbound/`.
- Reserved outbound seams via `code/AP/application/ports/__init__.py` and `code/AP/interfaces/outbound/__init__.py` without persistence implementation.
- Captured scaffold intent and downstream constraints in `code/AP/README.md`.

## Outputs produced
- `code/__init__.py`
- `code/AP/__init__.py`
- `code/AP/README.md`
- `code/AP/bootstrap/__init__.py`
- `code/AP/bootstrap/main.py`
- `code/AP/bootstrap/asgi.py`
- `code/AP/interfaces/__init__.py`
- `code/AP/interfaces/inbound/__init__.py`
- `code/AP/interfaces/inbound/http_router.py`
- `code/AP/application/__init__.py`
- `code/AP/application/service_facade.py`
- `code/AP/application/ports/__init__.py`
- `code/AP/domain/__init__.py`
- `code/AP/interfaces/outbound/__init__.py`

## Rails and TBP satisfaction
- Work stayed under companion repo rails: `companion_repositories/codex-saas/profile_v1/code/**`.
- No edits to `reference_architectures/**` or planner-owned `caf/*` inputs.
- No new framework/runtime/vendor choices were introduced beyond resolved pins (`fastapi`, `docker_compose`, `postgres`).
- Added `CAF_TRACE` headers to all created scaffold files.

