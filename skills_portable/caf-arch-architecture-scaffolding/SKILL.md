---
name: caf-arch-architecture-scaffolding
description: >
  Internal sub-skill for caf-arch. Produces/refreshes pinned Layer-8 derived view
  and scaffolds the system/application specifications (architecture_scaffolding phase).
  No new user-facing commands.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-arch-architecture-scaffolding

## Purpose

Provide the **architecture scaffolding** portion of `/caf arch <name>`.

This skill exists to prevent step skipping by medium reasoning agents.

## Inputs (required)

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

Note: this sub-skill is intentionally **packet-driven** to reduce token usage and avoid
"checked-before-generated" foot-guns. Do not pre-check downstream artifacts; invoke the
producing sub-skill and stop if it emits a feedback packet.

Ship blocker (anti-shortcut):
- Do NOT inspect the instance filesystem to decide whether `caf-system-architect` is “already done”, “fresh”, or “needs block updates”.
- Do NOT substitute a “script-only refresh” for instruction-owned producer steps.
- Always run the producing sub-skill(s) in the order below. "Exists" ≠ "invoked".

## Procedure (fail-closed; packet-driven; non-skippable)

0) Read `profile_parameters_resolved.yaml:lifecycle.generation_phase`.

1) If `generation_phase == architecture_scaffolding`:

   STEP 1 — Spec scaffolding (packet-driven)
   - Invoke: `skills/caf-system-architect/SKILL.md`
- If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
- If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

   STEP 2 — Guardrails resolution (scripted; deterministic)
   - Invoke: `skills/caf-guardrails/SKILL.md` with `overwrite=true`
- If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
- If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

   STEP 3 — Refresh spec scaffolding
   - Invoke: `skills/caf-system-architect/SKILL.md`
- If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
- If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

   STEP 4 — Deterministic pre-retrieval helpers (MUST RUN; no skipping)
   - Invoke deterministic helper: `tools/caf/build_pinned_inputs_v1.mjs <name>`
   - Invoke deterministic helper: `tools/caf/build_pin_value_explanations_v1.mjs <name>`
   - Invoke deterministic helper: `tools/caf/prefilter_semantic_candidates_v1.mjs <name> --profile=arch_scaffolding --limit=180`
   - Invoke deterministic helper: `tools/caf/build_retrieval_context_blob_v1.mjs <name> --profile=arch_scaffolding`

   STEP 5 — Retrieval (retrieval owner; end-to-end)
   - Invoke: `skills/worker-pattern-retriever-arch-scaffolding/SKILL.md``
   - Retrieval owner is expected to complete graph expansion (when enabled), integration, and produce the grounded candidate dump; the deterministic postprocess step performs spec writeback + scaffold merge + retrieval gate.
- If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
- If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

   STEP 6 — Retrieval postprocess (mandatory)
   - Ship blocker: do NOT run the postprocess if the retrieval owner did not produce required artifacts for this run.
     - Required (under `reference_architectures/<name>/spec/playbook/`):
       - `retrieval_context_blob_arch_scaffolding_v1.md`
       - `semantic_candidate_subset_arch_scaffolding_v1.jsonl`
       - `grounded_candidate_records_arch_scaffolding_v1.md`
       - `graph_expansion_open_list_arch_scaffolding_v1.yaml` (when graph expansion enabled)
       - `graph_expansion_trace_arch_scaffolding_v1.md` (when graph expansion enabled)
       - (optional, script-owned) `spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md`
       - Updated candidate blocks in BOTH spec files (written by retrieval_postprocess)
   - Invoke deterministic helper: `tools/caf/retrieval_postprocess_v1.mjs <name> --profile=arch_scaffolding`
   - If the postprocess fails, STOP.

2) If `generation_phase != architecture_scaffolding`:

   - If either spec file is missing, invoke `skills/caf-system-architect/SKILL.md` to regenerate.
   - Do **not** run retrieval here.

3) STOP.