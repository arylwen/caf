# CAF scripted helpers (dual-track; design note)

CAF currently runs as **instruction-only** skills for stability and portability.

This directory defines a parallel, *optional* track where maintainers may run small scripts to reduce token cost for **LLM-as-script** work.

## Note: maintainer meta scripts

Maintainer/audit scripts that operate on the *library itself* live under `tools/caf-meta/`.
This folder is intentionally separate from `tools/caf/` (which contains instance/runtime helpers).


## Contracts (keep scripts + skills aligned)

- `tools/caf/contracts/playbook_blocks_ownership_and_invariants_v1.md`
- `tools/caf/contracts/decision_candidates_block_parsing_contract_v1.md`
- `tools/caf/contracts/retrieval_context_blob_contract_v1.md`

## What scripts MAY do (mechanical only)

- Parse YAML/JSON/MD blocks and emit compact, deterministic summaries.
- Lint/validate library surfaces (e.g., JSONL well-formedness).
- Produce derived indexes (e.g., `pattern_id` → `family/plane/definition_path`).
- Produce deterministic candidate *prelists* (filters/partitions), but **NOT** the final semantic ranking.

## Scripted seeding (token-saver)

When an operation is purely mechanical and repeatable (e.g., instance seeding), a script may perform
the file system work to reduce token cost.

- `seed_saas_v1.mjs`: copy Phase 8 profile template YAMLs into a new instance with bounded substitutions. If the selected profile template pack includes `prd_v1.sample.md`, it is also copied to `reference_architectures/<instance>/product/PRD.md`.
  - Usage: `node tools/caf/seed_saas_v1.mjs <instance_name> <profile_template_id> [--overwrite]`
  - This is invoked by `skills/caf-saas-init` when available.

- `companion_init_v1.mjs`: initialize the minimal companion repository target for an instance.
  - Usage: `node tools/caf/companion_init_v1.mjs <instance_name> [--overwrite]`
  - This is invoked by `skills/caf-companion-init` when available.

- `next_v1.mjs`: compute a deterministic phase-advance recommendation and write the derivation cascade contract.
  - Usage: `node tools/caf/next_v1.mjs <instance_name> [--apply]`
  - This is invoked by `skills/caf-next` when available.

- `extract_adopted_decision_options_v1.mjs`: deterministic extractor for adopted option selections under `decision_resolutions_v1`.
  - Usage: `node tools/caf/extract_adopted_decision_options_v1.mjs <instance_name> [--source=system|application|both] [--format=jsonl|json|tsv]`
  - Intended for maintainer/agent diagnostics when verifying option_set_id adoption.


- `guardrails_v1.mjs`: derive Guardrails (profile_parameters_resolved + TBP resolution) deterministically from pinned inputs and data files.
  - Usage: `node tools/caf/guardrails_v1.mjs <instance_name> [--overwrite]`
  - This is invoked by `skills/caf-guardrails`.

- `arch_gate_v1.mjs`: deterministic caf-arch preflight consolidation (validate → Layer 8 → pins↔resolved coherence (1 retry) → contract materialization).
  - Usage: `node tools/caf/arch_gate_v1.mjs <instance_name>`
  - Intended to be invoked by `skills/caf-arch` when available.

- `playbook_gate_v1.mjs`: deterministic caf-arch Step 5e coverage gate (Guardrails enforcement bar → Task Graph capabilities).
  - Usage: `node tools/caf/playbook_gate_v1.mjs <instance_name>`
- `pattern_obligation_gate_v1.mjs`: deterministic caf-arch Step 5f coverage gate (pattern obligations → Task Graph trace anchors).
- `post_plan_gate_v1.mjs`: thin wrapper that runs `playbook_gate_v1.mjs` then `pattern_obligation_gate_v1.mjs` (caf-arch Step 5e+5f consolidation).
  - Usage: `node tools/caf/pattern_obligation_gate_v1.mjs <instance_name>`
  - Intended to be invoked by `skills/caf-arch` when available.

- `planning_invariant_gate_v1.mjs`: producer-side planning invariant check (planning outputs exist + obligations trace anchors + enforcement-bar capability coverage).
  - Usage: `node tools/caf/planning_invariant_gate_v1.mjs <instance_name>`
  - Intended to be invoked immediately after `caf-application-architect` returns.

- `pattern_retrieval_scaffold_merge_v1.mjs`: merge-safe decision scaffold refresh + option hydration.
  - Usage: `node tools/caf/pattern_retrieval_scaffold_merge_v1.mjs <instance_name>`
  - Reads CAF-managed candidate blocks from the instance specs and appends missing entries into
    `decision_resolutions_v1` (without overwriting architect edits). If a candidate is a `caf.kind: decision_pattern`,
    the helper hydrates the bounded question/option scaffold and auto-adopts the default option when declared.
- `retrieval_postprocess_v1.mjs`: retrieval mechanical chain runner (apply candidates → scaffold merge → retrieval gate).
  - Usage: `node tools/caf/retrieval_postprocess_v1.mjs <instance_name> --profile=<profile>`
  - Rationale: avoids agent ordering quirks by running the non-semantic postprocess chain deterministically (no extra Node spawns).

- `scaffold_contract_declarations_v1.mjs`: deterministic scaffold/normalize for Phase-8 contract declarations registry schema.
  - Usage: `node tools/caf/scaffold_contract_declarations_v1.mjs <instance_name>`
  - Ensures `design/playbook/contract_declarations_v1.yaml` uses `registry_version: contract_declarations_v1` and `contracts: []` (array).
  - If a legacy/non-canonical file is detected, it is backed up under `design/playbook/` and reseeded with the canonical template.
  - Intended to run as a design pre-gate before `caf-solution-architect` to prevent schema drift from silently dropping contract tasks.


