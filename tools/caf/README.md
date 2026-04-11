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
- `tools/caf/contracts/ux_lane_producer_contract_v1.md`
- `tools/caf/contracts/ux_plan_output_contract_v1.md`
- `tools/caf/contracts/ux_materialization_contract_v1.md`
- `tools/caf/contracts/ux_retrieval_context_blob_contract_v1.md`
- `tools/caf/contracts/ux_lane_gate_posture_v1.md`
- `tools/caf/contracts/ux_retrieval_execution_contract_v1.md`
- `tools/caf/contracts/ux_semantic_derivation_packet_contract_v1.md`
- `tools/caf/contracts/ux_demo_overlay_posture_v1.md`
- `tools/caf/contracts/deployment_identity_contract_v1.md`
- `tools/caf/contracts/enrichment_ownership_map_v1.md`
- `tools/caf/contracts/design_handoff_preflight_boundary_v1.md`

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

- `lib_plane_integration_contract_choices_v1.mjs`: shared parser/validator for the canonical `plane_integration_contract_choices_v1` architect-edit block in `control_plane_design_v1.md`.
  - Used by post-gates and planning/build preflight consumers that need deterministic CP/AP runtime-shape and contract-surface facts without reparsing ad hoc.

- `guardrails_v1.mjs`: derive Guardrails (profile_parameters_resolved + TBP resolution) deterministically from pinned inputs and data files, including the canonical derived deployment identity (`deployment.stack_name`).
  - Usage: `node tools/caf/guardrails_v1.mjs <instance_name> [--overwrite]`
  - This is invoked by `skills/caf-guardrails`.

- `arch_gate_v1.mjs`: deterministic caf-arch preflight consolidation (validate → Layer 8 → pins↔resolved coherence (1 retry) → contract materialization).
  - Usage: `node tools/caf/arch_gate_v1.mjs <instance_name>`
  - Intended to be invoked by `skills/caf-arch` when available.

- `playbook_gate_v1.mjs`: deterministic caf-arch Step 5e coverage gate (Guardrails enforcement bar → Task Graph capabilities).
  - Usage: `node tools/caf/playbook_gate_v1.mjs <instance_name>`
- `compile_pattern_obligations_v1.mjs`: deterministic compiler for `design/playbook/pattern_obligations_v1.yaml` from resolved rails, planning payloads, domain models, contract declarations, and TBP manifests.
- `pattern_obligation_gate_v1.mjs`: deterministic caf-arch Step 5f coverage gate (pattern obligations → Task Graph trace anchors).
- `task_graph_obligation_trace_enrichment_v1.mjs`: deterministic task-graph trace attachment for compiler-owned obligation families using canonical task ids / option anchors / TBP capability routing.
- `post_plan_gate_v1.mjs`: thin wrapper that runs the deterministic post-plan chain (obligation compilation, semantic acceptance enrichment, required-input enrichment, UI-seed semantic enrichment, obligation-trace enrichment, playbook/obligation/task-graph gates, interface-binding derivation/gate, task-plan generation).
  - Usage: `node tools/caf/post_plan_gate_v1.mjs <instance_name>`
  - Intended to be invoked by `skills/caf-arch` when available. Ownership guidance for what belongs in this chain lives in `tools/caf/contracts/enrichment_ownership_map_v1.md`.

- `planning_invariant_gate_v1.mjs`: producer-side planning invariant check (planning outputs exist + contract/task trace anchors + enforcement-bar capability coverage).
  - Usage: `node tools/caf/planning_invariant_gate_v1.mjs <instance_name>`
  - Intended to be invoked immediately after `caf-application-architect` returns.
- `project_task_backlog_v1.mjs`: mechanical backlog projection from `task_graph_v1.yaml`.
  - Usage: `node tools/caf/project_task_backlog_v1.mjs <instance_name>`
  - Produces: `reference_architectures/<instance>/design/playbook/task_backlog_v1.md`
  - Invoked by `/caf backlog` when the human backlog view is needed.



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

