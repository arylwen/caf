<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-TBP-PG-01-postgres_persistence_wiring -->
<!-- CAF_TRACE: capability=postgres_persistence_wiring -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-TBP-PG-01-postgres_persistence_wiring

## Inputs consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability postgres_persistence_wiring`

## Task completion evidence

### Claims
- TBP-PG-01 compose postgres service obligation is present and health-gated for dependent AP/CP services.
- TBP-PG-01 env contract obligation is present with `POSTGRES_*` variables and SQLAlchemy-compatible `DATABASE_URL`.
- TBP-PG-01 adapter-hook obligation is present via a reusable postgres adapter surface without creating resource-specific repositories.

### Evidence anchors
- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L105` - supports Claim 1
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example:L1-L12` - supports Claim 2
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_adapter.py:L1-L36` - supports Claim 3
- `companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_runtime.py:L1-L56` - supports Claim 3

## Output

- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-TBP-PG-01-postgres_persistence_wiring.md`
