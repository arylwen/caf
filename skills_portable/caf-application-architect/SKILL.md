---
name: caf-application-architect
description: >
  Produce application planning contract artifacts (Playbook) for an instance in a deterministic, fail-closed way.
  Instruction-only: no scripts. The planner writes plan contracts as files and refuses on missing/ambiguous inputs.
status: active
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

1) Require `guardrails/profile_parameters_resolved.yaml` and read:
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
- Do NOT require `application_spec_v1.md` to carry a canonical `## Resources` section; that was a older posture.

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
- `guardrails/profile_parameters.yaml`
- `system_spec_v1.md`
- `application_spec_v1.md`
- `application_design_v1.md`
- `control_plane_design_v1.md`
- `contract_declarations_v1.yaml`

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
  - `application_design_v1.md`
  - `control_plane_design_v1.md`
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

C) Domain model + API candidates (preferred)

- If `reference_architectures/<name>/spec/playbook/domain_model_v1.yaml` exists:
  - Parse it as YAML.

  C1) Explicit API candidates (preferred)
  - If it contains `api_candidates.resources` (a list of objects with `name`):
    - Treat that list as the authoritative "API surface candidates" for planning.
    - Record `resource_names = [r.name for r in api_candidates.resources]`.

  C1b) Entity-derived API candidates (domain-model-driven; generic)
  - Else, attempt a deterministic, **non-bespoke** derivation from the domain model's entities:
    - Collect entity names from:
      - `domain.bounded_contexts[*].aggregates[*].entities[*].name`
    - Normalize to stable resource tokens (kebab-case):
      - Example: `Widget` → `widget`, `User Account` → `user-account`
    - De-duplicate and sort.
    - If this list is non-empty, treat it as `resource_names`.

  - If neither C1 nor C1b yields any names, fall back to C2.

C2) Resource list fallback (only when domain_model is missing/incomplete)

- From `application_spec_v1.md`, treat any `## Resources` section or `ARCHITECT_EDIT_BLOCK: domain_and_resources_v1` only as a narrative fallback, not the canonical planner-facing source.
- Extract a deterministic list of resource names.
- If the list is empty, allow an empty list (do not refuse).

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
- From `reference_architectures/<name>/spec/playbook/system_spec_v1.md` → `decision_resolutions_v1`:
  - Collect `adopted_option_choices` as tuples:
    - `(pattern_id, evidence_hook_id, question_id, option_set_id, option_id)`
  - Include only decisions where:
    - `status: adopt`, and
    - `resolved_values.questions` exists (non-empty), and
    - each question has exactly one `options[].status: adopt` (enforced by Preconditions).
- Validate every `pattern_id` in `adopted_option_choices` appears in the union of `selected_patterns` from BOTH design planning payload blocks (`planning_pattern_payload_v1`).
  - If any are missing: FAIL-CLOSED (design/pattern adoption drift). The feedback packet MUST list the missing pattern ids and instruct the architect to rerun `/caf arch <name>` after resolving the adoption drift.
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

### Step 2 — Emit `pattern_obligations_v1.yaml`

Write a schema-valid `pattern_obligations_v1.yaml` that enumerates obligations required to make a “boring SaaS” demo viable.

Hard rules:
- Task IDs are NOT arbitrary. Every emitted task_id MUST match one of the canonical templates below (TG-00-*, TG-20-*, TG-30-*, TG-40-*, TG-90-*, TG-10-OPTIONS-*, TG-TBP-*).
- The planner MUST NOT emit sequential TG-01/TG-02/TG-03 style ids for worker-dispatched capabilities.
- If an obligation cannot be mapped to a canonical task id template, FAIL-CLOSED and write a feedback packet.

