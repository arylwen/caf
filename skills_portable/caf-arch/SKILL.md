---
name: caf-arch
description: >
  Run the CAF derivation process for a reference architecture instance in a fail-closed way.
  Orchestrates deterministic generation steps only (no new choices). Optional scripted helpers may be used for purely mechanical work per caf_operating_contract_v1.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.



# caf-arch

## Purpose

Execute the CAF derivation for an existing reference architecture instance following:

- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md`
- `architecture_library/phase_8/83_phase_8_system_spec_contract_v1.md`
- `architecture_library/phase_8/85_phase_8_contract_declarations_schema_v1.yaml`

This skill is an **orchestrator**. It does not invent choices.

This skill MUST be **rerunnable** without requiring manual deletion of CAF-managed derived outputs.
It achieves this by regenerating CAF-managed bundles/views (Layer 8) and by initializing the
companion repository skeleton in a non-destructive, merge-safe way.

Execution order invariants (deterministic; fail-closed):

- Always derive Guardrails first via `caf-guardrails`.
- If generation_phase is `architecture_scaffolding`:
  - `caf-system-architect` materializes specs and CAF-managed enrichment blocks.
  - Re-run `caf-guardrails` once to reflect adopted technology choice points.
  - Re-run `caf-system-architect` once to refresh rail summaries after the re-derivation.
  - Invoke `worker-pattern-retriever-arch-scaffolding` to emit grounded candidates **and**:
     - (optional, script-owned) `spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md`
    - `playbook/retrieval_context_blob_arch_scaffolding_v1.md`
  - Stop (do not plan tasks).
- If generation_phase is `implementation_scaffolding`:
  - `caf-solution-architect` MUST run before `caf-application-architect`.
  - Domain model derivation MUST run before planning.
- If generation_phase is later than `implementation_scaffolding`:
  - Domain model derivation may still run, but planning MUST never depend on missing derived reports.

Constraints for generation come from: Guardrails (resolved rails + atoms) + Playbook (task graph) + capability catalog.

## Inputs

- instance_name (required): folder name under `reference_architectures/` (kebab-case or snake_case)

## Preconditions (fail-closed)

Before attempting any generation, require:

- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml` exists
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml` exists

Also require (after running `caf-guardrails` in this procedure):

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` exists

If any requirement fails (non-advisory): write a feedback packet under `reference_architectures/<name>/feedback_packets/` and stop.

Advisory packets are warnings only:
- If a packet contains `- Severity: advisory`, DO NOT stop the run.
- If a packet has no explicit severity, treat it as non-advisory and stop (fail-closed).

## Procedure

Ship blocker (anti-preflight / anti-shortcut):

- Do NOT inspect existing instance artifacts to decide whether to skip any producer step (e.g., "already scaffolded; only run refresh helpers").
- This orchestrator MUST execute the phase-appropriate producer steps in order; existence/freshness checks may only be used to apply minimal edits *after* the decision to run the step.

### Step 0 — Instruction-only preflight (no helper scripts)

Proceed with the deterministic in-band steps below. Do not attempt to invoke node helpers in this skillpack.

### Internal orchestration helpers (non-skippable; no new user-facing commands):

- `skills/caf-arch-architecture-scaffolding/SKILL.md`
- `skills/caf-arch-implementation-scaffolding/SKILL.md`
- `skills/caf-arch-postprocess/SKILL.md`


1) Validate instance_name format matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) Verify pinned input files exist (fail-closed):

   - Layer 6: `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
   - Layer 8 UX inputs: `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

   2a. Placeholder hygiene (fail-closed):

      - Read `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`.
      - Read `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`.
      - If either file contains any placeholder tokens (`TBD`, `TODO`, `UNKNOWN`, `{{...}}`, `<...>`), refuse and emit a feedback packet.
      - Do NOT auto-fix timestamps; pinned inputs must be clean at creation time.