- `design_postgate_plane_domain_model_views_coherence_v1.mjs`: deterministic post-gate for normalized application/system plane-domain-model YAML views.
  - Usage: `node tools/caf/design_postgate_plane_domain_model_views_coherence_v1.mjs <instance_name>`
  - Fails closed when either normalized view is missing, unparsable, mis-scoped, or violates the canonical planning-facing contract.
  - Intended to run immediately after `worker-domain-modeler` inside the later `/caf arch` lane.

- `design_postgate_plane_integration_contract_choices_coherence_v1.mjs`: deterministic post-gate for the canonical architect-edit `plane_integration_contract_choices_v1` block inside `control_plane_design_v1.md`.
  - Usage: `node tools/caf/design_postgate_plane_integration_contract_choices_coherence_v1.mjs <instance_name>`
  - Fails closed when the block is missing, unparsable, or violates the planning-facing contract for CP/AP runtime shapes and the primary CP↔AP contract surface.
  - Intended to run after `caf-solution-architect` and before `/caf plan` relies on this narrow control-plane design handoff seam.

- `design_open_questions_advisory_gate_v1.mjs`: advisory-only checker for carried-forward application design open questions, enriched from the referenced library-owned pattern definitions so deferred-pattern warnings do not require a seam-local mapping file.
  - Usage: `node tools/caf/design_open_questions_advisory_gate_v1.mjs <instance_name>`
  - Writes a single advisory feedback packet when `design/playbook/application_design_v1.md` still contains non-empty `open_questions_v1`; lists each `question_id`, current state, and source anchors.
  - Intended to run warning-only after the later `/caf arch` lane and again before `/caf plan`, without promoting unresolved questions to a global blocker.

- `validate_instance_v1.mjs`: deterministic instance preflight validator (mechanical).
- Planning/runtime-scaffold compatibility: `plane_runtime_scaffolding` is the canonical capability id. Legacy `runtime_scaffolding_cp` and `runtime_scaffolding_ap` are accepted as compatibility aliases for existing throwaway instances.
  - Usage: `node tools/caf/validate_instance_v1.mjs <instance_name> [--mode=arch|plan|build]`
  - Intended to be invoked as a **preflight** inside `caf-arch` and `caf-build-candidate` when available.

- `build_gate_v1.mjs`: deterministic caf-build-candidate gate (required artifacts + rail sanity).
  - Usage: `node tools/caf/build_gate_v1.mjs <instance_name>`

- `build_technology_choice_realization_gate_v1.mjs`: contract-owned technology realization gate for emitted companions (role-binding expectations + validator-backed runtime smoke (for example import/authenticated boundary smoke where declared by TBP manifests)).
  - Usage: `node tools/caf/build_technology_choice_realization_gate_v1.mjs <instance_name>`

- `build_postgate_companion_runnable_v1.mjs`: deterministic post-gate for runnable candidate integrity (compose sanity + common stray entrypoints). Compose naming is validated against `deployment.stack_name` from the resolved guardrails view.
  - Usage: `node tools/caf/build_postgate_companion_runnable_v1.mjs <instance_name>`
  - Intended to run after all build tasks complete; writes a feedback packet and fails closed on common non-runnable outputs.

- `gen_build_dispatch_manifest_v1.mjs`: deterministic derived view for build dispatch (wave order + capability→worker mapping).
  - Usage: `node tools/caf/gen_build_dispatch_manifest_v1.mjs <instance_name>`
  - Produces: `reference_architectures/<instance>/design/playbook/build_dispatch_manifest_v1.md`
  - Dispatch packets preserve the selected task object fields required by the build contract (`task_id`, `title`, `depends_on`, `inputs`, `steps`, `definition_of_done`, `semantic_review`, and `trace_anchors`).
  - Intended to reduce build-step ambiguity and prevent agent thrash; does **not** execute workers.

- `atom_normalization_validator_v1.mjs`: validate canonical atoms are approved and legacy spine pins do not conflict.
  - Usage: `node tools/caf-meta/atom_normalization_validator_v1.mjs <instance_name>`