- No framework assumptions.
- `generated_from.inputs` MUST include all instance inputs used to compile obligations, plus:
  - `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
  - `architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_manifest_v1.yaml` for every TBP that contributes any obligation via `extensions.obligations`.
  - `architecture_library/patterns/external_v1/definitions_v1/<PATTERN>.yaml` for every adopted option obligation emitted in section (9) (unique list).
- Obligation ids are stable and deterministic.
- Obligations MUST cite their sources (pattern ids, runtime shapes, boundary ids, resource names).
Additional grounding rules (selected_pattern_ids):

- `selected_pattern_ids` for each obligation MUST be a subset of the union of `selected_patterns` from the two design planning payloads.
  - It MUST NOT include pattern ids that were not adopted in `system_spec_v1.md`.
  - If an obligation is not driven by any adopted pattern, set `selected_pattern_ids: []` (empty list is allowed by schema).
- If you cite a pattern definition file under `sources` (e.g., `architecture_library/patterns/.../definitions_v1/<PATTERN>.yaml`), that `<PATTERN>` MUST be present in the adopted `selected_patterns` union. Otherwise FAIL-CLOSED (do not cite non-adopted patterns).

Pattern-driven structural validation obligations (required)

Goal: make non-optionized (and optionized) adopted patterns first-class drivers of obligations and tasks, without bespoke if/then mapping.

Rules (deterministic; no guessing):

- Let `adopted_pattern_ids` be all `decision_resolutions_v1.decisions[*].pattern_id` where `status: adopt`.
- For each `pattern_id` in `adopted_pattern_ids`:
  - Resolve the pattern via the canonical retrieval surface JSONL to obtain:
    - `definition_path`
    - `plane`
  - Emit exactly one obligation:

    - obligation_id: `OBL-PAT-<pattern_id>`
    - obligation_kind: `other`
    - capability_id: `structural_validation`
    - plane_scope (derived from `plane`):
      - `control` → `CP`
      - `application` → `AP`
      - `data` → `DP`
      - `both` (or unknown) → `cross_plane`
    - description (single sentence):
      - `"Adopted pattern <pattern_id>: validate structural alignment with the pattern definition of done."`
    - selected_pattern_ids: `["<pattern_id>"]`
    - sources (minimum):
      1) `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
         - anchor: `decision_resolutions_v1 pattern_id=<pattern_id> status=adopt`
      2) `<definition_path>`
         - anchor: `definition_of_done + promotions (when present)`

- Add every referenced `<definition_path>` to `generated_from.inputs` (unique list).

Fail-closed:

- If any adopted `pattern_id` cannot be resolved to a `definition_path` via the retrieval surface, STOP with a feedback packet (do not guess).




Minimum obligation set to emit (if applicable):

0) Pattern structural validation obligations (always when any patterns are adopted)
- For each adopted pattern_id: `OBL-PAT-<pattern_id>`


1) Runtime scaffold obligations (always)
- `OBL-PLANE-CP-RUNTIME-SCAFFOLD`
- `OBL-PLANE-AP-RUNTIME-SCAFFOLD`

2) Per material contract (for each `boundary_id`)
- `OBL-CONTRACT-<boundary_id>-AP`
- `OBL-CONTRACT-<boundary_id>-CP`

3) CP/AP policy surface (required when any material AP↔CP contract exists)
- `OBL-CP-POLICY-SURFACE`
- `OBL-AP-POLICY-ENFORCEMENT`

4) Tenant context propagation (required when tenancy pattern(s) are selected OR a tenant carrier is explicitly adopted in the contract section)
- `OBL-TENANT-CONTEXT-PROPAGATION`

5) Auth mode (required when `ap_runtime_shape` implies an external API boundary; mock is acceptable)
- `OBL-AP-AUTH-MODE`

6) Per API surface candidate (only when `ap_runtime_shape` implies an external HTTP API)

For each `R` in `resource_names` (as derived from `domain_model_v1.yaml` when available, otherwise from the spec fallback):
- `OBL-AP-RESOURCE-<R>-API`
- `OBL-AP-RESOURCE-<R>-SERVICE`
- `OBL-AP-RESOURCE-<R>-PERSISTENCE`

7) Enforcement-bar-required obligations (when required)

Read these flags from:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

If `candidate_enforcement_bar.runnable_policy.require_runtime_wiring == true`, emit:
- `OBL-RUNTIME-WIRING`

If `candidate_enforcement_bar.test_policy.require_unit == true`, emit:
- `OBL-UNIT-TESTS`


7b) Repo operator documentation obligation (always in implementation_scaffolding)

