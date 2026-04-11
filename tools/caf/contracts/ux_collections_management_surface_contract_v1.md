# UX collections management surface contract v1

Owner: TBP-declared UX page-family/management-surface validator executed by framework post-build validation

Intent:
- Keep the generated Collections + Publish Workspace usable as a canonical governed demo surface.
- Ensure the management surface supports the end-to-end operator flow of creating a collection and then publishing it.

Contract:
- The generated UX collections management surface must expose a create path, a collection-update path, and a publish-permission path in the same resolved management-surface page-family surface.
- The resolved management-surface/page-family surface must use framework-owned API helpers rather than local fetch hardcoding.
- At minimum, the management-surface page must:
  - import and use the shared `createCollection` helper (an aliased local handler name is allowed)
  - import and use `updateCollection(...)`
- consume resource rows only after the shared UX API helper normalizes AP envelopes shaped as `{ id, data }`
  - expose a visible new/create collection control
  - expose a visible publish-permission control on the same page
- A separate published-permissions review page may exist as a supporting browser, but the main management surface must still let the operator create a collection and continue directly into publish setup without switching tools.
- Supporting review pages should use framework-owned permission helpers such as `listCollectionPermissions(...)` and `updateCollectionPermission(...)` when they offer post-create review/tuning.

Why:
- The current CAF thesis is PRD-to-code with architecture in the loop; the governed demo surfaces must therefore be operationally usable, not only structurally present.
- A Collections + Publish Workspace that cannot create a collection forces operators into another surface and breaks the intended end-to-end demo path.
