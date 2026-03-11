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
    - `/caf next <name> apply`
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

3b) Planning handoff preflight (fail-closed)

Run:

- `node tools/caf/design_postgate_planning_coherence_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- If it exits non-zero, it will print a CAF-owned feedback packet path. STOP and surface only that path.
- This is the canonical proof that the script-owned `planning_pattern_payload_v1` handoff exists and has the required `promotions.*` list keys before the instruction-owned planner runs.

4) Invoke the canonical planning producer:


- `skills_portable/caf-application-architect/SKILL.md`

5) Mechanical YAML scalar-safety postprocess (deterministic)

Run:

- `node tools/caf/planning_yaml_scalar_safety_postprocess_v1.mjs <name>`

Rules:
- This helper is script-owned and mechanical only; it rewrites unsafe plain scalars containing `: ` in planning YAML so downstream parsers do not fail on valid planning content.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

6) Producer-side planning invariants (fail-closed; do not "auto-fix")

Run:

- `node tools/caf/planning_invariant_gate_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- This gate exists so `/caf plan` fails on planner-owned omissions before those same defects surface later in `/caf build`.
- If it exits non-zero, it will print or write a CAF-owned feedback packet path. STOP and surface only that path.

7) Deterministic planning validation (fail-closed; no hidden repair)

Run:

- `node tools/caf/validate_instance_v1.mjs <name> --mode=plan`

Rules:
- Do **not** print the invocation.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

8) Finalize derived views:

- `skills_portable/caf-arch-postprocess/SKILL.md`

Important ownership note:
- `task_backlog_v1.md` is **not** planner-owned output from Step 4.
- The canonical backlog path is instruction-owned by `skills_portable/worker-task-backlog-projector/SKILL.md`, invoked by `caf-arch-postprocess` as part of `/caf plan` finalization.
- If a stale or wrong file already exists at `design/playbook/task_backlog_v1.md` (for example a task-plan-shaped file), the postprocess step must overwrite it with the worker-projected backlog view.

STOP.
