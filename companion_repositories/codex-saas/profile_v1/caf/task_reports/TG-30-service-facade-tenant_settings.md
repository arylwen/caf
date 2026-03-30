# TG-30-service-facade-tenant_settings Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed TENANT_SETTING singleton semantics (`get/update`) and tenant-scoped update metadata requirements.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP policy/tenant-context posture for service orchestration boundaries.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-tenant_settings` and declared `TenantSettingsAccessInterface` as the required consumer-side interface.

## Claims
- Declared `TenantSettingsAccessInterface` and updated `TenantSettingsFacade` to depend on explicit injected access contracts.
- Kept service invariants for settings payload validation and actor attribution in the access seam while preserving transport-free facade orchestration.
- Exposed explicit `CAF_TEST_ONLY` provider wiring for tenant settings so interface ownership is visible until persistence binding is completed.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L180-L189 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L286-L323 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L520-L539 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L75-L120 — supports Claim 3