- `retrieval_preflight_v1.mjs`: retrieval pre-gate helper (materialize retrieval blob from current spec/guardrails before semantic retrieval).
  - Usage: `node tools/caf/retrieval_preflight_v1.mjs <instance_name> --profile=<profile>`
  - Rationale: makes the MP-20 retrieval pre-gate explicit instead of relying on skill text to remember the blob-build prerequisite.

- `graph_expand_candidates_v1.mjs`: deterministic BFS graph expansion over retrieval-surface `relations[]`.
  - Usage: `node tools/caf/graph_expand_candidates_v1.mjs <instance_name> --profile=<profile> --seeds=<id1,id2,...>`
  - Writes an open list YAML and a human-readable trace under `reference_architectures/<instance>/spec/playbook/`.
  - Intended to be followed by semantic grounding by the pattern retriever.

- `build_retrieval_context_blob_v1.mjs`: script-owned retrieval context blob builder.
  - Contract: `tools/caf/contracts/retrieval_context_blob_contract_v1.md`
- `materialize_ux_design_v1.mjs`: rerun-safe materializer for `design/playbook/ux_design_v1.md`.
  - Usage: `node tools/caf/materialize_ux_design_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_materialization_contract_v1.md`

- `derive_ux_seed_content_v1.mjs`: deterministic PRD/spec-to-UX seed projection for the canonical UX artifact.
  - Usage: `node tools/caf/derive_ux_seed_content_v1.mjs <instance_name>`
  - Purpose: refresh CAF-managed `caf_ux_*_seed_v1` blocks before retrieval.

- `build_ux_retrieval_context_blob_v1.mjs`: script-owned retrieval blob builder for the UX lane.
  - Usage: `node tools/caf/build_ux_retrieval_context_blob_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_retrieval_context_blob_contract_v1.md`

- `ux_preflight_v1.mjs`: UX lane deterministic pre-stage wrapper (materialize artifact -> derive UX seed content).
  - Usage: `node tools/caf/ux_preflight_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_lane_gate_posture_v1.md`

- `derive_ux_semantic_projection_v1.mjs`: deterministic applier for the instruction-owned UX semantic packet.
  - Usage: `node tools/caf/derive_ux_semantic_projection_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_semantic_projection_contract_v1.md`

- `hydrate_ux_architect_blocks_v1.mjs`: compact pointer hydration for architect-edit UX sections when no manual override exists yet.
  - Usage: `node tools/caf/hydrate_ux_architect_blocks_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_architect_hydration_contract_v1.md`

- `ux_gate_v1.mjs`: UX lane structural post-gate for artifact/blob readiness.
  - Usage: `node tools/caf/ux_gate_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_lane_gate_posture_v1.md`
- `ux_retrieval_preflight_v1.mjs`: UX retrieval pre-stage wrapper (materialize -> seed refresh -> semantic packet apply -> architect pointer hydration -> blob build -> semantic subset prefilter for `ux_design`; graph expansion remains seed-driven by the UX retrieval worker).
  - Usage: `node tools/caf/ux_retrieval_preflight_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_retrieval_execution_contract_v1.md`

- `ux_retrieval_postprocess_v1.mjs`: UX retrieval post-stage wrapper (grounded writeback into `ux_design_v1.md` + UX retrieval gate).
  - Usage: `node tools/caf/ux_retrieval_postprocess_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_retrieval_execution_contract_v1.md`

- `ux_retrieval_gate_v1.mjs`: UX retrieval post-gate for candidate/writeback correctness and shortlist/open-list discipline.
  - Usage: `node tools/caf/ux_retrieval_gate_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_retrieval_execution_contract_v1.md`

- `ux_plan_v1.mjs`: deterministic UX post-plan projection wrapper (`ux_task_graph_v1.yaml` -> `ux_task_plan_v1.md` -> `ux_task_backlog_v1.md` -> gate).
  - Usage: `node tools/caf/ux_plan_v1.mjs <instance_name>`
  - Intended to be invoked by `skills/caf-ux-plan` after `skills/worker-ux-planner/SKILL.md` writes the semantic task graph.

- `gen_ux_task_graph_v1.mjs`: deprecated fail-closed stub that points callers to the instruction-owned UX planner.
  - Usage: `node tools/caf/gen_ux_task_graph_v1.mjs <instance_name>`
  - Behavior: writes a blocker feedback packet rather than regenerating `ux_task_graph_v1.yaml` mechanically.

