---
name: caf-application-architect
description: Produce application planning contract artifacts (Playbook) for an instance in a deterministic, fail-closed way. Instruction-only: no scripts. The planner writes plan contracts as files and refuses on missing/ambiguous inputs. Instruction-only: no scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

# caf-application-architect

## Purpose

This skill is a **planner**. It does not write candidate code.

It compiles the semantic cascade:

patterns + adopted design choices + contracts + resources
→ pattern obligations
→ task capabilities (Task Graph)
→ (later) workers + TBPs realize the tasks.

Fail-closed is mandatory:
- missing/ambiguous required inputs → stop with a feedback packet
- uncovered pattern obligations → stop with a feedback packet

This worker is complex. Make a careful plan before you execute. Follow the instructions and ship blockers exactly. Do not skip steps. Do not take shortcuts. You must run the skill first, then check for outputs. Do NOT use feedback packets as a shortcut to bypass any required step or to bypass executing a skill.

Optional interactive checkpoint (allowed; preferred over shortcuts):

- If you believe this planning run will be unusually expensive or risky, you MAY ask the user once:
  - "I’m about to generate planning outputs (pattern obligations + task graph). What do you want me to do?"
    1) Run `caf-application-architect` now.
    2) Fail-closed with a feedback packet.
    3) Stop with no action.
- Forbidden: skipping execution, then failing because planning outputs are missing.

## Outputs (canonical)

This planner MUST write (overwrite when `overwrite=true`):

- `reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`

The `/caf plan` workflow MUST also produce (mechanical post-plan derivation; not hand-authored by this planner):

- `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml`

Optional (search-friendly indexes; non-authoritative mirrors):

- `reference_architectures/<name>/design/playbook/pattern_obligations_index_v1.tsv`
- `reference_architectures/<name>/design/playbook/task_graph_index_v1.tsv`

## Authoritative inputs (fail-closed)

Instance inputs:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`

Do NOT require `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml` as a planning input.
That file is generated mechanically after `task_graph_v1.yaml` is emitted by the scripted post-plan phase.

Normative library references:

- `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_pattern_obligations_schema_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- `architecture_library/phase_8/plane_roots_v1.tsv`
- `architecture_library/phase_8/contract_surface_output_layout_v1.tsv`
- `architecture_library/phase_8/plane_runtime_shape_compilation_v1.yaml`
- `architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml`

## Preconditions (fail-closed)

1) Require `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` and read:
- `lifecycle.generation_phase`

1a) Require `guardrails/tbp_resolution_v1.yaml` exists and parse it as YAML.
- Require `schema_version: phase8_tbp_resolution_v1`
- Require `resolved_tbps` is present (may be an empty list).
If missing or invalid: write a feedback packet instructing the architect to rerun `/caf arch <name>` to regenerate Guardrails/TBP resolution, then stop.

2) Refuse unless `lifecycle.generation_phase` is one of:
- `implementation_scaffolding`
- `pre_production`
- `production_hardening`

3) Resource completeness gate:
- `design/playbook/application_domain_model_v1.yaml` is the authoritative planner-facing source for application resources.
- Parse it as YAML and derive resource completeness in this order:
  1. preferred: `api_candidates.resources[*]`
  2. fallback: entity names from `domain.bounded_contexts[*].aggregates[*].entities[*].name`
  3. last resort only when the application domain model is incomplete: a narrative `## Resources` section in `application_spec_v1.md` or the `ARCHITECT_EDIT_BLOCK: domain_and_resources_v1` bridge in the spec source
- Refuse only if all three sources are empty/absent for an active application plane.
- Do NOT require `application_spec_v1.md` to carry a canonical `## Resources` section; that was a legacy posture.

4) Human choice-point gate:
- If any architect-edit option set is present in the plane designs, each set MUST have exactly one adopted option.
  - 0 adopted or >1 adopted → refuse.

4a) Decision option gate (fail-closed):
- In `system_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1`, parse YAML.
- For each decision where:
  - `status: adopt`, and
  - `resolved_values.questions` exists (non-empty),
  require **every** question has **exactly one** option with `status: adopt`.
  - 0 adopted → refuse and instruct the architect to choose one option (or set the whole decision to `defer`).
  - >1 adopted → refuse (ambiguous).
- If an adopted option has `option_id: custom`, require the option entry includes:
  - a non-empty `summary`, and
  - a `payload` object with at least one key.
  Otherwise refuse (custom choice is underspecified).

5) Placeholder hygiene:
- Placeholder hygiene applies only to **human-authored inputs** (pinned inputs + architect-edit docs). It MUST NOT refuse just because the resolved Guardrails view contains placeholder *policy literals*.

Refuse if any of these files contain unresolved placeholder tokens:
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/<name>/spec/system_spec_v1.md`
- `reference_architectures/<name>/spec/application_spec_v1.md`
- `reference_architectures/<name>/design/application_design_v1.md`
- `reference_architectures/<name>/design/control_plane_design_v1.md`
- `reference_architectures/<name>/design/contract_declarations_v1.yaml`

Treat these as placeholders (refuse if present):
- `TBD`, `TODO`, `UNKNOWN`, `{{`, `}}`
- Angle-bracket stand-ins like `<SOME_TOKEN>` or `<VALUE>`

Explicit allowance:
- The literal string `<...>` is allowed **only** when it appears as a forbidden-token policy literal under:
  - `candidate_enforcement_bar.placeholder_policy.forbidden_tokens` in `guardrails/profile_parameters_resolved.yaml`.
  - This allowance does not apply anywhere else.

## Procedure

### Step 0 — Required file existence gate (fail-closed)

Require these inputs exist before any planning work:
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`

