---
name: caf-prd
version: 1
summary: PRD workflow. Deterministic extraction + semantic inference + deterministic validation and (optional) promotion.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf prd

## Invocation

- `/caf prd <instance_name> [promote=true|false]`

## Purpose

Turn a PRD into an **architecture shape** for the instance:

1) Deterministic: validate/extract PRD structure
2) Semantic: infer a proposed architecture shape + rationale sidecar
3) Deterministic: validate and (by default) auto-promote the proposal

## Normative sources

- PRD source contract:
  - `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`
- Inference + validator contract:
  - `architecture_library/phase_8/79_phase_8_prd_shape_inference_and_validator_contract_v1.md`
- Rationale JSON schema:
  - `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`
- Architecture shape schema:
  - `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`
- Allowed values source:
  - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

## Required inputs

- Product PRD (PM-owned):
  - `reference_architectures/<instance>/product/PRD.md`

- Platform posture brief (architect-owned; file name is stable):
  - `reference_architectures/<instance>/product/PLATFORM_PRD.md`

## Outputs

- Proposed (semantic):
  - `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml`
  - `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

- Resolved PRDs (semantic; produced before inference):
  - `reference_architectures/<instance>/product/PRD.resolved.md`
  - `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`

- Authoritative (deterministic, on pass when promote=true):
  - `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`
    - promotion stamps lifecycle provenance under `meta.lifecycle_shape_status: "prd_promoted"`

## Workflow (MUST follow ordering)

**UX rule:** the user runs **only** `/caf prd ...`. Do **not** ask the user to run `node tools/...` commands. Any Node helpers below are executed as part of this workflow.

### Step 1 — Deterministic PRD extract (fail-closed)

Execute (internal step of `/caf prd`):

- Product PRD extract:
  - `node tools/caf/prd_extract_v1.mjs <instance_name> --prd reference_architectures/<instance_name>/product/PRD.md --out reference_architectures/<instance_name>/spec/playbook/prd_extract_v1.json`

- Platform posture extract:
  - `node tools/caf/prd_extract_v1.mjs <instance_name> --prd reference_architectures/<instance_name>/product/PLATFORM_PRD.md --out reference_architectures/<instance_name>/spec/playbook/platform_prd_extract_v1.json`

Rules:
- If the PRD is missing or violates the PRD contract, this script writes a feedback packet and exits non-zero.
- If it fails, STOP and surface the newest PRD-extract feedback packet path.

### Step 2 — Semantic resolve (two-input join; emit resolved PRDs)

Run the semantic resolver using the canonical skill:

- `skills/caf-prd-resolve/SKILL.md`

Outputs:

- `reference_architectures/<instance>/product/PRD.resolved.md`
- `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`

Hard rules:
- Resolved outputs MUST satisfy the Phase 8 PRD Source Contract (v1).
- Resolved outputs MUST NOT introduce new product scope.
- Resolved outputs MUST NOT mention pins, templates, or CAF internal IDs.

### Step 3 — Deterministic extract (resolved PRDs; token-saver)

Execute (internal step of `/caf prd`):

- Product resolved extract:
  - `node tools/caf/prd_extract_v1.mjs <instance_name> --prd reference_architectures/<instance_name>/product/PRD.resolved.md --out reference_architectures/<instance_name>/spec/playbook/prd_resolved_extract_v1.json`

- Platform resolved extract:
  - `node tools/caf/prd_extract_v1.mjs <instance_name> --prd reference_architectures/<instance_name>/product/PLATFORM_PRD.resolved.md --out reference_architectures/<instance_name>/spec/playbook/platform_prd_resolved_extract_v1.json`

### Step 4 — Semantic inference (emit proposed artifacts)

Run the semantic step using the canonical skill:

- `skills/caf-prd-shape-emit/SKILL.md`

Inference source (hard):
- Use `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md` as the PRD input.
- If it does not exist, fall back to `reference_architectures/<instance>/product/PLATFORM_PRD.md`.

Outputs:

- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml`
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

Hard rules:
- Proposed YAML must use only template pins and allowed values from the template catalog.
- Every proposed pin MUST have rationale evidence pointers (PRD:SEC:... or PRD:CAP:...).
- No placeholders (TBD/TODO/UNKNOWN/{{ }} or <...>).

### Step 5 — Deterministic validate + (optional) promote (fail-closed)

Default policy: promote=true.

Execute (internal step of `/caf prd`):

- Promote (default): `node tools/caf/prd_shape_validate_and_promote_v1.mjs --instance <instance_name>`
- No promote: `node tools/caf/prd_shape_validate_and_promote_v1.mjs --instance <instance_name> --no-promote`

Rules:
- If proposed artifacts are missing or invalid, the script writes a feedback packet and exits non-zero.
- If it fails, STOP and surface the newest PRD-shape feedback packet path.

Validator grounding rule (hard):
- Evidence pointers are validated against the PRD-like document referenced by `source_prd_path` in the rationale JSON.
