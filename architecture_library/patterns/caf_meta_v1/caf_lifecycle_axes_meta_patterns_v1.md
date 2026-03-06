# CAF Lifecycle Axes Meta-Patterns v1

This document consolidates the former `CAF-LIFE-*` entries that previously lived under:

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-LIFE-*.yaml`

These are **CAF meta-patterns** (framework lifecycle vocabulary and gating), not CAF **domain patterns**.

## Sources to reconcile (staleness alignment)

Before assuming any single artifact is authoritative, **flag discrepancies** and reconcile intentionally across:

- Lifecycle definitions (Phase 8): `architecture_library/phase_8/80_phase_8_agent_crew_model_v1.md` (and any lifecycle playbook sections)
- Guardrails resolved view rules: relevant `caf-guardrails` skill and documentation
- Skills and shims: `skills/` and `.codex/`
- Any runbooks/workflows: `.agent/workflows/`

If these sources disagree, treat it as **CAF drift**: record the mismatch and resolve explicitly.

## Meta-pattern LIFE-01: Two orthogonal axes

CAF lifecycle is modeled with two independent axes:

- `lifecycle.evolution_stage` (maturity / risk posture)
- `lifecycle.generation_phase` (run focus)

These are architect-owned pins (copied verbatim into Layer 8 resolved view).

## Meta-pattern LIFE-02: Pins are minimal; everything else is derived

Only the pinned knobs are human inputs for lifecycle. Everything else (rails, enforcement bars, runnable approvals) is derived.

## Meta-pattern LIFE-03: Phase gates behavior; stage gates trust

- Phase influences what artifacts may be generated and how “complete” they should be.
- Stage influences how strict rails/enforcement should be and what can be treated as safe.

## Meta-pattern LIFE-04: Branch only on Layer 8 resolved view

All orchestration decisions must branch on:

- `reference_architectures/<name>/layer_8/profile_parameters_resolved.yaml`

Avoid split-brain behavior between pinned inputs and resolved truth.

## Meta-pattern LIFE-05: Drift is explicit

If the enum sets, semantics, or gating rules change, update:

- Phase 8 docs
- skills in `skills/`
- shims in `.codex/`
…and flag discrepancies rather than assuming any file is authoritative.

