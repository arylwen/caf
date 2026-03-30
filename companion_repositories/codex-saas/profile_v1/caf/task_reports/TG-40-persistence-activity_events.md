# TG-40-persistence-activity_events Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed the activity_events aggregate scope and tenant-scoped projection expectations.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed `database.engine=postgresql`, `persistence.orm=sqlalchemy_orm`, and `schema_management_strategy=code_bootstrap` rails.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-activity_events` provider requirement for `ActivityEventsAccessInterface`.

## Claims
- Implemented a tenant-scoped SQLAlchemy-backed `PostgresActivityEventsRepository` that serves non-stub list operations from postgres.
- Bound the AP activity_events facade provider to the repository factory seam required by interface bindings.
- Ensured AP ORM model registration participates in shared schema bootstrap for code_bootstrap strategy.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_activity_events_repository.py:L15-L29 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L47-L48 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L97-L98 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L93-L100 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L16-L18 — supports Claim 3
