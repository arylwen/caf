---
name: caf-arch-implementation-scaffolding
description: >
  Internal sub-skill for caf-arch. Executes implementation-scaffolding orchestration
  steps for phases where design + planning outputs are expected.
  No new user-facing commands.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-arch-implementation-scaffolding

## Purpose

Provide the **implementation scaffolding** portion of `/caf arch <name>` when
`lifecycle.generation_phase != architecture_scaffolding`.

This sub-skill exists to prevent step skipping by medium reasoning agents.

Key properties (ship blockers):

- Deterministic ordering (no ambiguity)
- Packet-driven (invoke producer; stop on blocker feedback packets; advisory packets are non-stopping warnings)
- Fail-closed (missing required outputs -> feedback packet + STOP)

## Procedure (fail-closed; packet-driven)

### Step 0 - Phase gate

1) Read `guardrails/profile_parameters_resolved.yaml` and require:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

- `lifecycle.generation_phase` is one of:
  - `implementation_scaffolding`
  - `pre_production`
  - `production_hardening`

If not, STOP (this helper is not applicable).

### Step 1 - Spec invariants (recoverable)

Specs are prerequisites for design/planning. If missing, attempt deterministic recovery.

1) If either spec file is missing:

- `spec/playbook/system_spec_v1.md`
- `spec/playbook/application_spec_v1.md`

Invoke:

- `skills/caf-system-architect/SKILL.md`

If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

2) Require both spec files exist after recovery. If either is still missing, write a feedback packet and STOP.

### Step 2 - Domain model derivation (semantic intermediate; required before design-stage retrieval)

Invoke:

- `skills/worker-domain-modeler/SKILL.md`

Hard rules:

- Overwrite `playbook/domain_model_v1.yaml` if present

Write to design-stage:

- `design/playbook/domain_model_v1.yaml`
- Refuse on underspecified specs (worker writes its own feedback packet)

If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

### Step 3 - Refresh design-stage pattern candidates (baseline retrieval)

Deterministic pre-retrieval helpers (MUST RUN; no skipping):

Full pack scripted path:
- Run: `node tools/caf/prefilter_semantic_candidates_v1.mjs <name> --profile=solution_architecture --limit=180`
- Run: `node tools/caf/build_retrieval_context_blob_v1.mjs <name> --profile=solution_architecture`

Portable rule (ship blocker):
- Do not run scripts. Continue with the semantic retrieval owner step below.

Invoke the retrieval owner once before design:

- `skills/worker-pattern-retriever-solution-architecture/SKILL.md``

If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

Then perform deterministic graph expansion (REQUIRED when enabled):

- Invoke: `skills/caf-graph-expander/SKILL.md` with:
  - `instance_name=<name>`
  - `profile=solution_architecture`
  - `seed_ids=<the seed ids selected by retrieval>`

Retrieval postprocess (mandatory):

Full pack scripted path:
- Run: `node tools/caf/retrieval_postprocess_v1.mjs <name> --profile=solution_architecture`

Portable rule (ship blocker):
- Do not run scripts. If the postprocess would fail (missing grounded candidate dump, missing graph artifacts when enabled, malformed candidate blocks), write a feedback packet and STOP.

### Step 4 - Design pre-gate scaffolding (contract declarations; required)

This is the MP-20 **pre-gate** scaffold for contract-first planning.

Full pack scripted path:
- Run: `node tools/caf/scaffold_contract_declarations_v1.mjs <name>`

Portable rule (ship blocker):
- Do not run scripts.
- Ensure `design/playbook/contract_declarations_v1.yaml` exists and uses the canonical schema:
  - `registry_version: contract_declarations_v1`
  - `contracts: []` (array)
- If missing or non-canonical, write a feedback packet and STOP.

### Step 5 - Run caf-solution-architect (first pass)

Invoke:

- `skills/caf-solution-architect/SKILL.md`

If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

Postcondition (fail-closed; attribute upstream):

Require these design bundle outputs exist **immediately after** `caf-solution-architect` returns:

- `design/playbook/contract_declarations_v1.yaml`
- `design/playbook/control_plane_design_v1.md`
- `design/playbook/application_design_v1.md`

If any are missing, write a feedback packet and STOP.
This indicates `caf-solution-architect` did not emit required outputs for this phase (or emitted them under unexpected paths) and did not self-report a packet.

Notes:

- `caf-solution-architect` MUST enforce the subset rule.

### Step 6 - Planning (obligations + task graph)

Before planning, run the mandatory design post-gates (MP-20):

Run (do not print invocation):

- `node tools/caf/materialize_planning_pattern_payload_v1.mjs <name>`
- `node tools/caf/materialize_design_summary_v1.mjs <name>`
- `node tools/caf/design_postgate_contract_declarations_coherence_v1.mjs <name>`
- `node tools/caf/design_postgate_planning_coherence_v1.mjs <name>`

If any exit non-zero, it will print a feedback packet path. STOP and surface only that path.

Invoke:

- `skills/caf-application-architect/SKILL.md`

If a feedback packet was produced with `Severity: blocker`, STOP and surface it.
If a feedback packet was produced with `Severity: advisory`, treat it as a warning and continue.
If a feedback packet is missing a `Severity:` line, treat it as `Severity: blocker` and STOP.

Postcondition (fail-closed; attribute upstream):

Require these planning outputs exist **immediately after** `caf-application-architect` returns:

- `design/playbook/pattern_obligations_v1.yaml`
- `design/playbook/task_graph_v1.yaml`

If any are missing, write a feedback packet and STOP.
This indicates `caf-application-architect` did not emit required outputs for this phase (or emitted them under unexpected paths) and did not self-report a packet.

### Step 7 - End-of-run bundle check (backstop; fail-closed)

At this point, design + planning producers should already have been validated by earlier postconditions.
This check is a final backstop to catch unexpected path drift.

Require these final outputs exist:

- `design/playbook/contract_declarations_v1.yaml`
- `design/playbook/control_plane_design_v1.md`
- `design/playbook/application_design_v1.md`
- `design/playbook/pattern_obligations_v1.yaml`
- `design/playbook/task_graph_v1.yaml`

If any are missing, write a feedback packet and STOP.

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
  - `/caf next <name> [apply]`

When sanity-check outputs are missing, the proposal MUST:

- Point the user to the newest feedback packet(s) under `reference_architectures/<name>/feedback_packets/` that explain why a producer refused.
- Instruct the user to resolve that packet's required edits, then rerun `/caf arch <name>`.
- If `lifecycle.generation_phase` looks incorrect for what they are trying to produce, instruct them to run `/caf next <name>` to inspect and adjust the phase.