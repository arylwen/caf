---
name: caf-graph-expander
description: >
  Deterministic graph expansion owner for CAF retrieval. Runs the scripted graph expander
  and fail-closed gates. No semantic work.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# caf-graph-expander

## Purpose

Make graph expansion **non-skippable**.

This skill is **deterministic only**. It does not rank, ground, or interpret.

## Inputs

- `instance_name` (required)
- `profile` (required)
- `seed_ids` (required, comma-separated)

## Procedure (strict; fail-closed)

If `graph_expansion.enabled=true` for this `profile`, expansion MUST run.

### STEP 1 — Read profile config

Read:
- `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`

Extract:
- `profiles.<profile>.graph_expansion.enabled`
- `profiles.<profile>.graph_expansion.reserve_slots`

If the profile is missing or cannot be parsed → FAIL-CLOSED with a feedback packet.

### STEP 2 — If enabled, run the expander script

Run exactly once:

`node tools/caf/graph_expand_candidates_v1.mjs <instance_name> --profile=<profile> --seeds=<seed_ids>`

### STEP 3 — Gate required graph artifacts

Run (mandatory):

`node tools/caf/graph_expansion_gate_v1.mjs <instance_name> --profile=<profile>`

If the gate fails → STOP.

NOTE: `retrieval_gate_v1` is owned by the retrieval owner and runs **after** spec candidate blocks are written.

### STEP 4 — Return open list path

Return the open list path under the **profile playbook dir**:
- If `profile=arch_scaffolding`: `reference_architectures/<instance>/spec/playbook/graph_expansion_open_list_<profile>_v1.yaml`
- If `profile=solution_architecture`: `reference_architectures/<instance>/design/playbook/graph_expansion_open_list_<profile>_v1.yaml`

## Hard rules

- No manual shortlist reuse.
- No semantic override.
- If enabled but artifacts are missing → fail-closed with a feedback packet.
