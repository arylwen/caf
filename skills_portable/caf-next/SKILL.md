---
name: caf-next
description: >
  User-initiated phase advancement advisor/applier for a CAF instance.
  Fail-closed: recommends the next sensible generation_phase based on observable artifacts
  (state machine predicates), and if apply=true, edits only profile_parameters.yaml.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.


# caf-next

## Purpose

Provide a low-friction, **user-initiated** way to advance `lifecycle.generation_phase` for an instance.

This skill may act as an “expert” in the *derivation state machine* by:
- inspecting observable artifacts under `reference_architectures/<name>/`
- determining whether a phase advance is **sensible** (prerequisites satisfied)
- printing what it recommends (and what it changed, if apply=true)

This skill MUST NOT introduce new architecture decisions. It may only recommend and (optionally) update
the single pinned key `lifecycle.generation_phase`.

## Inputs
- Instance name: `<name>`
- Optional: `apply=true|false` (default: false)

## Reads (authoritative)
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (if present; informational)

Additional reads (for state predicates; informational):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- `reference_architectures/<name>/feedback_packets/` (presence of non-advisory packets indicates fail-closed latch; packets containing `Severity: advisory` are warnings only)

## Writes
- Always (apply=false or apply=true): write/update `reference_architectures/<name>/spec/guardrails/derivation_cascade_contract_v1.md` (Markdown; strict headings; see below).
- If `apply=true`: update `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml` ONLY by changing `lifecycle.generation_phase`.
- Otherwise: no other writes.

### Derivation cascade contract (v1) — strict Markdown
This document is a **human-readable, compiler-style state report**. It must be regenerated every `caf-next` run.

Required headings (in this order):
1. `# Derivation cascade contract (v1)`
2. `## Instance` — name + absolute-relative paths used (repo-relative).
3. `## Pinned inputs` — stage, phase, platform pins (infra_target/packaging/runtime_language/database_engine) (quote the exact lines from pins file).
4. `## Derived view status` — whether `profile_parameters_resolved.yaml` exists; if it appears stale vs pins (see checks below).
5. `## Observable artifacts` — existence list for the key state predicates files (playbook specs/design/task graph; feedback packets latch).
6. `## State predicates` — brief pass/fail list of the phase-specific prerequisites evaluated.
7. `## Allowed commands and next steps` — include full syntax lines for `/caf saas <name>`, `/caf arch <name>`, `/caf next <name> [apply=true]`, `/caf build <name>`.
8. `## Recommendation` — recommended next phase (or no change) and why, citing predicates.
9. `## Changes applied` — if apply=true and phase changed, record old→new; else state 'no changes'.

**No YAML/JSON/TSV** in this file. Use bullets and short quoted snippets only.

#### Pins vs resolved staleness check (no scripts)
- Read pins from `guardrails/profile_parameters.yaml` by locating the exact lines containing:
  - `lifecycle.evolution_stage:`
  - `lifecycle.generation_phase:`
  - `platform:` (and the four required keys under it):
- If `profile_parameters_resolved.yaml` exists, locate the same keys there.
- Normalization rule (deterministic, no scripts): when comparing values, trim whitespace and strip a single pair of surrounding quotes (`"..."` or `'...'`) from both sides before comparing.
- If any normalized value differs, treat resolved as **stale** and record in the contract under `## Derived view status`.
- Recommendation when stale: run `/caf arch <name>`; if it still remains stale, recommend deleting the resolved file and re-running `/caf arch <name>`.

## Procedure

### Procedure (instruction-only)



If the scripted path is unavailable, perform the checks and writes described in this SKILL manually.

## Phase progression (v1 default)
- `architecture_scaffolding` → `implementation_scaffolding`
- `implementation_scaffolding` → `pre_production`
- `pre_production` → `production_hardening`
- `production_hardening` → (no automatic next; stop)

Important: this is a *default* ordering, not a mandate. `caf-next` must refuse to advance if prerequisite
artifacts for the current phase are missing.

## Rules (fail-closed)
- If the instance pins file is missing, write a feedback packet under `reference_architectures/<name>/feedback_packets/` and stop.
- Do NOT infer stage/phase; read it.
- Do NOT edit Layer 8 resolved view.

### State-machine-aware recommendation (expert mode)

Use the descriptive predicates in:
- `technical_notes/TN-005_phase_8_derivation_state_machine_working_v1.md`

as a guide, and compute a recommendation using only observable artifact facts.

Minimum prerequisite checks (fail-closed; do not advance if any fail):

If current phase is `architecture_scaffolding`, require:
- `playbook/system_spec_v1.md` exists and contains `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
- `playbook/application_spec_v1.md` exists and contains `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`

- `system_spec_v1.md` decision_resolutions entries are internally consistent for adopted decision patterns:
  - For any adopted pattern whose definition declares `caf.kind: decision_pattern`, require each `resolved_values.questions[*]` has **exactly one** option with `status: adopt`
  - If not, recommend **no phase change** and instruct the architect to either adopt one option or set the pattern status to `defer`

If current phase is `implementation_scaffolding`, require:
- `design/playbook/application_design_v1.md` exists
- `design/playbook/control_plane_design_v1.md` exists
- no feedback packet “latch” exists from the last run (if any non-advisory packet exists, recommend resolving it before advancing; advisory-only packets may remain)

If current phase is `pre_production`, require:
- `playbook/task_graph_v1.yaml` exists (planner output exists)

If prerequisites are not met, recommend “no phase change” and emit a feedback packet listing the missing
artifacts (and which command typically produces them), then stop.

## Output
- Always print:
  - current stage + phase
  - recommended next phase (or “no change”)
  - the exact file path to edit
  - what predicates were satisfied / missing (brief list)

If `apply=true`:
- If recommended next phase differs from current, update the phase and confirm the write occurred.
- If recommended is “no change”, do not edit the file; print that nothing was changed.

## Next steps (required)
- Recommend running `/caf arch <name>` after advancing phase.
