<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-collection_permissions -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: TG-25-ui-page-collection_permissions

## Inputs Consumed

- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/design/playbook/application_design_v1.md

## Claims

- Implemented a concrete Collection Permissions page wired through the shared `ResourcePage` surface.
- Bound the page to the declared `collection_permissions` resource with `list` and `update` operations.
- Captured contract-aligned update fields (`collection_id`, `role_id`, `permission_level`) in the page binding.

## Evidence anchors

- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/CollectionPermissionsPage.jsx:L10-L18
- companion_repositories/codex-saas/profile_v1/code/ui/src/pages/ResourcePage.jsx:L60-L305
- companion_repositories/codex-saas/profile_v1/code/ui/src/App.jsx:L19-L28
- companion_repositories/codex-saas/profile_v1/code/ui/src/api.js:L69-L103

