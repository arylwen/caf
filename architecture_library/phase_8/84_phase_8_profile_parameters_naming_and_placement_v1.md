# Phase 8 Profile Parameters Naming and Placement (v1)

## Canonical architect-authored input

Phase 8 uses exactly one canonical architect-authored instance input file:

- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

This file is the machine-consumed implementation/binding surface for Phase 8.
It keeps architect-selected bindings explicit without forcing business rationale into technical pins.

Normative split:

- **Rationale** belongs in specs/design/decisions.
- **Bindings** belong in `profile_parameters.yaml`.

This includes:

- lifecycle posture (`lifecycle.*`)
- architecture style pin (`architecture.architecture_style`)
- platform/runtime pins (`platform.*`)
- machine-consumed UI pins (`ui.*`)

The file name remains `profile_parameters.yaml` for stability.
Documentation and template comments MUST clarify that it is the implementation/binding surface.

## Schema authority

The canonical schema for this file is:

- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

Starter templates must stay aligned to:

- `architecture_library/phase_8/84_phase_8_profile_parameters_template_v1.yaml`

The file must parse as YAML and must validate structurally against:

- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

## What this replaces (deprecated instance inputs)

The following instance inputs are deprecated and MUST NOT be required once `profile_parameters.yaml` is adopted:

- `reference_architectures/<name>/spec/guardrails/platform.yaml` (replaced by profile_parameters.yaml.platform.*)
- `reference_architectures/<name>/spec/guardrails/lifecycle_constraints.md` as an architect input (replaced by profile_parameters.yaml.lifecycle.*)
- style/runtime YAML embedded elsewhere for machine consumption (replaced by profile_parameters.yaml.architecture.* / platform.* / ui.*)
- UI technology/runtime YAML inside `spec/playbook/application_spec_v1.md` (replaced by profile_parameters.yaml.ui.*)

## Generated views (assistant-produced)

For review friendliness and enforcement determinism, the system MAY generate read-only views derived from `profile_parameters.yaml`.
These are not architect inputs and must be safely regenerable:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml`
- `reference_architectures/<name>/spec/guardrails/syntactic_checks.md` (optional)

If these views exist, validators and skills MUST treat them as derived artifacts and MUST NOT require the architect to edit them.

## Validation gates (Phase 8 readiness)

Phase 8 readiness validation MUST include:

1) Structural validation of:
   - `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
   against:
   - `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`

2) Semantic validation (fail-closed), performed against the derived view when present:
   - architecture style pin (`architecture.architecture_style`) resolves uniquely to an ABP catalog entry
   - platform pins (infra_target/packaging/runtime_language/database_engine) resolve uniquely in the declared catalog_version
   - companion repo target exists and meets skeleton requirements
   - UI pins (`ui.present`, `ui.kind`, `ui.framework`, `ui.deployment_preference`) are the only machine-consumed UI source of truth

On FAIL, the system MUST emit a feedback packet and stop.

## Naming conventions (derived fields)

Certain Phase 8 fields are derived into `profile_parameters_resolved.yaml` and related derived views for deterministic enforcement.
Architects should edit only the pinned UX knobs:

- `lifecycle.evolution_stage`
- `lifecycle.generation_phase`
- `architecture.architecture_style`
- platform pins (`infra_target`, `packaging`, `runtime_language`, `database_engine`)
- UI pins (`ui.present`, `ui.kind`, `ui.framework`, `ui.deployment_preference`) when a browser UI is in scope

`profile_parameters.yaml` MAY also include the minimal envelope fields required for schema validation and traceability:

- `schema_version`
- `instance_name`
- `created_at` (optional)
- `meta` (optional; if present, values MUST be non-empty because CAF rejects empty strings as placeholders)

## Recommended migration rule (soft landing)

During migration, if deprecated inputs exist, the system MUST ignore them if `profile_parameters.yaml` exists.
If `profile_parameters.yaml` is missing, the system MUST fail closed (do not infer from deprecated files).
