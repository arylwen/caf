# TN-009 — Generic Derivation Cascade (v1)

## Purpose

Define a reusable, generic derivation pattern (“the cascade”) for CAF:

> build query corpus → semantic retrieve → rank/diversify → propose decisions + open questions → (human) resolve → next hop consumes resolutions

This enables traceable progression across hops:

- pins → specs
- specs → design
- design → plan
- plan → build
- build → code

All CAF outputs remain advisory; the human architect remains the final decision maker.

See also:

- `technical_notes/TN-012_promotions_and_obligations_v1.md` — how pattern promotions flow into planning and how obligations flow into tasks/build

---

## What exists today in this repo

### Pins → Specs playbook (implemented)

- Retrieval surface: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
- Retrieval owner: `skills/worker-pattern-retriever/SKILL.md` (default view: `arch_scaffolding`)

Outputs:

- `reference_architectures/<name>/layer_6/system_spec_v1.md` (block `caf_decision_pattern_candidates_v1`)
- `reference_architectures/<name>/layer_6/application_spec_v1.md` (block `caf_decision_pattern_candidates_v1`)

Templates define the candidate record format:

- `architecture_library/phase_8/templates/system_spec_v1.template.md`
- `architecture_library/phase_8/templates/application_spec_v1.template.md`

---

## The missing bridge (to unlock the cascade)

### Decision Resolutions registry (canonical Layer 6)

A derivation hop can propose candidates, but a downstream hop must not guess which were adopted.

Therefore, CAF introduces a canonical registry:

- `reference_architectures/<name>/layer_6/system_spec_v1.md` (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1)

Schema + template:

- (replaced by Human Signal Blocks Contract; resolutions live inside system_spec)
- (replaced by Human Signal Blocks Contract; resolutions live inside system_spec)

Rules:

- Only `status: adopt` is binding input to downstream hops.
- `status: defer` becomes open questions.
- `status: reject` is recorded but must not drive design/planning.
- Every entry must have at least one legitimacy anchor (decision checklist item, pattern requirement, TBP requirement, or Layer 8 rail).

---

## Hop B: Specs → Design (added)

Canonical retrieval substrate:

- `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
- View profile: `solution_architecture` (see `retrieval_view_profiles_v1.yaml`)

Primary producer:

- `skills/caf-solution-architect/SKILL.md`

Rules (fail-closed):

- Use only patterns present in `system_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`.
- Use only `status: adopt` entries in `system_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1` as binding inputs.
- If any adopted `pattern_id` cannot be found in the retrieval surface, STOP and write a feedback packet (do not guess).
- Design outputs MUST emit `CAF_MANAGED_BLOCK: decision_trace_v1` with anchors back to adopted decisions and the design sections they influenced.

---

## Traceability contract: Specs → Design

Design artifacts MUST include:

- `<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START --> ... <!-- CAF_MANAGED_BLOCK: decision_trace_v1 END -->`

This block lists adopted/deferred/rejected resolutions consumed from:

- `layer_6/system_spec_v1.md (decision_resolutions_v1 block)`

This enables an auditor to trace:
candidate hook → human resolution → design section.

---

## Where the state machine is updated

- `technical_notes/TN-005_phase_8_derivation_state_machine_working_v1.md`

A new working state `S3R` is introduced:

- “Decisions resolved enough for design (resolution registry present)”

---

## Next steps after this note (not implemented here)

1) Implement Hop C: Design → Plan (task graph compilation) via task archetype catalog + TBP role bindings.
2) Make Plan QA gate consume the same decision trace + contract declarations.
3) Extend cascade to build + candidate code, treating “generate runnable code” as an explicit decision gated by Layer 8 rails.
