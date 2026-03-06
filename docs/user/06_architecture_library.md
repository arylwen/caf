# Architecture library

The `architecture_library/` folder is the normative corpus CAF uses for retrieval and decision overlays.

It contains:

- pattern catalogs and standards
- schemas and contracts
- validation guides

## What you should change (and what you shouldn’t)

- If you are *using* CAF: treat the library as read-only.
- If you are *maintaining* CAF: prefer mechanical, deterministic maintenance scripts under `tools/caf-meta/`.

If you modify library content, prefer deterministic maintenance scripts under `tools/caf-meta/`.

See also:

- `docs/patterns/pattern_taxonomy_v1.md` (GitHub-friendly family browsing + how to ask your assistant)
- `docs/pattern_index_v1.json` (machine-friendly pattern index)

## Keeping derived docs in sync

Pattern graphs + the JSON index are generated deterministically:

```text
node tools/caf-meta/build_pattern_docs_v1.mjs
```
