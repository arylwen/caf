# UX collections workspace surface contract v1

Owner: framework post-build validation

Intent:
- Keep the generated Collections + Publish Workspace usable as a canonical governed demo surface.
- Ensure the workspace supports the end-to-end operator flow of creating a collection and then publishing it.

Contract:
- The generated UX collections workspace must expose a create path, a collection-update path, and a publish-permission path in the same surface.
- The surface must use framework-owned API helpers rather than local fetch hardcoding.
- At minimum, the workspace page must:
  - import and use `createCollection(...)`
  - import and use `updateCollection(...)`
  - expose a visible new/create collection control
  - expose a visible publish-permission control on the same page
- A separate published-permissions review page may exist as a supporting browser, but the main workspace must still let the operator create a collection and continue directly into publish setup without switching tools.
- Supporting review pages should use framework-owned permission helpers such as `listCollectionPermissions(...)` and `updateCollectionPermission(...)` when they offer post-create review/tuning.

Why:
- The current CAF thesis is PRD-to-code with architecture in the loop; the governed demo surfaces must therefore be operationally usable, not only structurally present.
- A Collections + Publish Workspace that cannot create a collection forces operators into another surface and breaks the intended end-to-end demo path.
