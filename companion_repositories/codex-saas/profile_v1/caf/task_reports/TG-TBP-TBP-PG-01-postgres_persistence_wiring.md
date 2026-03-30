<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-TBP-TBP-PG-01-postgres_persistence_wiring -->
<!-- CAF_TRACE: capability=postgres_persistence_wiring -->
<!-- CAF_TRACE: instance=codex-saas -->
<!-- CAF_TRACE: trace_anchor=pattern_obligation_id:O-TBP-PG-01-app-adapter-hook -->

## Task Spec Digest
- task_id: `TG-TBP-TBP-PG-01-postgres_persistence_wiring`
- title: Materialize PostgreSQL wiring contracts
- primary capability: `postgres_persistence_wiring`
- depends_on: `TG-90-runtime-wiring`

## Inputs consumed
- `caf/tbp_resolution_v1.yaml`: validated Postgres + SQLAlchemy TBP posture.
- `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`: validated required role-binding outputs.
- `caf/profile_parameters_resolved.yaml`: validated `database.engine=postgresql`, `persistence.orm=sqlalchemy_orm`.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability postgres_persistence_wiring`: validated required output paths and evidence markers.

## Claims
1. PostgreSQL compose service wiring and AP/CP runtime `DATABASE_URL` contracts are present and aligned to compose-internal service DNS.
2. PostgreSQL env contract example is present with SQLAlchemy-compatible `DATABASE_URL` and `POSTGRES_*` variables.
3. AP Postgres adapter hook exposes `get_database_url` and `get_session_factory` without resource-specific repository ownership.

## Task completion evidence

### Evidence anchors
- `docker/compose.candidate.yaml:L1-L76` - supports Claim 1
- `infrastructure/postgres.env.example:L1-L11` - supports Claim 2
- `code/ap/persistence/postgres_adapter.py:L1-L10` - supports Claim 3