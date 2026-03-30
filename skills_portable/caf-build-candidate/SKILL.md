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
- wave_index (optional positional selector; REQUIRED when total task count is greater than 10)

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

After gates succeed, you MUST execute the Task Graph deterministically (do not invent alternate orchestration and do not stop merely because there is no scripted dispatcher helper).

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

### Step 2c — Operator-managed wave policy (instructional; cross-runner)

This policy is semantic and MUST be followed across Codex, Claude, and Antigravity. Do not require a dedicated helper script.

Determine the total task count from `task_graph_v1.yaml` and the valid wave list from Step 2.

Policy:
- If total task count is **10 or fewer**:
  - `wave_index` is optional.
  - If omitted, you MAY execute the full graph in wave order.
  - If provided, execute ONLY that wave.
- If total task count is **greater than 10**:
  - `wave_index` is REQUIRED.
  - If `wave_index` is missing, FAIL-CLOSED with a blocker feedback packet that:
    - states unrestricted multi-wave build is not allowed for graphs larger than 10 tasks,
    - lists the total wave count,
    - lists the exact valid rerun commands `/caf build <instance_name> 0`, `/caf build <instance_name> 1`, ... `/caf build <instance_name> <last_wave>`.
  - If `wave_index` is not a non-negative integer, FAIL-CLOSED with a blocker feedback packet.
  - If `wave_index` is outside the valid wave range, FAIL-CLOSED with a blocker feedback packet that lists the valid range.

Prior-wave completion rule:
- If `wave_index > 0`, verify that every task in all prior waves already has BOTH artifacts under the COMPANION REPO evidence root:
  - `companion_repositories/<instance_name>/profile_v1/caf/task_reports/<task_id>.md`
  - `companion_repositories/<instance_name>/profile_v1/caf/reviews/<task_id>.md`
- Do NOT look for prior-wave evidence under `reference_architectures/<instance_name>/...`; build execution evidence lives under the companion repo only.
- If any are missing, FAIL-CLOSED with a blocker feedback packet that:
  - identifies the earliest incomplete prior wave,
  - lists the missing evidence paths using the full `companion_repositories/<instance_name>/profile_v1/...` paths,
  - instructs the operator to run `/caf build <instance_name> <earliest_incomplete_wave>` first.
- If the companion evidence exists, do NOT emit a blocker packet merely because a similarly named path is absent under `reference_architectures/`.

Selection rule:
- In wave-only mode, dispatch ONLY the tasks in the selected wave.
- In full-run mode, dispatch all tasks in wave order.

Packet quality rule:
- Do NOT emit a vague blocker such as “manual orchestration required” or “no canonical scripted dispatcher.”
- Any packet emitted under this step MUST explain exactly which wave selection is required and the exact rerun command(s).

### Step 3 — Dispatch wave-by-wave (context-minimizing)

For each task in the selected execution set:

- full-run mode: all tasks in wave order
- wave-only mode: only the tasks in the selected wave, still in lexicographic task_id order

1) Dispatch the task to the worker skill implied by its `required_capabilities`.
2) Immediately run `worker-code-reviewer` for that task’s artifacts (fail-closed).
3) Mark the task completed only if both worker + review succeed.

Current-session dispatch rule:
- When this build lane is already running inside a CAF CLI runner session, dispatch worker + reviewer work in the CURRENT session.
- Do NOT spawn a nested `codex exec`, nested `claude` runner, or any equivalent child runner merely to hop into a worker skill.
- The deterministic requirement is capability → worker selection and fail-closed review, not runner recursion.

**Context rule:** do NOT paste the entire task graph into a worker prompt. Provide only:
- the selected task object (task_id/title/steps/DoD/inputs/trace_anchors), and
- the list of its `depends_on` task_ids (so the worker knows upstream context), and
- any referenced input file paths.

**Determinism rule (capability → worker):** do NOT invent worker selection.
- Resolve via `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`.
- The `build_dispatch_manifest_v1.md` file (Step 2b) is a precomputed view of this mapping.

On any worker/review failure: write a feedback packet and STOP.

Nested-runner denial rule:
- Treat nested runner execution as an escape hatch, not the default dispatch mechanism.
- If you are already inside a CAF CLI runner session, an `Access is denied`, `permission denied`, `EPERM`, or equivalent nested-runner refusal means you chose the wrong dispatch path; switch to CURRENT-session worker + reviewer dispatch and continue.
- Only emit the scripted access-denied packet when worker/reviewer dispatch truly requires a nested runner in the current environment and no current-session dispatch path is available.
- If that rare case occurs, do NOT hand-write a packet. Instead run:
  - `node tools/caf/build_dispatch_exec_access_denied_packet_v1.mjs <instance_name> Codex <error summary ...>`
- Then STOP and print only the resulting packet path.

### Step 4 — Build post-gate: runnable candidate integrity (mechanical; fail-closed)

After ALL tasks in the selected execution set have completed successfully, run:

- `node tools/caf/build_postgate_companion_runnable_v1.mjs <instance_name>`

Run this post-gate:
- after the full graph in full-run mode, or
- in wave-only mode only after runtime wiring has completed (either in the selected wave or a prior completed wave)

Wave-mode defer rule:
- If runtime wiring has not completed yet, missing companion runnable surfaces (for example `docker/compose.candidate.yaml`) are expected.
- In that case, the scripted helper may return success with a defer/skip message instead of blocking.
- Do NOT write a feedback packet merely because runnable surfaces are absent before runtime wiring.

This post-gate is mechanical only. Once runtime wiring has completed, it MUST fail-closed if the companion repo is not minimally runnable (common issues: invalid compose service nodes like `ui: null`, stray root entrypoints like `profile_v1/main.py`, or compose `name:` not matching `deployment.stack_name` from the resolved guardrails view).

If the helper exits non-zero and wrote a feedback packet, STOP and print only the newest feedback packet path.
