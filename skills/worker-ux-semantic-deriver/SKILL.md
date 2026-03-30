---
name: worker-ux-semantic-deriver
description: >
  Instruction-owned UX semantic derivation worker for CAF.
  Reads PRD/spec/design signals and writes a compact semantic packet that
  deterministic scripts later apply into ux_design_v1.md.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-ux-semantic-deriver

## Purpose

This worker owns **UX meaning**, not deterministic mechanics.

It exists to derive a compact semantic packet from product/spec/design signals so CAF can capture:
- primary product intent
- primary experience intent
- trust / clarity intent
- visual tone intent
- bounded core journeys
- coherent interaction surfaces
- UX-visible state/recovery posture
- touchpoints and constraints
- interface/contract pressures
- retrieval-facing pattern pressures

The worker must **not**:
- directly edit `ux_design_v1.md` managed blocks;
- hydrate architect-edit blocks;
- build the retrieval blob;
- run graph expansion or candidate retrieval;
- defer meaning back into script-authored prose.

## Invocation inputs

- `instance_name` (required)

## Required read set

Read these instance artifacts before deriving the packet:
- `reference_architectures/<instance_name>/product/PRD.resolved.md`
- `reference_architectures/<instance_name>/product/UX_VISION.md` when present
- `reference_architectures/<instance_name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<instance_name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<instance_name>/design/playbook/ux_design_v1.md`
- `architecture_library/phase_8/templates/application_spec_v1.template.md`
- `tools/caf/contracts/ux_semantic_derivation_packet_contract_v1.md`

Read when present and relevant:
- `reference_architectures/<instance_name>/product/PLATFORM_PRD.resolved.md`
- `reference_architectures/<instance_name>/design/playbook/application_design_v1.md`
- `reference_architectures/<instance_name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<instance_name>/design/playbook/contract_declarations_v1.yaml`

## Semantic posture

Treat these as hard rules:
- semantic = instruction-based derivation of intent
- deterministic scripts = apply, validate, dedupe, hydrate pointers, and build blobs
- do not pretend regex or keyword heuristics are semantic derivation
- keep the packet compact and directly useful downstream
- keep the smoke-test UI separate from the richer UX realization lane
- keep the current REST/OpenAPI UX-realization integration posture unless the architecture lane explicitly changed it

When `application_product_surface_v1.md` still matches the template starter text (and the legacy `ui_product_surface_v1` fallback is also default or absent), treat it as **non-authoritative** and do not let it steer product meaning.

## Output file

Write exactly one packet file:
- `reference_architectures/<instance_name>/design/playbook/ux_semantic_derivation_packet_v1.yaml`

The packet must conform to:
- `tools/caf/contracts/ux_semantic_derivation_packet_contract_v1.md`

## Output quality rules

1. **Compactness**
   - Bound the core journeys and surfaces to the few groups that materially shape planning and build.
   - Prefer 2 to 5 journeys and 2 to 5 surfaces unless the instance genuinely demands more.

2. **Consumer usefulness**
   - The packet should be usable directly by:
     - `derive_ux_semantic_projection_v1.mjs` for canonical UX artifact refresh,
     - `build_ux_retrieval_context_blob_v1.mjs` for retrieval framing,
     - `skills/worker-ux-planner/SKILL.md` for `/caf ux plan` task shaping.

3. **Grounding**
   - Ground the packet in the PRD/spec/design evidence you actually read.
   - Prefer the product's real domain nouns and actor labels.
   - Do not let starter-template UI prose override the PRD.

4. **No architecture drift**
   - Do not introduce new architecture choices.
   - Do not change backend contract style.
   - Do not pin final component libraries, CSS tools, or frontend stacks.

## Suggested derivation sequence

1. Identify the primary product job and the bounded primary UX realization story.
2. Separate primary operators from supporting/admin actors.
3. Collapse raw capabilities into compact journeys.
4. Group pages/routes into coherent surfaces rather than one surface per capability.
5. Derive visual/UX-realization posture from product intent and runtime rails.
6. Identify the UX-visible state/recovery posture.
7. Identify interface pressures the UX imposes on the existing REST/OpenAPI boundary.
8. Emit retrieval-facing pattern pressures tied to the compact journey/surface ids.

## Fail-closed rule

If the worker cannot derive a grounded packet from the available source artifacts, write a blocker feedback packet under:
- `reference_architectures/<instance_name>/feedback_packets/`

Do not replace the packet with filler prose or script-shaped placeholders.