Do NOT require `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml` as a planning input.
That file is generated mechanically after `task_graph_v1.yaml` is emitted by the scripted post-plan phase.

If any are missing:
- write a feedback packet: `BP-YYYYMMDD-planning-missing-design-bundle.md`
- instruct the architect to rerun `/caf arch <name>` in `implementation_scaffolding`
- STOP

### Step 1 — Extract the minimal planning facts (no guessing)

Read the required inputs and extract only what is explicitly present:

A) Planning pattern payloads (fail-closed)
- Treat `planning_pattern_payload_v1` as a **script-owned design → planning handoff** materialized by `tools/caf/materialize_planning_pattern_payload_v1.mjs` during `/caf arch <name>`.
- `/caf plan <name>` MUST run the deterministic handoff preflight `node tools/caf/design_postgate_planning_coherence_v1.mjs <name>` before this worker is invoked.
- After that preflight passes, consume the payload blocks as present/authoritative. Do **not** invent a bespoke planner packet claiming the blocks are missing unless the files actually lack the CAF markers / YAML fence.
- In both:
  - `design/playbook/application_design_v1.md`
  - `design/playbook/control_plane_design_v1.md`
- Require `CAF_MANAGED_BLOCK: planning_pattern_payload_v1`.
- Record:
  - selected pattern ids (all scopes)
  - promoted required trace anchors
  - promoted required role bindings (do not validate role bindings here; that belongs to layout/TBP merge)
- Require `promotions` to have explicit list keys:
  - `semantic_inputs` (list; may be empty)
  - `required_trace_anchors` (list; may be empty)
  - `required_role_bindings` (list; may be empty)
  - `plane_placements` (list; may be empty)
- Empty `promotions.*` lists are valid. Missing keys are not.
- If the blocks are actually missing, unparseable, or `promotions` is `{}` / missing any required key, FAIL-CLOSED by surfacing the CAF-owned packet from the deterministic handoff preflight and STOP. Do **not** author a second planner-specific packet that contradicts the files.



B) Runtime shapes (fail-closed)
- From `control_plane_design_v1.md`, read the adopted values for:
  - `cp_runtime_shape`
  - `ap_runtime_shape`
- If missing or ambiguous → refuse.

C) ABP/PBP resolution + active-plane-aware domain inputs (required)

- Require and parse `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml`.
- Treat that file as the authoritative style→plane binding view.
- Do **not** reinterpret architecture style directly from prose once this file exists.

C1) Active plane derivation (planner rule; fail-closed)

Derive the active plane set only from explicit runtime / design / contract evidence:
- resolved plane/runtime pins in `spec/guardrails/profile_parameters_resolved.yaml`
- adopted `cp_runtime_shape` / `ap_runtime_shape` choices in `design/playbook/control_plane_design_v1.md`
- material cross-plane boundaries in `design/playbook/contract_declarations_v1.yaml`

Rules:
- The existence of a domain model file does **not** activate a plane.
- If application-plane work would be emitted but AP is not active → refuse.
- If control-plane/system persistence work would be emitted but CP is not active → refuse.

C2) Application plane domain model (planner-facing)

- Require `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`.
- Parse it as YAML.
- Derive `resource_names` from this file only:
  - preferred: `api_candidates.resources[*].name`
  - fallback: entity names from `domain.bounded_contexts[*].aggregates[*].entities[*].name`
- If neither yields names, fall back only as a last resort to a narrative resource list in the application spec or the `domain_and_resources_v1` bridge block.

C3) System/control-plane domain model (planner-facing)

- Require `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`.
- Parse it as YAML.
- Collect persisted system aggregate keys from:
  - `domain.bounded_contexts[*].aggregates[*]` where `persistence.required == true`
- Record these as `system_persisted_aggregate_names`.
- Optional canonical metadata on aggregates/entities is advisory only; it may help grouping but MUST NOT replace the aggregate/entity source name.

D) Material cross-plane contracts (fail-closed)
- From `contract_declarations_v1.yaml`, list every contract where:
  - `boundary_type: cross_plane`
  - `materiality.is_material: true`
- For each material contract, require:
  - `boundary_id`
  - `contract_ref.path`
  - `contract_ref.section_heading`


E) TBP resolution (fail-closed)
- Read `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml` and record:
  - `resolved_tbps` (ordered list)
  - `resolution_atoms` (for grounding; do not reinterpret)
- Do NOT infer TBPs from patterns here; only use the deterministic resolution output.

F) Adopted decision options (fail-closed)
- Use the union of `planning_pattern_payload_v1.adopted_option_choices` from BOTH design payload blocks as the primary planner-visible adopted option source.
- Cross-check that source against `reference_architectures/<name>/spec/playbook/system_spec_v1.md` → `decision_resolutions_v1`.
- Collect `adopted_option_choices` as tuples:
  - `(pattern_id, evidence_hook_id, question_id, option_set_id, option_id)`
  - Include only decisions where:
    - `status: adopt`, and
    - `resolved_values.questions` exists (non-empty), and
    - each question has exactly one `options[].status: adopt` (enforced by Preconditions).
	- Validate every `pattern_id` in `adopted_option_choices` appears in the union of `selected_patterns` from BOTH design planning payload blocks (`planning_pattern_payload_v1`).
	  - If any are missing, this indicates **design payload drift** (a common agent shortcut).
	    - Write a **blocker** feedback packet and STOP:
	      - `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-design-planning-adoption-drift.md`
	    - This drift should be caught earlier by the design-phase post-gate at the end of `/caf arch`.
	    - Minimal fix proposal (no repair scripts):
	      1) Preferred: rerun `/caf arch <name>` (design) so the CAF-managed planning payloads include all adopted decisions.
	      2) If a pattern should not drive planning/code yet: change its `status` in `system_spec_v1.md` → `decision_resolutions_v1` from `adopt` to `defer`, then rerun `/caf arch <name>`.
	      3) Do not return a manual hotfix to the CAF-managed `planning_pattern_payload_v1` blocks. Treat missing IDs there as producer drift, fix the producing framework seam, and rerun `/caf arch <name>` so the handoff is regenerated cleanly.
