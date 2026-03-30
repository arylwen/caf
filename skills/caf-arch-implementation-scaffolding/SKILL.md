---
name: caf-arch-implementation-scaffolding
description: >
  Internal sub-skill for caf-arch. Executes implementation-scaffolding orchestration steps for phases where design outputs are expected.
  Planning (obligations + task graph) is performed by `/caf plan <name>`.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# caf-arch-implementation-scaffolding

## Purpose

Provide the **design** portion of `/caf arch <name>` when
`lifecycle.generation_phase != architecture_scaffolding`.

Key properties (ship blockers):

- Clear ordering (no ambiguity)
- Do NOT expect or request a deterministic worker skill script. Semantic ranking + seed selection + grounding + semantic debug view are LLM-owned inside `worker-pattern-retriever`. Do NOT skip instrucion-only steps.
- Packet-driven (invoke producer; stop on feedback packet)
- Fail-closed (missing required outputs -> feedback packet + STOP)

This worker is complex. Make a careful plan before you execute. Follow the instructions and ship blockers exactly. Do not skip steps. Do not take shortcuts. 
The sub-skills are a mix of instruction-only and invocation. There is no deterministic scripted path end-to-end so you must execute the instructions where directed. Non-deterministic and ad-hoc execution is expected, but you must follow the instructions in each step and execute the required sub-skills where directed. Do not jump to postcondition checks before running the required skills, as that would be a chicken/egg problem. You must run the skill first, then check for outputs.
Do NOT use feedback packets as a shortcut to bypass any required step or to bypass executing a skill.

## Procedure (fail-closed; packet-driven)

Caller contract (ship blocker):
- This sub-skill is invoked only when `lifecycle.generation_phase` is in {implementation_scaffolding, pre_production, production_hardening}.
- Do not add alternate phase gates here.

Packet rule (ship blocker):
- Invoke the producer.
- If it emits a feedback packet, STOP and surface it.
- Do not "check before generate" beyond the minimum invariants below.

### Step 0 - No automatic cleanup (ship blocker)

CAF MUST NOT delete derived artifacts automatically.

- Do **not** run any reset/cleanup helpers unless the user explicitly requests a reset.
- If a reset is required to proceed, CAF will emit a feedback packet that names the exact manual reset command.

### Step 1 - Spec invariants (recoverable)
 (recoverable)

Specs are prerequisites for design/planning. 

1) If either spec file is missing write a feedback packet and STOP.

- `spec/playbook/system_spec_v1.md`
- `spec/playbook/application_spec_v1.md`

### Step 2 - Project PRD-grounded playbook sources when defaults or legacy starter content remain

Invoke:

- `skills/worker-playbook-source-projector/SKILL.md`

Hard rules:

- This step owns automatic PRD-grounded replacement for still-default or legacy-starter:
  - `spec/playbook/application_domain_model_v1.md`
  - `spec/playbook/application_product_surface_v1.md`
- Preserve meaningful human edits.
- Do not move this ownership into `/caf prd`.

Deterministic drift gate (required; fail-closed):

Run (do not print invocation):

- `node tools/caf/playbook_source_projection_drift_gate_v1.mjs <name>`

Rules:
- If it exits non-zero, it will print a feedback packet path. STOP and surface only that path.
- Do not continue into domain-model derivation when default or legacy playbook source docs are still in place and the resolved PRD is already specific.

### Step 3 - Plane-separated domain model derivation from architect-edit sources (semantic intermediate; required before design-stage retrieval)

Invoke:

- `skills/worker-domain-modeler/SKILL.md`

Hard rules:

- Require these architect-edit source docs to exist before invoking the worker:
  - `spec/playbook/application_domain_model_v1.md`
  - `spec/playbook/system_domain_model_v1.md`
- The worker MUST treat those Markdown files as the authoritative human-edit sources for detailed domain modeling.
- The worker MAY overwrite only the derived YAML views if present:
  - `design/playbook/application_domain_model_v1.yaml`
  - `design/playbook/system_domain_model_v1.yaml`
- Do **not** emit or refresh the legacy combined file `design/playbook/domain_model_v1.yaml`.
- Do **not** silently recreate or overwrite the Markdown source docs in this phase. If either source doc is missing, fail closed and instruct the user to rerun the architecture-scaffolding lane or restore the files.
- Refuse on underspecified specs, missing source docs, or unresolved plane ownership (worker writes its own feedback packet).

If a feedback packet was produced, STOP.

