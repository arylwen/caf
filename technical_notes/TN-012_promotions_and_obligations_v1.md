# TN-012 — Promotions and Obligations (v1)

## Purpose

Define what **promotions** and **obligations** mean in CAF Phase 8, how they flow through the pipeline, and how to add/remove/change them without introducing drift.

This note is intentionally “mechanical”: it describes concrete files, schemas, and invariants.

## Scope

In scope:

- Where promotions live, what they are allowed to contain, and how they affect planning.
- Where obligations live, how they are compiled, and how they affect the Task Graph and build.
- How to change each safely (producer-side only).

Out of scope:

- UI or CP-console product decisions (those belong in patterns/spec/design).
- TBP/PBP implementation details beyond how they consume tasks.

## Definitions

### Promotion

A **promotion** is pattern-defined metadata that “promotes” extra semantic requirements into planning without introducing a bespoke planner rule.

Promotions are authored in pattern definition YAMLs, validated by the pattern definition schema, and unioned into design-stage planning payloads.

Promotions are used for:

- Forcing specific **inputs** to be opened by workers (`inputs[]`).
- Forcing specific **trace anchors** to be treated as binding (`trace_anchors[]`).
- Declaring role bindings and plane placements used by downstream planning/build (when applicable).

Promotions do not directly create obligations today; they constrain how tasks must be executed and reviewed.

Authoritative locations:

- Pattern definitions: `architecture_library/patterns/**/definitions_v1/*.yaml`
- Schema: `architecture_library/patterns/caf_v1/caf_pattern_definition_schema_v1.yaml`
- Design-stage union: `reference_architectures/<name>/spec/playbook/{control_plane_design_v1.md,application_design_v1.md}` → `CAF_MANAGED_BLOCK: planning_pattern_payload_v1`
- Union procedure: `skills/caf-solution-architect/SKILL.md`

### Obligation

An **obligation** is a planner-compiled requirement that the Task Graph must cover to produce a viable candidate outcome (e.g., runnable demo, enforcement bar).

Obligations are enumerated in `pattern_obligations_v1.yaml` and converted into Task Graph tasks with specific worker capabilities.

Authoritative locations:

- Schema: `architecture_library/phase_8/80_phase_8_pattern_obligations_schema_v1.yaml`
- Planner procedure: `skills/caf-application-architect/SKILL.md` (Step 2 → obligations, Step 3 → Task Graph)

## End-to-end flow

The canonical flow (pins → spec → design → plan → build) is documented in `technical_notes/TN-009_generic_derivation_cascade_v1.md`.

This note focuses on the promotions/obligations slice:

1) Pattern retrieval proposes candidate patterns (no decisions).

- Retrieval index: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
- Views: `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- Worker: `skills/worker-pattern-retriever/SKILL.md`

2) Human architect adopts/rejects patterns in the spec.

- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1`

3) Design stage materializes a planning payload that includes the selected patterns and the unioned promotions.

- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md` → `CAF_MANAGED_BLOCK: planning_pattern_payload_v1`
- `reference_architectures/<name>/design/playbook/application_design_v1.md` → `CAF_MANAGED_BLOCK: planning_pattern_payload_v1`
- Procedure + fail-closed validation: `skills/caf-solution-architect/SKILL.md`

4) Planning stage compiles obligations, then compiles tasks that cover those obligations.

- Obligations: `reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml`
- Task Graph: `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- Procedure: `skills/caf-application-architect/SKILL.md`

5) Build stage executes tasks via workers, producing code + reports.

- Orchestrator: `skills/caf-build-candidate/SKILL.md`
- Worker contracts: `skills/worker-*/SKILL.md`
- Worker outputs: `companion_repositories/<name>/caf/task_reports/*.md` (generated)

## How promotions work

### Promotion schema (CAF patterns)

CAF pattern definitions may include a `promotions` object with these keys:

- `semantic_inputs[]`: paths that must be opened by workers, with a scope.
- `required_trace_anchors[]`: trace anchors that must be treated as binding, with a scope.
- `required_role_bindings[]`: role binding keys that must exist, with a scope (optional).
- `plane_placements[]`: plane placement declarations that bind roles to planes (optional).

See:

- `architecture_library/patterns/caf_v1/caf_pattern_definition_schema_v1.yaml`

### Union rule (design stage)

In `planning_pattern_payload_v1`, promotions are unioned from each adopted pattern definition:

- Source of truth for adopted patterns: `system_spec_v1.md:decision_resolutions_v1 (status: adopt)`
- Source of truth for definition file location: `pattern_retrieval_surface_v1.jsonl` → `definition_path`

Union procedure + validation is defined in:

- `skills/caf-solution-architect/SKILL.md`

Critical invariant:

- The emitted `promotions` block must preserve the expected shape and must not be `{}`.
  Emit explicit list keys even when empty.

### Consumption rule (planning stage)

