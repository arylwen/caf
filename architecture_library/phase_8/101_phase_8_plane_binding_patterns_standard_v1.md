# Phase 8 Plane Binding Patterns (PBP) Standard (v1)

## Purpose

Plane Binding Patterns (PBPs) are Phase 8 library artifacts that provide a **deterministic plane layout surface**
and bind **ABP roles to plane-local materialization surfaces** so planners can scaffold required plane structure
without inventing conventions.

PBPs are:

- **Deterministic**: they provide static layout and role bindings.
- **Fail-closed**: missing plane entries, missing manifests, or ambiguous bindings are errors.
- **Plane-scoped**: they describe only the plane’s directory, minimum materialization surface, and ABP role placement for that plane.

## Separation of concerns (normative)

PBPs exist to answer:

- which selected **ABP roles** are materialized in a given plane,
- where those roles live in that plane,
- which plane-local scaffolding directories are required.

PBPs MUST NOT:

- define the architecture style itself (that belongs to ABPs),
- define cross-plane interaction semantics (that belongs to plane integration contracts),
- define framework or ORM specifics (that belongs to TBPs).

## Library layout (normative)

- Plane binding pattern catalog:
  - `architecture_library/phase_8/81_phase_8_plane_binding_pattern_catalog_v1.yaml`

- PBP manifests:
  - `architecture_library/phase_8/pbp/planes/<PLANE_ID>/pbp_manifest_v1.yaml`

- ABP/PBP resolution contract + schema:
  - `architecture_library/phase_8/99_phase_8_abp_pbp_resolution_contract_v1.md`
  - `architecture_library/phase_8/99b_phase_8_abp_pbp_resolution_schema_v1.yaml`

## Layout surface (normative)

A PBP manifest provides:

- `layout.scaffold_directories`: directories that must exist for the plane.
- `layout.role_bindings`: deterministic plane-local roles and path templates for plane artifacts.
- `layout.abp_role_bindings` (optional but normative when style-aware mapping is needed): mappings from `abp_id` → ABP role ids → plane-local path/materialization bindings.

Planners must merge PBP layout with TBP layout deterministically, but only after the selected ABP has been projected through the ABP/PBP resolution contract:

- `scaffold_directories`: union then sort.
- `role_bindings`: duplicate keys are allowed only if byte-for-byte identical; otherwise fail closed.

## ABP role binding rules (normative)

When planning needs style-aware role placement in a plane, the PBP for that plane MUST provide
an `abp_role_bindings.<ABP_ID>` mapping for the required roles.

Rules:

- The mapping MUST use ABP role ids from the selected ABP manifest.
- The mapping MUST remain plane-local and deterministic.
- The mapping MAY customize path conventions to match enterprise/internal standards.
- If the selected ABP requires a role mapping in a materialized plane and the PBP does not provide it, planning must fail closed.

## Extensions surface for obligations and gates (v1 optional)

PBP manifests MAY include an `extensions` block that declaratively expresses:

- **Obligations**: required plane artifact outputs that the planner must compile into Task Graph tasks.
- **Gates**: *semantic* acceptance criteria (Definition of Done / coding standards / guardrails) that the framework-owned post-plan compiler compiles into the final Task Graph after the planner emits the structural task graph:
  - `definition_of_done[]`
  - `semantic_review.review_questions[]` (when provided)

Rules (v1):

- Declarations MUST reference intent via `role_binding_key` and/or `required_capability`.
- Gates MUST NOT be compiled into deterministic filesystem checks.
- If a gate cannot be deterministically attached to exactly one planner-emitted task, planning must fail closed.

### Shared semantic acceptance attachment shape (v1 optional)

When a PBP manifest needs to contribute semantic acceptance pressure, it SHOULD use the same conceptual fields as TBP gates / pattern attachments:

- `attachment_id`
- `attachment_scope` (`single_execution_anchor` or `all_matching_tasks`)
- `required_capabilities[]` (or a plane-local role-binding mapping that resolves to them)
- `criteria[]`
- `review_questions[]`
- `focus_areas[]`
- `severity_threshold_override`

These attachments are framework-collected semantic requirements for post-plan enrichment, not deterministic path checks.
