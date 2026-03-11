---
name: worker-phase-advancer
description: >
  Internal phase advancement worker for CAF.
  Determines the next sensible `lifecycle.generation_phase` from the current phase
  using minimal observable prerequisites and, when apply is requested, updates only
  `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`.
  No new user-facing commands.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-phase-advancer

## Purpose

Advance `lifecycle.generation_phase` **without** the user-facing `caf-next` UX overhead.
This is intended for internal orchestrators to reduce token usage and
avoid wrapper-on-wrapper compaction.

Fail-closed is mandatory: if prerequisites are missing or ambiguous, write a feedback packet and stop.

## Inputs

- `instance_name` (required)
- `apply` (optional literal token; default behavior is to apply when invoked directly)

## Reads (authoritative)

- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

Prerequisite probes (existence only; no deep parsing):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/spec/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- `reference_architectures/<name>/feedback_packets/` (latch)

## Writes

- If `apply` is present: update **only** `guardrails/profile_parameters.yaml` by changing `lifecycle.generation_phase`.
- On failure: write a feedback packet:
  - `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-phase-advance.md`

## Phase ordering (default)

- `architecture_scaffolding` → `implementation_scaffolding`
- `implementation_scaffolding` → `pre_production`
- `pre_production` → `production_hardening`
- `production_hardening` → (no automatic next)

## Minimal prerequisites (token-light; fail-closed)

Do **not** attempt to validate every intermediate artifact. Only validate the *phase-gating* files:

- If current phase is `architecture_scaffolding`, require both spec files exist:
  - `playbook/system_spec_v1.md`
  - `playbook/application_spec_v1.md`

- If current phase is `implementation_scaffolding`, require both design files exist:
  - `playbook/control_plane_design_v1.md`
  - `playbook/application_design_v1.md`

- If current phase is `pre_production`, require:
  - `playbook/task_graph_v1.yaml`

- If any feedback packets exist, refuse to advance (latch).

## Procedure

1) Read current `lifecycle.generation_phase` from `profile_parameters.yaml`.

2) If `feedback_packets/` contains any `BP-*.md`:
   - write a feedback packet explaining the latch and stop.

3) Determine the recommended next phase using Phase ordering.
   - If current is `production_hardening`, write a feedback packet stating no automatic next phase and stop.

4) Check the minimal prerequisites for the *current* phase (above).
   - If any required file is missing, write a feedback packet listing missing files and stop.

5) If `apply=false`:
   - print the current phase and the recommended next phase; do not edit any files; stop.

6) If `apply` is present:
   - update `profile_parameters.yaml` by changing **only** `lifecycle.generation_phase`.
   - print old → new.

## Feedback packet contents (required)

- `## Stuck At` (which prerequisite check failed)
- `## Observed Constraint` (missing file(s) / latch / no next phase)
- `## Minimal Fix Proposal` (which producing sub-skill is expected to generate the missing file)
- `## Evidence` (paths)
