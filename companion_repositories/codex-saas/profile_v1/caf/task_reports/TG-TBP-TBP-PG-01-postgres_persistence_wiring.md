# Task Report — TG-TBP-TBP-PG-01-postgres_persistence_wiring

## Task Spec Digest
- task_id: `TG-TBP-TBP-PG-01-postgres_persistence_wiring`
- title: `Materialize postgres runtime wiring contracts`
- primary capability: `postgres_persistence_wiring`
- task graph source: `companion_repositories/codex-saas/profile_v1/caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
- required: `architecture_library/phase_8/tbp/atoms/TBP-SQLALCHEMY-01/tbp_manifest_v1.yaml`

## Inputs consumed
- `companion_repositories/codex-saas/profile_v1/caf/profile_parameters_resolved.yaml` — confirmed `database.engine=postgresql` and `persistence.orm=sqlalchemy_orm`.
- `companion_repositories/codex-saas/profile_v1/caf/tbp_resolution_v1.yaml` — confirmed postgres + sqlalchemy rails are resolved in this instance.
- `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml` — used for postgres role-binding contract surfaces.
- `architecture_library/phase_8/tbp/atoms/TBP-SQLALCHEMY-01/tbp_manifest_v1.yaml` — used for SQLAlchemy-compatible DATABASE_URL contract constraints.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability postgres_persistence_wiring` output — used as authoritative path/evidence contract for compose postgres service, env contract, and adapter hook.

## Step execution evidence
- `Materialize postgres compose service contract and environment-variable examples.`  
  Verified and retained postgres service in `docker/compose.candidate.yaml`; created `infrastructure/postgres.env.example`.
- `Align adapter hooks and env surfaces with sqlalchemy_orm persistence rails.`  
  Verified adapter hook module `code/ap/persistence/postgres_adapter.py` exposes `get_database_url` and `get_session_factory` sourced from shared SQLAlchemy runtime.
- `Ensure DATABASE_URL and POSTGRES_* contracts align with code_bootstrap lifecycle.`  
  Emitted SQLAlchemy-compatible postgres URL and full `POSTGRES_*` variable contract in `infrastructure/postgres.env.example`.
- `Preserve contract seams needed by runtime wiring and operator README tasks.`  
  Kept compose/env surfaces declarative and reusable (no resource-specific repository edits, no factory rewrites).
- `Capture postgres wiring assumptions for deterministic worker-postgres execution.`  
  Captured artifact ownership and evidence anchors in this task report for downstream reviewer verification.

## Outputs produced
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example`

## Rails and TBP satisfaction
- Rails respected: all writes are under `companion_repositories/codex-saas/profile_v1/`.
- TBP role-bindings satisfied for `postgres_persistence_wiring`:
  - `postgres_compose_candidate` evidence in `docker/compose.candidate.yaml` (`postgres` service)
  - `database_env_contract` + `sqlalchemy_postgres_env_example_contract` in `infrastructure/postgres.env.example`
  - `postgres_adapter_module` satisfied by existing `code/ap/persistence/postgres_adapter.py` containing `get_database_url` and `get_session_factory`
- Ownership rule respected: no resource repository files or repository factory files were created/rewritten by this task.

## Task completion evidence

### Claims
- PostgreSQL compose service contract is present in runtime wiring.
- PostgreSQL env contract examples now exist and include SQLAlchemy-compatible `DATABASE_URL`.
- Adapter hook surface for postgres persistence remains aligned with SQLAlchemy rails and exposes required symbols.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L66` — supports Claim 1
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example:L1-L12` — supports Claim 2
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_adapter.py:L1-L5` — supports Claim 3

