---
name: caf-guardrails
description: >
  Deterministic Guardrails compiler. Runs the scripted helper to derive the authoritative resolved view
  (profile_parameters_resolved.yaml + TBP resolution) from architect-pinned profile parameters.
  No in-band derivation is allowed.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# caf-guardrails

## Required scripted execution (ship blocker)

This workflow is **script-only**.

- Run:
  - `node tools/caf/guardrails_v1.mjs <instance_name> --overwrite`

## Success criteria

Exit code `0` and the following files are (re)written:

- `reference_architectures/<instance_name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<instance_name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<instance_name>/spec/guardrails/tbp_resolution_debug_v1.md`

## Fail-closed behavior

If the helper exits non-zero:

- It will have written a feedback packet under:
  - `reference_architectures/<instance_name>/feedback_packets/`
- Stop and surface the packet path only.
- Do not attempt any in-band derivation.
