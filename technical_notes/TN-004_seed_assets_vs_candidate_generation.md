# TN-004 — Library assets vs generated candidate outputs (Phase 8)

## Purpose

CAF Phase 8 is **guardrails-first**. This note prevents drift back into “template codegen” by
clearly separating:

1) **Producer-owned library assets** (static, normative, shipped with CAF), from
2) **Generated candidate outputs** (instance-specific files produced by skills under rails + bars).

This is about *where decisions live* and *what is allowed to be copied verbatim*.

## Current posture (this CAF version)

- CAF does **not** use “prompt packs” for generation.
- CAF does **not** seed runnable applications by copying a static code bundle.
- Any stable scaffolding lives as **library assets** (TBPs/PBPs/templates) and is used only as:
  - planner/worker **inputs**, or
  - **non-runnable** scaffolding copied into a companion repo when explicitly required by a binding pattern.

## Definitions

### A) Producer-owned library assets (static)

Examples:

- Pattern definitions and trigger playbooks under `architecture_library/patterns/**`
- Technology Binding Patterns (TBPs) under `architecture_library/phase_8/tbp/**`
- Plane Binding Patterns (PBPs) under `architecture_library/phase_8/pbp/**`
- Document templates under `architecture_library/phase_8/templates/**`

Rules:

- Library assets are **authoritative inputs** and may be copied verbatim **only** when the TBP/PBP
  explicitly declares a copy step (and only into allowed write paths).
- Library assets must be **instance-agnostic** (no hard-coded instance names, no hard-coded local paths).

### B) “Seed assets” (reserved concept)

The name “seed assets” is reserved for a future optional UX that would copy a small,
**non-runnable** starter bundle (examples: README scaffolding, conventions, static diagrams).

Hard rule (if seed assets ever exist):

- Seed assets MUST NOT include runnable application code, Dockerfiles/compose stacks, or deployable
  infrastructure. Those remain **candidate outputs**.

### C) Generated candidate outputs (instance-specific)

Instance outputs are authored by the model (or a future generator) under CAF constraints.

Examples (depending on stage/phase and enforcement bar):

- Companion repo code under `companion_repositories/<instance>/.../code/**`
- Tests, docs, validation artifacts required by the enforcement bar

Rules:

- Candidate outputs must be **grounded** in the instance artifacts (pins/spec/design/task graph) and TBP/PBP
  constraints.
- Candidate outputs are always **CANDIDATE** (never production claims by default).

## Drift risks this note prevents

If we accidentally ship static runnable code bundles inside the CAF repo:

- We mask model differences (everything looks “generated” but is actually copied).
- We create silent coupling between tech profiles and hidden templates.
- We increase the chance that future “cleanup” commits delete critical scaffolds.

## Recommended drift-eval checks (producer-side)

If/when implemented, drift-eval-caf should treat as ship blockers:

- Any “runnable scaffold” files living in the CAF repo under `architecture_library/**` (except strictly-doc examples).
- Any TBP/PBP/template that hard-codes instance paths or names.
- Any adapter shim that performs destructive git actions.

See: `technical_notes/TN-010_caf_advancement_roadmap_v1.md` for the current cleanup and
guardrail plan.
