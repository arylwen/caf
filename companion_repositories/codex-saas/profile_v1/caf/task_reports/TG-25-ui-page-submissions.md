## Task Spec Digest
- task_id: `TG-25-ui-page-submissions`
- title: `Implement UI page for submissions resource`
- primary capability: `ui_frontend_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/application_domain_model_v1.yaml`

## Inputs consumed
- `caf/application_spec_v1.md`: constrained submission behavior to list/create/update operations.
- `caf/application_domain_model_v1.yaml`: used submission/workspace identifiers and status semantics for UI scaffold fields.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: verified UI TBP posture remains valid.

## Claims
- Added a dedicated submissions page route and navigation integration.
- Implemented list/create/update submission interactions without extra operations.
- Carried tenant/principal context through all submissions API seams.

## Evidence anchors
- `code/ui/src/pages/submissions.jsx:L6-L54` - submissions list/create/update page scaffold.
- `code/ui/src/api.js:L46-L62` - submissions API seams for list/create/update with context headers.
- `code/ui/src/App.jsx:L23-L27` - submissions route wiring from shell.