- If the payload union and the spec-derived tuples disagree, FAIL-CLOSED with a feedback packet. The design post-gate should have caught this earlier; do not continue planning on drift.
- Record the adopted option’s `summary` and `payload` (verbatim) for grounding; do not reinterpret.

G) Resolved UI pins (optional; fail-closed when required but invalid)

- From `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`, read the resolved `ui` object.
- If `ui.present: true`, record:
  - `ui.kind`
  - `ui.framework`
  - `ui.deployment_preference`
- Technology/runtime choices MUST come only from this resolved `ui` object.
- Separately, read `reference_architectures/<name>/spec/playbook/application_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: ui_product_surface_v1` as narrative grounding for shell/navigation/page wording.
- Treat `ui_product_surface_v1` as product-surface intent only; it MUST NOT override or duplicate technology pins.
- If the resolved file is missing or the `ui` object cannot be read when required, FAIL-CLOSED.

### Step 2 — Consume compiler-owned `pattern_obligations_v1.yaml`

Read the canonical compiler-owned obligations registry from:

- `reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml`

Ownership rules:
- The planner MUST NOT hand-author, overwrite, or "repair" the full obligations artifact.
- The planner consumes the compiled obligations registry and emits `task_graph_v1.yaml` that covers it.
- If the compiled obligation registry is missing, invalid, or materially inconsistent with the task-graph problem the planner is asked to solve, FAIL-CLOSED and surface the CAF-owned packet path from the deterministic compiler / invariant gates.

What remains planner-owned:
- task existence
- dependencies
- required capability routing
- canonical task ids
- baseline task contract
- semantic / decision anchors needed for downstream deterministic enrichment

What is no longer planner-owned:
- enumerating the full `pattern_obligations_v1.yaml` list
- restating TBP extension obligations inline
- serializing the obligations registry in chat or one-shot shell blobs


### Step 3 — Emit `task_graph_v1.yaml` covering all obligations

Write a schema-valid `task_graph_v1.yaml` with tasks that cover every emitted obligation.

Ownership note:
- The planner remains responsible for task structure, baseline task contract, and semantic/decision anchors.
- The planner MUST NOT spend tokens re-emitting library-owned semantic acceptance prose from adopted patterns/options/TBPs/PBPs/ABPs.
- Those library-owned attachments are enriched mechanically during the scripted post-plan phase.

Hard rules:
- Every obligation MUST be covered by ≥1 task via a trace anchor token:

Output serialization safety (critical; prevents LLM output-token exhaustion):

- The planner MUST write `task_graph_v1.yaml` as a file under the repo path.
- Avoid single-command file writes containing large YAML (common 8–16k command-length limits). Prefer multiple small file edits/patches.
- The planner MUST NOT print the full YAML (or large YAML fragments) in chat output.
- The planner MUST serialize `task_graph_v1.yaml` **one task per write** for all models and all task counts:
  - create/overwrite the file with header + `tasks:` first
  - append exactly one task at a time, ensuring the file remains valid YAML after each write
  - after each write, output only a short progress line (e.g., `wrote task 1/25`)
- After writing the file, output only a short summary (counts + file paths).

Named CAF deliverables that MUST NOT be dumped fully in chat and MUST NOT be written as one whole-shell blob regardless of OS/shell:
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- `reference_architectures/<name>/design/playbook/task_backlog_v1.md`
- `reference_architectures/<name>/design/caf_meta/plan_traceability_mindmap_v3.md`
- `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml`

Troubleshooting rule (non-negotiable):
- If the runner hits command-length / output-length / buffer limits while writing a named deliverable, do **not** switch to printing the artifact in chat and do **not** fall back to a single huge shell write.
- Continue using the artifact's prescribed write discipline (for `task_graph_v1.yaml`: one task per write).
- If the runner still fails after following the prescribed write discipline, stop and surface a feedback packet that tells the human to retry `/caf plan <instance_name>` rather than inventing an alternate emission mode.

  - `pattern_obligation_id:<obligation_id>`
- Every task MUST have exactly one `required_capabilities` entry.
- Required capability ids MUST come from `80_phase_8_worker_capability_catalog_v1.yaml`.
- Every task MUST include a first-class `steps:` array (5–14 items). Each step is a short imperative verb phrase.
- YAML output MUST use ASCII quotes only (`"` / `'`). Do not emit smart quotes.
- Any scalar that contains `: ` MUST be quoted or rephrased so the emitted YAML remains parseable. This applies to `title`, `description`, and any list-item scalar text.

Planning promotions + references (required; no new decisions):

