---
name: worker-domain-modeler
description: >
  Derive plane-separated planner-facing YAML views from the architect-edit application/system domain model source docs.
  Instruction-only: no scripts. Fail-closed on ambiguity or missing required inputs.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-domain-modeler

## Purpose

Produce the plane-separated planner-facing YAML bundle required by planning from the architect-edit source docs:

Architect-edit source artifacts (authoritative inputs; do not overwrite in this phase):
- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md`
- `reference_architectures/<name>/spec/playbook/system_domain_model_v1.md`

Planner-facing derived YAML artifacts:
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`

Do **not** emit the legacy combined file `design/playbook/domain_model_v1.yaml`.

## Inputs (read-only)

Required:
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md`
- `reference_architectures/<name>/spec/playbook/system_domain_model_v1.md`

Optional grounding inputs (use when present):
- `reference_architectures/<name>/product/PRD.resolved.md`
- `reference_architectures/<name>/product/PLATFORM_PRD.resolved.md`
- `reference_architectures/<name>/product/PRD.md`
- `reference_architectures/<name>/product/PLATFORM_PRD.md`
- `reference_architectures/<name>/spec/playbook/prd_resolved_extract_v1.json`
- `reference_architectures/<name>/spec/playbook/platform_prd_resolved_extract_v1.json`
- product/PRD extracts or resolved text that help validate or enrich the architect-authored Markdown without replacing it

Normative contracts / templates:
- `architecture_library/phase_8/87a_phase_8_plane_domain_models_and_persistence_compilation_contract_v1.md`
- `architecture_library/phase_8/87b_phase_8_plane_domain_model_schema_v1.yaml`
- `architecture_library/phase_8/87c_phase_8_canonical_domain_normalization_vocabulary_v1.yaml`
- `architecture_library/phase_8/templates/application_domain_model_v1.template.md`
- `architecture_library/phase_8/templates/system_domain_model_v1.template.md`

## Hard rules (fail-closed)

1) Grounded only: do not invent capabilities/entities not supported by PRD/spec/system inputs.
2) Plane separation is mandatory:
   - application/business-facing aggregates/entities go to `application_domain_model_v1.*`
   - control-plane/platform-owned aggregates/entities go to `system_domain_model_v1.*`
3) Source names are authoritative. Canonical normalization is optional metadata only.
4) Do not replace a source entity name with a canonical vocabulary term.
5) Deterministic canonical normalization policy:
   - auto-annotate only for exact/alias-grade matches from `87c_phase_8_canonical_domain_normalization_vocabulary_v1.yaml`
   - semantic matches may be marked as `status: suggested`
   - if ambiguous, leave canonical metadata empty / `none`
6) Derived YAML must validate against `87b_phase_8_plane_domain_model_schema_v1.yaml`.
7) Each derived YAML must contain at least one bounded context and one use case, and those use cases must live under `domain.use_cases` rather than as a top-level key.
8) Planner-facing aggregates must never emit an empty `entities` array. When a source section is authored as `### Aggregate: <Name>` with direct `Fields`/`Invariants`/`Persistence intent` but no clearly separate subordinate `### Entity:` sections, derive an aggregate-root entity inside `entities[]` that carries those fields.
9) Aggregate-root entity normalization must be deterministic:
   - keep the source aggregate `name` unchanged for the aggregate itself
   - derive a root entity with the same business `name` as the aggregate unless that would collide with an explicitly listed subordinate entity name
   - derive `entity_id` from the aggregate id; if the plain aggregate id would collide with an explicit child entity id, use `<AGGREGATE_ID>_ROOT`
   - copy the aggregate-root fields into that root entity instead of dropping them or leaving `entities` empty
10) If the inputs are too underspecified to separate application vs system ownership, refuse and write a feedback packet.
11) Use-case touch closure is mandatory in the planner-facing YAML: every `domain.use_cases[*].touches_entities[]` name must resolve to an aggregate or entity name present in that same plane view.
12) Explicit source-section preservation is mandatory: if the source Markdown explicitly authors a plane-owned `### Aggregate:` or `### Entity:` section, do not drop it from the derived YAML when that section is still grounded by the source/spec/PRD inputs. This includes small supporting contexts such as activity/audit aggregates.
13) Do not carry undeclared or cross-plane concepts into `touches_entities[]`. If a use case mentions names such as Role/User/Tenant that are not modeled in the same plane source doc, either (a) emit a grounded same-plane aggregate/entity that owns that concept, or (b) fail closed and ask the architect to clarify the ownership/modeling. Do not leave dangling touch references in the YAML.
14) Field requiredness is mandatory in the planner-facing YAML: every emitted `fields[]` item must include `required: true | false`. Default to `true` unless the source explicitly marks the field optional/nullable/derived-only.
15) `api_candidates.resources[]` must use the canonical object shape in the planner-facing YAML (`- name: <resource_key>` with optional `operations[]`). Do not emit plain string array entries there.

