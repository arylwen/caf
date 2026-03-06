---
name: worker-pattern-retriever-solution-architecture
description: >
  Phase-specialized pattern retrieval owner for CAF solution_architecture retrieval.
  Instruction-only for semantic retrieval/ranking + grounding.
  Uses deterministic helpers for prefilter/blob/graph/debug/gate.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-pattern-retriever-solution-architecture

Hard-coded phase facts (ship rules):
- profile = `solution_architecture`
- retrieval-owner playbookDir = `design/playbook`
- candidate blocks are written back into `spec/playbook/*_spec_v1.md`

## Invocation inputs
- `instance_name` (required)

## Ship blockers (anti-shortcut)
- Do NOT run mechanical steps “against existing grounded candidate blocks in spec”.
  A refresh MUST re-rank from `semantic_candidate_subset_solution_architecture_v1.jsonl`.
- Candidate blocks are outputs, not inputs.
- Do NOT assume arch_scaffolding and solution_architecture surfaces are interchangeable.

## Output acceptance criteria (optimize for first-try pass)

Your output will be validated by deterministic gates. Produce candidates that satisfy:

1) **No injection; surfaces govern new additions**  
   - Newly added candidate IDs MUST come from:
     - `reference_architectures/<instance_name>/design/playbook/semantic_candidate_subset_solution_architecture_v1.jsonl`
     - `reference_architectures/<instance_name>/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml`  
   - Carry-forward candidates already present in the CAF-managed blocks are allowed (union), but do NOT invent new out-of-surface IDs.

2) **Graph integration (refresh point)**  
   Integrate and ground up to `reserve_slots` graph-only candidates from the open list (when available).

3) **EXT grounding proof (when EXT-* is selected)**  
   For each EXT-* candidate you include, add at least one instance-specific evidence bullet tagged `[pinned_input]` (or `[spec_excerpt]`) showing *why this instance needs it* (do not spend tokens on `[pattern_definition]` evidence unless explicitly requested).

## Minimum required artifacts (ship blocker)
All under `reference_architectures/<instance_name>/design/playbook/`:
- `semantic_candidate_subset_solution_architecture_v1.jsonl`
- `semantic_prefilter_debug_solution_architecture_v1.md`
- `retrieval_context_blob_solution_architecture_v1.md`
- `graph_expansion_open_list_solution_architecture_v1.yaml`
- `graph_expansion_trace_solution_architecture_v1.md`

## Execution order (ship blocker)

1) Prefilter (script-owned; mandatory)
- `node tools/caf/prefilter_semantic_candidates_v1.mjs <instance_name> --profile=solution_architecture --limit=180`

2) Build retrieval context blob (script-owned; mandatory)
- `node tools/caf/build_retrieval_context_blob_v1.mjs <instance_name> --profile=solution_architecture`

3) Semantic retrieval/ranking (LLM-owned; mandatory)
- Input: `.../design/playbook/retrieval_context_blob_solution_architecture_v1.md`

Seed rule (ship blocker):
- Select HIGH+MEDIUM seed_ids from the ranked working set you just produced.
- Do NOT “extract seeds” from the prefilter subset file.
- Do NOT reuse prior-run seed lists.

4) Graph expansion (script-owned; mandatory)

Invoke deterministic graph expansion owner:
- `skills/caf-graph-expander/SKILL.md` with:
  - `instance_name=<instance_name>`
  - `profile=solution_architecture`
  - `seed_ids=<comma-separated HIGH+MEDIUM pattern_ids>`

5) Integrate open-list (LLM-owned; mandatory grounding)
- Load: `.../design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml`

  - solution_architecture => `.../design/playbook/grounded_candidate_records_solution_architecture_v1.md`

- Then run the deterministic retrieval postprocess chain (mandatory):
  - `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=solution_architecture`

This helper runs, in order:
- apply_grounded_candidates_v1
- pattern_retrieval_scaffold_merge_v1
- retrieval_gate_v1

No retrieval debug report is required (LLM-authored or otherwise).