- For each `promotions.semantic_inputs` entry in either design's `planning_pattern_payload_v1`:
  - If `scope == cross_cutting`: add it to **every** task's `inputs` as:
    - `path: <source_path>`, `required: true`
  - If `scope == per_resource`: add it to every **per-resource** task (`TG-20-*`, `TG-30-*`, `TG-40-*`) **and** to both plane runtime scaffold tasks (`TG-00-CP-runtime-scaffold`, `TG-00-AP-runtime-scaffold`) as required inputs.

- For each `promotions.required_trace_anchors` entry:
  - If `scope == cross_cutting`: add it to **every** task's `trace_anchors` as:
    - `pattern_id: "<pattern_id>"`, `anchor_kind: "<anchor_kind>"`
  - If `scope == per_resource`: add it to every **per-resource** task (`TG-20-*`, `TG-30-*`, `TG-40-*`) **and** to both plane runtime scaffold tasks.

Task story + steps (must reach codegen):

- Each task MUST include a first-class `steps:` array (5–14 items). Each step is a short imperative verb phrase.
- Each task MUST include `semantic_review.constraints_notes` containing:
  - `Story:` 1–3 sentences explaining *why this task exists*, derived from the obligation(s) it covers and the adopted patterns.
  - `References:` bullet list of `inputs[].path` plus the `trace_anchors[].pattern_id` values.
- These notes MUST remain semantic (no "assert file exists" checks). They MUST NOT introduce new design decisions.

Canonical task mapping (deterministic):

Non-negotiable planning integrity (fail-closed):
- Do NOT collapse or "optimize away" canonical tasks to reduce task count.
  - Example: do NOT cover `OBL-PLANE-*-RUNTIME-SCAFFOLD` by only emitting `TG-90-runtime-wiring`.
  - Example: do NOT replace per-boundary `TG-00-CONTRACT-*` tasks with a single cross-cutting task.
  - Example: do NOT omit `TG-30-service-facade-*` / `TG-40-persistence-*` when application resources exist.
  - Example: do NOT omit `TG-40-persistence-cp-*` when persisted system/control-plane aggregates exist and CP is active.
- If you cannot emit the canonical tasks with required fields (including `steps:`), FAIL-CLOSED by emitting a feedback packet path and stopping.

A) Plane runtime scaffold tasks
- `TG-00-CP-runtime-scaffold` → `plane_runtime_scaffolding`
- `TG-00-AP-runtime-scaffold` → `plane_runtime_scaffolding`
- Never emit legacy runtime scaffold capability ids `runtime_scaffolding_cp` or `runtime_scaffolding_ap` in new planning output. Those ids are compatibility aliases only.

B) Contract scaffolding tasks (two per boundary)
- `TG-00-CONTRACT-<boundary_id>-AP` → `contract_scaffolding`
- `TG-00-CONTRACT-<boundary_id>-CP` → `contract_scaffolding`
- Never emit an unsuffixed boundary-wide contract task such as `TG-00-CONTRACT-<boundary_id>`. That shape is invalid for new planning output.
- For every material boundary, emit exactly two contract tasks in new planning output: one `-AP` task and one `-CP` task.
- If you cannot justify both plane-specific tasks from the boundary declaration, stop and surface a blocker rather than collapsing them into one task.

Contract trace anchors (required; deterministic):

For every `TG-00-CONTRACT-<boundary_id>-(AP|CP)` task, you MUST include these additional `trace_anchors[]` objects (in addition to the obligation anchor):

- `contract_boundary_id:<BOUNDARY_ID>`
- `contract_ref_path:<PATH>`
- `contract_ref_section:<HEADING>`
- `contract_surface:<synchronous_http|async_events|mixed|custom>`

Derivation rules (deterministic; no new decisions):

- `<BOUNDARY_ID>` MUST equal the `contracts[].boundary_id` value in `design/playbook/contract_declarations_v1.yaml` that corresponds to this task's `<boundary_id>`.
- `<PATH>` and `<HEADING>` MUST come from the same contract's `contract_ref.path` and `contract_ref.section_heading`.
- `<contract_surface>` MUST be derived from the adopted surface choice recorded in the contract reference document at `<HEADING>`:
  - If the section contains an `ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1` with an adopted `option_id` under `choices.cp_ap_contract_surface`, map it as:
    - `mixed` → `mixed`
    - `async_events` → `async_events`
    - `synchronous_api` → `synchronous_http`
    - `synchronous_http` → `synchronous_http`
  - If no adopted surface choice can be located deterministically, set `contract_surface:custom`.
- These anchors are part of the planner's required output. Do NOT rely on a hidden repair/postprocess step to fill them later.

C) Policy / auth / tenant-context task (when applicable)
- `TG-35-policy-enforcement-core` → `policy_enforcement`

Planner rule (canonical; deterministic):
- Emit one combined policy task when the selected patterns/obligations require any of:
  - CP policy surface semantics
  - AP policy enforcement
  - AP auth mode
  - tenant-context propagation / conflict handling
- The combined task MUST cover those obligations in one task rather than splitting them into separate CP/AP/auth tasks.
- Legacy split policy task ids (`TG-00-CP-policy-surface`, `TG-00-AP-policy-enforcement`, `TG-00-AP-auth-mode`) are compatibility-only and MUST NOT appear in new planning output.
- The policy task MUST consume `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` as a required input so the selected `platform.auth_mode` is explicit in planning.
- Baseline task wording MUST explicitly name the selected `platform.auth_mode` value in the task story (steps, DoD, or semantic_review.constraints_notes); do not let auth mode disappear behind generic policy prose.
- If `platform.auth_mode == mock` and the adopted tenant-context carrier is `auth_claim`, the baseline task wording MUST make the mock claim-bearing contract explicit (for example a mock JWT or equivalent test token that carries the verified claim shape). Do not silently drift to header-style semantics.

