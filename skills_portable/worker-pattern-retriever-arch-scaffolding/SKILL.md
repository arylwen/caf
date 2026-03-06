---
name: worker-pattern-retriever-arch-scaffolding
description: >
  Phase-specialized pattern retrieval owner for CAF architecture_scaffolding.
  Instruction-only for semantic retrieval/ranking + grounding.
  Uses deterministic helpers for prefilter/blob/graph/debug/gate.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-pattern-retriever-arch-scaffolding

Hard-coded phase facts (ship rules):
- profile = `arch_scaffolding`
- playbookDir = `spec/playbook`

## Invocation inputs
- `instance_name` (required)

## Output acceptance criteria (optimize for first-try pass)

Your output will be validated by deterministic gates. Produce candidates that satisfy:

1) **Surface provenance (no injection)**  
   Candidate IDs MUST be a subset of:
   - `reference_architectures/<instance_name>/spec/playbook/semantic_candidate_subset_arch_scaffolding_v1.jsonl`
   - `reference_architectures/<instance_name>/spec/playbook/graph_expansion_open_list_arch_scaffolding_v1.yaml`  
   Do NOT add patterns outside these surfaces (including EXT-*), even if they feel “useful”.

2) **Graph integration (refresh point)**  
   Integrate and ground up to `reserve_slots` graph-only candidates from the open list (when available).

3) **Pin coverage bar (token-efficient)**  
   Across the candidate set, every pin ID present in `architecture_shape_parameters.yaml` must appear at least once in evidence as:  
   `pin_ref: <PIN-ID>=<value>` (with a cite to the pins file).

4) **Union refresh (do not drop)**  
   Treat refresh as **existing ∪ new**. Keep existing candidates already in the CAF-managed blocks unless they violate (1).


5) **Candidates MUST be present (no easy outs)**  
   Replace the placeholder sentinel line in the CAF-managed candidates blocks.  
   BOTH candidate blocks must contain ≥1 canonical candidate record:
   - `spec/playbook/system_spec_v1.md` (caf_decision_pattern_candidates_v1)
   - `spec/playbook/application_spec_v1.md` (caf_decision_pattern_candidates_v1)  
   If no candidates can be grounded, FAIL-CLOSED and write a retrieval diagnostics feedback packet (do not leave the section empty / placeholder).

## Minimum required artifacts (ship blocker)
All under `reference_architectures/<instance_name>/spec/playbook/`:
- `semantic_candidate_subset_arch_scaffolding_v1.jsonl`
- `semantic_prefilter_debug_arch_scaffolding_v1.md`
- `retrieval_context_blob_arch_scaffolding_v1.md`
- `graph_expansion_open_list_arch_scaffolding_v1.yaml`
- `graph_expansion_trace_arch_scaffolding_v1.md`

## Execution order (ship blocker)

1) Prefilter (script-owned; mandatory)
- `node tools/caf/prefilter_semantic_candidates_v1.mjs <instance_name> --profile=arch_scaffolding --limit=180`

2) Build retrieval context blob (script-owned; mandatory)
- `node tools/caf/build_retrieval_context_blob_v1.mjs <instance_name> --profile=arch_scaffolding`

3) Semantic retrieval/ranking (LLM-owned; mandatory)
- Input: `.../spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md`
- Output: ranked `pattern_id` with confidence; drop LOW before graph expansion.

Seed rule (ship blocker):
- Select HIGH+MEDIUM seed_ids from the ranked working set you just produced.
- Do NOT “extract seeds” from the prefilter subset file.
- Do NOT reuse prior-run seed lists.

4) Graph expansion (script-owned; mandatory)

Invoke deterministic graph expansion owner:
- `skills/caf-graph-expander/SKILL.md` with:
  - `instance_name=<instance_name>`
  - `profile=arch_scaffolding`
  - `seed_ids=<comma-separated HIGH+MEDIUM pattern_ids>`

5) Integrate open-list (LLM-owned; mandatory grounding)
- Load: `.../spec/playbook/graph_expansion_open_list_arch_scaffolding_v1.yaml`
- Add up to `reserve_slots` graph-only ids (per profile run config) and ground them.

6) Grounded candidate dump + deterministic postprocess (token-saver; mandatory)
- Write the combined, grounded candidate records to the profile dump file in the canonical heading form.
  - arch_scaffolding => `.../spec/playbook/grounded_candidate_records_arch_scaffolding_v1.md`

