---
name: caf-build-candidate
description: >
  Execute the Application Architect Task Graph by dispatching tasks to worker skills under Layer 8 rails.
  Packet-driven and fail-closed: on any missing input, invalid schema, mapping gap, rails violation, worker failure,
  or review failure, write a feedback packet and stop.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.



# caf-build-candidate

## Purpose

Dispatch the **Task Graph v1** (produced during implementation scaffolding) to worker skills, under the derived Layer 8 rails.

This skill is intentionally **packet-driven** (token-saving):

- Avoid long precondition/postcondition checklists.
- Prefer: run the producing step → stop if a feedback packet is produced.

## Inputs

- instance_name (required)

## Authoritative inputs (fail-closed)

Instance artifacts:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

Catalogs / schemas:

- `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- `architecture_library/phase_8/80_phase_8_make_skill_feedback_packet_block_v1.md`
- `architecture_library/phase_8/80_phase_8_make_skill_request_schema_v1.yaml`
- `architecture_library/phase_8/90_phase_8_profile_derivation_policy_matrix_v1.yaml`
- `architecture_library/phase_8/100_phase_8_technology_binding_patterns_standard_v1.md`
- `architecture_library/phase_8/tbp/catalogs/tbp_catalog_v1.md`

## Hard rules (non-negotiable)

1) **Fail-closed always**
- On any missing input, invalid schema, mapping gap, rails violation, worker failure, or review failure: write a feedback packet and STOP.

2) **Task Graph is the source of truth**
- Do not invent/merge tasks.
- Do not change task inputs, DoD, review questions, or trace anchors.

3) **No new architecture/vendor decisions**
- Only implement what is implied by the pinned tech profile + Layer 8 rails + Task Graph.

4) **Write boundary and artifact class enforcement**
- No writes outside `lifecycle.allowed_write_paths`.
- No outputs with artifact_class outside `lifecycle.allowed_artifact_classes`.

## Procedure (deterministic, packet-driven)

### Step 0 — Run deterministic build preflight (scripted)

Run:

- `node tools/caf/build_preflight_v1.mjs <instance_name>`

Rules:
- Do **not** print command invocations.
- If the helper exits non-zero and wrote a feedback packet under the instance, STOP and print only the feedback packet path.

This preflight materializes the worker-visible companion scaffold:
- ensures `companion_repo_target/` exists
- stages CAF planning inputs under `<companion_repo_target>/caf/`
- ensures evidence roots exist: `caf/task_reports/` and `caf/reviews/`

### Step 3 — Load + validate Task Graph (minimal)

1) Load `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`.

2) Validate using `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml` as the checklist.

Refuse if:
- `tasks` is empty
- any task has empty `required_capabilities`
- any task has empty `definition_of_done`

- For each task, include a `steps:` ordered list of concise implementation steps (human-readable). Do not add new file paths.
- any task has empty `semantic_review.review_questions`

### Step 4 — Resolve capability coverage and dispatch mapping

1) Load `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`.

2) For each task, map all `required_capabilities` to a `worker_id`.

Dispatch rule (v1):
- A task may list multiple capabilities only if they all map to the same `worker_id`.
- If a task maps to more than one distinct `worker_id`, fail closed (planner must split the task).

3) Verify each resolved `worker_id` exists at `skills/<worker_id>/SKILL.md`.

If any capability is unmapped OR any worker skill is missing:
- emit a **Make Skill Request** feedback packet (Step 4.1) and STOP.

#### Step 4.1 — Missing capability coverage: emit feedback packet + Make Skill Request block

Write a feedback packet to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-build-candidate-missing-capabilities.md`

The packet MUST include:

A) Failure summary:
- Stuck At: capability_coverage
- Observed Constraint: missing capabilities + impacted task_ids
- Gap Type: Missing mapping | Missing worker skill

B) Minimal fix proposal (producer-side):
- Add a worker skill implementing the missing capabilities OR update deterministic mappings in the capability catalog.

C) The required machine-consumable block:
- Include the “Proposed Make Skill Request (YAML)” block exactly as specified by:
  - `architecture_library/phase_8/80_phase_8_make_skill_feedback_packet_block_v1.md`
  - Schema: `architecture_library/phase_8/80_phase_8_make_skill_request_schema_v1.yaml`

Populate the Make Skill Request with:
- required_capabilities = missing capabilities
- requested_workers = deterministic grouping is allowed
- task_signatures = only impacted tasks (task_id + title + required_capabilities + inputs + DoD + semantic_review + trace_anchors)

Chat output MUST print ONLY:
- the feedback packet path (one line)

### Step 5 — Compute execution order

1) Build a dependency graph from `depends_on`.

2) Refuse if:
- dependency references an unknown task_id
- a cycle exists

3) Compute a stable execution order:
- Lexicographic tie-break among ready tasks (task_id ascending).

Optional (mechanical aid):

- You MAY generate a derived dispatch view via:
  - `node tools/caf/gen_build_dispatch_manifest_v1.mjs <instance_name>`

This produces `design/playbook/build_dispatch_manifest_v1.md` (wave order + resolved worker IDs). It is a convenience only; source of truth remains `task_graph_v1.yaml` + capability catalog.

### Step 6 — Dispatch tasks to workers + review

For each task in execution order:

1) Construct a Task Assignment Contract (in-memory payload):
- instance_name
- companion_repo_target
- lifecycle rails (allowed_write_paths, allowed_artifact_classes, forbidden_actions)
- platform spine pins
- full task object (inputs, DoD, semantic_review, trace_anchors)

2) Invoke the worker:
- `skills/<worker_id>/SKILL.md`

Workers MUST write a task report to:
- `<companion_repo_target>/caf/task_reports/<task_id>.md`

3) Immediately invoke semantic review:
- `skills/worker-code-reviewer/SKILL.md`

Reviewer MUST:
- write `<companion_repo_target>/caf/reviews/<task_id>.md` on pass
- or write a feedback packet (and STOP the build) if severity threshold is met

This skill does not perform deterministic filesystem checks between worker and reviewer.
The only gates are: rails enforcement, schema validity, and semantic review threshold.

## Build post-gate (mechanical; fail-closed)

After ALL tasks have completed successfully, run:

- `node tools/caf/build_postgate_companion_runnable_v1.mjs <instance_name>`

This post-gate is mechanical only. It MUST fail-closed if the companion repo is not minimally runnable (common issues: invalid compose service nodes like `ui: null`, stray root entrypoints like `profile_v1/main.py`).

If the helper exits non-zero and wrote a feedback packet, STOP and print only the newest feedback packet path.

## Feedback packets (general)

Write feedback packets to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-build-candidate-<slug>.md`

Minimum fields:
- Stuck At
- Observed Constraint
- Gap Type (Missing input | Schema violation | Missing mapping | Task failure | Review failure)
- Minimal Fix Proposal
- Evidence

Do not print feedback packet contents in chat.

## Success output constraints

On success, print (in order):

- `Dispatched Task Graph v1 and passed semantic review for reference_architectures/<name>.`

Never echo file contents.

## Next steps (required)

After success, include a short “Next steps” section that:

- points to `<companion_repo_target>/caf/reviews/`
- reminds that output is CANDIDATE only

Do NOT include concrete command examples; the workflow will render them.
