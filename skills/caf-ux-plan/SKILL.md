---
name: caf-ux-plan
description: >
  First bounded UX planning proof. Produces an instruction-owned ux_task_graph_v1.yaml
  plus deterministic ux_task_plan_v1.md and ux_task_backlog_v1.md from the canonical UX artifacts
  while reusing the existing task-graph schema and task-plan/backlog posture.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.

# /caf ux plan

## Inputs

- instance_name (required)

## Purpose

`/caf ux plan` is the first bounded UX planning lane.

It owns exactly these concerns:
- read the canonical `design/playbook/ux_design_v1.md` artifact, the bounded `design/playbook/ux_visual_system_v1.md` plan, and the UX retrieval blob;
- invoke the instruction-owned UX planner that writes `ux_task_graph_v1.yaml`;
- project the deterministic UX task-plan and UX backlog views;
- stop before `/caf ux build`.

It must **not**:
- replace current `/caf plan`;
- rewrite `ux_design_v1.md` outside the deterministic producer-owned `/caf ux` lane;
- invent a UX-only planner schema or worker-routing vocabulary;
- generate frontend code.

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
    - `/caf ux plan <name>`

3) Required upstream inputs:
- `reference_architectures/<name>/design/playbook/ux_design_v1.md`
- `reference_architectures/<name>/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/<name>/design/playbook/ux_visual_system_v1.md`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- `tools/caf/contracts/ux_task_graph_semantic_contract_v1.md`

If any are missing:
- Write a blocker feedback packet and STOP.
- Minimal fix proposal: run `/caf ux <name>` first (and `/caf arch <name>` if the design bundle is not ready), then rerun `/caf ux plan <name>`.

## Semantic planning step (mandatory; fail-closed)

Invoke:

- `skills/worker-ux-planner/SKILL.md`

Rules:
- Do **not** replace this step with a script-authored task graph generator.
- The worker owns `ux_task_graph_v1.yaml` task existence, grouping, dependencies, and trace anchors.
- If the worker emits a blocker feedback packet, STOP and surface only the newest blocker.

## Deterministic post-plan projection (mandatory; fail-closed)

After the worker writes `ux_task_graph_v1.yaml`, run:

- `node tools/caf/ux_plan_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- Treat `/caf ux plan` as one ordered fence: preconditions first, then the instruction-owned semantic write, then the deterministic post-plan helper.
- Do **not** use sub-agents or parallel branches to overlap the semantic `ux_task_graph_v1.yaml` write with deterministic projection or gates.
- Wait until `ux_task_graph_v1.yaml` exists and is readable before starting the deterministic helper.
- This helper is now limited to deterministic projection + validation:
  - `ux_task_plan_v1.md`
  - `ux_task_backlog_v1.md`
  - `ux_task_graph_gate_v1.mjs`
- If it exits non-zero, STOP and surface only the printed feedback packet path or error.

## Completion message (required)

After a successful `/caf ux plan <name>` run, emit only a short next-step hint:

- Next step: inspect `design/playbook/ux_task_graph_v1.yaml`; the follow-on realization lane is `/caf ux build <name>`.