## Procedure

1) Read the product/system inputs.
   - Use `application_spec_v1.md` for product-facing domain/resources.
   - Use `system_spec_v1.md` plus `PLATFORM_PRD*.md` / extracts for control-plane/platform entities.

2) Read the two architect-edit source docs as authoritative human input.
   - `application_domain_model_v1.md`
   - `system_domain_model_v1.md`
   - Build a closed-world inventory for each plane: explicit `### Aggregate:` names, explicit `### Entity:` names, and every `**Touches**` reference from the source use cases.
   - Use the PRD/spec/system inputs only to validate, clarify, and ground derivation of the YAML views.
   - Do not silently rewrite, reseed, or replace the Markdown source docs in this phase.

3) Normalize into the two YAML views.
   - `schema_version: phase8_plane_domain_model_v1`
   - `plane_scope: application | system`
   - include `generated_from.inputs`
   - include **one `domain` mapping** that owns:
     - `domain.summary`
     - `domain.bounded_contexts`
     - `domain.use_cases`
   - include `api_candidates.resources[]` only when the plane genuinely exposes API-surface candidates
   - emit `api_candidates.resources[]` as objects with `name` and optional `operations[]`; do not emit plain strings
   - do **not** place `use_cases` at the document root
   - for every emitted aggregate, ensure `entities[]` contains at least one planner-facing entity
   - when the source doc gives an aggregate direct fields but no child entities, emit a root entity that mirrors those aggregate fields
   - for every emitted field, carry `name`, `type`, and `required`; infer `required: false` only when the source explicitly says optional / nullable / may be omitted / `?`, otherwise emit `required: true`
   - ensure the derived YAML preserves every grounded explicit source aggregate/entity section that still belongs to the plane
   - before writing output, verify touch closure: every emitted `touches_entities[]` name must match an aggregate/entity name in that same YAML file
   - if the source use cases mention a plane-owned concept that is clearly required but not yet modeled (for example activity/audit records or tenant-role assignment objects), derive a grounded aggregate/entity for it; otherwise fail closed instead of emitting dangling touch names

   Required top-level shape:

   ```yaml
   schema_version: phase8_plane_domain_model_v1
   plane_scope: application
   generated_from:
     inputs:
       - reference_architectures/<name>/spec/playbook/application_spec_v1.md
   domain:
     summary: ...
     bounded_contexts:
       - context_id: ...
         name: ...
         aggregates:
           - aggregate_id: WORKSPACE
             name: Workspace
             persistence:
               required: true
             entities:
               - entity_id: WORKSPACE
                 name: Workspace
                 fields:
                   - name: workspace_id
                     type: string
                     required: true
     use_cases:
       - use_case_id: UC-...
         title: ...
         intent: ...
   api_candidates:
     resources:
       - name: workspaces
         operations: [list, get, create, update]
   ```

4) Canonical normalization metadata (optional; additive only)
   - For aggregates/entities, you MAY add:
     - `canonical.term_id`
     - `canonical.status: exact | alias | suggested | none`
     - `canonical.matched_by: alias_table | semantic_suggestion | architect_selected | none`
     - `canonical.confidence` when suggested
     - `canonical.aliases[]`
     - `canonical.note`
   - Preserve the source `name` regardless of normalization status.

5) System/control-plane derivation guidance
   - Prefer platform-owned records visible in `PLATFORM_PRD*.md` / extracts, for example policy/admin/evidence/execution/tenant lifecycle records.
   - If the platform inputs list entities such as `Policy Version`, `Approval Decision`, `Execution Record`, `Evidence Record`, `Retention Rule`, or `Deletion Request`, carry them into `system_domain_model_v1.*` rather than collapsing them back into narrative prose.

6) Application-plane derivation guidance
   - Keep `application_spec_v1.md` lean/product-facing.
   - If explicit `## Resources` exist, mirror them into `application_domain_model_v1.yaml:api_candidates.resources[]` using the canonical object shape (`name` + optional `operations[]`).
   - Otherwise derive application resources from clearly grounded entities only.

7) Write outputs:
   - `design/playbook/application_domain_model_v1.yaml`
   - `design/playbook/system_domain_model_v1.yaml`

8) Refusal path
   - Write a feedback packet under `reference_architectures/<name>/feedback_packets/`
   - Explain which missing/ambiguous sections prevented plane-separated derivation.
   - Missing source docs are a refusal condition in this phase.
