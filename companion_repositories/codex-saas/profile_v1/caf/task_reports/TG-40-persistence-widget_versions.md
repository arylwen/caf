# TG-40-persistence-widget_versions Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed widget_versions aggregate list/query semantics and tenant scoping requirements.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed resolved SQLAlchemy ORM/postgres rails.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-widget_versions` provider requirement for `WidgetVersionsAccessInterface`.

## Claims
- Implemented tenant-scoped SQLAlchemy-backed widget_versions list operation over persisted records.
- Wired widget_versions facade provider through AP repository factory and dependency seam.
- Included widget_versions model in shared AP ORM model registration and bootstrap flow.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_widget_versions_repository.py:L15-L30 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L23-L24 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L73-L74 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L26-L34 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L16-L18 — supports Claim 3
