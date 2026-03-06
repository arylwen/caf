---
name: caf-preflight
description: >
  Deterministic CAF instance validation (mechanical-only).
  Runs deterministic helpers that fail-closed with feedback packets.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.


# caf-preflight

## Purpose

Token-saver wrapper: validate required instance inputs before running expensive steps.

## Inputs

- instance_name (required)

## Preferred scripted preflight (fail-closed)

Run:

- `node tools/caf/validate_instance_v1.mjs <instance_name> --mode=build`

Rules:
- Do **not** print the command invocation.
- If the script exits non-zero and wrote a feedback packet under the instance, STOP and print only the feedback packet path.
- If the helper is missing/unavailable: FAIL-CLOSED with a feedback packet requesting restoration of the helper.

## Output

- None on success
- Feedback packet on failure
