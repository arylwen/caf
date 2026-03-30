# TG-40-persistence-cp-policy Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml`: consumed Policy aggregate fields and control-plane persistence scope.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed `database_engine=postgres`, `persistence.orm=sqlalchemy_orm`, and `schema_management_strategy=code_bootstrap`.

## Claims
- Materialized shared SQLAlchemy metadata/runtime surfaces for ORM-backed postgres persistence.
- Materialized CP policy ORM model and SQLAlchemy repository with tenant-scoped CRUD operations.
- Materialized CP repository factory/provider seam for runtime wiring.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_metadata.py:L1-L11 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_runtime.py:L1-L29 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/models.py:L1-L50 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/postgres_policy_repository.py:L1-L130 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/repository_factory.py:L1-L23 — supports Claim 3