The planner (`caf-application-architect`) consumes promotions only to constrain tasks:

- For `semantic_inputs` entries:
  - `cross_cutting` inputs are added to every task `inputs[]`.
  - `per_resource` inputs are added to resource tasks and plane runtime scaffold tasks.

- For `required_trace_anchors` entries:
  - `cross_cutting` anchors are added to every task `trace_anchors[]`.
  - `per_resource` anchors are added to resource tasks and plane runtime scaffold tasks.

This is specified in:

- `skills/caf-application-architect/SKILL.md` → “Planning promotions + references (required; no new decisions)”

## How obligations work

### Obligation schema

`pattern_obligations_v1.yaml` is a compiled list of obligations with fields:

- `obligation_id`
- `obligation_kind`
- `plane_scope`
- `capability_id` (must map to a worker capability)
- `description`
- `sources[]` (path + anchor)
- `selected_pattern_ids[]` (must be a subset of adopted patterns; may be empty)

See:

- `architecture_library/phase_8/80_phase_8_pattern_obligations_schema_v1.yaml`

### Compilation rule (planning stage)

The planner compiles a deterministic “minimum viable set” of obligations plus expansions based on:

- material contracts (`contract_declarations_v1.yaml`)
- resources / API surface (domain model + spec fallback)
- enforcement bar flags (from `guardrails/profile_parameters_resolved.yaml`)

This is specified in:

- `skills/caf-application-architect/SKILL.md` → Step 2

Critical invariants:

- `selected_pattern_ids` must never include non-adopted pattern ids.
- If a pattern definition file is cited in `sources`, that pattern must be adopted (fail-closed otherwise).

### From obligations to tasks

Each obligation must be covered by one or more tasks in `task_graph_v1.yaml`.

Coverage is proven by trace anchor tokens:

- Every task covering an obligation must include a `trace_anchor` with `pattern_obligation_id:<obligation_id>`.

Additionally, every task must include:

- `inputs[]` (with `required:true` where applicable)
- `trace_anchors[]` (pattern ids; must be treated as binding)
- `semantic_review.constraints_notes` with Story/Steps/References (“G step”)

See:

- `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml`
- `skills/caf-application-architect/SKILL.md` → Step 3

## How to change promotions safely

### Add or change promotions on an existing pattern

1) Edit the pattern definition YAML under:

- `architecture_library/patterns/<namespace>/definitions_v1/<PATTERN>.yaml`

2) Validate the promotions block against the schema:

- `architecture_library/patterns/caf_v1/caf_pattern_definition_schema_v1.yaml`

3) Ensure the design-stage union will pick it up:

- `skills/caf-solution-architect/SKILL.md` (promotion union + validation)

4) Ensure planning consumes it:

- `skills/caf-application-architect/SKILL.md` (promotion consumption)

5) Optional (retrieval quality): add/adjust `terms[]` in the retrieval surface so the pattern is retrievable for the relevant evidence.

- `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`

### Add a new pattern with promotions

1) Add the definition YAML file under `definitions_v1/`.
2) Add a JSONL record for it (canonical index) with correct `definition_path`.
3) Ensure view profiles include its namespace where appropriate.
4) Run caf-meta audits (or equivalent) to confirm coverage.

## How to change obligations safely

Obligations are compiled outputs. Do not hand-edit instance obligation files.

To change obligation behavior:

1) Change the planner rules:

- `skills/caf-application-architect/SKILL.md` (Step 2/Step 3)

2) If you introduce a new `obligation_kind`:

- Update `architecture_library/phase_8/80_phase_8_pattern_obligations_schema_v1.yaml`
- Ensure there is a corresponding worker capability in `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- Ensure the Task Graph compiler emits tasks that cover the new kind

3) If you want obligations to become pattern-driven:

- Add a new, schema-validated promotion channel (producer-side) and consume it generically in `caf-application-architect`.
  Do not add bespoke pattern-id checks.

## Ownership and change control

- Pattern definitions (including promotions) are library-maintained artifacts.
- Planning payload blocks (`planning_pattern_payload_v1`) are CAF-managed outputs written by `caf-solution-architect`.
- Obligations (`pattern_obligations_v1.yaml`) and the Task Graph are CAF-managed outputs written by `caf-application-architect`.
- Candidate code and task reports are worker-produced outputs under `companion_repositories/**`.

Producer-side rule:

- Never manually edit shipped instance outputs under `reference_architectures/**` or `companion_repositories/**`.
  Fix skills/templates/schemas/pattern definitions instead.

## Recommended follow-ups

- Add a small section to `TN-009_generic_derivation_cascade_v1.md` that links to this note for the promotions/obligations slice.
- Add a caf-meta audit that reports:
  - adopted patterns with promotions that did not appear in unioned `planning_pattern_payload_v1`
  - tasks missing promoted inputs or trace anchors
  - obligations whose `selected_pattern_ids` contain non-adopted patterns
