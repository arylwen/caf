# Phase 8 Technology Binding Patterns (TBP) Standard (v1)

## Purpose

Technology Binding Patterns (TBPs) are Phase 8 artifacts that **bind stack-independent core patterns** (Layer 1) to **concrete technology realizations** (files, modules, configuration, naming conventions, and runtime-wiring conventions).

A TBP is:

- **Deterministic**: it is parsed from a strict schema and contributes only static signals (hooks + validations).
- **Fail-closed**: missing TBPs, unknown IDs, or schema violations are errors.
- **Stack-specific**: it may reference concrete technologies (FastAPI, Django, Compose, Postgres), but it may not invent new core patterns.

## Non-goals (v1)

- No runtime or dynamic checks (no code execution, no network calls, no container runs).
- No code generation inside TBPs.
- No introduction of new module roles beyond the extended core patterns.

## Library layout (normative)

TBPs live under:

- Atoms (fully specified TBPs):
  - `architecture_library/phase_8/tbp/atoms/<TBP_ID>/`
    - Normative TBP spec: `tbp_<TBP_ID>_v1.md`
    - **Normative binding manifest (required):** `tbp_manifest_v1.yaml`

- Catalogs (index of TBPs):
  - `architecture_library/phase_8/tbp/catalogs/tbp_catalog_v1.md`

- Schemas and resolution contract:
  - `architecture_library/phase_8/tbp/schemas/tbp_schema_v1.md`
  - `architecture_library/phase_8/tbp/schemas/tbp_resolution_contract_v1.md`
  - **TBP manifest schema (required):** `architecture_library/phase_8/tbp/schemas/tbp_manifest_schema_v1.yaml`
  - **TBP resolution schema (required):** `architecture_library/phase_8/tbp/schemas/tbp_resolution_schema_v1.yaml`

- Sources (supporting external references, optional but recommended):
  - `architecture_library/phase_8/tbp/sources/tbp_sources_*_v1.md`

## Formatting rules (normative)

TBP atom files use the field-based schema in `tbp_schema_v1.md`.

- Field labels are **case-sensitive** and must appear exactly as specified.
- Each field is written as `FIELD_NAME: <value>` on one line.
- Lists are written as dash-prefixed bullets under the field where applicable.
- One blank line must separate fields (for reliable parsing).

### File and directory naming

- Atom directory: `architecture_library/phase_8/tbp/atoms/<TBP_ID>/`
  - Example: `.../atoms/TBP-PY-01/`

- Atom filename: lowercase letters, numbers, and underscores only, ending with `_v1.md`:
  - `tbp_<tbp_id_lowercase_with_underscores>_v1.md`
  - Example: `TBP-PY-01` → `tbp_tbp_py_01_v1.md`

The `TBP_ID:` field value must match the atom directory name exactly.

> Note: chat outputs may wrap TBP content in a single outer fence (per Contura document output standards). The repository files themselves are plain Markdown.

## Deterministic resolution (normative)

Resolution turns a technology profile into an ordered set of TBPs.

The resolution process is defined in `tbp_resolution_contract_v1.md` and must:

1. Map selected **approved technology atoms** to TBP IDs.
2. Add TBPs required by `REQUIRES_TBPS` (transitive closure).
3. Validate:
   - Every selected TBP has an atom file on disk.
   - No conflicting TBPs are present (`CONFLICTS_WITH_TBPS`).
   - All TBPs pass schema parsing.
4. Produce a deterministic, stable ordering (lexicographic by TBP_ID).

If any rule fails, resolution fails closed and produces a feedback packet.

## Evidence hooks and implementation hints (normative)

A TBP contributes **implementation hints** that help workers realize a binding without inventing conventions.

- `layout.scaffold_directories` and `layout.role_bindings` provide deterministic *where* outputs live.
- `layout.module_conventions` provides deterministic cross-worker convention signals (for example language import/module roots) that should be merged during normal TBP resolution and exposed via existing resolved artifacts rather than via ad hoc micro-resolvers.
- `layout.role_bindings.*.evidence_contains` / `evidence_not_contains` (when present) are implementation hints for workers and reviews.
- When deterministic realization verification is required, role bindings SHOULD declare a library-owned `validator_kind` (plus optional `validator_config`) that generic `tools/caf` gates consume, instead of hardcoding stack/package lore directly in generic gates.

CAF build is **semantic-first**:

- No code execution.
- No deterministic filesystem content checks.
- The only enforcement gates are write-rails + schema validity + semantic review severity thresholds.

TBP/runtime binding is also the right layer for framework-specific realization of declared interface bindings, for example:

- container/provider registration conventions,
- module/bootstrap wiring,
- explicit manual composition-root structure when no container is selected.

Those realization details must not be pushed back up into ABP manifests or into the abstract interface-binding contract.

## Extensions surface for obligations and gates (v1 optional)

TBP manifests MAY include an `extensions` block that declaratively expresses:

- **Obligations**: required artifact outputs that the planner compiles into Task Graph tasks.
- **Gates**: *semantic* acceptance criteria that the framework-owned post-plan compiler compiles into the final Task Graph after the planner emits the structural task graph:
  - `definition_of_done[]` items
  - `semantic_review.review_questions[]` (when provided)
  - `semantic_review.focus_areas[]` (when provided)
  - optional raising of `semantic_review.severity_threshold`

Rules (v1):

- Extensions are optional; absence means no extra obligations/gates.
- Declarations MUST reference intent via `role_binding_key` and/or `required_capability`.
  - They MUST NOT hardcode concrete file paths into gate criteria.
- Gates MUST be compiled as **Definition of Done / coding standards / guardrails**, not as deterministic checks.
- If a gate cannot be deterministically attached to exactly one planner-emitted task, planning must fail closed.

Gate kinds (v1):
- `definition_of_done`
- `coding_standard`
- `guardrail`

### Shared semantic acceptance attachment shape (normative)

TBP `extensions.gates[]` are the TBP-owned form of the shared CAF semantic acceptance attachment contract.

Use these fields when the planner needs to collect TBP-owned semantic pressure generically:

- `gate_id`
- `attachment_scope` (`single_execution_anchor` or `all_matching_tasks`)
- `required_capability` or `required_capabilities[]`
- `criteria[]`
- `review_questions[]`
- `focus_areas[]`
- `severity_threshold_override`

The framework-owned post-plan semantic acceptance compiler should compile these into task `definition_of_done[]` and `semantic_review.review_questions[]`, not into bespoke technology-specific checks.

Deterministic validators remain allowed for companion/runtime realization when they are library-owned, declared from TBP role bindings, and executed by generic `tools/caf` validator paths rather than worker-local lore.


## Catalog integrity (normative)

For `tbp_catalog_v1.md`:
- Each row must correspond to an atom file.
- `requires` and `conflicts` must reference TBP IDs that exist in the catalog.
- Catalog must not include “longlist-only” TBPs unless they are clearly marked as deferred and are excluded from automated resolution.