Dependency rule (deterministic):
- `TG-35-policy-enforcement-core` depends on every emitted contract scaffolding task.
- If any `TG-20-api-boundary-*` tasks exist, it also depends on the lexicographically first emitted `TG-20-api-boundary-*` task so policy enforcement lands after at least one concrete AP ingress exists.

D) Per-API-surface-candidate tasks (when applicable)

For each `R` in `resource_names`:

- `TG-20-api-boundary-<R>` → `api_boundary_implementation`
- `TG-30-service-facade-<R>` → `service_facade_implementation`
- `TG-40-persistence-<R>` → `persistence_implementation`

E1) Per persisted system/control-plane aggregate task (when applicable)

For each `S` in `system_persisted_aggregate_names`:
- `TG-40-persistence-cp-<S>` → `persistence_implementation`

Dependencies (minimal, deterministic):
- Application resource tasks depend on `TG-00-AP-runtime-scaffold`.
- `service-facade` has no required dependency beyond runtime scaffold (it owns the per-resource domain/service shape).
- `api-boundary` depends on `service-facade`.
- application-plane `persistence` depends on `service-facade`.
- control-plane `TG-40-persistence-cp-*` tasks depend on `TG-00-CP-runtime-scaffold`.
- `TG-35-policy-enforcement-core` depends on all emitted contract scaffolding tasks; if any AP boundary tasks exist, it also depends on the lexicographically first emitted `TG-20-api-boundary-*` task.

### TG-40 persistence task rails (mandatory)

For each `TG-40-persistence-<R>` and `TG-40-persistence-cp-<S>` task, the planner MUST embed persistence rails so downstream workers cannot default to in-memory runtime wiring.

