<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-activity_events -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-activity_events`
- title: Implement UI page for activity_events
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-activity_events`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used `Activity Event` fields and audit context.
- `caf/application_product_surface_v1.md`: used activity-history journey and readability expectations.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `ActivityEventsPage` and wired it into shell navigation.
2. Bound activity retrieval to `GET /api/activity_events` with optional `target_id` filter.
3. Rendered loading, empty, success, and failure states for audit timeline retrieval.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/ActivityEventsPage.jsx` | `src/App.jsx` nav item `activity_events` | `GET /api/activity_events` (+ optional `target_id`) | `apiGet("/api/activity_events", ..., { target_id })` | `loading`, `success`, `empty`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/ActivityEventsPage.jsx:L1-L54`
