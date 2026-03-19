---
name: caf-solution-architect
description: Produce system design artifacts with a single coherent "brain" to avoid split-brain between control-plane and application-plane design. Instruction-only: no scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-solution-architect

## Purpose

Create or update the **system design** (solution architecture) artifacts during `implementation_scaffolding`.

This skill exists to prevent split-brain by making **cross-plane integration** a first-class contract and by producing both plane designs coherently.

This worker is complex. Make a careful plan before you execute. Follow the instructions and ship blockers exactly. Do not skip steps. Do not take shortcuts. You must run the skill first, then check for outputs. Do NOT use feedback packets as a shortcut to bypass any required step or to bypass executing a skill.

Ship blockers (anti-circularity):

- **Do not treat missing `design/` outputs as a reason to stop.** This skill is the canonical producer of those outputs.
  - After a reset/wipe step, missing design artifacts are expected and are the reason this skill must run.
- **Do not perform "freshness" or "existence" preflight checks as a substitute for execution.**
  - You may inspect existing outputs only to apply minimal edits *after* you have decided to run this skill and produce the required artifacts.
- **Do not use cross-instance templates** (e.g., copying from another instance) to satisfy required outputs.

Optional interactive checkpoint (allowed; preferred over shortcuts):

- If you believe this run will be unusually expensive or risky, you MAY ask the user once:
  - "I’m about to generate the full design bundle for this instance (control plane + application plane + contract declarations). What do you want me to do?"
    1) Run `caf-solution-architect` now.
    2) Fail-closed with a feedback packet.
    3) Stop with no action.
- Forbidden: skipping execution, then claiming you are blocked because the post-reset design bundle is missing.

## Inputs (required, fail-closed)

Authoritative instance surfaces (ship rule):
- Only treat these as authoritative inputs/outputs for the instance run:
  - `reference_architectures/<name>/spec/playbook/**`
  - `reference_architectures/<name>/spec/guardrails/**`
  - `reference_architectures/<name>/design/playbook/**`
  - `reference_architectures/<name>/design/caf_meta/**`
  - `reference_architectures/<name>/feedback_packets/**`
- Ignore any sibling folders like `playbook-1`, `playbook_old`, etc. They are user-created and must not be searched or read.

Pattern retrieval (canonical):
- `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_surface_overview_v1.md`

Contract-first framework inputs:
- `architecture_library/phase_8/85_phase_8_contract_first_framework_v1.md`
- `architecture_library/phase_8/85_phase_8_contract_declarations_schema_v1.yaml`
- `architecture_library/phase_8/86_phase_8_plane_integration_contract_choices_schema_v1.yaml`
- `architecture_library/phase_8/templates/plane_integration_contract_v1.template.md`

- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` (rails + tech posture; derived)

## Outputs (canonical)

This skill MUST write (overwrite when rerun):

- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`

Script-owned (do NOT write by hand; overwritten deterministically post-design):

- `reference_architectures/<name>/design/playbook/design_summary_v1.md`
- `CAF_MANAGED_BLOCK: planning_pattern_payload_v1` (inside both plane design docs)



## Contract declarations registry schema (ship blocker)

`reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml` MUST conform to the Phase-8 registry schema.

Hard rules:
- `contract_ref.path` MUST be a repo-root-relative filesystem path that resolves to an existing file.
  - Do NOT use instance-relative paths like `design/playbook/...`.
  - For embedded CP↔AP FORM_B contracts, use: `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`.
- DO NOT emit the older non-canonical shape (`schema_version:` or `contracts:` as a mapping).
- `contracts` MUST be a list (`contracts: []`), even when empty.
- If you encounter a older/non-canonical file, overwrite it to the canonical shape.
  - Do not attempt partial conversions unless you can populate all required fields deterministically.

Minimum valid scaffold (allowed ONLY when no material contracts are expressed yet):

- Allowed only if the design docs do NOT contain any embedded contract choices blocks (e.g., `plane_integration_contract_choices_v1`) and no standalone contract docs are emitted.
- If a material contract section exists in a design doc, the registry MUST declare it and `contracts` MUST NOT be empty.

