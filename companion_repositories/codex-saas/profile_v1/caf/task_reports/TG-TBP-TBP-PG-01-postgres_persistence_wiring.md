## Task Spec Digest
- task_id: `TG-TBP-TBP-PG-01-postgres_persistence_wiring`
- title: `Materialize PostgreSQL wiring obligations`
- primary capability: `postgres_persistence_wiring`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- required: `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
- required: `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

## Inputs consumed
- `caf/tbp_resolution_v1.yaml`: confirmed resolved TBP set includes `TBP-PG-01`.
- `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`: used role bindings for `postgres_compose_candidate`, `database_env_contract`, and `postgres_adapter_module`.
- `caf/profile_parameters_resolved.yaml`: confirmed `database.engine: postgresql`, `deployment.mode: docker_compose`, and allowed write roots under companion target.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability postgres_persistence_wiring`: resolved required artifact paths and `evidence_contains` checks.

## Step execution evidence
- Step 1 (Read TBP-PG-01 obligations and role bindings): validated role-binding expectations and used resolved templates as authoritative output targets.
- Step 2 (Materialize compose PostgreSQL service and DATABASE_URL wiring): created `docker/compose.candidate.yaml` with `postgres` service plus AP/CP `DATABASE_URL` environment wiring and `depends_on` on `postgres`, and wired AP/CP services to Dockerfile-based builds.
- Step 3 (Materialize PostgreSQL environment contract examples): created `infrastructure/postgres.env.example` with `POSTGRES_*` values and `DATABASE_URL`.
- Step 4 (Materialize minimal AP adapter hook): refreshed `code/ap/persistence/postgres_adapter.py` to expose minimal reusable `get_connection()` and `get_pool()` adapter APIs using `DATABASE_URL` and `psycopg`.
- Step 5 (Document wiring constraints/security posture): encoded env-driven configuration with no embedded credentials in Python source and in-network hostname `postgres`.

## Outputs produced
- `docker/compose.candidate.yaml`
- `infrastructure/postgres.env.example`
- `code/ap/persistence/postgres_adapter.py`
- `docker/Dockerfile.ap`
- `docker/Dockerfile.cp`
- `.env`
- `.gitignore`

## Rails/TBP satisfaction
- Writes are limited to `companion_repositories/codex-saas/profile_v1/**`.
- Output artifact classes match role-binding expectations:
  - compose/env: `config_stubs_non_executable`
  - adapter: `code_placeholders_non_runnable`
- TBP evidence strings are materialized at required role-binding paths:
  - `docker/compose.candidate.yaml` contains `postgres` and `DATABASE_URL`
  - `infrastructure/postgres.env.example` contains `POSTGRES_`
  - `code/ap/persistence/postgres_adapter.py` contains `psycopg` and `DATABASE_URL`
- No resource-specific repositories or repository factory rewrites were introduced in this task.

## Task completion evidence

### Claims
- PostgreSQL compose wiring is materialized with a dedicated `postgres` service and AP/CP runtime `DATABASE_URL` configuration.
- Environment contract values for PostgreSQL are externalized in a dedicated example env file.
- Application-plane PostgreSQL adapter hook is present as a reusable minimal seam and validates `DATABASE_URL` before connecting.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L58` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example:L1-L7` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_adapter.py:L1-L38` - supports Claim 3
