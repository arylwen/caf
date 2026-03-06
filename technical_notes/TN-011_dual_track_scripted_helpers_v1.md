# TN-011 — Dual-track scripted helpers (producer-side; optional)

## Goal

Reduce token cost for **mechanical** work ("LLM-as-script" chores) while preserving the stability of CAF’s **instruction-only** marketing workflow.

## Non-negotiables

- Instruction-only skills remain the **default** path used by:
  - `caf saas`, `caf arch`, `caf next`, `caf build`
- Scripted helpers are **producer-side only** and **opt-in**.
- Helpers MUST NOT introduce architecture decisions or bespoke inclusion logic.
- Helpers MUST NOT write under shipped instance outputs:
  - `reference_architectures/**`
  - `companion_repositories/**`

## Allowed helper categories

1) **Mechanical extraction**
   - Example: extract pins into a canonical bullet list; extract decision_resolutions entries.
2) **Surface linting**
   - Example: JSONL schema well-formedness; required fields present.
3) **Derived indexes**
   - Example: `pattern_id → (namespace, family, plane, definition_path)`.
4) **Deterministic prelists (filters only)**
   - Example: partition candidates by namespace and family, apply view profile filters.
   - The final ranking/selection remains semantic and grounded in the worker.

## Not allowed

- Final relevance ranking.
- Auto-adoption decisions.
- Encoding "if pin X then include pattern Y" logic.

## Where helper outputs should live

- Library-scoped derived artifacts (if committed):
  - `architecture_library/__meta/_derived/**`
- Ephemeral outputs (not committed):
  - `technical_notes/_scratch/**`

## Next step

If we proceed, start with a single helper that produces a deterministic index from the retrieval surface JSONL.
This reduces token cost (workers can reference the index instead of re-reading/parsing the full JSONL) without changing semantics.