If `lifecycle.generation_phase == implementation_scaffolding`, emit:
- `OBL-REPO-README`
  - capability_id: `repo_documentation`
  - plane_scope: `cross_plane`
  - description: `Produce a practical operator README for the companion repo (start/run/test/env) grounded in pins + TBPs.`

This obligation is mandatory in `implementation_scaffolding`.
Do **not** treat it as optional, advisory, or postprocess-repairable.
If omitted, planning output is incomplete and should be rejected by gates rather than repaired by helper scripts.


8) TBP extension obligations (when present)

If any resolved TBP declares `extensions.obligations`, union those obligations into the compiled obligations list.

Deterministic compilation rules:
- For each `tbp_id` in `tbp_resolution_v1.yaml:resolved_tbps` (in listed order):
  - Open `architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml` and parse as YAML.
  - If `extensions.obligations` is missing or empty: continue.
  - For each entry `o` in `extensions.obligations`:
    - Require `o.obligation_id`, `o.title`, `o.required_capability`, `o.role_binding_key`.
    - Require `o.required_capability` exists as a `capability_id` in `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`.
    - Require `layout.role_bindings` contains key `o.role_binding_key`.
    - Fail-closed if `o.obligation_id` collides with any already-emitted obligation_id (pattern-derived or earlier TBP-derived).
    - Emit an obligation entry:
      - obligation_id: `o.obligation_id`
      - obligation_kind: `other`
      - plane_scope (deterministic):
        - If `o.required_capability` in {api_boundary_implementation, service_facade_implementation, persistence_implementation}: `AP`
        - Else if `o.required_capability` in {contract_scaffolding, runtime_wiring}: `cross_plane`
        - Else: `cross_plane`
      - capability_id: `o.required_capability`
      - description: `o.title` (optionally append ` (TBP: <tbp_id>)` for clarity)
      - sources (minimum 2):
        - path: `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml`
          anchor: `resolved_tbps includes <tbp_id>`
        - path: `architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml`
          anchor: `extensions.obligations[obligation_id=<o.obligation_id>], role_binding_key=<o.role_binding_key>`
      - selected_pattern_ids: []

9) Adopted decision option obligations (when present)

If `adopted_option_choices` is non-empty, emit one additional obligation per adopted option.

Deterministic obligation id:
- `OBL-OPT-<pattern_id>-<question_id>-<option_id>`
- Normalize tokens deterministically:
  - Uppercase all letters.
  - Replace any character not in `[A-Z0-9]` with `-`.
  - Collapse repeated `-` to a single `-`.
  - Trim leading/trailing `-`.

Deterministic obligation classification (no new decisions):
- Determine a category key:
  - If `option_set_id` begins with:
    - `ingress.` or `ui.` or `api.` or `resilience.` → category `api_edge`
    - `security.` → category `security_policy`
    - `obs.` or `ops.` → category `ops_observability`
    - `async.` or `data.` → category `data_async`
    - `network.` → category `network_wiring`
    - `service.` → category `service_runtime`
- otherwise → FAIL-CLOSED (unknown option_set_id namespace).
  - Immediate mitigation to proceed (conflict-safe):
    - In BOTH:
      - `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
      - `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
    - Locate the matching decision entry under `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1` (pattern_id/question_id).
    - Ensure the decision does not contain any nested adopted options:
      - If the decision `status` is `defer` or `reject`, set any nested option `status: adopt` to `status: defer`.
      - If the decision `status` is `adopt`, and you cannot support this namespace yet, flip the decision `status` to `defer`.
    - Then rerun: `/caf plan <name>` (no need to rerun `/caf arch` for this immediate unblock unless other blockers require it).
  - Maintainer action:
    - Open an issue at `[url]` and paste the full text of the newest `BP-*-planning-unknown-option-namespace` feedback packet.
    - Request a deterministic mapping for this namespace (or add pattern-level promotions/obligation extensions so it contributes without bespoke mapping).
- Map category → (obligation_kind, plane_scope, capability_id):
  - `api_edge` → (`api_boundary`, `AP`, `api_boundary_implementation`)
  - `security_policy` → (`auth`, `cross_plane`, `policy_enforcement`)
  - `ops_observability` → (`other`, `cross_plane`, `observability_and_config`)
  - `data_async` → (`persistence_boundary`, `AP`, `persistence_implementation`)
  - `network_wiring` → (`other`, `cross_plane`, `runtime_wiring`)
  - `service_runtime` → (`other`, `AP`, `plane_runtime_scaffolding`)