Deterministic post-gate (required; fail-closed):

Run (do not print invocation):

- `node tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs <name>`

Rules:
- If it exits non-zero, it will print a feedback packet path. STOP and surface only that path.
- This validator is the canonical deterministic contract check for the planner-facing plane domain-model YAML views.
- Do not continue into design-stage retrieval or planning handoff with missing/malformed plane domain-model views.

### Step 4 - Refresh design-stage pattern candidates (baseline retrieval)

Deterministic pre-retrieval helpers (MUST RUN; fail-closed):

- Run: `node tools/caf/prefilter_semantic_candidates_v1.mjs <name> --profile=solution_architecture --limit=180`
- Run: `node tools/caf/retrieval_preflight_v1.mjs <name> --profile=solution_architecture`

Rules:
- Do not print invocations.
- If a helper exits non-zero, it will write a feedback packet. STOP and surface only that packet path.

Invoke canonical retrieval owner:
   Canonical retrieval-owner step is instruction-only for semantic ranking, and is expected to complete the retrieval phase end-to-end:
   - semantic ranking + seed selection (LLM-owned)
   - deterministic graph expansion (via `caf-graph-expander`, when enabled)
   - integrate + ground graph-only candidates (fill `reserve_slots` where feasible)
   - write grounded candidates back into BOTH spec candidate blocks
   - scaffold merge/hydration
   - (no retrieval debug report required)

   - Invoke: `skills/worker-pattern-retriever-solution-architecture/SKILL.md``


   Deterministic retrieval postprocess (mandatory; idempotent):

   - Run (do not print invocation): `node tools/caf/retrieval_postprocess_v1.mjs <name> --profile=solution_architecture`

   Rules:
   - If it exits non-zero, it will print a feedback packet path. STOP and surface only that path.
   - This step removes ordering quirks (apply_grounded_candidates → scaffold merge → retrieval gate).
   - Even if the retrieval owner already ran it, rerunning is safe.

   Notes (ship blocker):
   - Do NOT expect or request deterministic scripts.
   - Semantic ranking + seed selection + grounding is LLM-owned inside `worker-pattern-retriever`.
   - Deterministic mechanics (prefilter/blob/graph traversal/scaffold merge) are executed by the retrieval owner.

   Packet handling policy for design-stage retrieval (profile=solution_architecture):

   Packet handling policy for design-stage retrieval (profile=solution_architecture):

   - Identify NEW feedback packets produced during Step 4 (retrieval owner + retriever).
     - Compare `reference_architectures/<instance>/feedback_packets/` before vs after Step 4.

   - If the ONLY new feedback packets have `Severity: advisory`:
     - DO NOT STOP.
     - Surface the packet paths as warnings.
     - Do NOT attempt to fix advisory packets. (Advisory is informational; token-saver rule.)
     - Continue to Step 6.

   - If ANY new feedback packet has `Severity: blocker`:
     - STOP and surface the newest blocker packet path.

   Notes:
   - Do not whitelist by slug. Severity is authoritative.
   - If a feedback packet is missing a `Severity:` line, treat it as `blocker`.
   - Advisory packets must never stop phase execution in CAF.

Optional interactive checkpoint (allowed; preferred over shortcuts):

- If you believe this retrieval run will be unusually expensive, you MAY ask the user once:
  - "I’m about to run the instruction-owned retrieval owner (semantic ranking + grounding + debug). What do you want me to do?"
    1) Run it now.
    2) Fail-closed with a feedback packet.
    3) Stop with no action.
- Forbidden: skipping the retrieval owner and then failing at a gate due to missing retrieval-owned outputs.

### Step 5 - Design pre-gate scaffolding (deterministic; required)

This is the MP-20 **pre-gate** scaffold for contract-first planning.
It ensures `design/playbook/contract_declarations_v1.yaml` exists and uses the canonical Phase-8 registry schema **before** the semantic design producer runs.

Run (do not print invocation):

- `node tools/caf/scaffold_contract_declarations_v1.mjs <name>`

Rules:
- If it exits non-zero, it will print a feedback packet path. STOP and surface only that path.
- If it detects a legacy/non-canonical file shape, it will back up the original under `design/playbook/` with a `.legacy.YYYYMMDD` suffix and reseed the canonical template.

### Step 6 - Run caf-solution-architect (first pass)

Solution architect is the canonical producer of design artifacts. This step is required to produce the design docs and contract declarations that are prerequisites for planning.
It is an instruction only step, but it MUST be run at least once to produce the initial design artifacts. You cannot skip it or shortcut it with feedback packets. This step has no deterministic scripted path, so you must execute the instructions in the skill. Do not jump to the postcondition checks before running the skill.

Invoke:

- `skills/caf-solution-architect/SKILL.md`

Optional interactive checkpoint (allowed; preferred over shortcuts):

- If you believe `caf-solution-architect` will be unusually expensive, you MAY ask the user once:
  - "Design outputs are currently missing (expected after reset). What do you want me to do next?"
    1) Run `caf-solution-architect` now.
    2) Fail-closed with a feedback packet.
    3) Stop with no action.
- Forbidden: checking for missing design outputs and failing-closed *without* running `caf-solution-architect`.

Do NOT use feedback packets as a shortcut to bypass any required step. 

Postcondition (fail-closed; attribute upstream):

Require these design bundle outputs exist **immediately after** `caf-solution-architect` returns. Do not check for these outputs before running `caf-solution-architect`, as that would be a chicken/egg problem. You must run the skill first, then check for outputs.

- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`