- `gen_ux_task_plan_v1.mjs`: mechanical plan projection from `ux_task_graph_v1.yaml`.
  - Usage: `node tools/caf/gen_ux_task_plan_v1.mjs <instance_name>`
  - Produces: `reference_architectures/<instance>/design/playbook/ux_task_plan_v1.md`

- `project_ux_task_backlog_v1.mjs`: mechanical backlog projection from `ux_task_graph_v1.yaml`.
  - Usage: `node tools/caf/project_ux_task_backlog_v1.mjs <instance_name>`
  - Produces: `reference_architectures/<instance>/design/playbook/ux_task_backlog_v1.md`

- `ux_task_graph_gate_v1.mjs`: bounded UX planning output gate.
  - Usage: `node tools/caf/ux_task_graph_gate_v1.mjs <instance_name>`
  - Contract: `tools/caf/contracts/ux_plan_output_contract_v1.md`
- Candidate block parsing (shared):
  - `tools/caf/lib_caf_decision_candidates_v1.mjs` (resilient parser for `caf_decision_pattern_candidates_v1` blocks)
  - Contract: `tools/caf/contracts/decision_candidates_block_parsing_contract_v1.md`
- `retrieval_gate_v1.mjs`: deterministic post-retrieval gate (required debug artifacts + shards + non-compacted candidate records + propagated CAF-managed retrieval sections).
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

CAF shims (`.claude/.codex/.copilot/.kiro`) resolve the canonical router skill path at runtime using:

- `tools/caf-state/active_skillpack.json` (gitignored)

Rules:

- If the file is missing, shims MUST treat the active pack as `default`.
- If `active_pack` is `portable`, shims route to `skills_portable/caf/SKILL.md`.
- Otherwise, shims route to `skills/caf/SKILL.md`.

Maintainer switch (out-of-band; does not touch `skills/**`):

- `node tools/caf/skillpack_select_v1.mjs --set=default|portable`


## Interface binding contracts (v1)

CAF can carry minimal required/provided interface intent across waves with a planner-owned artifact:

- `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml`

The contract stays intentionally small and style-neutral:

- `required_interface.consumer.task_id` — the task that declares the required interface
- `provider.task_id` — the task that materializes the implementation or adapter
- `assembler.task_id` — the assembly/composition task that binds the consumer to the provider explicitly

Build evidence is written under:

- `companion_repositories/<name>/profile_v1/caf/binding_reports/<binding_id>.yaml`

The planner/build gates fail closed when a declared interface binding does not line up with the task graph, or when assembler work completes without explicit binding evidence.

Conceptual split:

- ABP owns the logical inversion/composition shape.
- The interface binding contract owns the concrete binding obligations for this instance.
- TBP/runtime wiring owns the framework-specific realization mechanism (container registration, bootstrap/module wiring, or explicit manual composition-root code).

This keeps CAF from turning `interface_binding_contracts_v1.yaml` into a second general-purpose IoC configuration surface.

Planner emission is mechanical: the planner should emit per-task `interface_binding_hints[]` in `task_graph_v1.yaml`, and `tools/caf/gen_interface_binding_contracts_v1.mjs` derives `interface_binding_contracts_v1.yaml` from those hints plus `abp_pbp_resolution_v1.yaml`. Legacy AP task-id fallback remains only as a temporary compatibility path while older instances are still being regenerated.

Important ordering rule: `interface_binding_contracts_v1.yaml` is a post-plan derived artifact. The instruction-owned planner must not require it as a Step 0 planning input; the planner emits `task_graph_v1.yaml` and `interface_binding_hints[]`, then the scripted post-plan phase derives the binding-contract file and attaches it as a required input on each bound consumer/provider/assembler task.

Runnable post-gate behavior also tightens production binding discipline: once an interface binding contract applies, consumer/provider/assembler artifacts must not retain silent local demo/in-memory/default fallbacks unless they are explicitly marked `CAF_TEST_ONLY` and kept out of production runtime paths.
