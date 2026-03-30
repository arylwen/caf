<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-tenant_users_roles -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-tenant_users_roles`
- title: Implement UI page for tenant_users_roles
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-tenant_users_roles`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used user-role assignment fields and admin context.
- `caf/application_product_surface_v1.md`: used tenant-admin assignment management expectations.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `TenantUsersRolesPage` and wired it into shell navigation.
2. Bound list/create/delete interactions to `GET /api/tenant_users_roles`, `POST /api/tenant_users_roles`, and `DELETE /api/tenant_users_roles/{id}`.
3. Rendered loading, empty, success, and failure states for assignment workflows.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/TenantUsersRolesPage.jsx` | `src/App.jsx` nav item `tenant_users_roles` | `GET /api/tenant_users_roles`, `POST /api/tenant_users_roles`, `DELETE /api/tenant_users_roles/{id}` | `apiGet(...)`, `apiPost(...)`, `apiDelete(...)` | `loading`, `success`, `empty`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/TenantUsersRolesPage.jsx:L1-L88`
