---
name: caf-help
version: 1
summary: Help and onboarding guidance for CAF.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# CAF help

## Goal
Provide concise onboarding and command guidance for the CAF **single-command surface** (`/caf`).

## Hard rules
- Use `architecture_library/15_contura_command_surface_inventory_v1.yaml` as the only supported UX surface.
- Do not advertise any workflows/skills not listed in the inventory.
- Fail-closed: if the user asks for an unsupported command, explain it is intentionally not part of the supported UX.

## Default response (no question)
Show the happy path (copy/paste-ready):

Option A (ask-first):

- `/caf ask Summarize the main features of the codex-saas reference architecture.`

Option B (step-by-step):

1) `/caf saas <instance_name>`
2) `/caf prd <instance_name>` (default lifecycle: resolve the PRD and promote a lifecycle-ready architecture shape)
3) `/caf arch <instance_name>`
4) `/caf next <instance_name> apply` (when the architect is ready to checkpoint adopted decisions and advance)
5) `/caf arch <instance_name>` (design for the next phase)
6) `/caf plan <instance_name>` (planning outputs: obligations + task graph + task plan)
7) `/caf backlog <instance_name>` (optional human backlog projection when the team is ready to review the backlog)
8) `/caf build <instance_name>`

Show the happy path:

1) `/caf saas <instance_name>` to initialize a new instance.
2) `/caf prd <instance_name>` to infer/promote the architecture shape that architecture scaffolding consumes.
3) `/caf arch <instance_name>` to derive the current phase artifacts.
4) `/caf next <instance_name>` to preview the next phase.
5) `/caf next <instance_name> apply` to advance.
6) `/caf plan <instance_name>` to generate planning outputs after design.
7) `/caf backlog <instance_name>` to materialize the human backlog view on demand.
8) `/caf build <instance_name>` to generate candidate artifacts when pins/gates allow.

## If a question is provided
- Answer directly.
- If relevant, point back to the happy path above.
