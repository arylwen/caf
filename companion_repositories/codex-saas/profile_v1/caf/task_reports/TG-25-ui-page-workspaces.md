## Task Spec Digest
- task_id: `TG-25-ui-page-workspaces`
- title: `Implement UI page for workspaces resource`
- primary capability: `ui_frontend_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`

## Inputs consumed
- `caf/application_spec_v1.md`: constrained workspace behavior to list/create/update operations.
- `caf/application_domain_model_v1.yaml`: aligned workspace terminology and operation scope.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: confirmed role-binding expectation remains satisfied.

## Claims
- Added a dedicated workspaces page route and shell navigation integration.
- Implemented list/create/update workspace interactions and excluded speculative operations.
- Preserved tenant/principal context on all workspace API calls.

## Evidence anchors
- `code/ui/src/pages/workspaces.jsx:L6-L48` - workspace list/create/update page scaffold.
- `code/ui/src/api.js:L30-L45` - workspace API seams with explicit context headers.
- `code/ui/src/App.jsx:L20-L24` - workspace route wiring from shell.
