# UX task graph semantic contract v1

**Owner:** `skills/worker-ux-planner/SKILL.md`  
**Status:** adopted 0.4.0 contract for instruction-owned `/caf ux plan` task shaping

## Purpose

Define the semantic planning seam for `/caf ux plan`.

This contract exists so:
- `ux_task_graph_v1.yaml` is planner-owned rather than script-authored;
- deterministic scripts stay limited to projection, validation, dispatch, and wave mechanics;
- the UX lane reuses the existing `phase8_task_graph_v1` schema without inheriting platform-planner assumptions about which UX surfaces matter.

## Canonical output

- `reference_architectures/<instance>/design/playbook/ux_task_graph_v1.yaml`

## Canonical inputs

Required:
- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `reference_architectures/<instance>/design/playbook/ux_visual_system_v1.md`
- `reference_architectures/<instance>/design/playbook/retrieval_context_blob_ux_design_v1.md`
- `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<instance>/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/<instance>/spec/playbook/application_spec_v1.md` (legacy fallback only)
- `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

Optional/contextual:
- `reference_architectures/<instance>/design/playbook/application_design_v1.md`
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<instance>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<instance>/product/UX_VISION.md`

## Ownership rule

The semantic worker owns:
- task existence in `ux_task_graph_v1.yaml`
- task grouping and titles
- dependency shape
- per-task input selection
- per-task trace anchors
- per-task review focus and semantic questions
- the choice of which UX surfaces and journeys become bounded realization tasks

Deterministic scripts may own only:
- `ux_task_plan_v1.md`
- `ux_task_backlog_v1.md`
- `ux_task_graph_v1.yaml` validation
- `ux_build_dispatch_manifest_v1.md`
- `ux_build_wave_state_v1.json`

## Required bounded inventory

The graph must include at least these required task ids:
- `UX-TG-00-ux-shell-and-visual-system`
- `UX-TG-10-rest-client-and-session-wiring`
- `UX-TG-20-primary-worklist-surface`
- `UX-TG-30-detail-review-report-surface`
- `UX-TG-90-ux-polish`
- `UX-TG-92-ux-service-packaging`
- `UX-TG-95-ux-operator-notes`

Additional bounded tasks are allowed when clearly grounded.
When the declared product surface includes explicit primary actions or main surfaces that cannot be honestly realized inside the default bounded families, the planner should add a bounded follow-on task rather than silently compressing those actions away.

## Primary-action preservation rule

`reference_architectures/<instance>/spec/playbook/application_product_surface_v1.md` is authoritative for explicit UX-facing primary actions, main surfaces, and shell expectations.

The planner must preserve those declarations through task shaping:
- Every explicit primary action should appear in at least one bounded task through task steps, DoD lines, or semantic review questions.
- Every declared main surface should either map to a bounded realization task or be explicitly called out as deferred through blocker feedback.
- Shell expectations that keep primary actions visible (for example, "create widget" or "publish" remaining one click away) must not disappear during compression.

Do not emit a task graph whose wording sounds complete while the declared product actions have no realizable owner.

## Operator-note truthfulness rule

When the graph includes `UX-TG-95-ux-operator-notes`, the intended operator notes must remain truthful to the bounded richer UX runtime posture:
- do not shape the task so its natural completion would instruct humans to use controls that the bounded UX lane does not actually realize;
- prefer explicit fixed-posture wording (for example a fixed demo persona) over aspirational instructions about selectors, retry controls, membership review panels, or publish confirmations that are not part of the current build;
- when a desired validation step depends on a not-yet-realized flow, that gap should be deferred explicitly or surfaced through blocker feedback rather than hidden inside optimistic notes.

## Capability rule

Allowed required capabilities for this lane:
- `ux_frontend_realization`
- `ux_service_packaging_wiring`
- `repo_documentation`

`ui_frontend_scaffolding` remains reserved for the smoke-test UI lane.

## Input-selection rule

Within `ux_design_v1.md`, planning should prefer selected semantic/manual content in this order:
1. manual architect override
2. semantic projection block
3. deterministic seed fallback

Do not depend on copied architect hydration text or raw heading regexes as the semantic source of truth.

## Non-goals

This contract is not:
- a new planner schema;
- a code-generation contract;
- permission to bypass `/caf build` before `/caf ux build`;
- permission to replace the smoke-test UI lane.
