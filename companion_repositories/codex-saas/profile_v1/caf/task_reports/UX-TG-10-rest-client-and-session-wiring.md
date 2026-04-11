<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=UX-TG-10-rest-client-and-session-wiring -->
<!-- CAF_TRACE: capability=ux_frontend_realization -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: UX-TG-10-rest-client-and-session-wiring

## Inputs consumed

- `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- `node tools/caf/resolve_tbp_role_bindings_v1.mjs codex-saas --capability ux_frontend_realization`

## Claims

- Shared UX API helper centralizes tenant-aware list/detail/mutation calls for the richer UX lane.
- Mock session carrier and bearer claim construction remain explicit and conflict-aware.
- Deny/validation/failure outcomes are exposed as explicit UI states instead of hidden failures.
- Request shaping remains within current REST/OpenAPI + thin-BFF posture.

## UX interaction matrix

| surface | module | interaction posture |
| --- | --- | --- |
| Session contract | `code/ux/src/auth/mockAuth.js` | explicit tenant/principal/role claim carrier |
| Shared REST helper | `code/ux/src/api.js` | normalized AP calls with preserved backend error detail |
| Shell context | `code/ux/src/App.jsx` | persistent tenant and role visibility |

## Primary action coverage matrix

| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor |
| --- | --- | --- | --- | --- | --- |
| Create Widget | Catalog | `code/ux/src/pages/CatalogPage.jsx` | create form in catalog surface | `createWidget` in `code/ux/src/api.js` | `code/ux/src/pages/CatalogPage.jsx:L93-L132` |
| Publish Collection | Collections | `code/ux/src/pages/CollectionsPage.jsx` | publish/update controls | `updateCollection` in `code/ux/src/api.js` | `code/ux/src/pages/CollectionsPage.jsx:L137-L173` |
| Manage Roles | Admin | `code/ux/src/pages/AdminPage.jsx` | role assignment form | `createTenantRoleAssignment` in `code/ux/src/api.js` | `code/ux/src/pages/AdminPage.jsx:L68-L92` |

## Evidence anchors

- `companion_repositories/codex-saas/profile_v1/code/ux/src/auth/mockAuth.js:L1-L65`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/api.js:L1-L219`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/App.jsx:L1-L115`
- `companion_repositories/codex-saas/profile_v1/code/ux/package.json:L1-L20`
- `companion_repositories/codex-saas/profile_v1/code/ux/vite.config.js:L1-L17`
- `companion_repositories/codex-saas/profile_v1/code/ux/components.json:L1-L9`