3) Execute Step A3 (Layer 8 derived views) by following (rerun-safe):

   - `skills/caf-guardrails/SKILL.md`

   Use `overwrite=true`.

3a) Parse `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` and treat it as the **single authoritative runtime view** for orchestration decisions (no branching on `profile_parameters.yaml`). Read:

   - `lifecycle.generation_phase`

   All subsequent phase-gated steps in this procedure MUST branch on the value read from `profile_parameters_resolved.yaml`.

3b) Postcondition: Layer 8 pin coherence check (fail-closed)

After `caf-guardrails` completes, verify that the resolved view actually reflects the current pins.

- Read pins from `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`:
  - `lifecycle.evolution_stage`
  - `lifecycle.generation_phase`
  - `platform spine pins (infra_target/packaging/runtime_language/database_engine)`
- Read the same three values from `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`.
- Require exact string equality for each value.

If any mismatch is observed, treat this as a **stuck state machine** (resolved view is stale) and:

**Deterministic recovery attempt (CAF-managed derived file only):**

- Delete `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (CAF-managed derived output).
- Re-run Step A3 (`caf-guardrails`) once more with `overwrite=true`.
- Re-check the three pinned values for exact equality.

If the mismatch persists after the retry:

- Write a feedback packet instructing the architect to:
  - inspect `profile_parameters.yaml` for placeholders/unexpected keys
  - run `/caf next <name>` to generate the derivation contract and review the “Derived view status” section
  - re-run `/caf arch <name>` after fixing pins
- Stop (do not proceed with any phase-gated derivation).

3c) Derivation cascade contract (v1) (authoritative state report; strict Markdown)

Regardless of phase, generate/update:

- `reference_architectures/<name>/spec/guardrails/derivation_cascade_contract_v1.md`

Preferred path (instruction-only): follow the deterministic in-band procedure in `skills/caf-next/SKILL.md` to (re)materialize `guardrails/derivation_cascade_contract_v1.md` without applying phase changes.

**Contract materialization invariant:** `caf arch` must materialize `guardrails/derivation_cascade_contract_v1.md` as part of this run. Only fail-closed for a missing contract **after** attempting materialization in-run. Feedback packets must not recommend commands that contradict this invariant.

Use the same required headings and pin-vs-resolved staleness logic as `skills/caf-next/SKILL.md`.
This file is the **single “what state am I in?”** source for downstream diagnostics.



3d) Canonical atom normalization validation (fail-closed)

Run the validator worker to ensure the resolved guardrails use a single canonical atom vocabulary and do not conflict with legacy spine fields:

- Follow: `skills/worker-atom-normalization-validator/SKILL.md`

Use `overwrite=true` (feedback packets are additive; do not delete prior packets).

If this validator emits a non-advisory feedback packet: STOP immediately (do not proceed to planning).
4) Invoke internal architecture scaffolding sub-skill (non-skippable):

   - Follow: `skills/caf-arch-architecture-scaffolding/SKILL.md`

   This will run `caf-system-architect` when `generation_phase == architecture_scaffolding` (and may run it as recovery when specs are missing).

  - 4b. Scaffolding-only re-derivation + retrieval are handled by `caf-arch-architecture-scaffolding`.

  - 4c. Always emit the traceability mindmap (even in architecture_scaffolding) by invoking:

    - Follow: `skills/caf-arch-postprocess/SKILL.md`

    Use `overwrite=true`.

    If `lifecycle.generation_phase == architecture_scaffolding`, this postprocess run will emit **mindmap only** and then `/caf arch` MUST STOP (do not proceed to planning or companion repo initialization).

5) Generation phase processing

   If `profile_parameters_resolved.yaml:lifecycle.generation_phase != architecture_scaffolding`, you MUST execute the full implementation-scaffolding orchestration by invoking:

   - Follow: `skills/caf-arch-implementation-scaffolding/SKILL.md`

   This sub-skill is **authoritative** and contains:
   - domain model derivation (pre-retrieval)
   - design-stage retrieval (`profile=solution_architecture`) + stable debug output
   - `caf-solution-architect`
   - `caf-application-architect` planning (task graph + pattern obligations)
   - explicit postconditions + feedback packets

   Do NOT re-implement those steps here.

   - 5e. If `profile_parameters_resolved.yaml:lifecycle.generation_phase != architecture_scaffolding`, perform a **semantic Playbook sanity check** (fail-closed; low-token):
      
(Instruction-only skillpack: skip helper gates and proceed with the deterministic rules below.)

      Purpose: prevent “tiny task graph” regressions by ensuring the Task Graph covers **Guardrails enforcement bar** requirements.
      This is not a syntactic gate; it is a semantic coverage check.

      Inputs:
      - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (source of enforcement bar)
      - `reference_architectures/<name>/design/playbook/task_graph_v1.yaml` (candidate)

      Rules (deterministic, fail-closed):
      - Require `playbook/task_graph_v1.yaml` exists and parses as YAML.
      - Read:
        - `candidate_enforcement_bar.runnable_policy.require_runtime_wiring` (boolean; if missing treat as false)
        - `candidate_enforcement_bar.runnable_policy.require_container_build_file` (boolean; if missing treat as false)
        - `candidate_enforcement_bar.test_policy.require_unit` (boolean; if missing treat as false)

      Schema-aligned coverage evaluation (no per-task output paths):
      - Collect all task capabilities from the Task Graph:
        - `tasks[*].required_capabilities[0]`
      - Compute:
        - `has_runtime_wiring_capability`: capability `runtime_wiring`
        - `has_container_build_capability`: capability `container_build`
        - `has_unit_tests_capability`: capability `unit_test_scaffolding`

      Coverage requirements:
        - If `require_runtime_wiring == true` and `has_runtime_wiring_capability == false`: feedback packet and stop.
        - If `require_container_build_file == true` and `has_container_build_capability == false`: feedback packet and stop.
        - If `require_unit == true` and `has_unit_tests_capability == false`: feedback packet and stop.

      Feedback packet slug: `BP-YYYYMMDD-playbook-obligation-coverage-incomplete.md`.
      Evidence MUST include:
      - the specific enforcement bar flags (quoted values)
      - the set of Task Graph capabilities found (unique, sorted)
      - the missing coverage category/categories

      The packet MUST also include a Suggested Next Action section with one of:
      - `caf-meta add-skill <capability_id>` (to scaffold a new worker skill + update the capability catalog), OR
      - `caf-make-skill` (to scaffold a new worker skill) + manual update to `80_phase_8_worker_capability_catalog_v1.yaml`.

   - 5f. If `profile_parameters_resolved.yaml:lifecycle.generation_phase != architecture_scaffolding`, perform a **pattern-obligation coverage check** (fail-closed; semantic, not a minimum-task list):

      Purpose: enforce the intended cascade:
      **patterns → obligations → tasks → TBPs**

      Inputs:
      - `reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml` (required)
      - `reference_architectures/<name>/design/playbook/task_graph_v1.yaml` (required)

      
(Instruction-only skillpack: proceed with the deterministic rules below.)

Rules (deterministic, fail-closed):
      - Require both files exist and parse as YAML.
      - Read all `obligations[*].obligation_id` from `pattern_obligations_v1.yaml`.
      - Scan all Task Graph trace anchors (`tasks[*].trace_anchors[*].pattern_id`) and collect those matching:
        - `pattern_obligation_id:<obligation_id>`
      - For each obligation_id, require at least one implementing `task_id` contains the token above.

      If any obligation is missing coverage:
      - write a feedback packet (slug: `BP-YYYYMMDD-pattern-obligation-coverage-incomplete.md`) and stop.
      Evidence MUST include:
      - list of missing obligation_ids
      - list of task_ids present (first 40)
      - the required token format (exact string)


5g. Postprocess derived views (non-skippable)

After successful planning + semantic checks in this run, emit derived, human-facing views.

- Follow: `skills/caf-arch-postprocess/SKILL.md`

Use `overwrite=true`.

This step MUST NOT introduce new decisions.

6) Verify Layer 8 resolved parameters exist (fail-closed):

   - Require: `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` exists
   - If missing: write a feedback packet and stop (do not attempt companion initialization)

7) Parse `profile_parameters_resolved.yaml` as YAML and read (deterministic):

   - `companion_repo_target`
   - `lifecycle.allowed_write_paths`
   - `lifecycle.allowed_artifact_classes`
   - `lifecycle.forbidden_actions`
   - `runnable_code_approved`
   - `candidate_enforcement_bar`

8) Apply companion repository skeleton initialization (non-destructive):

   - Follow `skills/caf-companion-init/SKILL.md`

   Use the default non-destructive behavior (do not overwrite existing files unless explicitly requested).


9) Generate authoritative state report (guardrails) (rerun-safe)

Before finishing `caf arch`, (re)generate:

- `reference_architectures/<name>/spec/guardrails/derivation_cascade_contract_v1.md`

Preferred path (instruction-only): follow the deterministic in-band procedure in `skills/caf-next/SKILL.md` to (re)materialize the contract without applying phase changes.

using the same required headings and pins-vs-resolved staleness logic as `skills/caf-next/SKILL.md`.

Fail-closed only if the pins file is missing or contains placeholder tokens.

NOTE: Compiler diagnostics reports are currently **disabled** (audit-only later). Do **not** generate:
- `grounding_ledger_v1.md`
- `relevance_report_v1.md`
- `completeness_report_v1.md`

10) ADR / architecture audit is an explicit, sparing action.

   - `caf-arch` does not run Layer 7. ADR generation is performed by `caf-layer7` in the documentation/audit loop (e.g., `caf-arch-doc`, `caf-arch-audit`).
   - To force a full re-evaluation run, use: `skills/caf-arch-audit/SKILL.md`

## Feedback packet (on failure)

Write a feedback packet to:

- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-<slug>.md`

