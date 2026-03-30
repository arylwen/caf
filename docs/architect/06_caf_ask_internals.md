# CAF ask internals (how question answering works)

CAF’s `/caf ask` is intentionally **mechanical**:

- it does *not* reason about your architecture
- it classifies question intent and assembles the smallest stable context pack

![CAF two retrieval surfaces](../images/caf_two_retrieval_surfaces.svg)

*`/caf ask` works across CAF’s two retrieval surfaces: reusable architecture knowledge and compact instance-specific context packs derived from the current state.*

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

## Find out more

[Patterns to obligations to tasks](07_patterns_to_obligations_to_tasks.md) — Follow how the ask context ultimately ties back to adopted patterns and downstream work.

## You might also be interested in

- [Gates and fail-closed](08_gates_and_fail_closed.md) — See how CAF stops progression when the required evidence for an answer or downstream step is missing.
- [Architect workflows](10_architect_workflows.md) — Apply the ask surfaces in the main architect-facing review loops.
- [Maintainer command surfaces and routing](../maintainer/05_command_surfaces_and_routing.md) — Connect the architect-facing ask behavior to the maintainer-owned routing surface.
