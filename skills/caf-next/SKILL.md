---
name: caf-next
description: >
  User-initiated phase advancement advisor/applier for a CAF instance.
  Node-helper first: phase recommendation + optional apply are computed mechanically by tools/caf/next_v1.mjs.
  Fail-closed: no in-band/manual fallback in this skillpack.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.


# caf-next

## Purpose

Advance (or recommend advancing) `lifecycle.generation_phase` for a reference architecture instance **only** based on observable artifacts and the Phase 8 derivation state machine.

This command is intentionally **mechanical** and must not introduce new architecture decisions.

## Inputs
- Instance name: `<name>`
- Optional: literal token `apply` (omit it for dry-run preview)

## Reads (authoritative)
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (if present; informational)
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml` (lifecycle provenance; informational)

Additional reads (for state predicates; informational):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- `reference_architectures/<name>/feedback_packets/`
  - **Latch rule:** only packets with `Severity: blocker` (or missing `Severity:`) are blocking.
  - Packets with `Severity: advisory` are warnings and must **not** stop phase advancement checks.

## Writes
- Always: `reference_architectures/<name>/spec/guardrails/derivation_cascade_contract_v1.md`
- If `apply` is present: update `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml` ONLY by changing `lifecycle.generation_phase`.
- Coarse checkpoint (v1): when applying a phase advance out of `architecture_scaffolding`, snapshot `spec/` under:
  - `reference_architectures/<name>/.caf-state/checkpoints/architecture_scaffolding_<UTCSTAMP>/`

## Procedure (node-helper only)

1) Require the helper exists:
   - `tools/caf/next_v1.mjs`

   If missing: write a feedback packet and STOP.
   - Required capability: deterministic node helper `tools/caf/next_v1.mjs`
   - Minimal fix proposal: restore helper (producer-side) or switch to the instruction-only skillpack.

2) Run the helper:
   - `node tools/caf/next_v1.mjs <name> [--apply]`

   Constraints:
   - Do **not** print the command invocation.
   - If the helper exits non-zero and wrote a feedback packet under the instance, STOP and print only the feedback packet path.
   - Do NOT attempt any manual fallback.

## Output constraints

On success, print only two lines:

1) Summary (single line):
- If `apply` is omitted:
  - `caf-next: recommended <phase> (mode=dry-run; applied=no).`
- If `apply` is present:
  - After running the helper, open `derivation_cascade_contract_v1.md` and read `## Changes applied`.
  - If it contains an `Updated lifecycle.generation_phase` bullet, then:
    - `caf-next: recommended <phase> (mode=apply; applied=yes).`
  - Otherwise:
    - `caf-next: recommended <phase> (mode=apply; applied=no).`

2) Contract path (single line, explicit verb):
- Always:
  - `wrote: reference_architectures/<name>/spec/guardrails/derivation_cascade_contract_v1.md`

Do not echo file contents.
