# Customization and extension

Common customization paths:

- Add or extend patterns in `architecture_library/patterns/`
- Add decision overlays for pattern families (questions/options)
- Add or refine retrieval surfaces and triggers
- Add new skills under `skills/` (and keep `skills_portable/` instruction-only)

## Recommended approach

1. Make the smallest possible change to the library or contract.
2. Rebuild any derived docs/indexes deterministically.
3. Run the relevant CAF gates on a small reference instance.

Keep changes deterministic and drift-resistant.
