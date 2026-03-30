---
name: caf-ux
description: >
  Bounded UX derivation command. Materializes the canonical UX artifact,
  runs instruction-owned semantic UX derivation through a packet seam,
  then runs the same retrieval discipline as the other CAF lanes for profile=ux_design,
  and writes grounded candidates back into ux_design_v1.md. Stops before /caf ux plan.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf ux

## Inputs

- instance_name (required)

## Purpose

`/caf ux` is the bounded UX derivation lane.

It owns exactly these concerns:
- materialize or refresh `design/playbook/ux_design_v1.md` and `design/playbook/ux_visual_system_v1.md`;
- derive deterministic PRD/spec seed content into CAF-managed `caf_ux_*_seed_v1` blocks;
- derive instruction-owned UX semantics into `design/playbook/ux_semantic_derivation_packet_v1.yaml`;
- apply that packet into CAF-managed semantic projection blocks inside `ux_design_v1.md`;
- hydrate compact architect-override pointers rather than full copied payload;
- build `design/playbook/retrieval_context_blob_ux_design_v1.md`;
- run the same retrieval discipline CAF already uses elsewhere (`blob -> shortlist -> graph expansion -> grounded writeback -> gate`) using `profile=ux_design`;
- write grounded candidates back into `CAF_MANAGED_BLOCK: caf_ux_pattern_candidates_v1` inside the canonical UX artifact.

It must **not**:
- emit `/caf ux plan` outputs;
- generate frontend code;
- replace the current smoke-test UI lane;
- invent a UX-only retrieval shortcut;
- treat deterministic scripts as the owner of PM/experience/visual meaning.

## Preconditions (fail-closed)

1) Read:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml:lifecycle.generation_phase`

2) Phase gate:
- If `generation_phase == architecture_scaffolding`:
  - Write a blocker feedback packet and STOP.
  - Minimal fix proposal:
    - `/caf next <name> apply`
    - `/caf arch <name>`
    - `/caf ux <name>`

3) Required upstream inputs:
- `reference_architectures/<name>/product/PRD.resolved.md`
- `reference_architectures/<name>/product/UX_VISION.md` (expected for newly seeded instances; older instances may lack it)
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `architecture_library/phase_8/templates/ux_design_v1.template.md`

If any are missing:
- Write a blocker feedback packet and STOP.
- Minimal fix proposal: restore the missing producer-owned artifact(s), rerun `/caf arch <name>` if needed, then rerun `/caf ux <name>`.

## Deterministic pre-stage (mandatory; fail-closed)

Run:
- `node tools/caf/ux_preflight_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- This helper owns boring mechanics only:
  - `ux_design_v1.md` materialization/refresh
  - deterministic seed derivation from explicit PRD/spec surfaces
- It must **not** own PM intent, hero journey grouping, visual tone, or pretty-UI meaning.
- If it exits non-zero, STOP and surface only the printed feedback packet path or error.

## UX semantic derivation owner (mandatory)

Invoke:
- `skills/worker-ux-semantic-deriver/SKILL.md`

This worker must:
- read the bounded PRD/spec/design input set defined by the worker contract;
- write `reference_architectures/<instance_name>/design/playbook/ux_semantic_derivation_packet_v1.yaml`;
- keep the semantic packet compact, consumer-facing, and suitable for direct application into `ux_design_v1.md`.

If the worker cannot produce the packet, FAIL-CLOSED with a feedback packet.

## Deterministic retrieval pre-stage (mandatory; fail-closed)

Run:
- `node tools/caf/ux_retrieval_preflight_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- This helper applies the instruction-owned semantic packet into the managed semantic blocks, hydrates compact architect pointers, builds the UX retrieval blob, and refreshes the bounded semantic subset prefilter.
- If it exits non-zero, STOP and surface only the printed feedback packet path or error.

## Semantic retrieval owner (mandatory)

Invoke:
- `skills/worker-pattern-retriever-ux-design/SKILL.md`

Packet handling:
- If any new feedback packet has `Severity: blocker`, STOP and surface the newest blocker.
- If only advisory packets are produced, DO NOT STOP.

## Completion message (required)

After a successful `/caf ux <name>` run, emit only a short next-step hint:

- Next step: inspect `design/playbook/ux_design_v1.md`; if you want bounded UX task shaping next, the follow-on lane is `/caf ux plan <name>`.
