# TG-30-service-facade-collection_permissions Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed COLLECTION_PERMISSION entity fields and update-capable aggregate semantics to preserve tenant-scoped list/create/update behavior.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP service-facade boundary posture and transport-free orchestration requirement.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-collection_permissions` and declared `CollectionPermissionsAccessInterface` for consumer-side contract realization.

## Claims
- Declared the required `CollectionPermissionsAccessInterface` and implemented a service facade that depends on this explicit interface.
- Enforced service-level invariants by normalizing tenant and resource identifier ownership before delegating create/update operations.
- Registered explicit `CAF_TEST_ONLY` dependency providers so interface ownership is explicit pending TG-40 persistence wiring.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L161-L172 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L451-L491 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L65-L120 — supports Claim 3
