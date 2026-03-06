---
name: caf-build-candidate
description: "Execute the Application Architect Task Graph by dispatching tasks to worker skills under Guardrails. Runs deterministic gates (mechanical validators), then performs packet-driven worker dispatch (producer steps). Fail-closed: on any gate/worker/review failure, write a feedback packet and stop."
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.


# caf-build-candidate

## Inputs

- instance_name (required)

## Required scripted gates (fail-closed; token-saver)

Run the single deterministic preflight helper:

1) `node tools/caf/build_preflight_v1.mjs <instance_name>`

This preflight runs (in order):
- validate_instance_v1.mjs --mode=build
- companion_init_v1.mjs (materializes companion + caf/ planning inputs + evidence roots)
- build_gate_v1.mjs
- playbook_gate_v1.mjs

Rules:
- Do **not** print command invocations.
- If any helper exits non-zero and wrote a feedback packet under the instance, STOP and print only the feedback packet path.
- If any helper is missing/unavailable: FAIL-CLOSED with a feedback packet requesting restoration of the helper.

## Dispatch (packet-driven)

## Deterministic dispatch procedure (fail-closed)

After gates succeed, you MUST execute the Task Graph deterministically (do not invent orchestration).

### Step 1 — Ensure a derived task plan exists (mechanical)

Run:

- `node tools/caf/gen_task_plan_v1.mjs <instance_name>`

This produces:

- `reference_architectures/<name>/design/playbook/task_plan_v1.md`

If the helper exits non-zero (or a feedback packet was written), STOP and print only the newest feedback packet path.

### Step 2 — Compute execution order (authoritative algorithm)

Source of truth for dependencies is still:

- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

Execution order MUST be a topological traversal over `depends_on`:

- Define **Wave 0** as all tasks with no `depends_on`.
- Define **Wave N+1** as all remaining tasks whose `depends_on` are all completed.
- Within each wave, sort by lexicographic `task_id` (stable tie-break).
- Fail-closed if:
  - any task depends_on a missing task_id, or
  - there is a dependency cycle (no tasks are ready).

You may use the wave list in `task_plan_v1.md` as a convenience, but the algorithm above is the contract.

### Step 2b — Generate a deterministic dispatch manifest (mechanical; recommended)

Run:

- `node tools/caf/gen_build_dispatch_manifest_v1.mjs <instance_name>`

This produces:

- `reference_architectures/<name>/design/playbook/build_dispatch_manifest_v1.md`

This manifest is a derived view (like `task_plan_v1.md`) that:
- resolves each task's `required_capabilities` to a canonical `worker_id` using `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- lists tasks wave-by-wave with compact per-task dispatch packets

If the helper exits non-zero and wrote a feedback packet under the instance, STOP and print only the feedback packet path.

### Step 3 — Dispatch wave-by-wave (context-minimizing)

For each task in wave order:

1) Dispatch the task to the worker skill implied by its `required_capabilities`.
2) Immediately run `worker-code-reviewer` for that task’s artifacts (fail-closed).
3) Mark the task completed only if both worker + review succeed.

**Context rule:** do NOT paste the entire task graph into a worker prompt. Provide only:
- the selected task object (task_id/title/steps/DoD/inputs/trace_anchors), and
- the list of its `depends_on` task_ids (so the worker knows upstream context), and
- any referenced input file paths.

**Determinism rule (capability → worker):** do NOT invent worker selection.
- Resolve via `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`.
- The `build_dispatch_manifest_v1.md` file (Step 2b) is a precomputed view of this mapping.

On any worker/review failure: write a feedback packet and STOP.

### Step 4 — Build post-gate: runnable candidate integrity (mechanical; fail-closed)

After ALL tasks have completed successfully, run:

- `node tools/caf/build_postgate_companion_runnable_v1.mjs <instance_name>`

This post-gate is mechanical only. It MUST fail-closed if the companion repo is not minimally runnable (common issues: invalid compose service nodes like `ui: null`, stray root entrypoints like `profile_v1/main.py`).

If the helper exits non-zero and wrote a feedback packet, STOP and print only the newest feedback packet path.
