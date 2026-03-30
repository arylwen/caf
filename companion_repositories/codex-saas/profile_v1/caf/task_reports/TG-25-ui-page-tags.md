<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-tags -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-tags`
- title: Implement UI page for tags
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-tags`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used tag fields (`label`).
- `caf/application_product_surface_v1.md`: used catalog/tagging workflow cues.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `TagsPage` and wired it into shell navigation.
2. Bound list/create interactions to `GET /api/tags` and `POST /api/tags`.
3. Rendered loading, empty, success, and failure states for tag workflows.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/TagsPage.jsx` | `src/App.jsx` nav item `tags` | `GET /api/tags`, `POST /api/tags` | `apiGet("/api/tags")`, `apiPost("/api/tags", ...)` | `loading`, `success`, `empty`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/TagsPage.jsx:L1-L69`
