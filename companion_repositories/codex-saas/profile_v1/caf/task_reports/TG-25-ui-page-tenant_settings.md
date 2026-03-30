<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=TG-25-ui-page-tenant_settings -->
<!-- CAF_TRACE: capability=ui_frontend_scaffolding -->
<!-- CAF_TRACE: instance=codex-saas -->

## Task Spec Digest
- task_id: `TG-25-ui-page-tenant_settings`
- title: Implement UI page for tenant_settings
- primary capability: `ui_frontend_scaffolding`
- depends_on: `TG-15-ui-shell`, `TG-20-api-boundary-tenant_settings`

## Inputs consumed
- `caf/application_domain_model_v1.yaml`: used tenant-setting fields (`setting_key`, `setting_value`).
- `caf/application_product_surface_v1.md`: used tenant-admin management expectations.
- `caf/profile_parameters_resolved.yaml`: confirmed React SPA posture.
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ui_frontend_scaffolding`: validated role-binding evidence surfaces.

## Claims
1. Added `TenantSettingsPage` and wired it into shell navigation.
2. Bound get/update interactions to `GET /api/tenant_settings` and `PUT /api/tenant_settings`.
3. Rendered loading, success, and failure states for tenant settings management.

## Interaction matrix
| page/module | reachable from shell/router via | AP contract path or action surface used | shared API helper call(s) used | observable loading/success/empty/failure states rendered |
| --- | --- | --- | --- | --- |
| `src/pages/TenantSettingsPage.jsx` | `src/App.jsx` nav item `tenant_settings` | `GET /api/tenant_settings`, `PUT /api/tenant_settings` | `apiGet("/api/tenant_settings")`, `apiPut("/api/tenant_settings", ...)` | `loading`, `success`, `error` |

## Evidence anchors
- `code/ui/src/App.jsx:L1-L91`
- `code/ui/src/api.js:L1-L104`
- `code/ui/src/pages/TenantSettingsPage.jsx:L1-L75`
