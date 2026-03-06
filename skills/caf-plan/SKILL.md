---
name: caf-plan
description: >
  CAF planning command. Produces planning artifacts (pattern obligations + task graph) after design outputs exist.
  Intended to be run after `/caf arch <instance>` has produced the design bundle.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.


# /caf plan

## Inputs

- instance_name (required)

## Deterministic gate (fail-closed; token-saver)

Run:

- `node tools/caf/arch_gate_v1.mjs <instance_name>`

Rules:
- Do **not** print the command invocation.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

## Procedure (planning only; no new decisions)

Planning assumes the design bundle is already **coherent**:
- `/caf arch <instance>` (design) must have completed its MP-20 design post-gate invariants.
- If spec adoptions were edited after design was generated, rerun `/caf arch <instance>` before running `/caf plan <instance>`.

1) Read:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml:lifecycle.generation_phase`

2) Phase gate (fail-closed):

- If `generation_phase == architecture_scaffolding`:
  - Write a **blocker feedback packet** and STOP.
  - Minimal fix proposal:
    - `/caf next <name> apply=true` (to checkpoint and advance)
    - `/caf arch <name>` (to produce design outputs)
    - `/caf plan <name>` (to produce planning outputs)

3) Preconditions (fail-closed):

Require these design outputs exist before planning:

- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`

If any are missing:
- Write a **blocker feedback packet** and STOP.
- Minimal fix proposal: run `/caf arch <name>` (design stage), then rerun `/caf plan <name>`.

3a) Planning overwrite gate (fail-closed)

Planning is not idempotent and CAF does not yet have a first-class "update planning" workflow.
Refuse to overwrite existing planning artifacts.

- Run: `node tools/caf/planning_gate_v1.mjs <name>`
- If it exits non-zero, STOP and surface only the printed feedback packet path.

If you intentionally want to rerun planning:
- Run: `node tools/caf/planning_reset_v1.mjs <name> overwrite`
- Then rerun: `/caf plan <name>`

4) Invoke the canonical planning producer (instruction-owned):

- `skills/caf-application-architect/SKILL.md`

Packet handling:
- If any new feedback packet has `Severity: blocker`, STOP and surface the newest blocker.
- If ONLY advisory packets were produced, DO NOT STOP.

5) Deterministic planning invariants (fail-closed; do not "auto-fix")

Run:

- `node tools/caf/validate_instance_v1.mjs <name> --mode=plan`

Rules:
- Do **not** print the invocation.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

7) Finalize derived views:

- Invoke: `skills/caf-arch-postprocess/SKILL.md`

STOP.
