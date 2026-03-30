# CAF UX Patterns v1

This namespace holds the first framework-owned UX pattern family for the `/caf ux` lane.

Purpose:
- capture interaction and journey patterns that are too UX-specific for `core_v1`, too product-facing for `caf_v1`, and too implementation-shaped to leave entirely to external/frontend habits;
- keep UX retrieval grounded in a small, explicit family rather than hidden worker lore;
- let the UX lane join the existing canonical retrieval substrate without loading the full substrate into context.

Package-7 posture:
- `ux_v1` joins the canonical retrieval substrate (`pattern_retrieval_surface_v1.jsonl`);
- the `ux_design` profile uses a curated static semantic subset capped at 30 records;
- graph expansion remains the widening mechanism when recall must go beyond the shortlist;
- no separate UX-only canonical JSONL substrate is introduced.


Package-8 extension:
- `UX-VISUAL-01` adds shell/hierarchy polish for presentation-ready SaaS UI.
- `UX-DENSITY-01` adds repeatable card/panel/toolbar rhythm for dense operational pages.
- `UX-REPORT-01` adds editorial readability for findings and report surfaces.

These are intentionally the first pretty-UI starter patterns, not a full design-system framework.


## Follow-on family candidates

Once the current interaction + pretty-UI starter family settles, the likely next UX-adjacent families are:
- design-system primitives and tokens;
- storybook/component workbench posture;
- CSS-system posture (utility-first, token-first component library, or hybrid);
- custom-component pressure for dense worklists, composite filters, report/readability surfaces, and review/diff panels.

These are intentionally not all first-class patterns yet. The current rule is:
- derive product and journey intent first;
- stabilize visual direction and shell rhythm second;
- add design-system/storybook/CSS/custom-component families only when `/caf ux build` proves repeated realization pressure.
