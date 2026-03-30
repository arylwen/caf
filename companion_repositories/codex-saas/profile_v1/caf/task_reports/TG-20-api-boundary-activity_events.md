# TG-20-api-boundary-activity_events Task Report

## Inputs consumed
- `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`: consumed activity-events audit resource operation posture (`list`) and tenant-scoping constraints.
- `reference_architectures/codex-saas/design/playbook/application_design_v1.md`: consumed AP boundary adapter and service-facade separation posture.
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`: consumed auth-claim and policy-evaluation rails for ingress handling.

## Claims
- Materialized an activity_events boundary list handler with explicit auth-claim + policy enforcement and optional target filtering.
- Preserved boundary thinness by delegating event retrieval to `ActivityEventsFacade` through dependency-provider seams.
- Registered activity_events dependency provider and AP composition-root router wiring.

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ap/api/activity_events_router.py:L1-L49 — supports Claims 1-2
- companion_repositories/codex-saas/profile_v1/code/ap/api/dependencies.py:L69-L120 — supports Claim 3
- companion_repositories/codex-saas/profile_v1/code/ap/main.py:L89-L89 — supports Claim 3
