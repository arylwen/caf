---
name: caf-ux-build
description: >
  Realize the separate UX build lane from ux_task_graph_v1.yaml after the main build lane
  has completed. Keeps the smoke-test UI lane separate and dispatches only bounded UX tasks.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# /caf ux build

## Inputs

- instance_name (required)
- wave_index (optional positional escape hatch; normal usage is `/caf ux build <instance>`)

## Purpose

`/caf ux build` realizes the separate UX build lane.

It owns exactly these concerns:
- consume `ux_task_graph_v1.yaml`, `ux_visual_system_v1.md`, and bounded UX inputs;
- require the main `/caf build <instance>` lane to have completed first;
- dispatch UX tasks to UX-lane workers without reusing the smoke-test UI worker/task namespace;
- write the richer UX surface under a separate companion-repo UX namespace/root;
- materialize separate same-stack UX packaging when the UX packaging task is selected (Dockerfile.ux, nginx.ux.conf, compose ux: service).

It must **not**:
- replace `/caf build`;
- rewrite the smoke-test UI lane under `profile_v1/code/ui/`;
- invent a new backend contract style.

## Required preflight (fail-closed)

Run:

- `node tools/caf/ux_build_preflight_v1.mjs <instance_name>`

Rules:
- Do **not** print the invocation.
- If the helper exits non-zero and wrote a feedback packet, STOP and print only that feedback packet path.
- This preflight is authoritative for the chicken-and-egg rule: `/caf build <instance>` must already have completed and the current build candidate must remain minimally runnable before `/caf ux build <instance>` proceeds.

## Deterministic dispatch manifest (mechanical)

Run:

- `node tools/caf/gen_build_dispatch_manifest_v1.mjs <instance_name> --task-graph ux_task_graph_v1.yaml --out ux_build_dispatch_manifest_v1.md`

This produces:

- `reference_architectures/<name>/design/playbook/ux_build_dispatch_manifest_v1.md`

## Stateful wave selection (mechanical)

Run:

- `node tools/caf/build_wave_state_v1.mjs <instance_name> --task-graph ux_task_graph_v1.yaml --state-file ux_build_wave_state_v1.json` when `wave_index` is omitted
- `node tools/caf/build_wave_state_v1.mjs <instance_name> <wave_index> --task-graph ux_task_graph_v1.yaml --state-file ux_build_wave_state_v1.json` when the explicit escape hatch is used

Policy:
- reuse the same deterministic wave algorithm as `/caf build`, but against `ux_task_graph_v1.yaml`;
- evidence still lives under `companion_repositories/<instance>/profile_v1/caf/task_reports/` and `caf/reviews/`;
- state lives under `reference_architectures/<instance>/.caf-state/ux_build_wave_state_v1.json`.

## Dispatch procedure

For each task in the selected execution set:

1) Dispatch the selected task object to the worker implied by the capability catalog.
2) Immediately run `worker-code-reviewer` for that task’s artifacts.
3) Mark the task completed only if both worker + review succeed.

Current-session dispatch rule:
- When this UX build lane is already running inside a CAF CLI runner session, dispatch worker + reviewer work in the CURRENT session.
- Do NOT spawn a nested `codex exec`, nested `claude` runner, or equivalent child runner merely to hop into a worker skill.
- The deterministic requirement is capability → worker selection and fail-closed review, not runner recursion.

Context rule:
- do NOT paste the entire UX task graph into a worker prompt.
- Provide only the selected task object, its `depends_on` task ids, and referenced input paths.

Determinism rule:
- worker selection must come from `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`.
- the manifest above is the authoritative precomputed view.

## Post-execution refresh

After the selected execution set succeeds, rerun the same wave-state helper command so `.caf-state/ux_build_wave_state_v1.json` reflects current evidence.

## Completion messaging rule

- If `completed=true`, report that the current UX build lane is complete.
- If `execution_mode=wave_only` and `completed=false`, report:
  - `current UX wave X out of Y completed`
  - `next step: /caf ux build <instance_name>`
