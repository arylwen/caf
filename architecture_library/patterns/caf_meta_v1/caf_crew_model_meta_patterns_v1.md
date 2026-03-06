# CAF Crew Model Meta-Patterns v1

This document consolidates the former `CAF-CREW-*` entries that previously lived under:

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-CREW-*.yaml`

These are **CAF meta-patterns** (framework orchestration, roles, and fail-closed loop structure), not CAF **domain patterns**.

## Sources to reconcile (staleness alignment)

Before making any source “authoritative,” **flag discrepancies** and reconcile intentionally across:

- Crew model (Phase 8): `architecture_library/phase_8/80_phase_8_agent_crew_model_v1.md`
- Human-signal contract: `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`
- System/app designer skills: `skills/` (and shims under `.codex/`)
- Any runbooks/workflows: `.agent/workflows/`

If these sources disagree, treat it as **CAF drift**: record the mismatch and resolve it explicitly.

## Meta-pattern CREW-01: Deterministic, fail-closed loop

- Build a query corpus → semantic retrieve → rank/diversify → propose candidates/open questions → human resolves → downstream consumes **only adopted** signals.
- Fail-closed whenever required inputs or signals are missing/ambiguous.

Primary reference: `architecture_library/phase_8/80_phase_8_agent_crew_model_v1.md`.

## Meta-pattern CREW-02: Role separation and decision boundaries

Crew roles are defined to prevent hidden decisions:

- **Solution Architect** proposes candidates and open questions; does not “decide.”
- **Application Architect** compiles an executable plan (task graph) from adopted signals; fails-closed if signals are missing.
- **Workers** implement within rails (Layer 8), using selected TBPs when applicable.

## Meta-pattern CREW-03: “No duplicate homes” for human decisions

If a dedicated architect-edit block exists for a decision (e.g., Plane Integration Contract choices/open questions), do **not** emit a parallel decision inventory elsewhere. One decision → one home.

## Meta-pattern CREW-04: Shims must not change semantics

`.codex/` and `.agent/` are shims for `skills/`. They must not introduce new decisions, new permissions constraints, or alternate command surfaces. Drift should be flagged and resolved, not silently accepted.

## Meta-pattern CREW-05: Rerun-safety

- `ARCHITECT_EDIT_BLOCK`s are preserved verbatim.
- `DESIGNER_MANAGED_BLOCK`s and `CAF_MANAGED_BLOCK`s may be regenerated.
- Planning/build steps must be safe to rerun after the architect flips statuses.

## Drift notes

When you update any of the above rules, update the Phase 8 docs **and** any affected skills/shims together to keep the system coherent.
