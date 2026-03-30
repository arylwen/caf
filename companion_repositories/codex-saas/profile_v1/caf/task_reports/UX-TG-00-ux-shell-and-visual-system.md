# UX Task Report: UX-TG-00-ux-shell-and-visual-system

## Inputs consumed
- reference_architectures/codex-saas/design/playbook/ux_design_v1.md
- reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md
- reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

## Claims
- Implemented a persistent desktop-first UX shell with left navigation for Dashboard, Widgets, Collections, Activity, and Admin.
- Added a top context bar that keeps tenant and principal visibility on all primary surfaces.
- Materialized reusable semantic visual tokens and primitives in `src/styles.css` and shared shell layout in `src/App.jsx`.
- Kept richer UX lane implementation under `code/ux/` without modifying smoke-test `code/ui/` lane.

## UX interaction matrix
| implemented UX surface | module | key states | session/tenant visibility |
| --- | --- | --- | --- |
| Shell + Dashboard | code/ux/src/App.jsx, code/ux/src/styles.css | loading, ready, error | top context bar always visible |
| Widget catalog | code/ux/src/pages/CatalogPage.jsx | loading, ready, empty, error, success | inherited shell context |
| Widget detail | code/ux/src/pages/DetailPage.jsx | loading, ready, validation/error, success | inherited shell context |
| Collections workspace | code/ux/src/pages/CollectionsPage.jsx | loading, ready, empty, error, success | inherited shell context |
| Sharing/published | code/ux/src/pages/PublishedPage.jsx | loading, ready, empty, error, success | inherited shell context |
| Tenant admin | code/ux/src/pages/AdminPage.jsx | loading, ready, error, success | inherited shell context |
| Activity history | code/ux/src/pages/ActivityPage.jsx | loading, ready, empty, error | inherited shell context |

## Primary action coverage matrix
| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor or explicit deferred note |
| --- | --- | --- | --- | --- | --- |
| Create widget | Widget catalog/detail | code/ux/src/pages/CatalogPage.jsx | `Create widget` header button + form | `createWidget` via `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CatalogPage.jsx |
| New collection | Collections workspace | code/ux/src/pages/CollectionsPage.jsx | `New collection` form section | `createCollection` via `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CollectionsPage.jsx |
| Publish | Sharing and permissions | code/ux/src/pages/CollectionsPage.jsx, code/ux/src/pages/PublishedPage.jsx | `Publish` action button and confirmation flow | `createCollectionPermission` / `updateCollectionPermission` via `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/PublishedPage.jsx |
| Manage roles | Tenant admin | code/ux/src/pages/AdminPage.jsx | `Manage roles` action button and role form | `createTenantUserRole` / `deleteTenantUserRole` via `code/ux/src/api.js` | companion_repositories/codex-saas/profile_v1/code/ux/src/pages/AdminPage.jsx |

## Evidence anchors
- companion_repositories/codex-saas/profile_v1/code/ux/src/App.jsx
- companion_repositories/codex-saas/profile_v1/code/ux/src/styles.css
- companion_repositories/codex-saas/profile_v1/code/ux/src/main.jsx
- companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CatalogPage.jsx
