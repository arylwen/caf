# UX lane producer contract v1

**Owner:** `/caf ux` producer chain  
**Status:** 0.4.0 maintainer-facing producer contract

## Purpose

Define the ownership split for the canonical `/caf ux` lane so framework semantics live in the right layer.

## Canonical outputs

Primary outputs:
- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `reference_architectures/<instance>/design/playbook/ux_semantic_derivation_packet_v1.yaml`
- `reference_architectures/<instance>/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/<instance>/design/playbook/ux_visual_system_v1.md`

Secondary outputs may include CAF-managed candidate blocks and retrieval debug artifacts.

## Ownership split

### Deterministic scripts own
- materialization
- explicit structural extraction
- packet application into managed semantic blocks
- pointer hydration
- retrieval blob assembly
- prefilter/postprocess/gates
- rerun-safe dedupe and precedence mechanics

### Instruction-owned semantic worker owns
- product intent
- primary experience intent
- trust/clarity posture
- visual tone
- compact journey grouping
- compact surface grouping
- pattern pressures
- state/recovery meaning
- touchpoints/constraints meaning
- interface contract pressures

## End-to-end lane order

`/caf ux` should run in this order:
1. materialize canonical UX artifacts
2. refresh deterministic seed blocks
3. derive `ux_semantic_derivation_packet_v1.yaml`
4. apply packet into managed semantic blocks
5. hydrate architect pointers/non-destructive helper blocks
6. project the bounded visual-system/design-system plan
7. build retrieval blob and semantic shortlist
8. run semantic retrieval and grounded writeback
9. run retrieval postprocess/gate

## Architect-edit rule

Architect edits remain optional but authoritative.

The lane must not require a human promotion step before `ux_design_v1.md` becomes usable. At the same time, auto-hydrated pointer content is not equivalent to accepted human design.
