# Task Report: TG-40-persistence-cp-data-lifecycle

## Inputs consumed
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml: consumed `database.engine=postgresql`, `persistence.orm=sqlalchemy_orm`, `schema_management_strategy=code_bootstrap`.
- reference_architectures/codex-saas/design/playbook/system_domain_model_v1.yaml: consumed data-lifecycle aggregate entities (`RetentionRule`, `DeletionRequest`).
- reference_architectures/codex-saas/spec/guardrails/tbp_resolution_v1.yaml: consumed resolved TBP set including `TBP-PG-01` and `TBP-SQLALCHEMY-01`.

## Claims
- Control-plane data-lifecycle repository is implemented with SQLAlchemy-backed persistence operations.
- Schema bootstrap is ORM-owned via shared SQLAlchemy metadata/bootstrap helpers.
- Runtime composition invokes deterministic bootstrap before serving CP traffic.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/data_lifecycle_repository.py:L1-L73
- companion_repositories/codex-saas/profile_v1/code/cp/persistence/models.py:L48-L62
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L1-L15
- companion_repositories/codex-saas/profile_v1/code/cp/runtime/bootstrap.py:L1-L11

