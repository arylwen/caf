# CP/AP policy preview action alignment contract v1

Owner: framework post-build validation

Intent:
- Keep browser policy-preview actions aligned with AP-enforced CP policy actions.
- Prevent UX/UI surfaces from previewing policy actions that the AP runtime never enforces.
- Keep browse-preview actions aligned with the actual AP read path used by the page.

Contract:
- Any action literal passed to `previewPolicyDecision(...)` in generated UI/UX code must also appear in AP service policy enforcement calls.
- AP service policy enforcement calls are the source of truth for runtime-governed actions because they are the actions actually enforced before AP mutations or reads.
- Browser preview surfaces may present friendlier labels, but the action sent to CP must match an AP-enforced action literal.
- The alignment requirement applies when a page actually emits a page-level preview request. A supporting review page that relies only on runtime-governed API helpers does not need to invent a separate preview action literal.
- If a page obtains its data by calling `listCollections(...)` and also emits a page-level preview, that preview must use the AP-enforced read action for that path rather than a UX-only synonym.

Why:
- A browser preview action that is not AP-enforced can drift into a false deny/allow state.
- In `cdxt-saas`, a publish workspace previewed `collections:publish` while the runtime mutation path enforced `collections:update`, which caused page-level deny drift even though the AP path itself was healthy.
- In `cdxt-saas`, the Published Collections Browser read data through `listCollections(...)` and filtered client-side, so the page-level preview had to align to `collections:list` rather than a non-runtime action such as `collections:view_published`.
