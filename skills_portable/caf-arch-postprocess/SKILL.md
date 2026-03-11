---
name: caf-arch-postprocess
description: >
  Internal sub-skill for caf-arch.
  Emits rerun-safe derived views (backlog + traceability mindmap) and performs
  lightweight projection integrity checks.
  No new user-facing commands.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-arch-postprocess

## Purpose

Finalize `/caf arch <name>` by emitting human-facing derived views that are
pure projections of authoritative playbook artifacts.

This sub-skill is intentionally narrow:
- It MUST NOT introduce new decisions.
- It MUST be rerun-safe (`overwrite=true`).
- It MUST be fail-closed for required derived views.

Authoritative sources:
- Task Graph: `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- Pattern obligations: `reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml`

Derived views emitted here:
- Backlog projection: `reference_architectures/<name>/design/playbook/task_backlog_v1.md` (required)
- Traceability mindmap (phase-owned; required; fail-closed):
  - `architecture_scaffolding` => `reference_architectures/<name>/spec/caf_meta/spec_traceability_mindmap_v3.md`
  - `implementation_scaffolding` (design post-gate) => `reference_architectures/<name>/design/caf_meta/design_traceability_mindmap_v3.md`
  - planning (`/caf plan`) => `reference_architectures/<name>/design/caf_meta/plan_traceability_mindmap_v3.md`

Authoritative instance surfaces (ship rule):
- Only read/write within:
  - `reference_architectures/<name>/spec/playbook/**`
  - `reference_architectures/<name>/spec/guardrails/**`
  - `reference_architectures/<name>/design/playbook/**`
  - `reference_architectures/<name>/feedback_packets/**`
- Ignore sibling folders such as `playbook-1`, `playbook-2`, `playbook_old`, `tmp`, etc. They are user-created and MUST NOT be searched or read.
- Do not delete user-generated content. This skill may delete only CAF-managed obsolete outputs inside the canonical folders (e.g., deprecated derived views under `spec/caf_meta/`).

## Procedure

0a) Populate CAF-managed pin explanations (deterministic; overwrite=true)

   This portable skillpack is **instruction-only** and MUST NOT invoke scripts.

   The orchestrator/runtime MUST populate only:
   - `CAF_MANAGED_BLOCK: pin_value_explanations_v1` in `system_spec_v1.md`

   Postcondition (fail-closed):
   - Require `system_spec_v1.md` contains a non-placeholder `pin_value_explanations_v1` block.
   - If missing: write a feedback packet and STOP.

0) Read `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml` (required) and determine `lifecycle.generation_phase`.

   - Optionally read `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (if present) for additional context, but **do not** use the resolved view to gate phase behavior (it is derived and can lag the pin).

1) If `generation_phase == architecture_scaffolding`:

   - Do NOT attempt backlog generation (Task Graph is not guaranteed to exist).
   - DO emit the traceability mindmap anyway (it is a best-effort diagnostic projection that must render even when planning outputs are missing):

     - The orchestrator/runtime MAY use a deterministic helper.
     - Otherwise, follow: `skills/worker-traceability-mindmap/SKILL.md`

   Postcondition (fail-closed):
   - Require `reference_architectures/<name>/spec/caf_meta/spec_traceability_mindmap_v3.md` exists.
   - If missing: write a feedback packet and STOP.

   1a) Emit retrieval diagnostics (CAF-managed; scripted; rerun-safe)

   Rationale:
   - CAF provides deterministic projections derived from authoritative artifacts in the canonical playbook folder.

   Actions (instruction only; overwrite=true):
    - Use deterministic helper: `tools/caf/build_candidate_selection_report_v1.mjs` (environment-run; no command inline)
     - Output: `reference_architectures/<name>/spec/caf_meta/pattern_candidate_selection_report_arch_scaffolding_v1.md`

   Postconditions (fail-closed):
   - Require selection report exists under `spec/caf_meta/`.

   Then exit successfully.

2) Otherwise (any phase where planning is expected):

   Preconditions (fail-closed):
   - Require `reference_architectures/<name>/design/playbook/task_graph_v1.yaml` exists and parses as YAML.

   2a) Emit backlog projection (required; fail-closed)

   - Follow: `skills/worker-task-backlog-projector/SKILL.md`
   - Use `overwrite=true`.
   - This worker is the canonical writer for `task_backlog_v1.md` during planning finalization.
   - If a stale or wrong file already exists at the backlog path (including a task-plan-shaped file), replace it rather than merging with it.

   Postcondition (fail-closed):
   - Require `reference_architectures/<name>/design/playbook/task_backlog_v1.md` exists.
   - Require the first markdown heading is exactly `# Task Backlog (v1)`.

   Projection integrity check (fail-closed; deterministic):
   - Run: `node tools/caf/backlog_integrity_check.mjs <name>`
   - Require each task_id from `task_graph_v1.yaml` appears as a backlog section header.
   - Require each backlog section contains the canonical fields:
     - `Capability:`
     - `Dependencies:`
     - `Definition of Done:`
     - `Steps:`
     - `Gates:`
     - `Semantic review questions:`
     - `Story/References:`
     - `Trace anchors:`
     - `Inputs:`
   - Require the backlog file is not task-plan-shaped and is not byte-identical to `task_plan_v1.md` when that file exists.
   - If any check fails: write a feedback packet and STOP.

   2b) Emit traceability mindmap (required; fail-closed)

   - Follow: `skills/worker-traceability-mindmap/SKILL.md`
   - Use `overwrite=true`.

   Postcondition (fail-closed):
   - Require `reference_architectures/<name>/design/caf_meta/plan_traceability_mindmap_v3.md` exists.
   - If missing: write a feedback packet and STOP.

3) Do not modify instance outputs outside CAF-managed blocks.

## Feedback packet (on failure)

Write to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-arch-postprocess-derived-views.md`

Include:
- Stuck At
- Observed Constraint
- Gap Type
- Minimal Fix Proposal
- Evidence (file paths + excerpts as needed)