Required task inputs (authoritative):
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`
- `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (resolved persistence rails: database.engine, persistence.orm)
- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml` (resolved TBPs that may contribute DB adapter obligations)

Required task steps (minimum):
- Define a persistence boundary interface for the aggregate/resource aligned to the relevant plane domain model.
- Implement repository selection via an injectable factory/wiring surface; DO NOT instantiate an in-memory repository directly inside runtime entry surfaces.
- Align assumptions to resolved rails (database.engine + persistence.orm). If a DB engine is resolved, ensure the design is DB-ready (adapter/wiring points), even if DB-specific code is delivered by a TBP-derived task.
- Explicitly name the selected `persistence.orm` and `schema_management_strategy` in the task story so downstream workers cannot collapse ORM-backed rails into a raw-SQL-only assumption.
- When the task targets `TG-40-persistence-cp-*`, emit the persistence work into the control-plane code surface rather than the application-plane code surface.

Required DoD bullets (minimum):
- "Repository wiring is injectable and does not hard-wire an in-memory implementation for runtime."
- "Persistence assumptions are aligned to resolved rails (database.engine + persistence.orm) and do not contradict resolved TBPs."
- "The selected persistence.orm and schema_management_strategy are named explicitly and do not silently collapse to a raw-SQL-only posture when ORM-backed rails are selected."
- "The persistence boundary is emitted into the plane-local path implied by ABP/PBP resolution for the active plane."

Required semantic review question (minimum):
- "Are persistence assumptions aligned to the resolved persistence rails and any TBP-derived DB obligations (no in-memory-only runtime)?"
- "Does the task explicitly preserve the selected persistence.orm rather than silently degrading to a driver/raw-SQL-only assumption?"

E2) UI tasks (generic, data-driven; when applicable)

If resolved UI pins were recorded (Step 1G) and `ui.present: true`:

- UI tasks are NOT derived from pattern obligations. They are derived ONLY from resolved `ui.*` pins in `profile_parameters_resolved.yaml` + the authoritative UI task seeds.
- However, UI seed matching MAY reference the canonical adopted pattern set from `system_spec_v1.md:decision_resolutions_v1` when the seed file declares adopted-pattern conditions.
- When `ui.present: true`, you MUST emit at least the UI-01 seed task (`TG-15-ui-shell`) on the first pass, even if the UI pins use marketing-default values.

- Load `architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml`.
- Evaluate each `seed.when` clause using only:
  - the recorded `ui.*` values
  - canonical adopted pattern ids from `system_spec_v1.md:decision_resolutions_v1 (status: adopt)` when a seed declares `required_adopted_patterns_all` / `required_adopted_patterns_any`
  - pinned values present in `architecture_shape_parameters.yaml` only when a seed explicitly declares pin conditions
- Emit tasks from matching seeds.

Rules (non-negotiable):
- Seeds are authoritative. Do not invent additional UI tasks.
- If a seed declares `per_resource: true`, expand it deterministically for every application-plane `R` in `resource_names`; do not collapse per-resource pages into `TG-15-ui-shell`. System/control-plane persisted aggregates do not silently imply browser UI tasks.
- If a seed declares `required_adopted_patterns_all`, only match when **all** listed pattern ids are adopted in `system_spec_v1.md`.
- If a seed declares `required_adopted_patterns_any`, only match when **at least one** listed pattern id is adopted in `system_spec_v1.md`.
- If a seed declares `required_pins_all`, only match when **all** listed pins exist (key present) in the instance pins.
- UI tasks MUST be additive (they do not replace AP/CP tasks).
- UI tasks MUST include at least one trace anchor that grounds them to either:
  - `selected_pattern:<PATTERN_ID>` (for adopted-pattern-triggered seeds), or
  - `pinned_input:<PIN_KEY>` (for pin-triggered seeds), or
  - `pinned_input:ui.present` (for UI-triggered seeds driven by resolved profile parameters).
- When `ui_product_surface_v1` is present and non-placeholder, use it to refine task titles, steps, DoD wording, and review questions for the already-authoritative UI tasks; do not invent extra task ids from prose alone.

F) Cross-cutting decision option tasks (when applicable)

If any obligations were emitted with `obligation_id` starting with `OBL-OPT-`, compile deterministic cross-cutting tasks so the chosen options become actionable:

Grouping rule (deterministic):
- Group option-derived obligations by `capability_id`.

For each group `(capability_id)` emit exactly one task:

- task_id: `TG-10-OPTIONS-<capability_id>`
  - Normalize `<capability_id>` by replacing any non `[a-z0-9_-]` with `-` (lowercase), collapsing repeated `-`.
- title: `Decision option implementation (<capability_id>)`
- required_capabilities: [`<capability_id>`]
- inputs (required=true):
  - `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
  - `reference_architectures/<name>/design/playbook/application_design_v1.md`
  - `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
  - plus any cross-cutting promoted inputs already required on all tasks
- depends_on (minimal, deterministic):
  - If `<capability_id>` in {api_boundary_implementation, policy_enforcement, observability_and_config, runtime_wiring}:
    - depend on `TG-00-AP-runtime-scaffold` when present.
  - If `<capability_id>` == `persistence_implementation`:
    - depend on `TG-00-AP-runtime-scaffold` for `TG-40-persistence-*` tasks
    - depend on `TG-00-CP-runtime-scaffold` for `TG-40-persistence-cp-*` tasks
    - additionally, if `<capability_id>` == runtime_wiring, also depend on `TG-00-CP-runtime-scaffold` when present.
  - Otherwise: no dependencies beyond promoted cross-cutting inputs.

Coverage + trace anchors (required):
- For every covered option obligation_id `O`, include a trace anchor:
  - pattern_id: `pattern_obligation_id:<O>`
    anchor_kind: `plan_step_archetype`
- Also include one structural trace anchor per covered pattern decision:
  - pattern_id: `decision_option:<pattern_id>/<question_id>/<option_id>`
    anchor_kind: `structural_validation`

Definition of Done (semantic; deterministic; minimum 3 lines):
- Include bullets that:
  - restate the adopted options covered by this task (pattern_id/question_id/option_id), and
  - require implementations to align with the selected option payloads (without inventing new values).
- Do NOT encode file paths or deterministic checks.

Semantic review:
- severity_threshold: `blocker`
- 3–7 review_questions that ask whether the implementation aligns with the adopted options and does not introduce new architecture decisions.

F2) Library-owned semantic acceptance attachments (required; post-plan compiled)

Do not hardcode technology facts or option-specific DoD / review language in planner conditionals.
The planner must keep the semantic pressure visible by emitting the correct task structure (`required_capabilities`, dependencies, steps, and adopted-decision/obligation anchors), but the planner MUST NOT expand library-owned semantic acceptance prose into task-local `definition_of_done[]` / `semantic_review.review_questions[]`.

Framework-owned post-plan compiler:
- `tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs` collects active semantic acceptance from library-owned elements and enriches the planner-emitted `task_graph_v1.yaml` deterministically.
- Active attachment sources remain:
  - adopted pattern definitions: `caf.semantic_acceptance.attachments[]`
  - adopted human questions / option sets / adopted options: `semantic_acceptance.attachments[]`
  - resolved TBPs: `tbp_manifest_v1.yaml:extensions.gates[]`
  - selected ABP / PBP manifests: optional shared semantic-acceptance attachment extensions when present

Planner responsibilities (required):
- Emit the concrete non-OPTIONS tasks whose `required_capabilities[]` make those attachments targetable.
- Preserve adopted-option structural pressure via obligations and TG-10-OPTIONS-* tasks; do not collapse those obligations away just because the attachment prose is now script-owned.
- Keep task `steps`, baseline `definition_of_done`, and baseline `semantic_review.review_questions` focused on the task's own implementation story; do not restate library-owned attachment prose there.
- If planner output omits the concrete consumer task for an active attachment capability, the post-plan compiler will fail closed.

Semantic wording rules:
- Library-owned attachments must state what must be true, not file-path checks and not negative anti-checklists.
- If any attachment criteria encode file paths or script-like checks, FAIL-CLOSED and request a library rewrite.

G) Enforcement-bar-required wiring/tests (when required)

Before emitting the Task Graph, read these flags from:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

Flags:
- `candidate_enforcement_bar.runnable_policy.require_runtime_wiring` (default false)
- `candidate_enforcement_bar.test_policy.require_unit` (default false)

If `require_runtime_wiring == true`, emit:
- `TG-90-runtime-wiring` → `runtime_wiring`

If `require_unit == true`, emit:
- `TG-90-unit-tests` → `unit_test_scaffolding`

Dependencies:
- `TG-90-runtime-wiring` depends on `TG-00-AP-runtime-scaffold` and `TG-00-CP-runtime-scaffold` (when those tasks exist).
- `TG-90-unit-tests` depends on `TG-90-runtime-wiring` when present; otherwise depends on `TG-00-AP-runtime-scaffold`.

Coverage:
- These tasks MUST include trace anchors covering applicable obligations, including at minimum:
  - `pattern_obligation_id:OBL-RUNTIME-WIRING` (if emitted)
  - `pattern_obligation_id:OBL-UNIT-TESTS` (if emitted)
  - `pattern_obligation_id:OBL-REPO-README` (if emitted)


G2) Companion repo operator README (always in implementation_scaffolding)

If `lifecycle.generation_phase == implementation_scaffolding`, emit one documentation task:

- `TG-92-tech-writer-readme` → `repo_documentation`

This task is mandatory in `implementation_scaffolding` whenever the companion repository is in scope.
Do **not** rely on post-plan scripts to create this task if the planner omitted it.

Inputs (required=true):
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml`

