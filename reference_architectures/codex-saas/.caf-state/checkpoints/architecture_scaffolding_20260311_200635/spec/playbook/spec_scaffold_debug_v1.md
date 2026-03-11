# Spec Scaffold Debug (v1)

## Inputs read
- `reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

## CAF-managed blocks refreshed
- `system_spec_v1.md :: pinned_inputs_v1` (already populated; preserved)
- `system_spec_v1.md :: pin_value_explanations_v1` (script-populated; preserved)
- `system_spec_v1.md :: pin_derived_system_constraints_v1` (refreshed)
- `system_spec_v1.md :: tech_profile_explanations_v1` (refreshed)
- `application_spec_v1.md :: intent_derived_app_plane_constraints_v1` (refreshed)

## Architect-edit blocks present
- `system_spec_v1.md :: decision_resolutions_v1` -> present, default/empty (`decisions: []`)
- `system_spec_v1.md :: system_requirements_v1` -> present, starter content
- `system_spec_v1.md :: open_questions_v1` -> present, starter content
- `application_spec_v1.md :: ui_product_surface_v1` -> present, starter content
- `application_spec_v1.md :: decision_resolutions_v1` -> present, default/empty (`decisions: []`)
- `application_spec_v1.md :: domain_and_capabilities_v1` -> present, starter content
- `application_spec_v1.md :: open_questions_v1` -> present, starter content
- `application_spec_v1.md :: notes_and_constraints_v1` -> present, starter content

## Retrieval note
- This skill did not run pattern retrieval directly.
- Retrieval phase output is expected from the subsequent retriever run:
  - `reference_architectures/codex-saas/spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md`
  - `reference_architectures/codex-saas/spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md` (optional)
