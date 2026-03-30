# Design handoff preflight boundary v1

Status: internal CAF contract / maintainer-facing guidance

## Purpose

This note records the **current fail-closed boundary** for the later `/caf arch` -> `/caf plan` handoff.

It exists to prevent two kinds of drift:

1. claiming that all later-design handoff surfaces already have pre-plan deterministic enforcement when they do not; and
2. weakening real handoff invariants by treating stable producer/validator pairs as merely advisory.

## Core rule

Promote a later-design handoff surface to **explicit fail-closed preflight** only when CAF already has a stable producer/validator chain for that surface.

That means at least one of the following is true:

- CAF has a deterministic materializer/scaffolder plus a deterministic coherence validator, or
- CAF has a stable canonical producer seam plus a deterministic schema/invariant validator that is already wired into the relevant lifecycle seam.

If that producer/validator chain does not exist yet, keep the surface documented as a future handoff expectation rather than inventing a premature fail-closed check.

## Currently safe fail-closed handoff surfaces

### 1) Planning payload bridge blocks

Canonical surfaces:

- `design/playbook/application_design_v1.md`
- `design/playbook/control_plane_design_v1.md`
- `CAF_MANAGED_BLOCK: planning_pattern_payload_v1`

Current deterministic chain:

- producer/materializer:
  - `tools/caf/materialize_planning_pattern_payload_v1.mjs`
- coherence validator:
  - `tools/caf/design_postgate_planning_coherence_v1.mjs`
- workflow posture:
  - expected to fail closed before `/caf plan` proceeds when the planning bridge is missing or malformed.

Current contract meaning:

- once the later `/caf arch` design derivation has emitted the design docs, the planning payload bridge is no longer advisory;
- `/caf plan` should consume it as a framework-owned bridge surface rather than ask the planner to infer or recreate it.

### 2) Conditional contract declarations registry

Canonical surface:

- `design/playbook/contract_declarations_v1.yaml`

Current deterministic chain:

- scaffold/normalization:
  - `tools/caf/scaffold_contract_declarations_v1.mjs`
- coherence validator:
  - `tools/caf/design_postgate_contract_declarations_coherence_v1.mjs`
- downstream schema/invariant validation:
  - `tools/caf/validate_instance_v1.mjs`

Current contract meaning:

- when the control-plane design contains a material CP↔AP contract section / choices block, the registry is materially expected;
- in that condition, missing or placeholder-like registry output should fail closed;
- when no material contract section is present, do not invent registry obligations that the design handoff did not declare.


### 3) Narrow plane integration contract choices block in `control_plane_design_v1.md`

Canonical surface:

- `design/playbook/control_plane_design_v1.md`
- `ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1`

Current producer/validator boundary:

- canonical producer seam:
  - `skills/caf-solution-architect/SKILL.md`
  - `architecture_library/phase_8/86_phase_8_plane_integration_contract_choices_schema_v1.yaml`
  - `architecture_library/phase_8/templates/plane_integration_contract_v1.template.md`
- deterministic design post-gate validator:
  - `tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs`
- deterministic plan/build validation:
  - `tools/caf/validate_instance_v1.mjs`
- deterministic downstream consumer:
  - `tools/caf/task_graph_contract_anchor_postprocess_v1.mjs`

Current contract meaning:

- the full control-plane design doc is not yet promoted as a dedicated fail-closed preflight surface;
- this narrow architect-edit block is promoted because planning/build consumers depend on its canonical CP runtime shape, AP runtime shape, and primary CP↔AP contract surface adoption;
- missing, unparsable, or non-canonical block content should fail closed once later design derivation is in scope.

### 4) Normalized plane domain-model YAML views

Canonical surfaces:

- `design/playbook/application_domain_model_v1.yaml`
- `design/playbook/system_domain_model_v1.yaml`

Current producer/validator boundary:

- canonical producer seam:
  - `skills/worker-domain-modeler/SKILL.md`
  - `architecture_library/phase_8/87a_phase_8_plane_domain_models_and_persistence_compilation_contract_v1.md`
  - `architecture_library/phase_8/87b_phase_8_plane_domain_model_schema_v1.yaml`
- deterministic design post-gate validator:
  - `tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs`
- deterministic plan/build validation:
  - `tools/caf/validate_instance_v1.mjs`

Current contract meaning:

- once the later `/caf arch` design derivation has emitted the normalized application/system plane views, they are no longer advisory companions;
- `/caf plan` and later gates may fail closed when either normalized view is missing, unparsable, or violates the canonical planning-facing contract;
- this promotion is intentionally narrow: it validates the canonical YAML handoff shape and planning-relevant invariants, not the full semantic quality of the source Markdown.

## Surfaces not yet promoted to explicit pre-plan fail-closed status

These surfaces matter, but this contract does **not** yet claim they have a dedicated pre-plan fail-closed producer/validator boundary:

- `design/playbook/control_plane_design_v1.md` as a whole document outside the promoted `plane_integration_contract_choices_v1` block
- `design/playbook/application_design_v1.md` outside the already-promoted planning payload bridge
- `design/playbook/design_summary_v1.md`

Why not:

- their existence and some downstream validity are already checked by broader validators,
- but CAF does not yet have a narrow, dedicated pre-plan deterministic coherence contract for each of them that is strong enough to justify new fail-closed gating without ambiguity.

Until that exists, treat these as:

- documented required handoff surfaces in lifecycle/roadmap notes, and
- candidates for future stricter preflight only after the producing seam is made equally deterministic.

### Strongest next narrow candidate (not yet ready)

The next likeliest narrow later-design surface is:

- `design/playbook/application_design_v1.md` → `ARCHITECT_EDIT_BLOCK: open_questions_v1`

Why it is **not** ready for promotion yet:

- repo-bundled examples still show incompatible shapes for the same block (`schema_version: open_questions_v1` with `open_questions: []`, older `version: 1` scaffolds with `questions: {}`, and newer topic-keyed mappings), so the producer shape is not yet stably canonical across the repo;
- `/caf plan` and later deterministic gates do not yet consume this block through a bounded parser/validator seam;
- the main canonical shape rule currently lives partly in `skills/caf-solution-architect/SKILL.md`, which is the wrong long-term ownership layer for a planning-facing handoff shape.

Current posture after the ownership fix:

1. the canonical block shape is library-owned;
2. CAF may surface non-empty `open_questions_v1` through a warning-only advisory checker so the later design handoff is visible to planning/build operators; that checker should enrich deferred-pattern warnings from the referenced pattern definitions themselves (intent/problem/consequences/human questions), not from a new seam-local mapping file;
3. only after planning/build has a bounded consumer for the block should CAF add the narrow parser/validator pair needed for fail-closed promotion.

## Maintainer guidance

When reviewing or adding a `/caf plan` preflight rule for later-design handoff:

1. identify the exact producing seam;
2. identify the deterministic producer and deterministic validator already in place;
3. only then promote the surface to fail-closed preflight;
4. if the chain is not present, patch the producer/validator boundary first or keep the note at roadmap/contract level.

## Non-goals

- Do not make `/caf plan` compensate for missing later-design work.
- Do not add worker-local lore to recreate bridge surfaces that CAF should have produced deterministically.
- Do not use this contract to justify a new public command surface.