- `validate_instance_v1.mjs`: deterministic instance preflight validator (mechanical).
  - Usage: `node tools/caf/validate_instance_v1.mjs <instance_name> [--mode=arch|build]`
  - Intended to be invoked as a **preflight** inside `caf-arch` and `caf-build-candidate` when available.

- `build_gate_v1.mjs`: deterministic caf-build-candidate gate (required artifacts + rail sanity).
  - Usage: `node tools/caf/build_gate_v1.mjs <instance_name>`

- `build_postgate_companion_runnable_v1.mjs`: deterministic post-gate for runnable candidate integrity (compose sanity + common stray entrypoints).
  - Usage: `node tools/caf/build_postgate_companion_runnable_v1.mjs <instance_name>`
  - Intended to run after all build tasks complete; writes a feedback packet and fails closed on common non-runnable outputs.

- `gen_build_dispatch_manifest_v1.mjs`: deterministic derived view for build dispatch (wave order + capability→worker mapping).
  - Usage: `node tools/caf/gen_build_dispatch_manifest_v1.mjs <instance_name>`
  - Produces: `reference_architectures/<instance>/design/playbook/build_dispatch_manifest_v1.md`
  - Intended to reduce build-step ambiguity and prevent agent thrash; does **not** execute workers.

- `atom_normalization_validator_v1.mjs`: validate canonical atoms are approved and legacy spine pins do not conflict.
  - Usage: `node tools/caf-meta/atom_normalization_validator_v1.mjs <instance_name>`

- `graph_expand_candidates_v1.mjs`: deterministic BFS graph expansion over retrieval-surface `relations[]`.
  - Usage: `node tools/caf/graph_expand_candidates_v1.mjs <instance_name> --profile=<profile> --seeds=<id1,id2,...>`
  - Writes an open list YAML and a human-readable trace under `reference_architectures/<instance>/spec/playbook/`.
  - Intended to be followed by semantic grounding by the pattern retriever.

- `build_retrieval_context_blob_v1.mjs`: script-owned retrieval context blob builder.
  - Contract: `tools/caf/contracts/retrieval_context_blob_contract_v1.md`
- Candidate block parsing (shared):
  - `tools/caf/lib_caf_decision_candidates_v1.mjs` (resilient parser for `caf_decision_pattern_candidates_v1` blocks)
  - Contract: `tools/caf/contracts/decision_candidates_block_parsing_contract_v1.md`
- `retrieval_gate_v1.mjs`: deterministic post-retrieval gate (required debug artifacts + shards + non-compacted candidate records).
  - Usage: `node tools/caf/retrieval_gate_v1.mjs <instance_name> --profile=<profile>`
  - Writes a feedback packet and exits non-zero on invariant violations.

- `tools/caf-meta/pattern_relations_sweep_v1.mjs`: maintainer sweep to canonicalize typed pattern relationships.
  - Usage: `node tools/caf-meta/pattern_relations_sweep_v1.mjs --mode=audit|fix`
  - Converts legacy `related_patterns` comma lists into typed, line-oriented relations and derives `relations[]` into the JSONL retrieval surface.

- `pattern_relations_reclassify_v1.mjs`: maintainer helper to reclassify a conservative subset of defaulted `complements` into `refines` / `depends_on` (family-by-family).
  - Usage: `node tools/caf-meta/pattern_relations_reclassify_v1.mjs --mode=audit|fix`
  - Applies a conservative, rule-based reclassification pass (currently: MTEN parent/child = `refines`; POL baseline dependencies = `depends_on`).

- `iam_hub_control_tighten_v1.mjs`: maintainer helper to tighten IAM-family relationships (taxonomy + hub control).
  - Usage: `node tools/caf-meta/iam_hub_control_tighten_v1.mjs --mode=audit|fix`
  - Mechanical-only IAM pass:
    - Step A: rewire IAM sub-family children (AUTH/GOV/PROP/OBS) to refine their `*-01` sub-root.
    - Step C: reclassify IAM links to core prerequisites (CTX-01/OBS-01/POL-01) from `complements` to `depends_on`.

## What scripts MUST NOT do

- Decide which patterns are relevant, which options to adopt, or how to design the system.
- Encode bespoke inclusion logic like “if pin X then pattern Y”.

## Proposed use in the future (not wired today)

1) A script produces a deterministic prelist/index (library-scoped; committed if stable).
2) A no-script worker consumes that prelist and performs **semantic** ranking + grounded emission.

## Why keep this separate

- The marketing workflow is hard-won and must remain portable.
- Tooling capability varies across environments.

If/when we wire scripted helpers into a workflow, it must be via an explicit opt-in profile or maintainer-only path.

Note:

- The bundled minimal YAML parser intentionally supports YAML inline comments (`key: value  # comment`) and ignores them during parsing.
  
## Guardrails (non-negotiable)

- Scripts are **mechanical only** and must write only within a single instance root under `reference_architectures/<name>/`.
- Scripts MUST NOT write to producer surfaces (`tools/**`, `skills/**`, `architecture_library/**`) during routed workflows.

## Skillpack selection (shim-resolved; no folder copying)

CAF shims (`.claude/.codex/.copilot`) resolve the canonical router skill path at runtime using:

- `tools/caf-state/active_skillpack.json` (gitignored)

Rules:

- If the file is missing, shims MUST treat the active pack as `default`.
- If `active_pack` is `portable`, shims route to `skills_portable/caf/SKILL.md`.
- Otherwise, shims route to `skills/caf/SKILL.md`.

Maintainer switch (out-of-band; does not touch `skills/**`):

- `node tools/caf/skillpack_select_v1.mjs --set=default|portable`
