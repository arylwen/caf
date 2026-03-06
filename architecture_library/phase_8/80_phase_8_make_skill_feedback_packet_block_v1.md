# Phase 8 Make Skill Feedback Packet Block (v1)

## Purpose

Standardize an actionable, structured payload that can be embedded in a fail-closed feedback packet
whenever a Manager cannot cover required capabilities with the existing agent roster.

This block is designed so that `caf-make-skill` can consume it directly.

This standard complements (does not replace) the general feedback packet minimum fields:

- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md` (Section: “Feedback packet standard”)

## When to include

Include this block in a feedback packet when both of the following are true:

1) The execution plan cannot be produced because one or more Task Graph `required_capabilities` are not covered.
2) The missing capabilities can be satisfied by adding one or more worker skills (agents) without changing architect-owned intent.

Do not include this block when the real issue is missing or ambiguous intent.
In that case, fail-closed with an intent-focused feedback packet.

## Block name and parsing rule (normative)

Inside the feedback packet, include a section with this exact heading:

`## Proposed Make Skill Request (phase8_make_skill_request_v1)`

Immediately under that heading, include a single YAML code block that validates against:

- `architecture_library/phase_8/80_phase_8_make_skill_request_schema_v1.yaml`

The YAML block is the authoritative payload for `caf-make-skill`.

## Required contextual notes (normative)

When emitting this block:

- Populate `missing_capabilities` directly from the Task Graph.
- Populate `task_signatures` with only the minimal IO and acceptance checks needed to scaffold the worker.
- Copy constraints from the derived Layer 8 rails.
- Keep `create_runner_shims: false` by default (UX simplification).

## Example block (illustrative)

## Proposed Make Skill Request (phase8_make_skill_request_v1)

```yaml
schema_version: phase8_make_skill_request_v1
request_id: BP-20260113-missing_capabilities
created_at: "2026-01-13"
instance:
  instance_name: example-instance
  reference_architecture_path: reference_architectures/example-instance/
  companion_repo_target_path: companion_repositories/example-instance/profile_v1/
pins:
  lifecycle_evolution_stage: stage_0_local_prototype
  lifecycle_generation_phase: implementation_scaffolding
  platform_pins: local_podmancompose_py_fastapi_pg_v1
missing_capabilities:
  - domain_modeling
requested_workers:
  - proposed_worker_id: worker-domain-modeler
    role_kind: worker
    capabilities:
      - domain_modeling
constraints:
  allowed_artifact_classes:
    - code_runnable_candidate
    - tests_runnable_candidate
  allowed_write_paths:
    - companion_repositories/example-instance/profile_v1/
  forbidden_actions:
    - introduce_new_architecture_choices
task_signatures:
  - task_id: TG-010
    title: Define domain entity models
    required_capabilities:
      - domain_modeling
    inputs:
      - path: companion_repositories/example-instance/profile_v1/caf/application_spec_v1.md
        required: true
    definition_of_done:
      - "Domain models are defined for the adopted entities/aggregates from the application spec."
      - "Models are transport-free and avoid framework-specific coupling unless explicitly adopted by inputs/trace anchors."
      - "No placeholder tokens; candidate-quality scaffolding only."
    semantic_review:
      review_questions:
        - "Do model names and fields align with the application spec (no invented entities)?"
        - "Are models transport-free (no API boundary imports) and do they preserve separation of concerns?"
        - "Is tenant scoping represented in a consistent, non-ambiguous way (per adopted inputs), without inventing auth mechanisms?"
      severity_threshold: blocker
      focus_areas: [correctness, separation_of_concerns]
    trace_anchors:
      - pattern_id: VAL-01
        anchor_kind: plan_step_archetype
        anchor_ref: "Define domain invariants"
scaffolding_instructions:

  output_skill_root: skills
  worker_skill_manifest:
    required_sections:
      - "## Capabilities"
      - "## Inputs"
      - "## Outputs"
      - "## Acceptance Checks"
      - "## Fail-closed conditions"
  create_runner_shims: false
```

## Notes

- This block is intentionally structured (non-freeform) to preserve determinism.
- The request must not smuggle new architecture decisions. It must only scaffold missing execution capability.
