<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-AP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:OBL-PLANE-AP-RUNTIME-SCAFFOLD -->

## Task Spec Digest
- task_id: `TG-00-AP-runtime-scaffold`
- title: Scaffold application plane runtime
- primary capability: `plane_runtime_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

## Inputs consumed
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: confirmed `runtime.language=python`, `platform.framework=fastapi`, `planes.ap.runtime_shape=api_service_http`, and module-root conventions.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP responsibilities, runtime shape, and tenant-context assumptions (`auth_claim`, policy enforcement posture).

## Step execution evidence
- Established AP composition root for HTTP runtime shape at `code/ap/main.py` and ASGI export at `code/ap/asgi.py`.
- Defined explicit AP layering seams in `code/ap/application/services.py` (`PolicyFacade`, `WidgetRepository`) and consumed them from the composition root.
- Connected startup configuration/bootstrap seam via `bootstrap_schema_if_needed()` from `code/common/persistence/bootstrap.py`.
- Registered AP dependency seams for downstream API/service/persistence tasks (`code/ap/application/services.py`).
- Confirmed scaffold semantics against design intent in `code/ap/runtime/README.md` and preserved adopted tenant/principal assumptions with `code/common/auth/mock_claims.py`.

## Outputs produced
- `code/__init__.py`
- `code/common/__init__.py`
- `code/common/auth/__init__.py`
- `code/common/auth/mock_claims.py`
- `code/common/persistence/__init__.py`
- `code/common/persistence/bootstrap.py`
- `code/ap/__init__.py`
- `code/ap/asgi.py`
- `code/ap/main.py`
- `code/ap/application/__init__.py`
- `code/ap/application/services.py`
- `code/ap/runtime/README.md`

## Rails/TBP satisfaction
- Writes are confined to `companion_repositories/codex-saas/profile_v1/` as allowed by resolved guardrails.
- Python module-root coherence is preserved: AP imports shared helpers via sibling-package coherent `..common...` imports.
- Tenant/principal semantics are explicit in shared mock-claim parsing with canonical claim fields (`tenant_id`, `principal_id`, `policy_version`).
- No new architecture or vendor choices were introduced beyond resolved profile/design inputs.

## How to validate (semantic)
- Confirm AP scaffold has composition root + ASGI seam and uses explicit service boundaries.
- Confirm shared claim parsing is centralized and conflict-precedence behavior is fail-closed.
- Confirm runtime README states what is scaffolded vs intentionally deferred.