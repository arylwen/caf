# TG-30-service-facade-tenant_users_roles Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed USER_ROLE_ASSIGNMENT aggregate and operation posture (`list/create/delete`) for service orchestration invariants.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP boundary layering and tenant-context enforcement posture.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-tenant_users_roles` and declared `TenantUsersRolesAccessInterface` as required service-consumer contract.

## Claims
- Declared `TenantUsersRolesAccessInterface` and reworked `TenantUsersRolesFacade` to consume explicit injected access interfaces.
- Enforced service-level identity ownership by removing caller-supplied tenant and role-assignment identifiers from write payloads.
- Wired explicit `CAF_TEST_ONLY` AP dependency providers for deterministic runtime composition before TG-40 provider binding.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L174-L178 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L493-L518 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L70-L120 — supports Claim 3
