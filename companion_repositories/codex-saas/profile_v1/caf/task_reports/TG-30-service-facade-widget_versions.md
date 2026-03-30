# TG-30-service-facade-widget_versions Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed WIDGET_VERSION entity and list-only operation posture for read-only service invariants.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP layering and transport-free service-facade requirements.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-widget_versions` and declared `WidgetVersionsAccessInterface` as required consumer contract.

## Claims
- Declared the `WidgetVersionsAccessInterface` contract aligned to interface binding requirements.
- Implemented `WidgetVersionsFacade` as a transport-free orchestrator over the injected access interface (no hidden persistence coupling).
- Added explicit AP dependency wiring with `CAF_TEST_ONLY` provider seams for predictable composition before TG-40 runtime binding.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L138-L140 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L374-L380 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L50-L120 — supports Claim 3