If `control_plane_design_v1.md` contains `plane_integration_contract_choices_v1` (Plane Integration Contract CP ↔ AP), you MUST declare a corresponding registry entry (shape per Phase-8 schema).

Example (shape only; values are illustrative):

```yaml
registry_version: contract_declarations_v1
contracts:
  - boundary_id: BND-CP-AP-01
    boundary_type: cross_plane
    materiality:
      is_material: true
      indicators: ["..."]
    contract_form: FORM_B_EMBEDDED_SECTION
    contract_ref:
      path: reference_architectures/<name>/design/playbook/control_plane_design_v1.md
      section_heading: Plane Integration Contract (CP ↔ AP)
    anchors:
      - anchor_type: design_decision
        anchor_ref: "..."
    justification:
      why_this_form: "..."
      why_not_alternatives: ["..."]
```

You must run this skill at least once to create the initial design artifacts. Do NOT use feedback packets as a shortcut to bypass any required step. 

## Plane Integration Contract section requirements (CP ↔ AP)

When the CP↔AP boundary is declared as material and expressed as an embedded section (FORM_B) in a plane design doc (canonical: control plane design),
the embedded "Plane Integration Contract (CP ↔ AP)" section MUST contain:

- `<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->` ... `END -->` (YAML options with adopt/reject/defer)
- `<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 START -->` ... `END -->` (YAML questions/options (optionized answers; adopt/reject/defer))
- `<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 START -->` ... `END -->` (designer-proposed baseline; rerun-safe)

Ship blockers (tight leash; required for `/caf plan`):

- The `plane_integration_contract_choices_v1` YAML MUST use the canonical schema header:
  - `schema_version: plane_integration_contract_choices_v1`
- It MUST include these keys under `choices:`:
  - `cp_runtime_shape` (exactly one option `status: adopt`)
  - `ap_runtime_shape` (exactly one option `status: adopt`)
  - `cp_ap_contract_surface` (exactly one option `status: adopt`)
- Use canonical option ids:
  - runtime shapes: `api_service_http | worker_service_events | library_embedded | custom`
  - contract surface: `synchronous_http | async_events | mixed | custom`
    - Older-instance allowance: `synchronous_api` MAY appear in older instances; prefer `synchronous_http` going forward.

- YAML scalar safety (ship blocker):
  - In architect-edit YAML blocks, any scalar containing `: ` MUST be quoted or rephrased so the block remains parseable.
  - This applies especially to `summary`, `question`, `notes[]`, and other human-readable scalar text.

Template guidance (preferred):
- Start from `architecture_library/phase_8/templates/plane_integration_contract_v1.template.md` and paste the choices/open-questions blocks into the CP design doc.
- Do NOT emit the reduced/older non-canonical shape (`version: 1` + `choices.contract_surface` only). That shape is not plan-readable.



Rerun-safety:
- Architect edit blocks MUST be preserved verbatim.
- The designer-managed block may be regenerated deterministically to reflect adopted resolutions and resolved posture.
Default option ergonomics (default flow):
- When you populate any `options:` list by copying from a pattern `caf.option_sets[]` entry, if that option set declares `default_option_id`, set exactly that option to `status: adopt` and leave the rest as `status: defer` in the initial scaffold.
- This is still a human-signal: it lives inside ARCHITECT_EDIT_BLOCKs and the architect may flip it.



Each design output MUST include a CAF-managed trace block:

Each plane design doc MUST include these architect-editable blocks (preserved on reruns):
- `<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->` ... `END -->`
- `<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->` ... `END -->`

  **Open questions formatting rule (low-friction):**
  - In `design/playbook/application_design_v1.md`, open questions MUST be emitted as **topic-keyed option sets** (a YAML mapping) so the architect only flips `status: adopt` (matching the ergonomics of the CP plane-integration *choices* blocks).
  - Avoid the higher-noise list form (`questions: - question_id: ...`). Use `questions: <topic_key>: {question_id, question, options, anchors}` instead.
  - Include `summary` on each option where it improves readability.

- `<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->` ... `END -->` (inside the Plane Integration Contract section)
- `<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 START -->` ... `END -->` (inside the Plane Integration Contract section)

