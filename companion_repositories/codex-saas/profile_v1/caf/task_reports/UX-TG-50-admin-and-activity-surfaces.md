# UX Task Report: UX-TG-50-admin-and-activity-surfaces

## Inputs consumed
- reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- reference_architectures/codex-saas/design/playbook/ux_design_v1.md

## Claims
- Implemented tenant admin surfaces for role assignment/revoke and tenant settings update operations.
- Preserved `Manage roles` as a first-class visible action with direct jump and explicit form workflow.
- Implemented activity timeline surface with target filtering and actor-action-target-timestamp readability.
- Normalized admin and activity states for loading/error/retry and success confirmation behavior.

## UX interaction matrix
| implemented UX surface | module | key states | session/tenant visibility |
| --- | --- | --- | --- |
| Tenant admin role operations | code/ux/src/pages/AdminPage.jsx | loading, ready, success, error | inherited shell context |
| Tenant settings operations | code/ux/src/pages/AdminPage.jsx | edit, update success/error | inherited shell context |
| Activity timeline | code/ux/src/pages/ActivityPage.jsx | loading, ready, empty, error | inherited shell context |

## Primary action coverage matrix
| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor or explicit deferred note |
| --- | --- | --- | --- | --- | --- |
| Create widget | Widget catalog/detail | code/ux/src/pages/CatalogPage.jsx | retained in widgets action rail | `createWidget` in `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CatalogPage.jsx |
| New collection | Collections workspace | code/ux/src/pages/CollectionsPage.jsx | retained in collections form | `createCollection` in `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CollectionsPage.jsx |
| Publish | Sharing and permissions | code/ux/src/pages/CollectionsPage.jsx | retained publish flow | `createCollectionPermission` in `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CollectionsPage.jsx |
| Manage roles | Tenant admin | code/ux/src/pages/AdminPage.jsx | visible `Manage roles` button + role form | `createTenantUserRole` / `deleteTenantUserRole` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/AdminPage.jsx |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ux/src/pages/AdminPage.jsx
- companion_repositories/codex-saas/profile_v1/code/ux/src/pages/ActivityPage.jsx
- companion_repositories/codex-saas/profile_v1/code/ux/src/api.js
