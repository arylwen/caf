---
name: worker-ux-planner
description: >
  Instruction-owned UX planning worker for CAF.
  Reads ux_design_v1.md, ux_visual_system_v1.md, and the bounded UX retrieval
  blob to write ux_task_graph_v1.yaml under the Phase-8 task-graph schema.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-ux-planner

## Purpose

This worker owns the **semantic UX task graph** for `/caf ux plan`.

It exists so CAF does not rely on keyword-triggered script logic to decide:
- which UX tasks should exist,
- how they should be grouped,
- which dependencies matter,
- which inputs each task should carry,
- which UX pattern anchors and review questions should govern realization.

The worker must **not**:
- rewrite `ux_design_v1.md` or `ux_visual_system_v1.md`;
- project `ux_task_plan_v1.md` or `ux_task_backlog_v1.md`;
- generate candidate code;
- change runtime/API architecture choices already pinned upstream;
- invent a UX-only schema outside `phase8_task_graph_v1`.

## Invocation inputs

- `instance_name` (required)

## Required read set

Read these before writing the task graph:
- `reference_architectures/<instance_name>/design/playbook/ux_design_v1.md`
- `reference_architectures/<instance_name>/design/playbook/ux_visual_system_v1.md`
- `reference_architectures/<instance_name>/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/<instance_name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<instance_name>/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/<instance_name>/spec/playbook/application_spec_v1.md`
- `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- `tools/caf/contracts/ux_task_graph_semantic_contract_v1.md`
- `tools/caf/contracts/ux_plan_output_contract_v1.md`

Read when present and relevant:
- `reference_architectures/<instance_name>/design/playbook/application_design_v1.md`
- `reference_architectures/<instance_name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<instance_name>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<instance_name>/product/UX_VISION.md`

## Output file

Write exactly one semantic planning artifact:
- `reference_architectures/<instance_name>/design/playbook/ux_task_graph_v1.yaml`

The task graph must conform to:
- `phase8_task_graph_v1`
- `tools/caf/contracts/ux_task_graph_semantic_contract_v1.md`

## Planning posture

Treat these as hard rules:
- semantic = instruction-owned task existence, grouping, dependency shape, and trace anchors
- deterministic scripts = plan/backlog projection, validation, dispatch manifest generation, and wave-state derivation
- keep the smoke-test UI lane separate from the richer UX realization lane
- keep the current REST/OpenAPI contract posture unless upstream architecture files explicitly changed it
- do not rely on brittle heading regexes or keyword tie-breaks to choose worklist/detail surfaces
- prefer the selected semantic/manual UX content over starter-template UI prose
- preserve explicit primary actions and main surfaces declared in `application_product_surface_v1.md`
- when compression would hide a declared primary action or main surface, add a bounded follow-on task rather than pretending the default family still covers it

## Required bounded task families

The graph must include at least these bounded task ids:
- `UX-TG-00-ux-shell-and-visual-system`
- `UX-TG-10-rest-client-and-session-wiring`
- `UX-TG-20-primary-worklist-surface`
- `UX-TG-30-detail-review-report-surface`
- `UX-TG-90-ux-polish`
- `UX-TG-92-ux-service-packaging`
- `UX-TG-95-ux-operator-notes`

You may add bounded follow-on tasks only when the instance clearly needs them.
Do not delete or merge away the required bounded task families unless the contract is updated first.

## Allowed capabilities

Restrict the required capabilities in this lane to:
- `ux_frontend_realization`
- `ux_service_packaging_wiring`
- `repo_documentation`

Do not route UX realization tasks through smoke-test `ui_frontend_scaffolding`.

## Suggested planning sequence

1. Read the selected UX semantic/manual content and identify the primary UX realization story.
2. Read `application_product_surface_v1.md` and extract the explicit primary actions, main surfaces, and shell expectations that the richer UX lane must keep visible.
3. Decide the shell/foundation task around navigation, visual system, and shared state posture.
4. Decide the integration task around REST/session/tenant visibility and browser-side recovery.
5. Decide the main worklist surface task and the main detail/review/report surface task based on the actual UX surfaces and journeys.
6. Add a bounded follow-on task when declared product surfaces such as collections, published browsing, activity, or admin would otherwise be hidden inside an over-compressed worklist/detail pair.
7. Decide the late polish task from the visual-system and state/readability posture.
8. Decide the separate-UX-service packaging task from the current same-stack separate-container posture.
9. Decide the operator-notes task from the task graph and packaging reality.
10. Attach trace anchors and semantic review questions that match the selected UX patterns and preserved product actions.

## Fail-closed rule

If you cannot derive a grounded task graph from the required inputs, write a blocker feedback packet under:
- `reference_architectures/<instance_name>/feedback_packets/`

Do not fall back to a script-generated generic task graph.
