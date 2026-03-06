# CAF ask internals (how question answering works)

CAF’s `/caf ask` is intentionally **mechanical**:

- it does *not* reason about your architecture
- it classifies question intent and assembles the smallest stable context pack

Implementation:

- `tools/caf/ask_v1.mjs`

## Intent categories

CAF classifies questions into one of:

- `feature_summary`
- `decision_visibility`
- `work_visibility`
- `impact_assessment`

The three architect targets map to the last three.

## What `/caf ask` includes (by intent)

### Decision visibility

- `spec/playbook/application_spec_v1.md`
- `spec/playbook/system_spec_v1.md`
- latest `pattern_candidate_selection_report_*_v1.md`
- latest `*traceability_mindmap_v3*.md`

### Work visibility / Impact assessment

Prefers compact TSV indexes (generated if missing):

- `design/playbook/pattern_obligations_index_v1.tsv`
- `design/playbook/task_graph_index_v1.tsv`

Plus (when present):

- `design/playbook/task_backlog_v1.md`

## Where the pack is written

- `reference_architectures/<instance>/spec/caf_meta/ask_context_v1.md` (spec phase)
- `reference_architectures/<instance>/design/caf_meta/ask_context_v1.md` (design phase)

## Extending ask (architect-facing)

If you add a new question class, do it in a drift-resistant way:

- add a new intent category
- keep selection rules deterministic
- include only bounded artifacts (or capped excerpts)

This keeps the token footprint predictable while maintaining answer quality.
