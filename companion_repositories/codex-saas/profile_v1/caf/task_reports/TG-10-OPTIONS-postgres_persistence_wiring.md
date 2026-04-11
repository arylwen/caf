<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-10-OPTIONS-postgres_persistence_wiring -->
<!-- CAF_TRACE: capability=postgres_persistence_wiring -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-10-OPTIONS-postgres_persistence_wiring

## Inputs consumed

- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
  - Derived: `database.engine=postgresql`, `persistence.orm=sqlalchemy_orm`, `platform.packaging=docker_compose`.
- `reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml`
  - Derived: postgres runtime wiring obligations and SQLAlchemy-compatible URL posture.
- `architecture_library/phase_8/tbp/atoms/TBP-PG-01/tbp_manifest_v1.yaml`
  - Derived: compose service, env contract, and adapter-hook obligations.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability postgres_persistence_wiring`
  - Derived expected outputs: `docker/compose.candidate.yaml`, `infrastructure/postgres.env.example`, `code/ap/persistence/postgres_adapter.py`.

## Claims

- Option-derived postgres persistence wiring is materialized as concrete runtime surfaces (compose, env contract, adapter hook).
- AP/CP runtime services use compose-internal postgres DNS and health-gated startup wiring.
- SQLAlchemy-compatible DATABASE_URL contracts remain externalized (no embedded credentials in source code).

## Evidence anchors

- `companion_repositories/codex-saas/profile_v1/docker/compose.candidate.yaml:L1-L105`
- `companion_repositories/codex-saas/profile_v1/infrastructure/postgres.env.example:L1-L12`
- `companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_adapter.py:L1-L36`
- `companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_runtime.py:L1-L56`

## Output

- `companion_repositories/codex-saas/profile_v1/caf/task_reports/TG-10-OPTIONS-postgres_persistence_wiring.md`
