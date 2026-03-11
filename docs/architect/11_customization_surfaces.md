# Customization surfaces (architect-facing)

Architect customization is about **bounded variability**.

## Customization layers

1. PRD and lifecycle-shape source surfaces (instance-scoped)

   - `product/PRD.md`
   - `product/PLATFORM_PRD.md`
   - `spec/playbook/architecture_shape_parameters.yaml`

2. Pins and playbook blocks (instance-scoped)

   - `spec/playbook/*_spec_v1.md`

3. Profile parameters (instance-scoped; resolved into guardrails)

   - `spec/guardrails/profile_parameters_resolved.yaml` (derived)

4. Pattern adoption + decision options (instance-scoped)

   - decision scaffolds + `decision_resolutions_v1`

5. Architecture library (repo-scoped; high scrutiny)

   - `architecture_library/`

## Shape lifecycle provenance

CAF now distinguishes the authoritative shape file by lifecycle status under `meta.lifecycle_shape_status`:

- `seeded_template_default`
- `prd_promoted`
- `architect_curated`

Practical rule:

- do not treat a seeded template default as architecture-scaffolding-ready
- either run `/caf prd` and accept the promoted shape, or
- manually curate the authoritative shape and mark it `architect_curated`

## Guardrails

- Prefer deterministic transformations (scripts) for mechanical work.
- Keep `skills_portable/` instruction-only.
- Avoid adding new “magic defaults”; require explicit pins when needed.
- Keep rationale in sidecars/source docs rather than collapsing it into the authoritative binding file.

See also:

- `docs/user/09_customization_and_extension.md`
- `docs/user/13_profile_parameters_configuration.md`
- `docs/architect/10_architect_workflows.md`
- `docs/maintainer/04_pattern_library_workflow.md`
