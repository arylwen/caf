# TG-20-api-boundary-tenant_users_roles Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed tenant user-role assignment contract and operations (`list/create/delete`).
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP boundary and service-facade seam expectations.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed auth-claim tenant carrier and policy fail-closed posture.

## Claims
- Materialized tenant_users_roles boundary handlers with explicit tenant/auth policy evaluation for list/create/delete.
- Preserved boundary-owned ID handling by rejecting client-supplied tenant/resource identifiers for create and using path IDs for delete.
- Added tenant_users_roles dependency providers and composition-root registration.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/api/tenant_users_roles_router.py:L1-L83 — supports Claims 1-2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L61-L108 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/main.py:L87-L87 — supports Claim 3
