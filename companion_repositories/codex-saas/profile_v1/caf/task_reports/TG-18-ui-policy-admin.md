<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-18-ui-policy-admin -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-18-ui-policy-admin`
- title: Implement UI policy and governance admin surface
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-35-policy-enforcement-core`

## Inputs consumed
- `caf/control_plane_design_v1.md`: used CP policy contract direction and admin governance context.
- `caf/application_product_surface_v1.md`: used Admin surface expectations and explicit action posture.
- `caf/profile_parameters_resolved.yaml`: confirmed `ui.framework=react`, `ui.kind=web_spa`, `platform.auth_mode=mock`.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding output placement and evidence markers.

## Claims
1. Implemented a reachable policy-admin page from the shell nav and connected it to a real contract interaction path.
2. Added explicit preview and submit controls that both call `POST /cp/contract/BND-CP-AP-01/policy-decision` via the shared API helper.
3. Rendered observable loading, success, idle, and failure states for policy decision operations.
4. Preserved shared auth/header behavior in `src/api.js` so policy calls inherit tenant/principal context correctly.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/PolicyAdminPage.jsx` | `src/App.jsx` nav item `policy_admin` | `POST /cp/contract/BND-CP-AP-01/policy-decision` with `action` + optional `resource_id` | `apiPost("/cp/contract/BND-CP-AP-01/policy-decision", ...)` | `idle`, `loading`, `success`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/PolicyAdminPage.jsx:L1-L81`
