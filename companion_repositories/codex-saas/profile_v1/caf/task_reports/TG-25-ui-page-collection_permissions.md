<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-collection_permissions -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-collection_permissions`
- title: Implement UI page for collection_permissions
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-collection_permissions`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used collection-permission fields and role-based sharing semantics.
- `caf/application_product_surface_v1.md`: used sharing/permissions surface expectations.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `CollectionPermissionsPage` and wired it into shell navigation.
2. Bound permission list/create interactions to `GET /api/collection_permissions` and `POST /api/collection_permissions`.
3. Rendered loading, empty, success, and failure states for permission workflows.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/CollectionPermissionsPage.jsx` | `src/App.jsx` nav item `collection_permissions` | `GET /api/collection_permissions`, `POST /api/collection_permissions` | `apiGet("/api/collection_permissions")`, `apiPost("/api/collection_permissions", ...)` | `loading`, `success`, `empty`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/CollectionPermissionsPage.jsx:L1-L84`
