<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-00-AP-runtime-scaffold -->
<!-- CAF_TRACE: capability=plane_runtime_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-00-AP-runtime-scaffold

## Task Spec Digest

- Title: Scaffold AP runtime (python api_service_http)
- Capability: `plane_runtime_scaffolding`
- Depends on: none
- Scope: application-plane runtime scaffold, composition root boundaries, mock-auth and tenant context runtime assumptions.

## Inputs Declared By Task

- Required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- Required: `reference_architectures/codex-saas/design/playbook/application_design_v1.md`

## Inputs Consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: `runtime.language=python`, `auth_mode=mock`, `planes.ap.runtime_shape=api_service_http`.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`
  - Derived: AP runtime assumptions and tenant context carrier posture anchored to verified Authorization claim semantics.

## Step Execution Evidence

1. Confirm AP runtime pins and selected `api_service_http` shape for python services.
   - Verified from resolved guardrails and AP design inputs.
2. Create AP runtime scaffold modules and composition root boundaries.
   - Confirmed scaffold surfaces: `code/ap/main.py`, `code/ap/asgi.py`, package markers under `code/` + `code/ap/*`.
3. Wire configuration loading for mock auth and tenant context dependencies.
   - `code/ap/main.py` loads `RuntimeSettings.for_plane("ap")`; AP API/service surfaces consume shared auth context.
4. Establish bootstrap entrypoints aligned to compose-first local execution.
   - `code/ap/main.py` startup hook calls AP bootstrap via `bootstrap_schema()`.
   - `code/ap/asgi.py` exposes package-relative `from .main import app`.
5. Record runtime assumptions for API, service, persistence, and UI consumers.
   - Runtime assumptions endpoint is exposed via AP routes and service layer seam.

## Outputs Produced

- `companion_repositories/codex-saas/profile_v1/code/ap/main.py`
- `companion_repositories/codex-saas/profile_v1/code/ap/asgi.py`
- `companion_repositories/codex-saas/profile_v1/code/__init__.py`
- `companion_repositories/codex-saas/profile_v1/code/ap/__init__.py`
- `companion_repositories/codex-saas/profile_v1/code/common/auth/mock_claims.py`

Note: scaffold artifacts were already present and compliant in the candidate; this task execution validated and accepted those artifacts without introducing new runtime framework choices.

## Rails/TBP Satisfaction

- Rails: writes are within companion repo rails (`profile_v1/caf/task_reports`); no forbidden actions performed.
- TBP Gate `TBP-PY-01/G-PY-MODULE-ROOT-COHERENCE`: AP imports resolve through canonical `code` root and shared helpers (`code/common`) without pseudo-package paths.
- Compiled obligation `OBL-PLANE-AP-RUNTIME-SCAFFOLD`: AP runtime scaffold for `api_service_http` is materialized.
- Compiled obligation `O-TBP-PY-01-python-package-markers`: package markers exist for candidate Python packages.
