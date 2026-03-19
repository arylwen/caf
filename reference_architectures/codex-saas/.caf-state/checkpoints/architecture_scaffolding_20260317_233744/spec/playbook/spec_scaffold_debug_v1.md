# Spec Scaffold Debug (v1)

## Inputs Read
- reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

## CAF-Managed Blocks Refreshed
- system_spec_v1.md :: pinned_inputs_v1 (script-owned, already populated)
- system_spec_v1.md :: pin_value_explanations_v1 (script-owned, already populated)
- system_spec_v1.md :: pin_derived_system_constraints_v1 (updated)
- system_spec_v1.md :: tech_profile_explanations_v1 (updated)
- application_spec_v1.md :: intent_derived_app_plane_constraints_v1 (updated)

## Architect-Edit Blocks Presence / Default Signal
- system_spec_v1.md :: decision_resolutions_v1 -> present, default/empty (`decisions: []`)
- system_spec_v1.md :: system_requirements_v1 -> present, starter content present
- system_spec_v1.md :: open_questions_v1 -> present, starter content present
- application_spec_v1.md :: ui_product_surface_v1 -> present, starter content present
- application_spec_v1.md :: decision_resolutions_v1 -> present, default/empty (`decisions: []`)
- application_spec_v1.md :: domain_and_capabilities_v1 -> present, starter content present
- application_spec_v1.md :: open_questions_v1 -> present, starter content present
- application_spec_v1.md :: notes_and_constraints_v1 -> present, starter content present

## Retrieval Note
- This skill does not run retrieval directly.
- `/caf arch` invokes `worker-pattern-retriever-arch-scaffolding` after this step.
- Retrieval context blob path: reference_architectures/codex-saas/spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md
- Retrieval debug path (optional): reference_architectures/codex-saas/spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md
