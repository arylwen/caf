# TG-40-persistence-tenant_users_roles Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed tenant_users_roles aggregate operations (`list/create/delete`) and tenant boundary rules.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed SQLAlchemy ORM and postgres rails.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-tenant_users_roles` provider requirement for `TenantUsersRolesAccessInterface`.

## Claims
- Implemented tenant-scoped SQLAlchemy repository methods for tenant_users_roles list/create/delete operations with fail-closed missing-item behavior.
- Wired tenant_users_roles facade provider via AP repository factory and dependency seam.
- Preserved ORM model/bootstrap alignment for tenant_users_roles persistence boundary.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/postgres_tenant_users_roles_repository.py:L17-L67 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/repository_factory.py:L39-L40 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L89-L90 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/persistence/models.py:L72-L82 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/common/persistence/sqlalchemy_schema_bootstrap.py:L16-L18 — supports Claim 3
