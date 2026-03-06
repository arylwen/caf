# CAF Derivation Cascade Meta-Patterns (v1)

This document consolidates and replaces the former `CAF-DER-*` pattern definitions that previously lived under `architecture_library/patterns/caf_v1/definitions_v1/`.

These are **CAF meta-patterns** (framework behavior and artifact-derivation mechanics), not target-system architecture patterns.

## Sources to reconcile (flag discrepancies first)

CAF is iterating. Do **not** assume any single source is authoritative. When sources disagree, **flag the discrepancy first** and then reconcile intentionally.

Primary sources to reconcile:

- `skills/` (canonical skills)
- `.codex/` (Codex shims for skills)
- `.agent/workflows/` (agent runbooks)
- Phase 8 framework docs:
  - `architecture_library/phase_8/80_phase_8_agent_crew_model_v1.md`
  - `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`
- Layer 8 resolved view semantics (where documented) and any related technical notes.
- Feedback packet specs and examples in `feedback_packets/` (if present in companion repos).

## Core meta-pattern: Derive → Propose → Human resolve → Consume

CAF should follow a repeatable cascade at every hop:

1. **Derive**: build a query corpus and gather grounded inputs (pinned knobs + prior adopted signals + existing artifacts).
2. **Propose**: semantic retrieval + ranking produces candidate decisions / option sets / questions (non-binding).
3. **Human resolve**: architect edits only the allowed fields in `ARCHITECT_EDIT_BLOCK`s (flip statuses; optional rationale/pins).
4. **Consume**: downstream steps consume **only adopted** human signals; fail-closed if required signals are missing/ambiguous.

This is the same cascade described at a high level in Phase 8 docs; this document is the “why/how” consolidation that used to be fragmented across `CAF-DER-*`.

## Invariants (framework-level)

- **Fail-closed**: if required inputs are missing or ambiguous, stop and emit a feedback packet; do not guess.
- **No skill-owned inventories**: skills describe the mechanism; candidate inventories live in libraries (e.g., pattern option sets) and are emitted only when warranted.
- **Rerun-safe merges**:
  - `ARCHITECT_EDIT_BLOCK` is preserved verbatim.
  - `CAF_MANAGED_BLOCK` / `DESIGNER_MANAGED_BLOCK` can be regenerated non-destructively.
- **Resolved view is authoritative for branching**: operational decisions should branch on a resolved, derived view (e.g., Layer 8 resolved profile parameters) to avoid split-brain.
- **Evidence anchors**: every proposed candidate should include traceable anchors (pattern IDs, checklist IDs, spec refs).

## Practical guidance

### When to emit a decision/question vs nothing

Emit only when **warranted** by:

- an adopted pattern applicability signal, and/or
- a concrete boundary/resource in the spec/design, and/or
- an enforcement bar that requires a choice.

Otherwise leave the block empty (or include only a `custom` fallback option where the UX requires a choice).

### How to represent low-friction choices

Prefer option sets where the architect only flips `status: adopt`:

- options live in library-owned `caf.option_sets`
- doc embeds options as an `ARCHITECT_EDIT_BLOCK`
- downstream requires exactly-one-adopt when required

### Feedback packet ergonomics

When failing closed, feedback packets should:

- point to exact file path + block name + item id
- state the invariant violated (e.g., “exactly one adopt required”)
- show the minimal edit required by the human
