---
name: caf-prd
version: 1
summary: Portable PRD workflow (instruction-only). Semantic inference + deterministic checklist-based validation.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf prd (portable)

## Invocation

- `/caf prd <instance_name> [promote=true|false]`

## Purpose

Instruction-only PRD → Architecture Shape workflow for portable runners.

This workflow MUST NOT invoke node helper scripts.

## Normative sources

- `architecture_library/phase_8/78_phase_8_prd_source_contract_v1.md`
- `architecture_library/phase_8/79_phase_8_prd_shape_inference_and_validator_contract_v1.md`
- `architecture_library/phase_8/79_phase_8_architecture_shape_proposed_rationale_schema_v1.json`
- `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`
- `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

## Inputs

- Product PRD (PM-owned):
  - `reference_architectures/<instance>/product/PRD.md`

- Platform posture brief (architect-owned; file name is stable):
  - `reference_architectures/<instance>/product/PLATFORM_PRD.md`

## Outputs

- Proposed:
  - `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.yaml`
  - `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.proposed.rationale.json`

- Resolved PRDs (semantic; produced before inference):
  - `reference_architectures/<instance>/product/PRD.resolved.md`
  - `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`

- Authoritative (only if promote=true and all validator rules pass):
  - `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`

## Procedure (portable; no scripts)

1) Validate both PRD-like inputs per the PRD source contract:
   - product/PRD.md
   - product/PLATFORM_PRD.md
2) Resolve (semantic, constrained): produce:
   - product/PRD.resolved.md
   - product/PLATFORM_PRD.resolved.md
   using: `skills/caf-prd-resolve/SKILL.md`
3) Produce proposed YAML + rationale sidecar per the inference contract, using `PLATFORM_PRD.resolved.md` as the source.
4) Validate the proposal using the validator contract rules (V-01..V-08).
5) If (and only if) validation passes and promote=true:
   - Copy the proposed YAML byte-for-byte to `architecture_shape_parameters.yaml`.

Fail-closed:
- If any validator rule fails, write a feedback packet under `reference_architectures/<instance>/feedback_packets/` describing the constraint and minimal fix.
