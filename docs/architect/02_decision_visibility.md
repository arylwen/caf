# Decisions: what we decided, and why

This doc targets question (1): **“What architecture decisions did we make, and why?”**

CAF models “decisions” as:

- **pins** (explicit architerctural intent) + **patterns** (explicit options) + **decision options** (bounded choices)

## How CAF answers (high level)

1) You provide intent (PRD, architectural intent pins, technology profile parameters).
2) CAF retrieves **candidate patterns** (semantic step) and records grounded evidence.
3) CAF gates the result (deterministic) and materializes a stable architectural decision set scaffold.
4) The architect **adopts / defers / rejects** patterns and selects options for decision patterns.
5) CAF extracts adopted options and promotes them into obligations.

## Primary UX surface

- `/caf ask <question about decisions>`
  - intent: `decision_visibility`
  - context pack: `reference_architectures/<instance>/{spec|design}/caf_meta/ask_context_v1.md`

## What to read (manual)

From the ask context pack, the decision answer typically comes from:

- `spec/playbook/system_spec_v1.md`
- `spec/playbook/application_spec_v1.md`
- `spec|design/caf_meta/pattern_candidate_selection_report_*_v1.md`
- `spec|design/caf_meta/*traceability_mindmap_v3*.md`

And (when present):

- `spec/playbook/decision_resolutions_v1.md` (or the CAF-managed decision section inside the specs)

## “Why” capture: what counts as rationale

CAF’s deterministic posture is:

- “Why” is **traceable text**, not inferred intent.

Recommended places to capture rationale (bounded, drift-resistant):

- pin descriptions (in spec playbooks)
- adopted pattern bullets (“adopt because …”)
- decision option selection notes (for `caf.kind: decision_pattern`)

## Deterministic helpers (mechanical)

These scripts don’t choose decisions; they only **expose / validate** them:

- `tools/caf/ask_v1.mjs` — builds the ask context pack
- `tools/caf/analyze_decisions_v1.mjs` — checks decision invariants (1 adopted option, etc.)
- `tools/caf/extract_adopted_decision_options_v1.mjs` — extracts adopted options for diagnostics
- `tools/caf/worker_traceability_mindmap_v3.mjs` — pins/atoms → patterns mapping from grounded evidence

## Common failure modes

- No candidate report / mindmap exists → you haven’t run `/caf arch <instance>` yet.
- “Adopted decision pattern has 0 or >1 adopted option” → decision option invariant broken; run `analyze_decisions_v1.mjs`.
- Drift between spec and design → re-run the deterministic postprocess chain (`retrieval_postprocess_v1.mjs`).

## Checklist

- [ ] Confirm you have the latest `pattern_candidate_selection_report_*` and traceability mindmap
- [ ] Confirm decision patterns have exactly 1 adopted option
- [ ] Capture “why” only in bounded, explicit fields (no freeform novels)
- [ ] Re-run `/caf arch` after changes to pins or decision selections
