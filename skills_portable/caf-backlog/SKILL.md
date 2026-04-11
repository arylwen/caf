---
name: caf-backlog
description: >
  On-demand human backlog projection for CAF.
  Deterministically projects task_graph_v1.yaml into task_backlog_v1.md without rerunning semantic planning.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.


# /caf backlog

## Purpose

Project the existing semantic task graph into the human backlog markdown view **on demand**.

This command exists so large planning runs do not need to inline backlog projection under token pressure.

## Inputs

- instance_name (required)

## Preconditions (fail-closed)

Require:

- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

If it is missing:
- write a blocker feedback packet and STOP.
- minimal fix proposal: run `/caf plan <name>` first, then rerun `/caf backlog <name>`.

## Procedure (deterministic helper)

The orchestrator/runtime should run:

- `tools/caf/project_task_backlog_v1.mjs`
- `tools/caf/backlog_integrity_check.mjs`

Rules:
- Do **not** invent a replacement script under `tools/caf/`.
- Keep backlog projection deterministic and pure.

## Output constraints

On success, print only two lines:

1) `caf-backlog: projected human backlog from task_graph_v1.yaml.`
2) `wrote: reference_architectures/<name>/design/playbook/task_backlog_v1.md`
