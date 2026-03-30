# TG-40-persistence-collections Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed collections aggregate operations (`list/get/create/update`) and tenant ownership semantics.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed postgres + SQLAlchemy ORM + code_bootstrap rails.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-collections` provider requirement for `CollectionsAccessInterface`.

## Claims
- Implemented tenant-scoped SQLAlchemy repository methods for full collections service-facade operation coverage.
- Bound collections facade dependencies to the AP repository factory provider seam required by interface contracts.
- Registered AP collections ORM model in shared metadata/bootstrap path.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_collections_repository.py:L17-L84 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L27-L28 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L77-L78 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L36-L46 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L16-L18 — supports Claim 3