Obligation fields (deterministic):
- `description` MUST be a single sentence:
  - `"Adopted decision option <pattern_id>/<question_id>=<option_id>: <option_summary>"`
- `selected_pattern_ids: ["<pattern_id>"]`
- `sources` MUST include at minimum:
  1) `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
     - anchor: `decision_resolutions_v1 decision pattern_id=<pattern_id>, question_id=<question_id>, adopted option_id=<option_id>`
  2) `architecture_library/patterns/external_v1/definitions_v1/<pattern_file>.yaml`
     - anchor: `caf.option_sets[option_set_id=<option_set_id>].options[option_id=<option_id>]`
- If the option has a non-empty `payload`, append to the system_spec source anchor (briefly; no verbose dumps), e.g. `payload keys: [k1, k2]`.

Fail-closed safety:
- If any adopted option maps to a `capability_id` not present in `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`, FAIL-CLOSED.

Obligation ordering:
- Sort by `obligation_id`.

Also write a TSV mirror `pattern_obligations_index_v1.tsv` to `reference_architectures/<name>/design/playbook/` with columns:
- obligation_id	plane_scope	kind	primary_source

### Step 3 — Emit `task_graph_v1.yaml` covering all obligations

Write a schema-valid `task_graph_v1.yaml` with tasks that cover every emitted obligation.

Hard rules:
- Every obligation MUST be covered by ≥1 task via a trace anchor token:

Output serialization safety (critical; prevents LLM output-token exhaustion):

- The planner MUST write `task_graph_v1.yaml` as a file under the repo path.
- Avoid single-command file writes containing large YAML (common 8–16k command-length limits). Prefer multiple small file edits/patches.
- The planner MUST NOT print the full YAML (or large YAML fragments) in chat output.
- If the task graph contains more than 10 tasks OR any single task is large, the planner MUST serialize in batches of **≤3 tasks per write**:
  - create/overwrite the file with header + `tasks:` first
  - append tasks 1–3, then 4–6, etc., ensuring the file remains valid YAML after each batch
  - after each batch, output only a short progress line (e.g., `wrote tasks 1–3/25`)
- After writing the file, output only a short summary (counts + file paths).

  - `pattern_obligation_id:<obligation_id>`
- Every task MUST have exactly one `required_capabilities` entry.
- Required capability ids MUST come from `80_phase_8_worker_capability_catalog_v1.yaml`.
- Every task MUST include a first-class `steps:` array (5–12 items). Each step is a short imperative verb phrase.
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

- Each task MUST include a first-class `steps:` array (5–12 items). Each step is a short imperative verb phrase.
- Each task MUST include `semantic_review.constraints_notes` containing:
  - `Story:` 1–3 sentences explaining *why this task exists*, derived from the obligation(s) it covers and the adopted patterns.
  - `References:` bullet list of `inputs[].path` plus the `trace_anchors[].pattern_id` values.
- These notes MUST remain semantic (no "assert file exists" checks). They MUST NOT introduce new design decisions.

Canonical task mapping (deterministic):

Non-negotiable planning integrity (fail-closed):
- Do NOT collapse or "optimize away" canonical tasks to reduce task count.
  - Example: do NOT cover `OBL-PLANE-*-RUNTIME-SCAFFOLD` by only emitting `TG-90-runtime-wiring`.
  - Example: do NOT replace per-boundary `TG-00-CONTRACT-*` tasks with a single cross-cutting task.
  - Example: do NOT omit `TG-30-service-facade-*` / `TG-40-persistence-*` when resources exist.
- If you cannot emit the canonical tasks with required fields (including `steps:`), FAIL-CLOSED by emitting a feedback packet path and stopping.

A) Plane runtime scaffold tasks
- `TG-00-CP-runtime-scaffold` → `plane_runtime_scaffolding`
- `TG-00-AP-runtime-scaffold` → `plane_runtime_scaffolding`
- Never emit older runtime scaffold capability ids `runtime_scaffolding_cp` or `runtime_scaffolding_ap` in new planning output. Those ids are transitional aliases only.

B) Contract scaffolding tasks (two per boundary)
- `TG-00-CONTRACT-<boundary_id>-AP` → `contract_scaffolding`
- `TG-00-CONTRACT-<boundary_id>-CP` → `contract_scaffolding`

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
- Older split policy task ids (`TG-00-CP-policy-surface`, `TG-00-AP-policy-enforcement`, `TG-00-AP-auth-mode`) are transitional-only and MUST NOT appear in new planning output.

Dependency rule (deterministic):
- `TG-35-policy-enforcement-core` depends on every emitted contract scaffolding task.
- If any `TG-20-api-boundary-*` tasks exist, it also depends on the lexicographically first emitted `TG-20-api-boundary-*` task so policy enforcement lands after at least one concrete AP ingress exists.

D) Per-API-surface-candidate tasks (when applicable)

For each `R` in `resource_names`:

- `TG-20-api-boundary-<R>` → `api_boundary_implementation`
- `TG-30-service-facade-<R>` → `service_facade_implementation`
- `TG-40-persistence-<R>` → `persistence_implementation`

Dependencies (minimal, deterministic):
- Resource tasks depend on `TG-00-AP-runtime-scaffold`.
- `service-facade` has no required dependency beyond runtime scaffold (it owns the per-resource domain/service shape).
- `api-boundary` depends on `service-facade`.
- `persistence` depends on `service-facade`.
- `TG-35-policy-enforcement-core` depends on all emitted contract scaffolding tasks; if any AP boundary tasks exist, it also depends on the lexicographically first emitted `TG-20-api-boundary-*` task.

### TG-40 persistence task rails (mandatory)

For each `TG-40-persistence-<R>` task, the planner MUST embed persistence rails so downstream workers cannot default to in-memory runtime wiring.

Required task inputs (authoritative):
- `reference_architectures/<name>/design/playbook/domain_model_v1.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (resolved persistence rails: database.engine, persistence.orm)
- `reference_architectures/<name>/spec/guardrails/tbp_resolution_v1.yaml` (resolved TBPs that may contribute DB adapter obligations)