- `<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START -->`
  - List adopted/deferred/rejected resolutions consumed from `system_spec_v1.md` (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1).
  - For each adopted decision, include the evidence_hook_id, pattern_id, and a pointer to the design section(s) it influenced.
  - Citations MUST reference `system_spec_v1.md` (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1) (and MAY reference the originating spec candidates).
- `<!-- CAF_MANAGED_BLOCK: decision_trace_v1 END -->`


- `reference_architectures/<name>/design/playbook/contract_declarations_v1.yaml`
- `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<name>/design/playbook/application_design_v1.md`

Note: Contracts may be expressed as standalone docs or embedded sections. Regardless of form, the choice MUST be declared and justified in `contract_declarations_v1.yaml`.



## Design summary view (CAF-managed; script-owned)

The design summary is a deterministic, script-owned artifact.

Do NOT write it by hand.

Producer:
- `node tools/caf/materialize_design_summary_v1.mjs <name>`

Output (overwrite=true; script-owned):
- `reference_architectures/<name>/design/playbook/design_summary_v1.md`

Content is mechanical only:
- Adopted patterns from `system_spec_v1.md` → `decision_resolutions_v1` (status: adopt)
- Per-plane breakdown (application/control/both) using `pattern_retrieval_surface_v1.jsonl` plane metadata
- `pattern_id → definition_path` mapping (from retrieval surface JSONL)
- Clear statement: enrichment/promotions deferred to planning (`/caf plan`)

## Planning payload materialization (CAF-managed; script-owned)

The `planning_pattern_payload_v1` blocks in the two design docs are **script-owned**.

Your responsibility in this skill is:
- Ensure BOTH design docs include the CAF-managed block markers and a YAML fence scaffold (schema-valid).
- Do **not** attempt to compute `selected_patterns` or per-plane filtering.
- Do **not** attempt to union promotions from pattern definitions.

A deterministic postprocess step will materialize the final contents:
- `node tools/caf/materialize_planning_pattern_payload_v1.mjs <name>`

This reduces agent-format drift and prevents partial edits from causing downstream planning failures.

## Planning pattern payload (CAF-managed)

Each design doc MUST contain this block (markers + fenced YAML). You may emit the scaffold exactly as shown.

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 START -->
## Planning pattern payload (CAF-managed)

```yaml
schema_version: planning_pattern_payload_v1
generated_from:
  retrieval_surface_path: "architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl"
  retrieval_profile: "solution_architecture"
  selected_patterns_source: "system_spec_v1.md:decision_resolutions_v1 (status: adopt)"
notes:
  - "Enrichment/promotions are deferred to planning (/caf plan). Reference:"
  - "reference_architectures/<name>/design/playbook/design_summary_v1.md"
  - "reference_architectures/<name>/design/playbook/pattern_obligations_v1.yaml"
  - "reference_architectures/<name>/design/playbook/task_graph_v1.yaml"
selected_patterns:
  caf: []
  core: []
  external: []
promotions:
  semantic_inputs: []
  required_trace_anchors: []
  required_role_bindings: []
  plane_placements: []
```

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 END -->

Rerun-safety:
- Preserve architect-edit blocks verbatim.
- Overwrite only inside CAF-managed blocks you own.


## Operating rules

### Decision-pattern question scaffolding (ship blocker)

For any candidate or adopted pattern whose definition has `caf.kind: decision_pattern` and declares `caf.human_questions[]`, the corresponding entry in `system_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1` MUST include a `resolved_values.questions` scaffold that hydrates the question(s) and option list(s) from the pattern definition (no hardcoded options).

If the scaffold is missing for any such pattern, FAIL-CLOSED with a feedback packet that points to:
- `system_spec_v1.md` block location
- the missing `pattern_id`
- and the remediation: rerun retrieval owner or fix `worker-pattern-retriever` decision scaffolding

- MUST enforce the **subset rule** to avoid split-brain:
  - You may only rely on patterns that appear in `system_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`.
  - You may only *adopt / apply* pattern requirements for patterns that are `status: adopt` in `system_spec_v1.md` → `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1`.
  - If you believe a missing pattern is required to proceed, FAIL-CLOSED with a feedback packet (do not guess).


