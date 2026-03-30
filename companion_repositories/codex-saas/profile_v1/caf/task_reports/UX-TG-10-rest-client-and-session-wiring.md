# UX Task Report: UX-TG-10-rest-client-and-session-wiring

## Inputs consumed
- reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

## Claims
- Implemented a shared UX API client in `code/ux/src/api.js` covering list/detail/mutation paths for widgets, collections, sharing, admin, and activity surfaces.
- Kept REST/OpenAPI posture aligned with AP/CP boundary routes through `/api/*` and `/cp/*` calls.
- Preserved explicit session/tenant contract using mock bearer claim builders and conflict detection in `code/ux/src/auth/mockAuth.js`.
- Normalized loading/error/success feedback handling across page surfaces to support recovery-safe UX behavior.

## UX interaction matrix
| implemented UX surface | module | key states | session/tenant visibility |
| --- | --- | --- | --- |
| Shared API layer | code/ux/src/api.js | request, success, denied, error | Authorization bearer claim and conflict guard |
| Mock auth helpers | code/ux/src/auth/mockAuth.js | preset selection, token parse | tenant_id/principal_id/policy_version preserved |
| Shell runtime status | code/ux/src/App.jsx | loading, ready, error | top context bar + role preset selector |
| Primary pages | code/ux/src/pages/*.jsx | loading, ready, empty, success, error | inherited shell context and shared API headers |

## Primary action coverage matrix
| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor or explicit deferred note |
| --- | --- | --- | --- | --- | --- |
| Create widget | Widget catalog/detail | code/ux/src/pages/CatalogPage.jsx | catalog action and form submit | `createWidget` via `buildAuthHeaders` | companion_repositories/codex-saas/profile_v1/code/ux/src/api.js |
| New collection | Collections workspace | code/ux/src/pages/CollectionsPage.jsx | collection form submit | `createCollection` via `buildAuthHeaders` | companion_repositories/codex-saas/profile_v1/code/ux/src/api.js |
| Publish | Sharing and permissions | code/ux/src/pages/CollectionsPage.jsx, code/ux/src/pages/PublishedPage.jsx | publish submit + toggle update | `createCollectionPermission` / `updateCollectionPermission` | companion_repositories/codex-saas/profile_v1/code/ux/src/api.js |
| Manage roles | Tenant admin | code/ux/src/pages/AdminPage.jsx | role assignment submit/revoke | `createTenantUserRole` / `deleteTenantUserRole` | companion_repositories/codex-saas/profile_v1/code/ux/src/api.js |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ux/src/api.js
- companion_repositories/codex-saas/profile_v1/code/ux/src/auth/mockAuth.js
- companion_repositories/codex-saas/profile_v1/code/ux/src/App.jsx
