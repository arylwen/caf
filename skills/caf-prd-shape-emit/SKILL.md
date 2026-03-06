> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

--- skills/caf-prd-shape-emit/SKILL.md ---
---
name: caf-prd-shape-emit
description: >
  Emit a PRD-derived Architecture Shape proposal (YAML + rationale sidecar) under spec/playbook.
  Instruction-only: no scripts. Grounded, auditable, fail-closed.
---

# caf-prd-shape-emit

## Purpose

Generate a **proposed** Architecture Shape Parameters bundle from a PRD:

- `architecture_shape_parameters.proposed.yaml`
- `architecture_shape_parameters.proposed.rationale.json`

The proposal is validated later (post-hoc) and may be auto-promoted on pass.

This skill is **instruction-only**:
- do not run scripts,
- do not introduce workflows,
- do not modify the authoritative file.

## Inputs

- instance_name (required): folder name under `reference_architectures/`.
- prd_path (optional): defaults to the canonical PRD location.
- overwrite (optional, default: true): controls overwriting existing proposed outputs.

## Normative sources

- PRD contract:
  - `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`
- Inference + validator contract:
  - `architecture_library/phase_8/79_phase_8_prd_shape_inference_and_validator_contract_v1.md`
- Rationale JSON schema:
  - `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`
- Architecture shape schema (YAML shape):
  - `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`
- Template catalog + allowed values (for pin/value membership):
  - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

## Canonical inputs

PRD-like input (canonical defaults):

- Product PRD (PM-owned): `reference_architectures/<instance>/product/PRD.md`

Two-input mode (recommended for architecture shape inference):

- Platform posture brief (architect-owned):
  - `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`
  - fallback: `reference_architectures/<instance>/product/PLATFORM_PRD.md`

When in two-input mode, set `prd_path` to the Platform posture brief path.

## Output paths

Write under:

- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml`
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

Do **not** write or modify:

- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`

## Fail-closed preconditions

Before writing any output:

1) **Validate instance_name** matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) **Validate required files exist**:
   - PRD file at `reference_architectures/<instance>/product/PRD.md` (or prd_path if provided)
   - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`
   - `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`
   - `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`
   - `architecture_library/phase_8/79_phase_8_prd_shape_inference_and_validator_contract_v1.md`
   - `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`

3) **Validate PRD structure** (fail-closed if any violated):
   - all required sections exist (per PRD contract)
   - capabilities index exists and every capability block exists
   - every capability block contains required fields:
     - Actor
     - Trigger
     - Main Flow
     - Postconditions
   - Product Posture has explicit selections (no ambiguous “TBD”, “TODO”, “depends”) for required questions

4) **Overwrite policy**:
   - If overwrite=false, fail-closed if either proposed output already exists.
   - If overwrite=true, overwrite the proposed outputs.

## Grounded inference rules

This step is allowed to use **creative inference** (“LLM vibes”), but the outputs must be:

- **bounded** by the template catalog (pins + allowed values),
- **complete** (all exposed parameters for each selected template are pinned),
- **auditable** (evidence pointers for every pin),
- **consistent** (no contradictions across capabilities/posture).

### 1) Select template instances (deterministic envelope)

Select the minimal set of template instances that fits the PRD **without inventing scope**.

Rules:
- Default baseline for a SaaS-like product PRD is usually: `CP`, `AP`, `DP`.
- Include `AI` only if the PRD includes explicit agentic/inference behavior.
- Do not include templates that the PRD does not require.

When in doubt, prefer **fewer templates** and fail-closed via `missing_info[]` if a decision cannot be grounded.

### 2) Pin every exposed parameter for each selected template

For each selected template instance:

1) Enumerate every parameter heading in the catalog for that template id (e.g., `CP-1 ... CP-N`).
2) Choose a value that is:
   - explicitly allowed by the catalog,
   - best supported by PRD evidence,
   - consistent with Product Posture and capability postconditions.

Hard constraints:
- **No invented pins** (keys).
- **No invented values**.
- No placeholders (`<...>`, `TBD`, `TODO`, `UNKNOWN`).

### 3) Evidence pointer requirements (hard)

Every pin must include **at least one** evidence pointer in the rationale sidecar.

Allowed evidence formats (canonical):

- `PRD:SEC:<section_id>`
- `PRD:CAP:<capability_id>:<field>`

Where `<field>` is one of:
- `actor`
- `trigger`
- `main_flow`
- `postconditions`
- `domain_entities`

If a pin is inferred from multiple capabilities, include multiple evidence pointers.

### 4) Confidence (token-minimal discipline)

Use a strict confidence rubric:

- **0.90–1.00**: explicit PRD posture answer or explicit capability postcondition directly implies the selection.
- **0.70–0.89**: strong multi-signal support across multiple capabilities/constraints.
- **0.50–0.69**: plausible but not explicit; must include `assumptions[]` and/or `missing_info[]`.
- **< 0.50**: not allowed for auto-promotion; include `missing_info[]` and prefer fail-closed rather than guessing.

## Output format requirements

### Proposed YAML (`architecture_shape_parameters.proposed.yaml`)

Must conform to `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`.

Required fields:
- `schema_version: architecture_shape_parameters_v1`
- `instance_name: <instance>`
- `created_at: <ISO-8601 UTC timestamp>`
- `template_instances: [...]`

### Rationale sidecar (`architecture_shape_parameters.proposed.rationale.json`)

Must validate against:

- `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`

Must include, at minimum:
- `schema_version`
- `source_prd_path`
- `template_instances[]`
- for each pin:
  - `selected_value`
  - `confidence`
  - `rationale`
  - `evidence[]` (non-empty)
  - optional `assumptions[]`
  - optional `missing_info[]`

## Postconditions

On success:

- both proposed artifacts exist under `spec/playbook/`
- the proposed YAML is **complete** for each included template
- the rationale sidecar contains evidence for **every** inferred pin

On failure:

- do not write partial artifacts
- write a feedback packet to:
  - `reference_architectures/<instance>/feedback_packets/BP-YYYYMMDD-prd-shape-emit-<slug>.md`

## Feedback packet slugs (use one)

- `missing-prd`
- `invalid-prd-structure`
- `missing-required-sections`
- `missing-capability-fields`
- `ambiguous-posture`
- `catalog-mismatch`
- `invented-pin-or-value`
- `placeholder-detected`
- `overwrite-disallowed`
