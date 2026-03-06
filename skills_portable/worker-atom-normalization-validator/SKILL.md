---
name: worker-atom-normalization-validator
description: >
  Validate that resolved guardrails use canonical approved atom vocabulary consistently.
  Fail-closed when legacy spine fields conflict with canonical atoms or when atoms are not approved.
  Instruction-only: no scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-atom-normalization-validator

## Purpose

Prevent "split-brain" configuration where legacy pinned spine keys (e.g., `lifecycle.pinned_platform_spine.*`)
disagree with canonical resolved atoms (e.g., `database.engine`), causing downstream derivations to silently diverge.

This worker performs **validation only**. It does not invent values and does not rewrite pins.
If the instance is inconsistent or uses unapproved atom values, it writes a **feedback packet** and stops.

## Inputs
- instance_name: `<name>`

## Reads (authoritative)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `architecture_library/phase_8/86_phase_8_technology_profile_catalog_v1.yaml` (approved atoms)

## Validation rules (fail-closed)

### Rule A — Canonical atoms must be approved
For each canonical atom key present under `profile_parameters_resolved.yaml` (e.g., `database.engine`,
`runtime.language`, `deployment.mode`, etc.):

- The value MUST be one of the approved values in the Phase 8 technology profile catalog.
- If a canonical atom key is present but the value is not approved: fail-closed.

### Rule B — Legacy spine keys may exist, but must not conflict
If any legacy spine key exists under `lifecycle.pinned_platform_spine.*`, treat it as **compat-only**.

- If a legacy value is present AND a corresponding canonical atom is present:
  - They MUST match under the canonical vocabulary (exact string match after applying *only* the canonical atom spelling).
  - Example: if legacy says `postgres` but canonical says `postgresql`, this is a **conflict** → feedback packet.
- If a legacy value is present but the corresponding canonical atom is missing:
  - Fail-closed: request that the canonical atom be pinned/derived and the legacy field removed or updated.

**Important:** Do not auto-normalize values in-place. Validation must be explicit and fail-closed.

## Feedback packet format

Write to:
- `reference_architectures/<name>/feedback_packets/BP-<timestamp>-atom-normalization.md`

Include:
- Which keys conflict (full YAML paths)
- Current values
- Allowed canonical values (quote the relevant option set from the approved catalog)
- The single required fix: update pins to use canonical values (or remove legacy spine fields)

## Output
- None on success (silent pass)
- Feedback packet on failure
