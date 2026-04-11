# Spec Scaffold Debug (v1)

## Inputs read

- `reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

## CAF-managed blocks refreshed

- `system_spec_v1.md`:
  - `pinned_inputs_v1`
  - `pin_value_explanations_v1`
  - `pin_derived_system_constraints_v1`
  - `tech_profile_explanations_v1`
- `application_spec_v1.md`:
  - `intent_derived_app_plane_constraints_v1`

## Architect-edit blocks present / default status

- `system_spec_v1.md`
  - `decision_resolutions_v1`: present, default-empty (`decisions: []`)
  - `system_requirements_v1`: present, starter content
  - `open_questions_v1`: present, starter content
- `application_spec_v1.md`
  - `decision_resolutions_v1`: present, default-empty (`decisions: []`)
  - `domain_and_resources_v1`: present, starter guidance
  - `open_questions_v1`: present, mostly empty
  - `notes_and_constraints_v1`: present, mostly empty

## Retrieval handoff note

This step does not perform pattern retrieval. `/caf arch` continues with `worker-pattern-retriever-arch-scaffolding`.
Expected retrieval diagnostics path after retriever run:
- `reference_architectures/codex-saas/spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md`
