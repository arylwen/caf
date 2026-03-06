---
name: worker-pattern-retriever-arch-scaffolding
description: Phase-specialized pattern retrieval owner for CAF architecture_scaffolding. Instruction-only for semantic retrieval/ranking + grounding. Uses deterministic helpers for prefilter/blob/graph/debug/gate.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-pattern-retriever-arch-scaffolding

## Purpose

This worker is the **arch_scaffolding** retrieval owner.

Hard-coded phase facts (ship rules):
- profile = `arch_scaffolding`
- playbookDir = `spec/playbook`
- Semantic ranking + seed selection + grounding are **Agent reasoning step** and mandatory.
- Deterministic helpers are mandatory for mechanical steps (prefilter/blob/graph/debug/gate).

## Invocation inputs

- `instance_name` (required)

## Required inputs (fail-closed)

Pinned / derived sources (ground truth):
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

Spec files (targets; must exist or be created by caller):
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`

Library sources:
- `architecture_library/patterns/retrieval_surface_v1/pattern_semantic_surface_v1.jsonl`
- `architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_surface_lint_contract_v1.md`
- `architecture_library/patterns/retrieval_surface_v1/bridge_lexicon_v1.yaml`

## Execution order (ship blocker)

Non-skippable checklist:
- Do NOT jump from “retrieval blob exists” directly to `retrieval_gate_v1`.
- Do NOT treat existing spec candidate blocks as an input surface. Candidate blocks are outputs.
- Do NOT run graph/debug/gate before the spec candidate blocks are updated.

## Output acceptance criteria (optimize for first-try pass)

Your output will be validated by deterministic gates. Produce candidates that satisfy:

1) **Surface provenance (no injection)**  
   Candidate IDs MUST be a subset of:
   - `reference_architectures/<instance_name>/spec/playbook/semantic_candidate_subset_arch_scaffolding_v1.jsonl`
   - `reference_architectures/<instance_name>/spec/playbook/graph_expansion_open_list_arch_scaffolding_v1.yaml`  
   Do NOT add patterns outside these surfaces (including EXT-*), even if they feel “useful”.

2) **Graph integration (refresh point)**  
   Keep all HIGH/MEDIUM seeds. Integrate and ground up to `reserve_slots` graph-only candidates from the open list (when available). Justify any decision to drop graph candidates (e.g. LOW grounding).

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

Minimum required artifact set for this run (all under `spec/playbook/` for the active instance):
- `semantic_candidate_subset_arch_scaffolding_v1.jsonl`
- `semantic_prefilter_debug_arch_scaffolding_v1.md`
- `retrieval_context_blob_arch_scaffolding_v1.md`
- `graph_expansion_open_list_arch_scaffolding_v1.yaml`
- `graph_expansion_trace_arch_scaffolding_v1.md`
- Updated candidate blocks in both spec files

Run steps in order:

1) Deterministic prefilter (mandatory):
- `node tools/caf/prefilter_semantic_candidates_v1.mjs <instance_name> --profile=arch_scaffolding --limit=180`

2) Build/refresh retrieval context blob (mandatory):
- `node tools/caf/build_retrieval_context_blob_v1.mjs <instance_name> --profile=arch_scaffolding`

3) Semantic retrieval/ranking (LLM-owned; mandatory)
- Input: `reference_architectures/<instance_name>/spec/playbook/retrieval_context_blob_arch_scaffolding_v1.md`
- Working set: ranked `pattern_id` with confidence (HIGH/MEDIUM/LOW)
- Drop LOW before graph expansion.

Seed rule (ship blocker):
- Seeds MUST be selected from the ranked working set you just produced (HIGH+MEDIUM only).
- Do NOT “extract seeds” from the prefilter subset file as a shortcut.
- Do NOT reuse prior-run seed lists.

4) Deterministic graph expansion using all HIGH+MEDIUM seeds (mandatory):

Invoke deterministic graph expansion owner:
- `skills/caf-graph-expander/SKILL.md` with:
  - `instance_name=<instance_name>`
  - `profile=arch_scaffolding`
  - `seed_ids=<comma-separated HIGH+MEDIUM pattern_ids>`

5) Integrate graph open-list into the working set (LLM-owned; grounding required)
- Load: `reference_architectures/<instance_name>/spec/playbook/graph_expansion_open_list_arch_scaffolding_v1.yaml`
- Add up to `reserve_slots` graph-only ids (per profile run config) and ground them.

6) Grounded candidate dump + deterministic postprocess (token-saver; mandatory)

Instead of editing large spec docs directly, write the grounded candidate records to a temp dump file and let a deterministic script perform the union + scaffold hydration + retrieval gate in one mechanical chain.

- Write the combined, grounded candidate records into:
  - `reference_architectures/<instance_name>/spec/playbook/grounded_candidate_records_arch_scaffolding_v1.md`
  - The dump file MUST contain only candidate records in the canonical heading form (e.g. `### HIGH-1: ...` / `### H-1: ...` / `### MEDIUM-1: ...` / `### M-1: ...`).

- Then run the deterministic retrieval postprocess chain (mandatory):
  - `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=arch_scaffolding`

This helper runs, in order:
- `apply_grounded_candidates_v1` (union refresh into CAF-managed candidate blocks)
- `pattern_retrieval_scaffold_merge_v1` (merge-safe decision scaffold refresh + option hydration)
- `retrieval_gate_v1` (postcondition enforcement)

Rules:
- Do NOT run the three helpers individually (avoid ordering quirks).
- If the helper cannot be invoked, FAIL-CLOSED with a feedback packet (do not attempt in-band merge/hydration).

No retrieval debug report is required (LLM-authored or otherwise).



## Advisory packet policy (token-saver; ship rule)

- If a deterministic gate writes a feedback packet with `Severity: advisory`, treat it as a warning.
- Do NOT attempt to fix advisory packets in-band.
- Only `Severity: blocker` (or missing Severity) requires remediation.