Required task steps (minimum):
- Define a persistence boundary interface for `<R>` aligned to the domain model.
- Implement repository selection via an injectable factory/wiring surface; DO NOT instantiate an in-memory repository directly inside API routes.
- Align assumptions to resolved rails (database.engine + persistence.orm). If a DB engine is resolved, ensure the design is DB-ready (adapter/wiring points), even if DB-specific code is delivered by a TBP-derived task.

Required DoD bullets (minimum):
- "Repository wiring is injectable and does not hard-wire an in-memory implementation for runtime."
- "Persistence assumptions are aligned to resolved rails (database.engine + persistence.orm) and do not contradict resolved TBPs."

Required semantic review question (minimum):
- "Are persistence assumptions aligned to the resolved persistence rails and any TBP-derived DB obligations (no in-memory-only runtime)?"

E2) UI tasks (generic, data-driven; when applicable)

If resolved UI pins were recorded (Step 1G) and `ui.present: true`:

- UI tasks are NOT derived from pattern obligations. They are derived ONLY from resolved `ui.*` pins in `profile_parameters_resolved.yaml` + the authoritative UI task seeds.
- However, UI seed matching MAY reference the canonical adopted pattern set from `system_spec_v1.md:decision_resolutions_v1` when the seed file declares adopted-pattern conditions.
- When `ui.present: true`, you MUST emit at least the UI-01 seed task (`TG-15-ui-shell`) on the first pass, even if the UI pins use defaulted values.

- Load `architecture_library/phase_8/80_phase_8_ui_task_seeds_v1.yaml`.
- Evaluate each `seed.when` clause using only:
  - the recorded `ui.*` values
  - canonical adopted pattern ids from `system_spec_v1.md:decision_resolutions_v1 (status: adopt)` when a seed declares `required_adopted_patterns_all` / `required_adopted_patterns_any`
  - pinned values present in `architecture_shape_parameters.yaml` only when a seed explicitly declares pin conditions
