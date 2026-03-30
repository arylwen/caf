# TG-40-persistence-cp-retention-lifecycle Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`: consumed Retention Lifecycle aggregate fields and operation semantics.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed SQLAlchemy/postgres and code-bootstrap constraints.

## Claims
- Materialized SQLAlchemy schema bootstrap hook and integrated shared bootstrap seam.
- Materialized Retention Lifecycle ORM-backed repository with tenant-scoped list/get/create/update operations.
- Materialized CP persistence package exports and repository factory wiring for retention repositories.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L1-L16 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/common/persistence/bootstrap.py:L1-L17 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/postgres_retention_lifecycle_repository.py:L1-L124 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/repository_factory.py:L1-L23 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/__init__.py:L1-L6 — supports Claim 3