## Task Spec Digest
- task_id: `TG-18-ui-policy-admin`
- title: `Implement UI page for policy authoring`
- primary capability: `ui_frontend_scaffolding`
- task graph source: `caf/task_graph_v1.yaml`

## Inputs declared by task
- required: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/control_plane_design_v1.md`
- required: `reference_architectures/codex-saas/design/playbook/contract_declarations_v1.yaml`

## Inputs consumed
- `caf/system_spec_v1.md`: derived policy-governance and tenant/principal context requirements.
- `caf/control_plane_design_v1.md`: aligned policy-admin flow to CP ownership and CP/AP contract intent.
- `caf/contract_declarations_v1.yaml`: preserved `X-Tenant-Id` and `X-Principal-Id` context carrier posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: confirmed `code/ui/package.json` Vite/React role-binding expectation remains satisfied.

## Claims
- Implemented a dedicated policy admin page with list/create/edit scaffolding.
- Added policy navigation in the UI shell and route-level rendering for the policy page.
- Preserved tenant/principal context requirements on all policy API seams.
- Kept policy schema decisions minimal and limited to declared activation-state scaffolding.

## Evidence anchors
- `code/ui/src/pages/policy_admin.jsx:L6-L51` - policy list/create/edit page scaffold and interactions.
- `code/ui/src/App.jsx:L17-L30` - policy route registration and page dispatch from shell.
- `code/ui/src/api.js:L71-L87` - tenant/principal-scoped policy list/create/update request shapes.