- Emit tasks from matching seeds.

Rules (non-negotiable):
- Seeds are authoritative. Do not invent additional UI tasks.
- If a seed declares `per_resource: true`, expand it deterministically for every `R` in `resource_names`; do not collapse per-resource pages into `TG-15-ui-shell`.
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
  - If `<capability_id>` in {api_boundary_implementation, policy_enforcement, observability_and_config, persistence_implementation, runtime_wiring}:
    - depend on `TG-00-AP-runtime-scaffold` when present.
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
- If `<capability_id>` in {api_boundary_implementation, service_facade_implementation, persistence_implementation, policy_enforcement}: depend on `TG-00-AP-runtime-scaffold` (when that task exists).
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


I) TBP extension gates (when present)

If any resolved TBP declares `extensions.gates`, compile them into **semantic acceptance signals**.

Hard rules (normative):
- Gates are **not** deterministic checks. They are **Definition of Done / coding standards / guardrails**.
- Do NOT compile gates into `path exists`, `file contains`, or any other script-like validation.
- Gate criteria MUST remain semantic and must not embed concrete file paths.

Deterministic compilation rules:

1) For each `tbp_id` in `tbp_resolution_v1.yaml:resolved_tbps` (in listed order):
   - Open `architecture_library/phase_8/tbp/atoms/<tbp_id>/tbp_manifest_v1.yaml`.
   - If `extensions.gates` is missing or empty: continue.

2) For each gate `g` in `extensions.gates`:
   - Require `g.gate_id`, `g.gate_kind`, and `g.criteria[]` (non-empty).
   - Phase applicability:
     - If `g.phase_applicability` is present, apply the gate only when the current `lifecycle.generation_phase` is included.
     - Otherwise apply in all supported planning phases.

3) Resolve the target capability deterministically:
   - If `g.required_capability` is present: use it.
   - Else if `g.role_binding_key` is present:
     - Find TBP obligations in `extensions.obligations` with the same `role_binding_key`.
     - If none exist → FAIL-CLOSED (gate cannot attach).
     - If the obligations map to more than one distinct `required_capability` → FAIL-CLOSED (ambiguous).
     - Otherwise use that single `required_capability`.

4) Attach the gate to exactly one task (deterministic):
   - If a task `TG-TBP-<tbp_id>-<capability_id>` exists, attach the gate there.
   - Else compute the same execution-anchor attachment target used in (H):
     - choose a **non-TBP, non-OPTIONS** task requiring `capability_id`.
   - If no valid execution-anchor exists (only selector tasks or none), emit a minimal `TG-TBP-<tbp_id>-<capability_id>` task (even if there were no TBP obligations for that capability) and attach the gate to it.
   - Never attach TBP gates to selector/OPTIONS tasks.

5) Compile gate content into the target task:
   - For each string `c` in `g.criteria[]`:
     - Append a line to `task.steps[]` (preferred):
       - `TBP Gate (<tbp_id>/<g.gate_id>) [<g.gate_kind>]: <c>`
     - If the task uses `definition_of_done[]`, also append the same line there.
   - For each string `q` in `g.review_questions[]` (if present):
     - Append a semantic review question to `task.semantic_review.review_questions[]`:
       - `TBP Gate (<tbp_id>/<g.gate_id>): <q>`
   - If `g.focus_areas[]` is present:
     - Union into `task.semantic_review.focus_areas[]` (dedupe + stable sort).
   - If `g.severity_threshold_override` is present:
     - Raise the task's `semantic_review.severity_threshold` to the **most severe** of:
       - current threshold
       - override
     - Severity order (most severe → least): `blocker` > `high` > `medium` > `low`.

6) If any gate criteria appears to encode a file path or a script-like check, FAIL-CLOSED and request the TBP author to rewrite it as semantic acceptance criteria.



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
- The backlog will be emitted later by `/caf plan` finalization via `caf-arch-postprocess`.


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
- Ensure the consumer, provider, and assembler tasks each take `interface_binding_contracts_v1.yaml` as a required input in the task graph (older `seam_contracts_v1.yaml` references remain tolerated only during migration).
- Ensure the assembler task depends on both the consumer and provider tasks for every declared interface binding.
