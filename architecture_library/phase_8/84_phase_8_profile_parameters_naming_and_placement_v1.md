# Phase 8 Profile Parameters — Canonical Instance Path and Naming (v1)

## Canonical instance file (architect-authored)

The architect MUST provide exactly one Phase 8 UX input file for a reference architecture instance:

- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

This file is seeded by CAF init workflows from a Phase 8 profile template pack:

- `architecture_library/phase_8/profile_templates/<profile_template_id>/profile_parameters_template_v1.yaml`

and must validate structurally against:

- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

## What this replaces (deprecated instance inputs)

The following instance inputs are deprecated and MUST NOT be required once `profile_parameters.yaml` is adopted:

- `reference_architectures/<name>/spec/guardrails/platform.yaml` (replaced by profile_parameters.yaml.platform.*)
- `reference_architectures/<name>/spec/guardrails/lifecycle_constraints.md` as an architect input (replaced by profile_parameters.yaml.lifecycle.*)

## Generated views (assistant-produced)

For review friendliness and enforcement determinism, the system MAY generate read-only views derived from `profile_parameters.yaml`.
These are not architect inputs and must be safely regenerable:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/syntactic_checks.md` (optional)

If these views exist, validators and skills MUST treat them as derived artifacts and MUST NOT require the architect to edit them.

## Validation gates (Phase 8 readiness)

Phase 8 readiness validation MUST include:

1) Structural validation of:
   - `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
   against:
   - `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

2) Semantic validation (fail-closed), performed against the derived view when present:
   - platform pins (infra_target/packaging/runtime_language/database_engine) resolves uniquely in the declared catalog_version
   - companion repo target exists and meets skeleton requirements

On FAIL, the system MUST emit a feedback packet and stop.

## Naming conventions (derived fields)

Certain Phase 8 fields are derived into `profile_parameters_resolved.yaml` for deterministic enforcement.
Architects should **edit only** the three knobs:

- `lifecycle.evolution_stage`
- `lifecycle.generation_phase`
- `platform pins (infra_target/packaging/runtime_language/database_engine)`

`profile_parameters.yaml` MAY also include the minimal envelope fields required for schema validation and traceability:

- `schema_version`
- `instance_name`
- `created_at` (optional)
- `meta` (optional; if present, values MUST be non-empty because CAF rejects empty strings as placeholders)



## Recommended migration rule (soft landing)

During migration, if deprecated inputs exist, the system MUST ignore them if `profile_parameters.yaml` exists.
If `profile_parameters.yaml` is missing, the system MUST fail closed (do not infer from deprecated files).