Minimum fields:

- Stuck At
- Required Capability
- Observed Constraint
- Gap Type (Missing input | Spec inconsistency)
- Minimal Fix Proposal
- Evidence

Do not print the feedback packet contents in chat.



## Success output constraints

On success, print the following (in order). After that, append the required Next steps section below:

- One line summary (single line) with this exact shape:

  `Completed CAF derivation for reference_architectures/<name>.`

- File paths written/created (paths only)
  - MUST include: reference_architectures/<name>/spec/guardrails/derivation_cascade_contract_v1.md

Never echo file contents.

## Next steps (required)
After successful completion, include a short "Next steps" section (2–5 bullets) that:
- tells the user which ARCHITECT_EDIT_BLOCKs to review/flip (if any were emitted/updated)
- recommends re-running /caf arch after flips
- recommends running `/caf next <name>` to see the suggested next phase, then `/caf next <name> apply=true` to advance (user-initiated)
- recommends running `/caf build <name>` once phase/pins are ready
Do NOT include concrete command examples; the workflow will render them.

NOTE: Any “what phase/stage am I in?” statement in diagnostics MUST cite `derivation_cascade_contract_v1.md`.

## Completion message (required)

After a successful run of `/caf arch <name>`, emit **only** a short, phase-correct next-step hint (no extra commentary):

- If `generation_phase == architecture_scaffolding`:
  - Next step: `/caf next <name> apply=true` (advance to solution architecture), then `/caf arch <name>`
  - **Do not** recommend `/caf plan` at this stage.

- Otherwise (design/implementation scaffolding and later):
  - Next step: `/caf plan <name>` (planning is performed by `/caf plan`)

