# UX Task Report: UX-TG-40-collections-workspace-and-publish-actions

## Inputs consumed
- reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- reference_architectures/codex-saas/design/playbook/ux_design_v1.md
- reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md

## Claims
- Implemented collections workspace with create/update flows and widget membership draft editing.
- Kept `New collection` and `Publish` as explicit, near-by actions in collection workflows.
- Implemented publish permission creation and confirmable permission update flows with denial/success feedback.
- Added dedicated published permissions surface for review-centric publish posture.

## UX interaction matrix
| implemented UX surface | module | key states | session/tenant visibility |
| --- | --- | --- | --- |
| Collections workspace | code/ux/src/pages/CollectionsPage.jsx | loading, ready, empty, success, error | inherited shell context |
| Publish controls | code/ux/src/pages/CollectionsPage.jsx | submit pending, success, error | role consequences explicit before commit |
| Published review | code/ux/src/pages/PublishedPage.jsx | loading, ready, empty, success, error | inherited shell context |

## Primary action coverage matrix
| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor or explicit deferred note |
| --- | --- | --- | --- | --- | --- |
| Create widget | Widget catalog/detail | code/ux/src/pages/CatalogPage.jsx | retained in widgets surface | `createWidget` in `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CatalogPage.jsx |
| New collection | Collections workspace | code/ux/src/pages/CollectionsPage.jsx | `New collection` create/update form | `createCollection` / `updateCollection` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CollectionsPage.jsx |
| Publish | Sharing and permissions | code/ux/src/pages/CollectionsPage.jsx, code/ux/src/pages/PublishedPage.jsx | `Publish` button, submit form, toggle update confirm | `createCollectionPermission` / `updateCollectionPermission` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/PublishedPage.jsx |
| Manage roles | Tenant admin | code/ux/src/pages/AdminPage.jsx | retained in admin action rail | `createTenantUserRole` in `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/AdminPage.jsx |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CollectionsPage.jsx
- companion_repositories/codex-saas/profile_v1/code/ux/src/pages/PublishedPage.jsx
- companion_repositories/codex-saas/profile_v1/code/ux/src/api.js
