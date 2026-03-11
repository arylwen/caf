# Pattern browser

CAF patterns are meant to be **browseable** outside of any single run, so you can answer:

- “What family should I look at for this concern?”
- “What does this pattern usually depend on?”
- “What other patterns does this refine/complement?”

![CAF two retrieval surfaces](../images/caf_two_retrieval_surfaces.svg)

*The pattern browser is one of CAF’s two retrieval surfaces: reusable architecture knowledge that can be explored before or outside a specific instance run.*

## Recommended browsing flow

1. Start with the **family taxonomy**:
   - [`docs/patterns/pattern_taxonomy_v1.md`](../patterns/pattern_taxonomy_v1.md)
2. Use the **per-family graphs** to see shape and dependencies:
   - e.g. `docs/patterns/pattern_graph_IAM_v1.md`, `docs/patterns/pattern_graph_POL_v1.md`
3. Use the **offline browser** for fast search + drill-down:
   - [`docs/patterns/pattern_browser_v1.html`](../patterns/pattern_browser_v1.html)

## Pattern browser file (why HTML)

The HTML browser is intentionally:

- **static** (no server, no build system)
- **deterministic** (generated from `docs/pattern_index_v1.json`)
- **drift-resistant** (no external JS dependencies)

It’s meant to complement (not replace) the GitHub-friendly Mermaid graph pages.

## Regenerating indexes/graphs

If you update patterns as a maintainer, rebuild the derived docs deterministically:

```text
node tools/caf-meta/build_pattern_docs_v1.mjs
```

This regenerates:

- `docs/pattern_index_v1.json`
- `docs/patterns/pattern_taxonomy_v1.md`
- `docs/patterns/pattern_graph_*_v1.md`
- `docs/patterns/pattern_browser_v1.html`

## Using patterns as a PM

If you are reviewing scope or risks, pattern families are a good way to anchor conversations (IAM, POL, MTEN, Observability, Delivery).

Ask: *Which families are we adopting, and what obligations do they imply?*
