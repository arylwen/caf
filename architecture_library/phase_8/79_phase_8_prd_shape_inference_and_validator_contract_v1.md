# Phase 8 — PRD → Architecture Shape Inference & Validator Contract (v1)

## Purpose

Define the deterministic contract for producing a **proposed** Architecture Shape from a PRD, and validating it post-hoc.

This contract is **normative** for Phase 8.

---

## Source

PRD source contract:

- `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`

Two-input mode:

- Product PRD (PM-owned): `reference_architectures/<instance>/product/PRD.md`
- Platform posture brief (architect-owned): `reference_architectures/<instance>/product/PLATFORM_PRD.md`

Canonical inference source (recommended):

- `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`

Fallbacks (if the resolved form is not present):

- `reference_architectures/<instance>/product/PLATFORM_PRD.md`

---

## Outputs

### Proposed (generated)

- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml`
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

### Authoritative (target)

- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`

Policy default:

- **auto-promote-on-pass**: if the proposal passes validation, it is copied to the authoritative target.

---

## Proposed YAML rules (hard)

The proposed YAML must:

1) Conform to the architecture shape schema:
   - `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`

2) Use only CAF-defined pins and allowed values:
   - pin keys must match the parameter IDs exposed by the template catalog
   - values must be members of the allowed value sets
   - source of truth for exposed pins + allowed values:
     - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

3) Contain **no invented pins** and **no invented values**.

---

## Rationale sidecar rules (hard)

The rationale sidecar must be a JSON document that validates against:

- `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`

Required fields:

- `schema_version`
- `source_prd_path`
- `template_instances[]`

Per pin (for every `template_instances[].pins.*` in the proposed YAML), the sidecar must include:

- `selected_value`
- `confidence` (0–1)
- `rationale`
- `evidence[]` (non-empty)
- optional `assumptions[]`
- optional `missing_info[]`

Evidence pointers must follow the PRD contract (canonical forms):

- `PRD:SEC:<section_id>`
- `PRD:CAP:<capability_id>:<field>`

Evidence pointers MUST resolve within the PRD-like document referenced by `source_prd_path`.

---

## Post-hoc validator rules

The validator must evaluate the proposal using deterministic checks.

### Hard-fail checks

1) **Schema correctness**
   - proposed YAML validates against `06_contura_architecture_shape_parameters_schema_v1.yaml`
   - rationale JSON validates against `79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`

2) **Enum / allowed value correctness**
   - every pin key is a catalog-exposed parameter for that template
   - every pin value is a catalog-allowed value for that parameter

3) **Groundedness**
   - every inferred pin has a non-empty evidence array
   - every evidence pointer resolves to a concrete PRD location (per PRD source contract)

4) **Completeness**
   - for each selected template instance, all exposed parameters for that template are pinned

### Soft checks (policy; can still fail-closed)

5) **Relevance / confidence thresholds**
   - default policy: auto-promotion requires all pins to have confidence ≥ 0.50
   - validator may fail-closed if confidence is below threshold

6) **Contradiction detection**
   - detect obvious internal contradictions (e.g., posture says “single-tenant” but pins imply “multi-tenant”) and fail-closed

---

## Feedback packet structure (on fail)

On any hard fail, the validator must write a feedback packet:

- `reference_architectures/<instance>/feedback_packets/BP-YYYYMMDD-prd-shape-<slug>.md`

The packet must include:

- Stuck At
- Required Capability
- Observed Constraint
- Gap Type
- Minimal Fix Proposal
- Evidence (file paths and/or evidence pointers)
