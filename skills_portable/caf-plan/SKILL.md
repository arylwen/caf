---
name: caf-plan
description: >
  Portable CAF planning command (instruction-only). Produces planning artifacts
  (pattern obligations + task graph) after design outputs exist.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# /caf plan (portable)

## Inputs

- instance_name (required)

## Procedure

1) Read:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml:lifecycle.generation_phase`

2) Phase gate (fail-closed):

- If `generation_phase == architecture_scaffolding`:
  - Write a **blocker feedback packet** and STOP.
  - Minimal fix proposal:
    - `/caf next <name> apply=true`
    - `/caf arch <name>`
    - `/caf plan <name>`

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

4) Invoke the canonical planning producer:


- `skills_portable/caf-application-architect/SKILL.md`

5) Deterministic planning invariants (fail-closed; do not "auto-fix")

Run:

- `node tools/caf/validate_instance_v1.mjs <name> --mode=plan`

Rules:
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

6) Finalize derived views:

- `skills_portable/caf-arch-postprocess/SKILL.md`

STOP.
