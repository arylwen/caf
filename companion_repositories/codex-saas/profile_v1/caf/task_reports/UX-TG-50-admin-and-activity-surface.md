<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=UX-TG-50-admin-and-activity-surface -->
<!-- CAF_TRACE: capability=ux_frontend_realization -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: UX-TG-50-admin-and-activity-surface

## Inputs consumed

- `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

## Claims

- Tenant admin surface supports role-assignment CRUD and explicit governance outcomes.
- Activity history surface provides auditable request/decision/outcome visibility.
- Manage Roles remains directly reachable via shell quick action and admin route.
- Admin deny/failure messages stay explicit and preserve operator context for retry.

## UX interaction matrix

| surface | module | interaction posture |
| --- | --- | --- |
| Tenant Admin | `code/ux/src/pages/AdminPage.jsx` | role assignment and removal flows |
| Activity History | `code/ux/src/pages/ActivityPage.jsx` | timeline/list + selected event detail |
| Role quick action | `code/ux/src/App.jsx` | direct shell route to admin |

## Primary action coverage matrix

| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor |
| --- | --- | --- | --- | --- | --- |
| Manage Roles | Admin | `code/ux/src/pages/AdminPage.jsx` | role assignment form + remove actions | `createTenantRoleAssignment` / `deleteTenantRoleAssignment` | `code/ux/src/pages/AdminPage.jsx:L68-L118` |
| Inspect Activity | Activity | `code/ux/src/pages/ActivityPage.jsx` | select event in timeline list | `listActivityEvents` / `getActivityEvent` | `code/ux/src/pages/ActivityPage.jsx:L31-L62` |
| Navigate to Admin | Shell | `code/ux/src/App.jsx` | shell quick action and nav tab | admin route in shell | `code/ux/src/App.jsx:L34-L40` |

## Evidence anchors

- `companion_repositories/codex-saas/profile_v1/code/ux/src/pages/AdminPage.jsx:L1-L133`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/pages/ActivityPage.jsx:L1-L93`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/App.jsx:L1-L115`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/api.js:L1-L219`

