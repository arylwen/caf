# TG-40-persistence-collection_permissions Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed collection_permissions aggregate semantics and tenant partitioning requirements.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed SQLAlchemy ORM and postgres runtime rails.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-collection_permissions` provider requirement for `CollectionPermissionsAccessInterface`.

## Claims
- Implemented tenant-scoped SQLAlchemy CRUD behavior for collection_permissions (list/create/update) with explicit not-found failure semantics.
- Wired AP provider factory and dependency seam so service facade consumes the persistence implementation via required interface binding.
- Kept persistence fully within AP boundary modules and shared ORM/bootstrap surfaces.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_collection_permissions_repository.py:L17-L78 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L35-L36 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L85-L86 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L60-L70 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L16-L18 — supports Claim 3
