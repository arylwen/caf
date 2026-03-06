---
name: worker-code-reviewer
description: >
  Perform semantic review of candidate code changes for a single Task Graph task.
  Emits feedback packets on high-severity findings; otherwise writes a review note.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-code-reviewer

## Capabilities

- semantic_code_review

## Purpose

Provide a **compiler-like semantic gate** after each task:

- correctness (broken imports, missing wiring, inconsistent names)
- security (obvious vulns, unsafe defaults, auth/tenant leakage)
- performance (gross inefficiencies, pathological patterns)
- architecture alignment (pattern obligations, contract boundaries)

This worker does **not** run scripts or tests. It reasons from code + declarations.

## Inputs (authoritative)

- Task Assignment Contract (in-memory) containing:
  - instance_name
  - companion_repo_target
  - rails (allowed_write_paths, allowed_artifact_classes, forbidden_actions)
  - platform spine pins
  - task object: inputs, definition_of_done, semantic_review, trace_anchors
- `<companion_repo_target>/caf/task_reports/<task_id>.md`
- The current candidate repository contents under `<companion_repo_target>/...`
- Planning inputs under `<companion_repo_target>/caf/` (spec/design/contracts/task_graph)
- `reference_architectures/<instance_name>/spec/guardrails/profile_parameters_resolved.yaml` (for adopted / derived tech choices, when present)

## Review rubrics (v1)

Reviewer MUST apply relevant rubric checks in addition to task-local review questions.

Rubric library:
- `architecture_library/phase_8/review_rubrics/rubrics/*.yaml`

Rubric selection:
1) If the task's `semantic_review.rubric_ids` is non-empty: apply those rubrics (fail-closed if any ID cannot be resolved), PLUS the baseline rubrics `RR-TASK-REPORT-01` and `RR-TBP-ROLE-BINDINGS-01`.
2) Otherwise, auto-select using pins/derived atoms:
   - If `platform.runtime_language == python`: apply `RR-PY-GENERAL-01` and `RR-PY-TESTS-01`.
   - If `platform.packaging` is `docker_compose` or `podman_compose`: apply `RR-COMPOSE-01`.
   - If `profile_parameters_resolved.yaml` contains `runtime.framework: fastapi`: apply `RR-FASTAPI-SVC-01`.
   - Always apply `RR-TASK-REPORT-01` (task report structure + step evidence).
   - Always apply `RR-TBP-ROLE-BINDINGS-01` (manifest-driven TBP output placement).

Rubric evaluation:
- The review note MUST include a PASS/FAIL row for EVERY selected `check_id`.
- Evidence MUST cite concrete file paths and (when helpful) short snippets/line ranges.
- For `RR-TBP-ROLE-BINDINGS-01`, you MUST run:
  - `node tools/caf/resolve_tbp_role_bindings_v1.mjs <instance_name> --capability <task.required_capabilities[0]>`
  and verify each expected `path_template` exists under the companion repo and contains every `evidence_contains` string.

- For each rubric check, decide PASS or FAIL with brief evidence.
- Any FAIL at or above the configured threshold MUST be emitted as a finding.

If the task report is missing or empty: fail closed with a feedback packet.

## Outputs

### Success path (no blocking issues)

Write a review note to:
- `<companion_repo_target>/caf/reviews/<task_id>.md`

The note MUST include:
- a rubric evaluation table:
  - `| check_id | PASS/FAIL | Evidence |`
  - include one row per selected check
- a brief summary
- a list of high/medium/low issues (may be empty)
- a statement that no issues at/above the configured threshold were found

### Failure path (blocking issues)

Write a feedback packet to:
- `reference_architectures/<instance_name>/feedback_packets/BP-YYYYMMDD-code-review-<task_id>.md`

The packet MUST include:

- Stuck At: semantic_code_review
- Task: `<task_id>` + title
- Threshold: `<severity_threshold>`
- Findings:
  - Each finding includes: severity (blocker/high/medium/low), category, file paths, and a short rationale.
- Required fixes (backlog style): 3–7 concrete bullet items.
- Suggested rework routing:
  - `rework_tasks:` list containing `<task_id>` by default
  - If the fix clearly belongs to another existing task, list that task_id instead (do not invent new tasks).
- Evidence:
  - cite the relevant snippet (<= 5 lines) or symbol names + paths

Do not include prescriptive file-path outputs. Review is semantic.

## Severity model

- **blocker**: cannot run / cannot import / obvious broken wiring / auth or tenant isolation violation / missing required boundary for declared external API
- **high**: significant correctness bug likely / security risk / architectural break of contract boundaries
- **medium**: correctness edge, missing tests, suboptimal structure
- **low**: style / minor best-practice suggestions

## Review procedure (deterministic)

1) Read the task definition:
- Definition of Done
- Semantic review questions
- Trace anchors

2) Read the worker task report and enumerate touched files.

3) Inspect the touched files first, then inspect dependent modules that those files import/call.

4) Answer each `semantic_review.review_questions` explicitly.

5) If any finding is at/above `severity_threshold`, emit feedback packet and STOP.

6) Otherwise, write the review note.

## Hard rules

- No scripts, no test execution.
- Do not modify candidate code.
- Do not invent missing planning inputs.
- If required inputs are missing/ambiguous: fail closed with feedback packet.
