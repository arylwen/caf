# Spec Scaffold Debug (v1)

## Inputs read
- reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters.yaml
- reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

## CAF-managed blocks refreshed
- system_spec_v1.md :: pinned_inputs_v1 (preserved)
- system_spec_v1.md :: pin_derived_system_constraints_v1 (updated)
- system_spec_v1.md :: tech_profile_explanations_v1 (updated)
- application_spec_v1.md :: intent_derived_app_plane_constraints_v1 (updated)

## Architect-edit block presence/default scan
- system_spec_v1.md :: decision_resolutions_v1 (present; default/empty)
- system_spec_v1.md :: system_requirements_v1 (present; starter content)
- system_spec_v1.md :: open_questions_v1 (present; starter content)
- application_spec_v1.md :: decision_resolutions_v1 (present; default/empty)
- application_spec_v1.md :: domain_and_resources_v1 (present; starter scaffold)
- application_spec_v1.md :: open_questions_v1 (present; starter scaffold)
- application_spec_v1.md :: notes_and_constraints_v1 (present; starter scaffold)

## Retrieval note
- This skill does not run pattern retrieval.
- In architecture_scaffolding, `/caf arch` invokes worker-pattern-retriever-arch-scaffolding after this step.
- Retrieval context path: reference_architectures/codex-saas/spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md
- Retrieval debug path (script-owned): reference_architectures/codex-saas/spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md