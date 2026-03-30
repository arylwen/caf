<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-widget_versions -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-widget_versions`
- title: Implement UI page for widget_versions
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-widget_versions`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used widget-version fields and filtering context.
- `caf/application_product_surface_v1.md`: used widget detail/version-history journey.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `WidgetVersionsPage` and wired it into shell navigation.
2. Bound retrieval to `GET /api/widget_versions` with optional `widget_id` filter.
3. Rendered loading, empty, success, and failure states for version-history queries.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/WidgetVersionsPage.jsx` | `src/App.jsx` nav item `widget_versions` | `GET /api/widget_versions` (+ optional `widget_id`) | `apiGet("/api/widget_versions", ..., { widget_id })` | `loading`, `success`, `empty`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/WidgetVersionsPage.jsx:L1-L56`
