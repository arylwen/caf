# TG-30-service-facade-activity_events Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed ACTIVITY_EVENT aggregate and list-only operation posture (`operations: [list]`) to keep service invariants tenant-scoped and read-only.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP layering requirement that service facades remain transport-free orchestration seams.
- `reference_architectures/codex-saas/design/playbook/interface_binding_contracts_v1.yaml`: consumed `BIND-AP-activity_events` and declared `ActivityEventsAccessInterface` as the required consumer-side interface for later provider wiring.

## Claims
- Declared the required `ActivityEventsAccessInterface` consumer contract for TG-30 service-facade binding.
- Materialized `ActivityEventsFacade` as transport-free orchestration over an injected access interface rather than a hidden in-facade persistence implementation.
- Wired AP dependency providers to explicit `CAF_TEST_ONLY` access seams so runtime composition keeps interface ownership visible until TG-40 persistence providers are bound.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L191-L192 — supports Claim 1
- companion_repositories/codex-saas/profile_v1/code/ap/application/services.py:L541-L545 — supports Claim 2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L44-L120 — supports Claim 3
