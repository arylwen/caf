<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-activity_events -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-25-ui-page-activity_events

## Inputs Consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## Claims

- Implemented a concrete Activity Events page wired through the shared `ResourcePage` surface.
- Bound the page to the declared `activity_events` resource with only `list` and `get` operations.
- Kept shell reachability and API helper integration aligned with the AP boundary resource contract.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/ActivityEventsPage.jsx:L10-L17
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/ResourcePage.jsx:L60-L305
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L19-L28
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L69-L103
