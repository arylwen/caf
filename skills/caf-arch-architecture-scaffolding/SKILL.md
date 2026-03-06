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

## Procedure (fail-closed; packet-driven)

Caller contract (ship blocker):
- This sub-skill is invoked only when `lifecycle.generation_phase == architecture_scaffolding`.
- Do not add alternate paths or phase gates here.

Steps:

1) Deterministic playbook spec seeding (token-saver; mandatory; fail-closed):

   Rationale: `build_pin_value_explanations_v1.mjs` writes into `spec/playbook/system_spec_v1.md`, so the playbook specs must exist before pin enrichment runs.

   - Run: `node tools/caf/seed_playbook_specs_v1.mjs <name>`

   Rules:
   - Do **not** print the invocation.
   - If it exits non-zero, STOP and surface only the error (it will have printed it).

2) Pinned inputs (script-owned; mandatory; fail-closed):

   Rationale: pinned inputs are authoritative lifecycle + platform pins and must be hydrated deterministically
   (avoid LLM drift and avoid placeholder leakage).

   - Run: `node tools/caf/build_pinned_inputs_v1.mjs <name>`

   Rules:
   - Do **not** print the invocation.
   - If it exits non-zero, STOP and surface only the error (it will have printed it).

3) Pin value explanations (script-owned; mandatory; fail-closed):


   Rationale: prevents the agent from “prefilling pins” in-band before retrieval.

   - Run: `node tools/caf/build_pin_value_explanations_v1.mjs <name>`

   Rules:
   - Do **not** print the invocation.
   - If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

4) Invoke once (single owner for pin-derived constraints + tech profile explanations; no refresh call):
   - `skills/caf-system-architect/SKILL.md`

   Notes:
   - This step MUST derive `pin_derived_system_constraints_v1` from the populated `pin_value_explanations_v1` block (dependency ordering).
   - This step MUST (re)write `tech_profile_explanations_v1` from the resolved rails view.

   If a feedback packet was produced, STOP.

5) Deterministic prefilter (token-saver; mandatory; fail-closed):

   - Run: `node tools/caf/prefilter_semantic_candidates_v1.mjs <name> --profile=arch_scaffolding --limit=180`

   Rules:
   - Do **not** print the invocation.
   - If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

6) Retrieval context blob (mandatory; fail-closed):

   - Run: `node tools/caf/build_retrieval_context_blob_v1.mjs <name> --profile=arch_scaffolding`

   Rules:
   - Do **not** print the invocation.
   - If it exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

7) Invoke canonical retrieval owner (retrieval owner; end-to-end):
   Canonical retrieval-owner step is instruction-only for semantic ranking, and is expected to complete the retrieval phase end-to-end:
   - semantic ranking + seed selection (Agent reasoning step)
   - deterministic graph expansion (via `caf-graph-expander`, when enabled)
   - integrate + ground graph-only candidates (fill `reserve_slots` where feasible)
   - write grounded candidates back into BOTH spec candidate blocks
   - scaffold merge/hydration
   - (no retrieval debug report required)

   - Invoke: `skills/worker-pattern-retriever-arch-scaffolding/SKILL.md``

   Notes (ship blocker):
   - Do NOT expect or request a deterministic “seed extraction” script.
   - Semantic ranking + seed selection + grounding is an Agent reasoning step inside `worker-pattern-retriever`.
   - Deterministic mechanics (prefilter/blob/graph traversal/scaffold merge) are executed by the retrieval owner.

   Packet handling policy for retrieval (profile=arch_scaffolding):

   Packet handling policy for retrieval (profile=arch_scaffolding):

   - Identify NEW feedback packets produced during the retrieval owner + retriever run.
     - Compare `reference_architectures/<instance>/feedback_packets/` before vs after Step 3.

   - If the ONLY new feedback packets have `Severity: advisory`:
     - DO NOT treat this as a failure.
     - Surface the packet paths as warnings.
     - Do NOT attempt to fix advisory packets. (Advisory is informational; token-saver rule.)
     - Continue to the end of this phase (STOP).

   - If ANY new feedback packet has `Severity: blocker`:
     - STOP and surface the newest blocker packet path.

   Notes:
   - Do not whitelist by slug. Severity is authoritative.
   - If a feedback packet is missing a `Severity:` line, treat it as `blocker`.
   - Advisory packets must never stop phase execution in CAF.


STOP.
