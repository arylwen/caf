<!-- CAF_TRACE: generated_by=Contura Architecture Framework (CAF) -->
<!-- CAF_TRACE: task_id=UX-TG-40-collections-and-sharing-surface -->
<!-- CAF_TRACE: capability=ux_frontend_realization -->
<!-- CAF_TRACE: instance=codex-saas -->

# Task Report: UX-TG-40-collections-and-sharing-surface

## Inputs consumed

- `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

## Claims

- Collections workspace supports list, create, update, delete, and membership curation flows.
- Sharing/permissions posture remains operable through explicit collection update and role-aware context.
- Publish Collection remains one click from collections and shell action entry points.
- Deny/failure paths for publish and permission operations are explicit and non-destructive.

## UX interaction matrix

| surface | module | interaction posture |
| --- | --- | --- |
| Collections workspace | `code/ux/src/pages/CollectionsPage.jsx` | curation + membership workflow |
| Publish posture | `code/ux/src/App.jsx` + `CollectionsPage.jsx` | one-click publish path and collection update actions |
| Sharing helpers | `code/ux/src/api.js` | collection and collection-membership REST helpers |

## Primary action coverage matrix

| declared action | source surface | realized surface/module | visible entry control or path | shared API/helper call path | evidence anchor |
| --- | --- | --- | --- | --- | --- |
| Publish Collection | Collections | `code/ux/src/pages/CollectionsPage.jsx` | collection update controls | `updateCollection` | `code/ux/src/pages/CollectionsPage.jsx:L137-L173` |
| Curate Membership | Collections | `code/ux/src/pages/CollectionsPage.jsx` | membership add/remove controls | `createCollectionMembership` / `deleteCollectionMembership` | `code/ux/src/pages/CollectionsPage.jsx:L99-L136` |
| Create Collection | Collections | `code/ux/src/pages/CollectionsPage.jsx` | create collection form | `createCollection` | `code/ux/src/pages/CollectionsPage.jsx:L64-L98` |

## Evidence anchors

- `companion_repositories/codex-saas/profile_v1/code/ux/src/pages/CollectionsPage.jsx:L1-L214`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/App.jsx:L1-L115`
- `companion_repositories/codex-saas/profile_v1/code/ux/src/api.js:L1-L219`

