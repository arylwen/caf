---
name: worker-pattern-retriever-ux-design
description: >
  Phase-specialized pattern retrieval owner for CAF ux_design retrieval.
  Instruction-only for semantic retrieval/ranking + grounding.
  Uses deterministic helpers for prefilter/blob/gate and the canonical graph expander for seed-driven widening.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-pattern-retriever-ux-design

## Purpose

This worker is the **ux_design** retrieval owner.

Hard-coded lane facts (ship rules):
- profile = `ux_design`
- playbookDir (retrieval owner artifacts) = `design/playbook`
- Candidate writeback target = `design/playbook/ux_design_v1.md`
- Candidate block = `CAF_MANAGED_BLOCK: caf_ux_pattern_candidates_v1`

Semantic ranking + seed selection + grounding are **Agent reasoning steps** and mandatory.
Deterministic helpers are mandatory for mechanical steps.

## Invocation inputs

- `instance_name` (required)

## Execution order (ship blocker)

Non-skippable checklist:
- Do NOT treat existing UX candidate blocks as an input surface. The candidate block is an output.
- Do NOT run graph expansion before selecting HIGH/MED seeds semantically from the current subset.
- Do NOT update `ux_design_v1.md` directly outside the canonical grounded-candidate dump + deterministic postprocess.

Minimum required artifact set for this run (all under `design/playbook/`):
- `ux_design_v1.md`
- `semantic_candidate_subset_ux_design_v1.jsonl`
- `semantic_prefilter_debug_ux_design_v1.md`
- `retrieval_context_blob_ux_design_v1.md`
- after graph expansion: `graph_expansion_open_list_ux_design_v1.yaml`
- after graph expansion: `graph_expansion_trace_ux_design_v1.md`

## Output acceptance criteria

Your output will be validated by deterministic gates. Produce candidates that satisfy:

1) **No injection; surfaces govern additions**
   - Every candidate you output in the dump MUST come from:
     - `semantic_candidate_subset_ux_design_v1.jsonl`, and/or
     - `graph_expansion_open_list_ux_design_v1.yaml`
   - Do not invent out-of-surface ids.

2) **Seeds are mandatory (no drops)**
   - Every pattern_id you pass as a HIGH/MED seed to the graph expander MUST appear in the dump candidate set.

3) **Graph integration**
   - Use all HIGH+MED seeds for graph expansion.
   - Add grounded graph-only candidates from the open list when they materially improve the UX lane's recall.
   - Respect the bounded shortlist posture; do not inflate the candidate count just because the graph exists.

4) **Grounding proof**
   - Every emitted candidate must be grounded in instance evidence from the UX blob and/or the pattern definition.
   - Prefer evidence hooks that tie back to PRD, `application_product_surface_v1.md` (or legacy `ui_product_surface_v1`), UX journeys/surfaces/visual direction, and visible interface-facing rails.

## Run steps in order

1) Semantic retrieval/ranking (LLM-owned; mandatory)
- Input: `reference_architectures/<instance_name>/design/playbook/retrieval_context_blob_ux_design_v1.md`
- Working set: ranked `pattern_id` with confidence (HIGH/MEDIUM/LOW)
- Drop LOW before graph expansion.

2) Deterministic graph expansion using all HIGH+MEDIUM seeds (mandatory)

Invoke deterministic graph expansion owner:
- `skills/caf-graph-expander/SKILL.md` with:
  - `instance_name=<instance_name>`
  - `profile=ux_design`
  - `seed_ids=<comma-separated HIGH+MEDIUM pattern_ids>`

3) Integrate graph open-list into the working set (LLM-owned; grounding required)
- Load:
  - `reference_architectures/<instance_name>/design/playbook/graph_expansion_open_list_ux_design_v1.yaml`
- Add grounded graph-only ids when they materially strengthen the UX lane's final candidate set.
- Keep the lane visually/demo-oriented for 0.4.0: prefer candidates that improve shell, hierarchy, density rhythm, reporting/readability, async feedback, review flows, and recovery.

4) Grounded candidate dump + deterministic postprocess (mandatory)

- Write the combined, grounded candidate records into:
  - `reference_architectures/<instance_name>/design/playbook/grounded_candidate_records_ux_design_v1.md`
  - The dump file MUST contain only candidate records in the canonical heading form (for example `### HIGH-1: ...` / `### H-1: ...`).

- Then run the deterministic postprocess chain:
  - `node tools/caf/ux_retrieval_postprocess_v1.mjs <instance_name>`

This helper runs, in order:
- `apply_grounded_candidates_v1 --profile=ux_design`
- `ux_retrieval_gate_v1`

Rules:
- Do NOT run the two helpers individually.
- If the helper cannot be invoked, FAIL-CLOSED with a feedback packet.

## Advisory packet policy

- If a deterministic gate writes a feedback packet with `Severity: advisory`, treat it as a warning.
- Do NOT attempt to fix advisory packets in-band.
- Only `Severity: blocker` (or missing Severity) requires remediation.
