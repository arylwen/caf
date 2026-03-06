---
name: worker-task-backlog-projector
description: >
  Deterministically project task_graph_v1.yaml into a human-readable backlog view.
  Pure projection: no new decisions.
  Instruction-only: no scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-task-backlog-projector

## Purpose

Produce a stable, rerun-safe backlog markdown view that is a pure projection of:

- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

This worker exists because backlog generation inside the planner skill can be skipped under
token pressure. Making backlog projection a dedicated worker makes it deterministic.

This worker MUST NOT:
- invent new tasks, dependencies, or acceptance criteria
- add new file paths not present in the Task Graph
- introduce new decisions or rewrite task intent

## Inputs

- instance_name: `<name>`

## Reads (required)

- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

## Writes

- `reference_architectures/<name>/design/playbook/task_backlog_v1.md` (overwrite=true)

## Projection rules (pure)

For each task in `task_graph_v1.yaml` (in the order listed):

- Emit a section:
  - `## <task_id>: <title>`
  - `Capability: <required_capabilities[0]>`
  - `Dependencies: <comma-separated task_id list or NONE>`
  - `Definition of Done:` (bullets copied verbatim from `definition_of_done`)

  - `Steps:`
    - bullets copied verbatim from `steps` (authoritative).
    - if `steps` is missing (legacy only), fall back to extracting from `semantic_review.constraints_notes` by locating a `Steps:` section.
    - if neither source exists, render `Steps: NONE`
  - `Gates:`
    - bullets copied verbatim from `definition_of_done` **only** for lines that start with `TBP Gate (` or `PBP Gate (`
    - if no such lines exist, render `Gates: NONE`
  - `Semantic review questions:` (bullets copied verbatim from `semantic_review.review_questions`)
  - `Story/References:`
    - copy verbatim from `semantic_review.constraints_notes` (story/references)
  - `Trace anchors:` (bullets copied verbatim from `trace_anchors`)
  - `Inputs:` (bullets for each `inputs[].path`, copied verbatim)

Constraints:
- Keep it concise: target 10–25 lines per task.
- Do not add new paths.
- If a field is missing, render `MISSING` and do not guess.

Non-negotiable:
- Always emit `Definition of Done:` bullets. This section is required and must not be omitted.

## Fail-closed conditions

Stop and write a feedback packet if:
- `task_graph_v1.yaml` is missing or not valid YAML
- any task is missing `task_id` or `required_capabilities[0]`

Feedback packet path:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-backlog-projection-failed.md`

Evidence MUST include:
- which required fields were missing
- the task ids observed (if any)
