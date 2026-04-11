<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-90-runtime-wiring -->
<!-- CAF_TRACE: capability=runtime_wiring -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-90-runtime-wiring

## Task Spec Digest

- Title: Wire cross-plane runtime assembly (python mock auth sqlalchemy_orm code_bootstrap)
- Capability: `runtime_wiring`
- Depends on: `TG-00-AP-runtime-scaffold`, `TG-00-CP-runtime-scaffold`, and all AP/CP persistence tasks in wave 4.
- Scope: compose-first CP/AP/postgres runtime assembly with claim-carried tenant context coherence and canonical Python packaging wiring.

## Inputs Declared By Task

- Required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- Required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- Required: `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`

## Inputs Consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: `deployment.stack_name=codex-saas`, `packaging=docker_compose`, `runtime_language=python`, module roots `code.ap` / `code.cp`, `auth_mode=mock`, `persistence_orm=sqlalchemy_orm`, `schema_management_strategy=code_bootstrap`.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
  - Derived: runtime-wiring TBP posture for compose, SQLAlchemy env contract, and UI service packaging/wiring obligations.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`
  - Derived: runtime assembler ownership for AP binding closures (`assembler.task_id: TG-90-runtime-wiring`) and evidence surfaces.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability runtime_wiring`
  - Derived: role-binding expectations for `docker/compose.candidate.yaml`, `docker/Dockerfile.ap`, `docker/Dockerfile.cp`, `.env`, `.gitignore`, `docker/Dockerfile.ui`, and `docker/nginx.ui.conf`.

## Step Execution Evidence

1. Assemble CP and AP runtime wiring into a single compose-first execution topology.
- `docker/compose.candidate.yaml` materializes `postgres`, `cp`, `ap`, `ui`, and `ux` services under stack name `codex-saas`.
- CP/AP both depend on postgres `condition: service_healthy`; AP also gates on CP health.

2. Apply mock auth wiring using auth_claim carrier and conflict precedence rules.
- AP boundary resolves auth context from `Authorization` bearer claims via `code/ap/api/auth_context.py` and shared helper `code/common/auth/mock_claims.py`.
- Conflict precedence is fail-closed (`enforce_claim_over_header_conflict`) when alternate carriers disagree with verified claims.

3. Align runtime persistence wiring to sqlalchemy_orm and code_bootstrap expectations.
- `.env` provides canonical `DATABASE_URL` with PostgreSQL+psycopg scheme and compose overrides CP/AP DSNs to internal `postgres` DNS.
- AP/CP composition roots (`code/ap/main.py`, `code/cp/main.py`) invoke plane-owned bootstrap on startup.

4. Integrate CP/AP contract boundary closure and service startup ordering.
- Compose health readiness and CP->AP dependency ordering preserve deterministic local startup topology.
- AP interface binding closure evidence for runtime assembly is present in `caf/binding_reports/BIND-AP-*.yaml` with assembler artifact path `code/ap/api/dependencies.py`.

5. Emit runtime assembly conventions that unit tests and README can exercise directly.
- Runtime surfaces expose canonical local run path via `CAF_CONTAINER_RUNTIME_CMD=docker compose -f docker/compose.candidate.yaml up --build` in `.env`.
- AP/CP Dockerfiles consume repo-root `requirements.txt` and expose deterministic `uvicorn code.ap.main:app` / `uvicorn code.cp.main:app` entrypoints.

## Outputs Produced

- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-90-runtime-wiring.md`

Runtime assembly artifacts validated as satisfying this task's role-binding expectations:
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ap`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.cp`
- `companion_repositories/codex-saas/profile_v1/.env`
- `companion_repositories/codex-saas/profile_v1/.gitignore`
- `companion_repositories/codex-saas/profile_v1/docker/Dockerfile.ui`
- `companion_repositories/codex-saas/profile_v1/docker/nginx.ui.conf`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-activity_events.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-collection_memberships.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-collection_permissions.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-collections.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-tenant_role_assignments.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-widget_versions.yaml`
- `companion_repositories/codex-saas/profile_v1/caf/binding_reports/BIND-AP-widgets.yaml`

Manual validation guidance (not executed by this worker):
- `docker compose -f docker/compose.candidate.yaml config`
- `docker compose -f docker/compose.candidate.yaml up --build`
- `curl http://localhost:8001/cp/health`
- `curl http://localhost:8000/ap/health`

## Rails/TBP Satisfaction

- Rails: writes limited to `companion_repositories/codex-saas/profile_v1/caf/task_reports/`.
- TBP role-binding expectations for `runtime_wiring` are satisfied:
  - compose candidate with `services`, `build`, and `env_file` wiring;
  - CP/AP Dockerfiles present and buildable;
  - `.env` / `.gitignore` contractual markers present;
  - SQLAlchemy runtime env contract preserved;
  - UI packaging/proxy/service wiring evidence present.
- Runtime wiring DoD remains coherent with CP/AP boundary ownership, auth claim carrier, and code-bootstrap startup posture.
