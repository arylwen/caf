# Phase 8 Plane Binding Patterns (PBP) Standard (v1)

## Purpose

Plane Binding Patterns (PBPs) are Phase 8 library artifacts that provide a **deterministic plane layout surface**
for non-AP planes (e.g., CP, DP, AI, ST) so planners can materialize required scaffolding without inventing
plane conventions.

PBPs are:

- **Deterministic**: they provide static layout/role bindings.
- **Fail-closed**: missing plane entries, missing manifests, or ambiguous bindings are errors.
- **Plane-scoped**: they describe only the plane’s directory and minimum materialization surface.

## Library layout (normative)

- Plane binding pattern catalog:
  - `architecture_library/phase_8/81_phase_8_plane_binding_pattern_catalog_v1.yaml`

- PBP manifests:
  - `architecture_library/phase_8/pbp/planes/<PLANE_ID>/pbp_manifest_v1.yaml`

## Layout surface (normative)

A PBP manifest provides:

- `layout.scaffold_directories`: directories that must exist for the plane.
- `layout.role_bindings`: deterministic roles and path templates for plane artifacts.

Planners must merge PBP layout with TBP layout deterministically:

- `scaffold_directories`: union then sort.
- `role_bindings`: duplicate keys are allowed only if byte-for-byte identical; otherwise fail closed.

## Extensions surface for obligations and gates (v1 optional)

PBP manifests MAY include an `extensions` block that declaratively expresses:

- **Obligations**: required plane artifact outputs that the planner must compile into Task Graph tasks.
- **Gates**: *semantic* acceptance criteria (Definition of Done / coding standards / guardrails) that the planner compiles into Task Graph:
  - `definition_of_done[]`
  - `semantic_review.review_questions[]` (when provided)

Rules (v1):

- Declarations MUST reference intent via `role_binding_key` and/or `required_capability`.
- Gates MUST NOT be compiled into deterministic filesystem checks.
- If a gate cannot be deterministically attached to exactly one planner-emitted task, planning must fail closed.
