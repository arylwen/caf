# Phase 8 Architecture Binding Patterns (ABP) Standard (v1)

## Purpose

Architecture Binding Patterns (ABPs) are Phase 8 library artifacts that define an **architecture style** as a
**plane-neutral implementation shape**. They give CAF a normative place to capture architecture style without
smearing that choice across CAF decision patterns, plane bindings, or technology bindings.

An ABP is:

- **Style-only**: it defines structural roles, dependency direction, and style invariants.
- **Plane-neutral**: it MUST NOT decide whether a role lives in CP, AP, DP, AI, or ST.
- **Technology-neutral**: it MUST NOT bind frameworks, ORMs, runtimes, vendors, or packaging.
- **Fail-closed**: unknown style keys, missing manifests, or missing required PBP role mappings are errors.

## Separation of concerns (normative)

ABPs exist to keep four concerns separate:

- **CPP / core patterns**: recurring problems and invariants (for example persistence, policy, context propagation).
- **ABP**: architecture style / implementation shape (for example Clean Architecture, Layered Architecture).
- **PBP**: plane binding of ABP roles to plane-local materialization surfaces and path mappings.
- **TBP**: concrete technology realization of already-resolved style + plane choices.

ABPs MUST NOT:

- define cross-plane interaction semantics;
- define CP↔AP contract surface choices (sync vs async, mixed, etc.);
- define context-carrier semantics (headers, JWT, message envelope, etc.);
- define file paths directly;
- define framework-specific or ORM-specific implementation details.

Those concerns belong to:

- `architecture_library/phase_8/84_phase_8_plane_integration_contract_v1.md`
- `architecture_library/phase_8/101_phase_8_plane_binding_patterns_standard_v1.md`
- `architecture_library/phase_8/100_phase_8_technology_binding_patterns_standard_v1.md`

## Library layout (normative)

- Standard:
  - `architecture_library/phase_8/98_phase_8_architecture_binding_patterns_standard_v1.md`

- Catalog:
  - `architecture_library/phase_8/98b_phase_8_architecture_binding_pattern_catalog_v1.yaml`

- Style manifests:
  - `architecture_library/phase_8/abp/styles/<ABP_ID>/abp_manifest_v1.yaml`
  - `architecture_library/phase_8/abp/styles/<ABP_ID>/abp_<abp_id_lowercase_with_underscores>_v1.md`

- ABP/PBP resolution contract + schema:
  - `architecture_library/phase_8/99_phase_8_abp_pbp_resolution_contract_v1.md`
  - `architecture_library/phase_8/99b_phase_8_abp_pbp_resolution_schema_v1.yaml`

## Selection and resolution (normative)

The architect selects an architecture style through the machine-consumed implementation surface:

- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- key: `architecture.architecture_style`

`architecture.architecture_style` is a **binding pin**, not business rationale.
Rationale belongs in specs/design/decision records.

Resolution rules (v1):

1. Read `architecture.architecture_style` from `profile_parameters.yaml` / `profile_parameters_resolved.yaml`.
2. Resolve the style key to exactly one ABP catalog entry.
3. Load the ABP manifest.
4. Project the selected ABP across the PBP catalog using the ABP/PBP resolution contract.
5. Planning later decides which planes are active; if a materialized/style-aware plane lacks required selected-role bindings, planning must fail closed.

The canonical composition algorithm and derived output schema live in:

- `architecture_library/phase_8/99_phase_8_abp_pbp_resolution_contract_v1.md`
- `architecture_library/phase_8/99b_phase_8_abp_pbp_resolution_schema_v1.yaml`

## ABP manifest surface (normative)

An ABP manifest MUST provide:

- `abp_id`: stable architecture binding pattern identifier.
- `style_key`: architect-facing machine pin value used in `profile_parameters.yaml`.
- `name`: human-readable style name.
- `plane_neutral`: MUST be `true`.
- `roles`: the architecture-style role vocabulary.
- `dependency_rules`: allowed dependency direction between roles.
- `invariants`: style-level constraints that planners and reviewers can reason about.

ABP role vocabulary MUST remain:

- stable,
- generic,
- understandable to human architects,
- free of domain-specific nouns.

## ABP role vocabulary (v1)

ABPs MAY define their own role vocabularies, but role names SHOULD stay close to well-known architecture language.

For example, a Clean Architecture ABP might define roles such as:

- `composition_root`
- `inbound_adapters`
- `application_use_cases`
- `domain_core`
- `outbound_ports`
- `outbound_adapters`

A Layered Architecture ABP might define roles such as:

- `composition_root`
- `presentation_layer`
- `application_services`
- `domain_model`
- `data_access_layer`
- `integration_adapters`

## Planner expectations (normative)

Planners may use ABPs to:

- compile role-aware obligations,
- check that selected PBPs can materialize the required roles for the selected planes,
- keep role semantics stable across technology stacks.

Planners MUST NOT use ABPs to:

- infer plane ownership,
- infer deployment topology,
- infer CP UI deployment posture,
- hardcode framework or ORM choices.

## Initial catalog expectation (v1)

The launch catalog SHOULD contain at least:

- one strong default style (`ABP-CLEAN-01`), and
- one recognizable counter-example (`ABP-LAYERED-01`).

This keeps the library understandable to architects and prevents “ABP” from becoming a single-style synonym.
