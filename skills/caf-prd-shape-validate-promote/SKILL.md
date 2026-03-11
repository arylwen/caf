# caf-prd-shape-validate-promote (Skill)

## Purpose

Validate PRD → Architecture Shape **proposed** artifacts and (on pass) **auto-promote** the proposal to the authoritative architecture shape parameters file.

This skill is **fail-closed**:

- If any validator rule fails, CAF MUST write a feedback packet under the instance and MUST NOT promote.
- No architectural decisions are made here; validation is deterministic.

This skill is **instruction-only** (portable). It MUST NOT call scripts.

---

## Inputs

Instance root (canonical):

- `reference_architectures/<instance_name>/`

Required PRD (canonical):

- `reference_architectures/<instance_name>/product/PRD.md`

Required proposed artifacts:

- `reference_architectures/<instance_name>/spec/playbook/architecture_shape_parameters.proposed.yaml`
- `reference_architectures/<instance_name>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

---

## Outputs

On PASS (auto-promote default policy):

- Write/overwrite authoritative:
  - `reference_architectures/<instance_name>/spec/playbook/architecture_shape_parameters.yaml`
  - Content MUST preserve the validated pins and stamp lifecycle provenance under `meta.lifecycle_shape_status: "prd_promoted"`.

On FAIL:

- Write a feedback packet:
  - `reference_architectures/<instance_name>/feedback_packets/BP-YYYYMMDD-prd-shape-validate-<slug>.md`

The validator MUST NOT write anywhere else.

---

## Normative references

- PRD source contract (canonical PRD location, required sections, evidence pointer format):
  - `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`

- Inference + validator contract (outputs, validator rules, auto-promote policy):
  - `architecture_library/phase_8/79_phase_8_prd_shape_inference_and_validator_contract_v1.md`

- Rationale sidecar JSON schema (machine validation):
  - `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`

- Architecture shape parameters schema (YAML/JSON Schema):
  - `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`

- Allowed values source (deterministic extraction target):
  - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

---

## Validator checks (hard fail unless noted)

### V-01 — Proposed YAML schema/shape correctness

The proposed YAML MUST conform to the architecture shape parameters schema:

- required top-level keys present
- no unexpected top-level keys
- `schema_version == architecture_shape_parameters_v1`
- `template_instances` is a non-empty list
- each template instance has `template_id`, `template_version`, `pins`
- each pin key matches `^[A-Z]{2,5}-[0-9]{1,3}$`
- each pin value is a non-empty string and contains no placeholders (`<...>`, `{{...}}`, `TBD`, `TODO`, `UNKNOWN`)

### V-02 — No invented pins

Every pin key present in proposed YAML MUST exist in the CAF parameterized templates source.

### V-03 — Allowed value membership

Every pin value in proposed YAML MUST be an allowed value for that pin (as defined in the CAF parameterized templates source).

### V-04 — Completeness

All mandatory pins in the CAF parameterized templates source MUST be present exactly once across `template_instances[*].pins`.

### V-05 — Rationale sidecar schema correctness

The rationale sidecar MUST validate against:

- `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`

Additionally:

- for every pin present in proposed YAML, a corresponding rationale entry MUST exist
- each rationale pin MUST include non-empty `evidence[]`
- each `confidence` MUST be within `[0, 1]`

### V-06 — Groundedness: evidence pointer resolution

Every evidence pointer MUST resolve to an existing PRD location per the PRD source contract:

- `PRD:CAP:<CAP-XXX>:<field>` MUST reference a real capability block and a real field (`actor|trigger|main_flow|postconditions|domain_entities`) with non-empty content.
- `PRD:SEC:<section_id>` MUST reference a required PRD section with non-empty content.

### V-07 — Relevance threshold (policy)

Default policy: each inferred pin MUST have `confidence >= 0.50`.

This is a hard fail unless the contract explicitly sets a different threshold for the run.

### V-08 — Consistency between proposed YAML and rationale

For each pin, `rationale.selected_value` MUST equal the proposed YAML pin value (string match after trimming).

---

## Auto-promote behavior (default)

If (and only if) all checks pass:

- Promote the validated YAML to `architecture_shape_parameters.yaml` (overwrite).
- Stamp lifecycle provenance metadata so downstream lifecycle gates can distinguish PRD-promoted shape from the bootstrap seed.

No other files are modified.

---

## Failure handling

On failure, write exactly one feedback packet containing:

- `Stuck At: PRD Shape Validation + Auto-Promote`
- `Required Capability: Validated proposed artifacts`
- `Observed Constraint:` human-readable summary
- `Gap Type:` one of `Missing input | Schema violation | Ungrounded inference | Completeness violation | Contradiction`
- `Minimal Fix Proposal:` bullet list of concrete edits
- `Evidence:` bullet list of file:line or pointer strings

---

## Non-goals

- Generating proposed artifacts (handled by caf-prd-shape-emit)
- Adding workflows
- Making architectural decisions
