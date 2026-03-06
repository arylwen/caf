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

## Execution (ship blocker)

This workflow MUST be executed deterministically (no in-band derivation).

This portable skillpack is **instruction-only** and MUST NOT invoke scripts.

An orchestrator/runtime may run a deterministic helper, but it MUST produce the declared outputs.

## Success criteria

Exit code `0` and the following files are (re)written:

- `reference_architectures/<instance_name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<instance_name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<instance_name>/spec/guardrails/tbp_resolution_debug_v1.md`

## Fail-closed behavior

If the deterministic execution fails:

- It will have written a feedback packet under:
  - `reference_architectures/<instance_name>/feedback_packets/`
- Stop and surface the packet path only.
- Do not attempt any in-band derivation.