### Carry forward unresolved pattern questions into plane design open questions (ship blocker)

Goal: ensure **optionized external decision patterns remain visible and actionable at design time**, even if the architect does not immediately edit `system_spec_v1.md`.

Source of truth:
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` → `<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->` YAML.

Definitions:
- A **pattern-level decision** is the `decision_resolutions_v1.decisions[]` entry (status adopt/defer/reject).
- A **pattern question** is an entry inside `resolved_values.questions[]` (hydrated from `caf.human_questions`).
- A pattern question is **resolved** iff **exactly one** option has `status: adopt`.

Fail-closed validation (required):
- If any pattern question has **more than one** option with `status: adopt`, FAIL-CLOSED with a feedback packet (ambiguous).
- If any adopted decision references `resolved_values.questions` but the option list is missing/malformed, FAIL-CLOSED (do not guess).

Carry-forward rules (required):

1) **Pattern-level defers** (status: defer)
- For every `decision_resolutions_v1.decisions[]` entry with `status: defer`, emit an **open question** into each applicable plane design doc asking whether to adopt the pattern.
- Use a deterministic question shape with options:
  - `adopt_pattern` (status: defer)
  - `defer` (status: adopt)  # reflects current state
  - `reject_pattern` (status: defer)
  - `custom` (status: defer)
- Anchors MUST include:
  - `caf_pattern: <pattern_id>`
  - `evidence_hook_id: <evidence_hook_id>`

2) **Unresolved pattern questions for adopted decision-patterns**
- For every decision entry with `status: adopt` where the pattern definition has `caf.kind: decision_pattern` and `resolved_values.questions[]` exists:
  - For each `resolved_values.questions[]` question where **no** option is `status: adopt`, emit that question into the relevant plane design doc(s) as an **open question**.
  - Copy the `options` list **verbatim** (including `summary` and `payload`) from `resolved_values.questions[].options` (never re-derive).
  - Anchors MUST include:
    - `caf_pattern: <pattern_id>`
    - `evidence_hook_id: <evidence_hook_id>`
    - `option_set_id: <option_set_id>`

3) Plane routing
- Route each question into plane docs based on the pattern plane resolved via the retrieval surface JSONL:
  - If `plane ∈ {control, both}` → include in `control_plane_design_v1.md`.
  - If `plane ∈ {application, both}` → include in `application_design_v1.md`.

4) Required YAML scaffolds and merge behavior (rerun-safe)
- Both plane design docs MUST include `<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START --> ... END -->` containing valid YAML.
- Minimum scaffold (if empty):

```yaml
version: 1
questions: {}
```

- **Merge rule:** preserve existing `questions` entries verbatim; only add missing topics.
- If the block is present but cannot be parsed as YAML, treat it as a CAF-generated placeholder **only if** it contains no fenced YAML at all; in that case you MAY replace it with the scaffold above and then populate carried-forward questions.
- If there is fenced YAML but it is invalid, FAIL-CLOSED (assume human edited).

5) Topic keys (deterministic)
- In `application_design_v1.md`, open questions MUST be a **topic-keyed mapping** (not a list). Use:
  - `<pattern_id_sanitized>__<question_id_sanitized>` for pattern questions, and
  - `<pattern_id_sanitized>__pattern_adoption` for pattern-level defer questions.
- Sanitization: lower-case; replace non-alphanumeric with `_`; collapse repeats.

6) Traceability
- In each plane design doc, in `CAF_MANAGED_BLOCK: decision_trace_v1`, include a short note indicating:
  - how many pattern questions were carried forward as open questions
  - and which `pattern_id`s they came from.


## Finalization (required)

After writing the two design docs and `contract_declarations_v1.yaml`:

- Ensure BOTH design docs contain the `CAF_MANAGED_BLOCK: planning_pattern_payload_v1` markers and a fenced YAML scaffold (schema-valid).
- Do NOT write `design_summary_v1.md` (script-owned).
- Do NOT write `design_enrichment_debug_v1.md` (removed; no compatibility).

STOP. The deterministic postprocess steps (run by implementation scaffolding) will materialize:
- `planning_pattern_payload_v1` (inside both design docs)
- `design_summary_v1.md`
