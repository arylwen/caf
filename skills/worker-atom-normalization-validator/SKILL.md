---
name: worker-atom-normalization-validator
description: >
  Validate that resolved guardrails use canonical approved atom vocabulary consistently.
  Fail-closed when legacy spine fields conflict with canonical atoms or when atoms are not approved.
  Script-first: uses tools/caf/atom_normalization_validator_v1.mjs (approved atoms schema is authoritative).
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-atom-normalization-validator

## Purpose

Deterministically validate that `profile_parameters_resolved.yaml` uses **approved canonical atom values** and that
any legacy spine pins do not conflict with canonical atoms.



## Source of truth
- Approved atoms: `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`
- Note: `86_phase_8_technology_profile_catalog_v1.yaml` is deprecated and must not be used.

## Inputs
- instance_name: `<name>`

## Preferred scripted validator (fail-closed)

Run:

- `node tools/caf/atom_normalization_validator_v1.mjs <instance_name>`

Rules:
- Do **not** print the command invocation.
- If the script exits non-zero and wrote a feedback packet under the instance, STOP and print only the feedback packet path.
- If the helper is missing/unavailable: FAIL-CLOSED with a feedback packet requesting restoration of the helper.

## Output
- None on success (silent pass)
- Feedback packet on failure