Dependencies (minimal, deterministic):
- If `TG-90-runtime-wiring` exists: depend on it.
- Else depend on `TG-00-AP-runtime-scaffold` when present and `TG-00-CP-runtime-scaffold` when present.

Coverage + trace anchors (required):
- Include trace anchor: `pattern_obligation_id:OBL-REPO-README` (plan_step_archetype).

Definition of Done (semantic; minimum):
- README explains how to start the stack locally using the pinned deployment mode (compose runner) and the produced compose wiring, without inventing new technologies.
- README documents required/optional environment variables and shows how to provide them (example env file copy/rename).
- README documents how to run unit tests with the pinned language toolchain.
- README mentions database wiring when a DB TBP is resolved (e.g., PostgreSQL), including the `DATABASE_URL` contract surface.

Semantic review (blocker):
- 3–7 review questions focusing on operator clarity, alignment to pins/TBPs, and avoidance of unapproved stack decisions.


H) TBP extension tasks (when present)

For TBP-derived obligations emitted in Step 2 (from `extensions.obligations`), compile deterministic tasks.

Grouping + attachment rule (deterministic):
- Group TBP-derived obligations by `(tbp_id, capability_id)` where `capability_id == obligation.capability_id`.
- For each group, compute an attachment target (execution-anchor) **without guessing**:

  Attachment target selection (execution-anchor; deterministic):
  - Candidate tasks: all **non-TBP** tasks whose `required_capabilities` contains `capability_id`.
  - Exclude selector/OPTIONS tasks (never attach implementation obligations here):
    - `task_id` contains `-OPTIONS-`, OR
    - `title` begins with `Adopted options:`
  - If any non-selector candidates remain:
    - Prefer tasks where `required_capabilities == [capability_id]` (single-capability owner signal).
    - Then prefer the task with the smallest numeric TG index parsed from `task_id` prefix `TG-<n>-...`.
    - Tie-break by lexicographic `task_id`.
    - Attach this TBP obligation coverage to that task (DO NOT emit a new `TG-TBP-*` task for this group).
  - Else (no valid execution-anchor; only selector tasks or none):
    - Emit exactly one `TG-TBP-*` task per group: `TG-TBP-<tbp_id>-<capability_id>`.

When attaching to an existing task (required):
- Ensure the attach target includes required inputs:
  - `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
  - `architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml`
- Append trace anchors for each covered `obligation_id` to the attach target (plan_step_archetype).
- In `semantic_review.constraints_notes`, list the covered obligation_ids and role_binding_keys (names only).

Task fields for emitted TG-TBP tasks (deterministic):
- task_id: `TG-TBP-<tbp_id>-<capability_id>`
- title: `TBP <tbp_id> obligations`
- required_capabilities: [`<capability_id>`]
- inputs MUST include (as required=true):
  - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
  - `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
  - `architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml`
  - plus any cross-cutting promoted inputs already required on all tasks

Dependencies (minimal, deterministic):
- If `<capability_id>` in {api_boundary_implementation, service_facade_implementation, policy_enforcement}: depend on `TG-00-AP-runtime-scaffold` (when that task exists).
- If `<capability_id>` == `persistence_implementation`: depend on the plane-local runtime scaffold (`TG-00-AP-runtime-scaffold` for `TG-40-persistence-*`; `TG-00-CP-runtime-scaffold` for `TG-40-persistence-cp-*`).
- If `<capability_id>` == contract_scaffolding: depend on both `TG-00-CP-runtime-scaffold` and `TG-00-AP-runtime-scaffold` (when that task exists).
- Otherwise: no additional dependencies.

Coverage + trace anchors (required):
- For every TBP-derived obligation_id covered by this task, include a trace anchor:
  - pattern_id: `pattern_obligation_id:<obligation_id>`
    anchor_kind: `plan_step_archetype`
- Also include a TBP trace anchor:
  - pattern_id: `tbp_id:<tbp_id>`
    anchor_kind: `structural_validation`
    anchor_ref: `tbp_manifest_v1.yaml`

Semantic requirements:
- Do not restate file paths in `steps` or `definition_of_done`. Refer to TBP role-binding keys and intent semantically.
- In `semantic_review.constraints_notes`, explicitly list the covered TBP obligation_ids and the TBP role_binding_keys (names only) so workers can implement without guessing.


I) TBP extension gates (when present; post-plan compiled)

Treat `extensions.gates[]` as the TBP-owned form of the shared semantic-acceptance attachment contract.

Rules:
- Do not attach TBP gates to selector/OPTIONS tasks.
- Normalize `required_capability` / `required_capabilities[]` + `attachment_scope` using the F2 rules above.
- The scripted post-plan compiler, not the planner, compiles TBP gate criteria into `definition_of_done[]` and TBP gate review questions into `semantic_review.review_questions[]`.
- Preserve TBP provenance in the emitted line prefix:
  - `TBP Gate (<tbp_id>/<gate_id>): <text>`
- If a TBP gate cannot be attached deterministically under the shared attachment rules, FAIL-CLOSED.

