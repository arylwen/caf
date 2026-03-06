# Customization surfaces (architect-facing)

Architect customization is about **bounded variability**.

## Customization layers

1) Pins and playbook blocks (instance-scoped)
- `spec/playbook/*_spec_v1.md`
- `spec/playbook/architecture_shape_parameters.yaml`

2) Profile parameters (instance-scoped; resolved into guardrails)
- `spec/guardrails/profile_parameters_resolved.yaml` (optional)

3) Pattern adoption + decision options (instance-scoped)
- decision scaffolds + `decision_resolutions_v1`

4) Architecture library (repo-scoped; high scrutiny)
- `architecture_library/`

## Guardrails

- Prefer deterministic transformations (scripts) for mechanical work.
- Keep `skills_portable/` instruction-only.
- Avoid adding new “magic defaults”; require explicit pins when needed.

See also:

- `docs/user/09_customization_and_extension.md`
- `docs/user/13_profile_parameters_configuration.md`
- `technical_notes/TN-008_pattern_library_workflow_v1.md`
