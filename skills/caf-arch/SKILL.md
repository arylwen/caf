---
name: caf-arch
description: "Script-first CAF orchestrator. Runs deterministic gate helpers and then dispatches phase-specific sub-skills. Fail-closed: on any gate failure, a feedback packet is written and this skill stops."
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.


# caf-arch

## Inputs

- instance_name (required)

## Preferred scripted gate (fail-closed; token-saver)

Run:

- `node tools/caf/arch_gate_v1.mjs <instance_name>`

Notes:
- The gate performs deterministic preflight + guardrails derivation. It does **not** delete derived artifacts automatically.
- During `architecture_scaffolding`, the gate still checks whether `spec/playbook/architecture_shape_parameters.yaml` is only a seeded template default. For the default command flow, that condition emits an advisory feedback packet and continues.
- After architecture scaffolding deliverables exist, regenerating architecture scaffolding in-place is blocked; use `/caf next` (preferred) or an explicit reset helper.
- Append the environement appropriate command equivalent with ;echo "EXIT:$?" to the command to capture exit code for gate failure detection.

Rules:
- Do **not** print the command invocation.
- If the helper is missing/unavailable: FAIL-CLOSED with a feedback packet requesting restoration of the helper.

## Orchestration (no new decisions)

Ship blocker (anti-preflight / anti-shortcut):

- Do NOT inspect instance artifacts to decide whether to "only run scripted refresh" or to skip dispatching the phase sub-skill.
- Do NOT attempt to determine whether the instance is "already scaffolded" before running the gate + dispatch.
- This orchestrator is defined by: run `arch_gate_v1` (phase-aware reset) → dispatch the phase sub-skill → postprocess.

After the scripted gate succeeds:

1) Read `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml:lifecycle.generation_phase`.

2) Dispatch (no branching beyond this exact mapping):

- If `generation_phase == architecture_scaffolding`:
  - Invoke: `skills/caf-arch-architecture-scaffolding/SKILL.md`
  - Run (required; fail-closed; do not print invocation): `node tools/caf/arch_postprocess_v1.mjs <name>`
    - If it exits non-zero, STOP and surface only the printed feedback packet path.
  - Run (warning-only; do not print invocation): `node tools/caf/derived_views_advisory_gate_v1.mjs <name>`
    - If it prints a feedback packet path, surface it as an advisory warning and continue.

- Otherwise (`implementation_scaffolding | pre_production | production_hardening`):
  - Invoke: `skills/caf-arch-implementation-scaffolding/SKILL.md` *(design-only)*
  - Run (warning-only; do not print invocation): `node tools/caf/derived_views_advisory_gate_v1.mjs <name>`
    - If it prints a feedback packet path, surface it as an advisory warning and continue.
  - Run (warning-only; do not print invocation): `node tools/caf/design_open_questions_advisory_gate_v1.mjs <name>`
    - If it prints a feedback packet path, surface it as an advisory warning and continue.
    - This gate is visibility-only: unresolved `open_questions_v1` in application design are not yet a standalone blocker.
  - STOP (planning is performed by `/caf plan <name>`)

Stop.

## Completion message (required)

After a successful run of `/caf arch <name>`, emit **only** a short, phase-correct next-step hint (no extra commentary):

- If `generation_phase == architecture_scaffolding`:
  - Next step: `/caf next <name> apply` (advance to solution architecture), then `/caf arch <name>`
  - **Do not** recommend `/caf plan` at this stage.

- Otherwise (design/implementation scaffolding and later):
  - Next step: `/caf plan <name>` (planning is performed by `/caf plan`)

