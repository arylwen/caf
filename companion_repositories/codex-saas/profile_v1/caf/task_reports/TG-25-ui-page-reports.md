## Task Spec Digest
- task_id: `TG-25-ui-page-reports`
- title: `Implement UI page for reports resource`
- primary capability: `ui_frontend_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`

## Inputs consumed
- `caf/application_spec_v1.md`: constrained report operations to list/get only.
- `caf/application_domain_model_v1.yaml`: aligned report page behavior to resource operation set.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: verified required UI TBP expectation remains intact.

## Claims
- Added a dedicated reports page route and navigation surface from the UI shell.
- Implemented report interactions scoped to list/get operations only.
- Preserved tenant/principal context propagation for report calls.

## Evidence anchors
- `code/ui/src/pages/reports.jsx:L6-L30` - reports page exposes list/get only behavior.
- `code/ui/src/api.js:L64-L69` - report API seam supports list/get only.
- `code/ui/src/App.jsx:L26-L30` - reports route wiring from shell.
