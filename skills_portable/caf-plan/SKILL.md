---
name: caf-plan
description: >
  CAF planning command. Produces planning artifacts (pattern obligations + task graph) after design outputs exist.
  Intended to be run after `/caf arch <instance>` has produced the design bundle.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only.


# /caf plan

## Inputs

- instance_name (required)

## Deterministic gate (fail-closed; token-saver)

Run:

- `node tools/caf/arch_gate_v1.mjs <instance_name>`

Rules:
- Do **not** print the command invocation.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

## Procedure (planning only; no new decisions)

Planning assumes the design bundle is already **coherent**:
- `/caf arch <instance>` (design) must have completed its MP-20 design post-gate invariants.
- If spec adoptions were edited after design was generated, rerun `/caf arch <instance>` before running `/caf plan <instance>`.

1) Read:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml:lifecycle.generation_phase`

2) Phase gate (fail-closed):

- If `generation_phase == architecture_scaffolding`:
  - Write a **blocker feedback packet** and STOP.
  - Minimal fix proposal:
    - `/caf next <name> apply` (to checkpoint and advance)
    - `/caf arch <name>` (to produce design outputs)
    - `/caf plan <name>` (to produce planning outputs)

3) Preconditions (fail-closed):

Require these design / derivation outputs exist before planning:

- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`
- `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml`

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

4) Invoke the canonical planning producer (instruction-owned):

- `skills/caf-application-architect/SKILL.md`

Packet handling:
- If any new feedback packet has `Severity: blocker`, STOP and surface the newest blocker.
- If ONLY advisory packets were produced, DO NOT STOP.

5) Mechanical YAML scalar-safety postprocess (deterministic)

Run:

- `node tools/caf/planning_yaml_scalar_safety_postprocess_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- This helper is script-owned and mechanical only; it rewrites unsafe plain scalars containing `: ` in planning YAML so downstream parsers do not fail on valid planning content.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

6) Producer-side planning invariants (fail-closed; do not "auto-fix")

Run:

- `node tools/caf/planning_invariant_gate_v1.mjs <name>`

Rules:
- Do **not** print the invocation.
- This gate exists so `/caf plan` fails on planner-owned omissions before those same defects surface later in `/caf build`.
- If it exits non-zero, it will print or write a CAF-owned feedback packet path. STOP and surface only that path.

Important:
- `interface_binding_contracts_v1.yaml` is not a prerequisite for Step 4.
- The scripted post-plan phase is allowed to enrich `task_graph_v1.yaml` mechanically only for framework-owned derivations (for example library-owned semantic acceptance attachment expansion and interface binding contract propagation).
- It is generated mechanically during the post-plan invariant phase after the planner emits `task_graph_v1.yaml`.
- The same scripted post-plan phase may update the task graph mechanically so bound consumer/provider/assembler tasks take `interface_binding_contracts_v1.yaml` as a required input.
- If that file is missing after `/caf plan`, investigate the planner output and `tools/caf/post_plan_gate_v1.mjs`, not `/caf arch`.

7) Deterministic planning validation (fail-closed; no hidden repair)

Run:

- `node tools/caf/validate_instance_v1.mjs <name> --mode=plan`

Rules:
- Do **not** print the invocation.
- If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

8) Finalize planning traceability view (non-authoritative; overwrite=true)

- Follow: `skills/worker-traceability-mindmap/SKILL.md`

Postcondition:
- Require `reference_architectures/<name>/design/caf_meta/plan_traceability_mindmap_v3.md` exists.
- If missing: write a feedback packet and STOP.

9) Optional human backlog projection

- `task_backlog_v1.md` is **not** planner-owned output from Step 4.
- The human backlog view is now projected on demand by `/caf backlog <name>` from the already-emitted `task_graph_v1.yaml`.
- Do **not** invent temporary backlog projector scripts under `tools/caf/` just because the task graph is large.

STOP.


Planning note:
- `application_domain_model_v1.yaml` and `system_domain_model_v1.yaml` are now the only planner-facing domain-model inputs.
- Do not read or regenerate the legacy combined file `design/playbook/domain_model_v1.yaml`.
