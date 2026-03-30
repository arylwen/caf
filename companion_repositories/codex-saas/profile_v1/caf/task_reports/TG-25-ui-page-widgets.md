<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-widgets -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-widgets`
- title: Implement UI page for widgets
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-widgets`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used widget fields (`title`, `description`, `status`) and server-generated id posture.
- `caf/application_product_surface_v1.md`: used widget-catalog and create-widget action expectations.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `WidgetsPage` and wired it into shell navigation.
2. Bound list/create/delete interactions to `GET /api/widgets`, `POST /api/widgets`, and `DELETE /api/widgets/{id}`.
3. Kept create form free of user-entered widget id and rendered loading, empty, success, and failure states.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/WidgetsPage.jsx` | `src/App.jsx` nav item `widgets` | `GET /api/widgets`, `POST /api/widgets`, `DELETE /api/widgets/{id}` | `apiGet(...)`, `apiPost(...)`, `apiDelete(...)` | `loading`, `success`, `empty`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/WidgetsPage.jsx:L1-L101`
