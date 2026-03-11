---
name: worker-pattern-retriever-solution-architecture
description: Phase-specialized pattern retrieval owner for CAF solution_architecture retrieval. Instruction-only for semantic retrieval/ranking + grounding. Uses deterministic helpers for prefilter/blob/graph/debug/gate.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# worker-pattern-retriever-solution-architecture

## Purpose

This worker is the **solution_architecture** retrieval owner.

Hard-coded phase facts (ship rules):
- profile = `solution_architecture`
- playbookDir (retrieval owner artifacts) = `design/playbook`
- Candidate blocks are written back into spec:
  - `spec/playbook/system_spec_v1.md` (system candidates)
  - `spec/playbook/application_spec_v1.md` (application candidates)

Semantic ranking + seed selection + grounding are **Agent reasoning step** and mandatory.
Deterministic helpers are mandatory for mechanical steps (prefilter/blob/graph/debug/gate).

## Invocation inputs

- `instance_name` (required)

## Execution order (ship blocker)

Non-skippable checklist:
- Do NOT treat existing spec candidate blocks as an input surface. Candidate blocks are outputs.
- Do NOT run mechanical retrieval-owner steps “against existing grounded candidate blocks”.
  A refresh MUST re-rank from `semantic_candidate_subset_solution_architecture_v1.jsonl`.
- Do NOT assume arch_scaffolding and solution_architecture surfaces are interchangeable.
- Do NOT run graph/debug/gate before the spec candidate blocks are updated.

Minimum required artifact set for this run (all under `design/playbook/` unless noted):
- `design/playbook/semantic_candidate_subset_solution_architecture_v1.jsonl`
- `design/playbook/semantic_prefilter_debug_solution_architecture_v1.md`
- `design/playbook/retrieval_context_blob_solution_architecture_v1.md`
- `design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml`
- `design/playbook/graph_expansion_trace_solution_architecture_v1.md`
- Updated candidate blocks in BOTH spec files (under `spec/playbook/`)

## Output acceptance criteria (optimize for first-try pass)

Your output will be validated by deterministic gates. Produce candidates that satisfy:

1) **No injection; surfaces govern new additions**
   - Every candidate you output in the dump MUST come from:
     - `reference_architectures/<instance_name>/design/playbook/semantic_candidate_subset_solution_architecture_v1.jsonl`, and/or
     - `reference_architectures/<instance_name>/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml`
   - Do **not** invent new out-of-surface IDs.

2) **Seeds are mandatory (no drops)**
   - Every pattern_id you pass as a HIGH/MED seed to the graph expander MUST appear in the dump candidate set.
   - Do not rely on “the spec already has it.” The apply script will union, but the dump must still include the seeds you selected for THIS run.

3) **Graph integration (reserve slots; when enabled)**
   - If `graph_expansion.enabled=true` and the open list contains ≥ `reserve_slots` **graph-only** candidates:
     - Include and ground **at least `reserve_slots`** graph-only candidates (non-seeds) from `open_list.candidates[*].id`.
   - If fewer than `reserve_slots` graph-only candidates exist, include as many as are available.

4) **EXT grounding proof (when EXT-* is selected)**
   - For each EXT-* candidate you include, add at least one instance-specific evidence bullet tagged `[pinned_input]` (or `[spec_excerpt]`) showing *why this instance needs it*.

5) **Pin coverage bar (token-efficient)**
   - Across the candidate set, every pin ID present in `architecture_shape_parameters.yaml` should appear at least once in evidence as:
     `pin_ref: <PIN-ID>=<value>` (with a cite to the pins file).

Token-saver rule:
- Do NOT read or diff existing spec candidate blocks. The deterministic apply script performs the union.
- Your only semantic work is: rank → select seeds → select graph-only adds → ground → dump.

Run steps in order:

1) Deterministic prefilter (mandatory):
- `node tools/caf/prefilter_semantic_candidates_v1.mjs <instance_name> --profile=solution_architecture --limit=180`

2) Build/refresh retrieval context blob (mandatory):
- `node tools/caf/retrieval_preflight_v1.mjs <instance_name> --profile=solution_architecture`

3) Semantic retrieval/ranking (LLM-owned; mandatory)
- Input: `reference_architectures/<instance_name>/design/playbook/retrieval_context_blob_solution_architecture_v1.md`
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
  - `profile=solution_architecture`
  - `seed_ids=<comma-separated HIGH+MEDIUM pattern_ids>`

5) Integrate graph open-list into the working set (LLM-owned; grounding required)
- Load: `reference_architectures/<instance_name>/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml`
- Add up to `reserve_slots` graph-only ids (per profile run config) and ground them.

6) Grounded candidate dump + deterministic postprocess (token-saver; mandatory)

Instead of editing large spec docs directly, write the grounded candidate records to a temp dump file and let a deterministic script perform the union + scaffold hydration + retrieval gate in one mechanical chain.

- Write the combined, grounded candidate records into:
  - `reference_architectures/<instance_name>/design/playbook/grounded_candidate_records_solution_architecture_v1.md`
  - The dump file MUST contain only candidate records in the canonical heading form (e.g. `### HIGH-1: ...` / `### H-1: ...` / `### MEDIUM-1: ...` / `### M-1: ...`).

- Then run the deterministic retrieval postprocess chain (mandatory):
  - `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=solution_architecture`

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
