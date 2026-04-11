<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-85-observability-and-config -->
<!-- CAF_TRACE: capability=observability_and_config -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-85-observability-and-config

## Task Spec Digest

- Title: Materialize observability and config contracts for python runtime
- Capability: `observability_and_config`
- Depends on: `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`
- Scope: canonical Python dependency/config contracts and runtime observability hooks.

## Inputs Declared By Task

- Required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- Required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`

## Inputs Consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: Python + FastAPI + SQLAlchemy + PostgreSQL stack contract and compose packaging mode.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
  - Derived: resolved TBP obligations for canonical `requirements.txt` dependency manifest markers.

## Step Execution Evidence

1. Materialize canonical python dependency and configuration contracts.
   - Canonical root dependency manifest exists at `requirements.txt` with CAF trace header.
2. Preserve FastAPI, ASGI, PostgreSQL driver, and SQLAlchemy package expectations.
   - Manifest includes `fastapi`, `uvicorn`, `psycopg[binary]`, and `sqlalchemy`.
3. Keep observability hooks aligned to policy and runtime assembly boundaries.
   - Shared observability helper surfaces event metadata for CP/AP policy paths.
4. Expose deterministic config surfaces for local compose and test execution.
   - Dockerfiles install from root `requirements.txt`; compose uses env and service-health wiring.
5. Ensure config docs and contracts remain compatible with generated runtime wiring.
   - Compose and Docker surfaces use manifest-driven install path without inline package duplication.

## Outputs Produced

- `companion_repositories/codex-saas/profile_v1/requirements.txt`
- `companion_repositories/codex-saas/profile_v1/code/common/observability.py`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ap`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.cp`
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml`

Note: observability/config artifacts were already present and compliant; this task execution validated and recorded canonical-manifest/runtime wiring evidence.

## Rails/TBP Satisfaction

- Rails: writes limited to `companion_repositories/codex-saas/profile_v1/caf/task_reports/`.
- TBP role binding expectations for `observability_and_config` are satisfied by `requirements.txt` evidence markers:
  - `uvicorn`, `fastapi`, `psycopg`, `pydantic-settings`, `sqlalchemy`, and `# CAF_TRACE:`.
- Canonical-manifest DoD is satisfied; Dockerfiles install dependencies from `requirements.txt`.

