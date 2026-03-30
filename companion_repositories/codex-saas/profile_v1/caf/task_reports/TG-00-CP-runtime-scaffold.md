<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-CP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-CP-RUNTIME-SCAFFOLD -->

## Task Spec Digest
- task_id: `TG-00-CP-runtime-scaffold`
- title: Scaffold control plane runtime
- primary capability: `plane_runtime_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: confirmed `runtime.language=python`, `platform.framework=fastapi`, `planes.cp.runtime_shape=api_service_http`, and module-root conventions.
- `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`: consumed CP governance/runtime scope and integration assumptions.
- `node tools/caf/resolve_tbp_role_binding_key_v1.mjs codex-saas --role-binding-key cp_runtime_repository_health_owner --format json`: resolved `code/cp/application/services.py` as required CP runtime consumer seam.

## Step execution evidence
- Established CP composition root for HTTP runtime shape at `code/cp/main.py` and ASGI export at `code/cp/asgi.py`.
- Defined CP runtime boundaries and governance seam with `RepositoryHealthOwner` in `code/cp/application/services.py`.
- Connected startup configuration/bootstrap seam via `bootstrap_schema_if_needed()` from `code/common/persistence/bootstrap.py`.
- Registered CP plane-local dependency seam consumed by `/cp/runtime-health` route.
- Confirmed scaffold semantics and scope limits in `code/cp/runtime/README.md` and preserved adopted tenant/principal assumptions via shared claim helper.

## Outputs produced
- `code/cp/__init__.py`
- `code/cp/asgi.py`
- `code/cp/main.py`
- `code/cp/application/__init__.py`
- `code/cp/application/services.py`
- `code/cp/runtime/README.md`

## Rails/TBP satisfaction
- Writes are confined to `companion_repositories/codex-saas/profile_v1/` rails.
- CP runtime consumer seam contract is satisfied: `cp_runtime_repository_health_owner` materialized at `code/cp/application/services.py` with explicit class/def seam.
- Python module-root coherence is preserved for CP imports into shared helper packages.
- No new architecture or vendor choices were introduced beyond resolved profile/design inputs.

## How to validate (semantic)
- Confirm CP scaffold has composition root + ASGI seam and explicit runtime health owner seam.
- Confirm CP runtime routes consume canonical mock-claim parsing and fail-closed claim requirements.
- Confirm runtime README documents scaffold boundaries and deferred capabilities.