If any are missing, write a feedback packet and STOP.
This indicates `caf-solution-architect` did not emit required outputs for this phase (or emitted them under unexpected paths) and did not self-report a packet. Do NOT use feedback packets as a shortcut to bypass any required step or to bypass a skill execution. You must run the skill first, then check for outputs. 

Notes:

- `caf-solution-architect` MUST enforce the subset rule.

### Step 7 - Design postprocess: materialize script-owned planning handoff artifacts (deterministic; required)

This is a deterministic postprocess step that makes the CAF-managed design → planning handoff resilient to agent formatting drift.
It is NOT a repair script; it is a script-owned projection of already-adopted decisions.

Run (do not print invocation):

- `node tools/caf/materialize_planning_pattern_payload_v1.mjs <name>`
- `node tools/caf/materialize_design_summary_v1.mjs <name>`

Rules:
- If either script exits non-zero, it will print a feedback packet path. STOP and surface only that path.
- `materialize_planning_pattern_payload_v1` overwrites only the YAML inside `CAF_MANAGED_BLOCK: planning_pattern_payload_v1` in BOTH design docs.
- `materialize_design_summary_v1` overwrites `reference_architectures/<name>/design/playbook/design_summary_v1.md`.

### Step 8 - Design post-gate invariants (fail-closed)

This is the MP-20 **post-gate** after the semantic design step (`caf-solution-architect`) and the deterministic materialization of script-owned planning handoff artifacts.
Its job is to fail early if:
- contract declarations are still placeholder-like (e.g., contracts: []) when a material contract section exists (CP↔AP), or
- adopted patterns in spec are not fully surfaced into the design planning payload blocks.

Run (do not print invocation):

- `node tools/caf/design_postgate_contract_declarations_coherence_v1.mjs <name>`
- `node tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs <name>`
- `node tools/caf/design_postgate_planning_coherence_v1.mjs <name>`

Rules:
- If it exits non-zero, it will print a feedback packet path. STOP and surface only that path.
- Do NOT attempt to “repair” by writing ad-hoc scripts. The first-line mitigation is strengthening gates and rerunning `/caf arch`.


### Step 9 - STOP (planning moved to `/caf plan`)

At this point, the design bundle is complete for this phase.

Planning outputs (pattern obligations + task graph) are produced by a separate user-facing command:

- `/caf plan <name>`

Do not attempt to generate planning outputs inside `/caf arch`.

STOP.

## Feedback packet (on failure)

Write to:

- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-arch-implementation-scaffolding.md`

Include:

- Stuck At
- Observed Constraint
- Gap Type
- Minimal Fix Proposal
- Evidence (paths + excerpts)

Minimal Fix Proposal rules (avoid chicken/egg):

- Do NOT instruct the user to run internal sub-skills.
- Always propose only allowed router commands:
  - `/caf arch <name>`
  - `/caf plan <name>`
  - `/caf next <name> [apply]`

When sanity-check outputs are missing, the proposal MUST:

- Point the user to the newest feedback packet(s) under `reference_architectures/<name>/feedback_packets/` that explain why a producer refused.
- Instruct the user to resolve that packet's required edits, then rerun `/caf arch <name>`.
- If `lifecycle.generation_phase` looks incorrect for what they are trying to produce, instruct them to run `/caf next <name>` to inspect and adjust the phase.