Definition of Done + Semantic Review (required):
- Each task MUST include a backlog-style `definition_of_done` list (semantic criteria only; no file path assertions).
- Each task MUST include `semantic_review` with:
  - `severity_threshold` (default: `blocker`)
  - 3–7 `review_questions` customized to the task's obligation scope
- The Task Graph MUST NOT declare per-task output paths or deterministic acceptance checks.

Also write a TSV mirror `task_graph_index_v1.tsv` to `reference_architectures/<name>/design/playbook/` with columns:
- task_id	plane_scope	required_capability	covers_obligation_ids

Batching reminder (token discipline):
- If you are using an LLM runner with strict output token caps, you MUST NOT dump the task graph into the response.
- Always write/append `task_graph_v1.yaml` in ≤3-task batches until complete.

### Step 3.5 — Backlog ownership boundary (required)

Do **not** emit `task_backlog_v1.md` in this planner step.

Backlog projection is instruction-owned by the dedicated post-plan worker:

- `skills/worker-task-backlog-projector/SKILL.md`

Why:
- `task_backlog_v1.md` is a human-facing derived view, not a planner-owned source artifact.
- The backlog must remain a pure projection of `task_graph_v1.yaml`.
- Centralizing backlog emission in the dedicated worker avoids drift where the planner writes a plan-shaped file into the backlog path.

Planner output boundary here:
- Emit `task_graph_v1.yaml` and `task_graph_index_v1.tsv`.
- Do **not** write or overwrite `reference_architectures/<name>/design/playbook/task_backlog_v1.md`.
- The backlog will be emitted later on demand by `/caf backlog <name>` from the canonical task graph.


I) Pattern structural validation tasks (required)

If any obligations were emitted with `obligation_id` starting with `OBL-PAT-`, compile deterministic validation tasks so adopted patterns remain actionable throughout codegen.

For each such obligation `OBL-PAT-<pattern_id>` emit exactly one task:

- task_id: `TG-95-VALIDATE-<pattern_id>`
- title: `Validate adopted pattern (<pattern_id>)`
- required_capabilities: [`structural_validation`]
- inputs (required=true):
  - `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
  - `reference_architectures/<name>/design/playbook/application_design_v1.md`
  - `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
  - `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`

Do NOT require `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml` as a planning input.
That file is generated mechanically after `task_graph_v1.yaml` is emitted by the scripted post-plan phase.
  - `<definition_path>` (resolved from retrieval surface; required)
  - plus any cross-cutting promoted inputs already required on all tasks

Dependencies (minimal; deterministic):

- If `TG-90-unit-tests` exists: depend on it.
- Else if `TG-90-runtime-wiring` exists: depend on it.
- Else depend on `TG-00-AP-runtime-scaffold` and `TG-00-CP-runtime-scaffold` when present.

Coverage + trace anchors (required):

- Include a trace anchor covering the obligation:
  - pattern_id: `pattern_obligation_id:OBL-PAT-<pattern_id>`
    anchor_kind: `plan_step_archetype`
- Include a pattern validation trace anchor:
  - pattern_id: `<pattern_id>`
    anchor_kind: `structural_validation`

Task story + steps (must be semantic):

- In `semantic_review.constraints_notes`, explain which evidence anchors and pattern DoD sections must be satisfied.
- Do not add new design choices.


### Step 4 — Semantic coverage validation (fail-closed)

Before finishing, validate coverage by inspection:
- For every obligation id in `pattern_obligations_v1.yaml`, ensure at least one task in `task_graph_v1.yaml` contains the trace token:
  - `pattern_obligation_id:<obligation_id>`

If any obligation is uncovered:
- Emit a feedback packet and stop.

Feedback packet path:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-pattern-obligation-coverage-incomplete.md`

The packet MUST list:
- uncovered obligation ids
- the files read
- the task ids present



Plane-binding rule (required):
- Before emitting any style-aware task into AP or CP, confirm the selected plane entry in `abp_pbp_resolution_v1.yaml` has `selected_abp_role_bindings.status: present`.
- If a required active plane lacks selected ABP role bindings, FAIL-CLOSED.
- Build must execute the emitted Task Graph as the binding contract; it must not reinterpret architecture style or plane placement.

G) Minimal interface binding contracts (required when consumer/provider/assembler closure loops exist)
- Do not hand-author `reference_architectures/<name>/design/playbook/interface_binding_contracts_v1.yaml`; it is generated mechanically after `task_graph_v1.yaml` is emitted by the scripted post-plan phase.
- The planner's responsibility is to emit the required `interface_binding_hints[]` on the relevant tasks in `task_graph_v1.yaml`.
- When the task graph includes a consumer/provider/assembler loop that must preserve an explicit required/provided interface across waves, emit per-task `interface_binding_hints[]` so the generator can derive the binding contracts mechanically.
- Keep each hinted binding minimal:
  - `binding_key`
  - `participant` (`consumer` | `provider` | `assembler`)
  - `semantic_role`
  - `required_interface_name` and `required_interface_description` on the consumer hint
  - optional `binding_id`, `provider_binding_kind`, `assembler_binding_action`
- Ensure the consumer, provider, and assembler tasks each take `interface_binding_contracts_v1.yaml` as a required input in the task graph when emitted directly; the scripted post-plan phase may also attach that required input mechanically from the derived bindings (legacy `seam_contracts_v1.yaml` references remain tolerated only during migration).
- Ensure the assembler task depends on both the consumer and provider tasks for every declared interface binding.
