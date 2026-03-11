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
7) Each derived YAML must contain at least one bounded context and one use case.
8) If the inputs are too underspecified to separate application vs system ownership, refuse and write a feedback packet.

## Procedure

1) Read the product/system inputs.
   - Use `application_spec_v1.md` for product-facing domain/resources.
   - Use `system_spec_v1.md` plus `PLATFORM_PRD*.md` / extracts for control-plane/platform entities.

2) Read the two architect-edit source docs as authoritative human input.
   - `application_domain_model_v1.md`
   - `system_domain_model_v1.md`
   - Use the PRD/spec/system inputs only to validate, clarify, and ground derivation of the YAML views.
   - Do not silently rewrite, reseed, or replace the Markdown source docs in this phase.

3) Normalize into the two YAML views.
   - `schema_version: phase8_plane_domain_model_v1`
   - `plane_scope: application | system`
   - include `generated_from.inputs`
   - include `domain.summary`, `bounded_contexts`, `use_cases`
   - include `api_candidates.resources[]` only when the plane genuinely exposes API-surface candidates

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
   - If explicit `## Resources` exist, mirror them into `application_domain_model_v1.yaml:api_candidates.resources[]`.
   - Otherwise derive application resources from clearly grounded entities only.

7) Write outputs:
   - `design/playbook/application_domain_model_v1.yaml`
   - `design/playbook/system_domain_model_v1.yaml`

8) Refusal path
   - Write a feedback packet under `reference_architectures/<name>/feedback_packets/`
   - Explain which missing/ambiguous sections prevented plane-separated derivation.
   - Missing source docs are a refusal condition in this phase.
