---
name: caf-system-architect
description: >
  Derive the system specification from pinned inputs in a fail-closed way.
  Instruction-only: no scripts. Produces system_spec_v1.md and application_spec_v1.md.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-system-architect

## Purpose

Create or update (merge-safe) the system and application specifications:

- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` (ensure ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 exists; prepopulate without overwriting human edits; onboarding default is `adopt`)

This is the **pins → specifications** bridge for `lifecycle.generation_phase == architecture_scaffolding`.

The skill:

- reads pinned inputs (shape parameters + profile parameters + resolved guardrails view)
- writes CAF-managed blocks that capture pin-derived constraints
- proposes CAF decision patterns (advisory-only) and emits traceable links
- leaves human-editable blocks for requirements and open questions

This skill MUST NOT invent new technology choices.
It MAY prepopulate the technology choice points block using only CAF v1 option sets (including mocks), and MUST preserve human edits.
It MUST keep `application_spec_v1.md` and `system_spec_v1.md` lean; detailed application/system entity catalogs belong in the plane-specific domain model source docs seeded during architecture scaffolding, and the detailed product-facing application surface belongs in `application_product_surface_v1.md`.

## Inputs (required, fail-closed)

Authoritative instance surfaces (ship rule):
- Only treat these as authoritative inputs/outputs for the instance run:
  - `reference_architectures/<name>/spec/playbook/**`
  - `reference_architectures/<name>/spec/guardrails/**`
  - `reference_architectures/<name>/feedback_packets/**`
- Ignore any sibling folders like `playbook-1`, `playbook_old`, etc. They are user-created and must not be searched or read.


- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

## Outputs (canonical)

- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/spec_scaffold_debug_v1.md` (CAF-managed debug; required)
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md` (ensure ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 exists; prepopulate without overwriting human edits; onboarding default is `adopt`)



## Human signal prepopulation (required)

This skill MUST maintain the **architect-edit** block `decision_resolutions_v1` inside:

- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`

Algorithm (deterministic, merge-safe):

1) Parse candidate hook pairs `(evidence_hook_id, pattern_id)` from both specs:
   - `system_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
   - `application_spec_v1.md` → `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
   Candidate headings are in the form:
   - `### H-...: <PATTERN_ID> ...`

2) Ensure `system_spec_v1.md` contains:
   - `<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START --> ... END -->`
   If missing, insert the block using the scaffold from `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`.

3) Inside the block, treat the YAML as authoritative human input:
   - **Onboarding upgrade (optional, safe):** If the block appears entirely CAF-generated and unedited (all entries have `status: defer`, `resolved_values` empty, and `rationale` starts with `CAF prepopulation`), CAF MAY flip those CAF-generated entries to `status: adopt` to remove first-run friction. If any human edits are detected (any `status` not `defer`, any non-empty `resolved_values`, or `rationale` changed), CAF MUST preserve the block verbatim.
   - Preserve any existing entries and human-edited fields (`status`, `anchors`, `rationale`, `resolved_values`).
   - For each candidate hook pair missing from `resolutions[]` (or `decisions[]` depending on schema), append a new entry with:
     - `status: adopt`
     - `anchors:` prepopulated (required; min 1) by reusing the originating candidate evidence:
       - include a `caf_pattern_requirement` anchor that points at the pattern definition path
       - include a `rail_constraint` anchor sourced from any `pinned_input` / `derived_rails_or_posture` evidence bullets when present
     - `rationale:` copy the candidate's **Rationale** (1–3 grounded sentences) for that evidence hook
     - `resolved_values: {}`

4) NEVER delete or reorder human-edited entries.

If the block YAML is invalid, FAIL-CLOSED with a feedback packet describing:
- the expected YAML schema (copy from the Human Signal Blocks Contract)
- the exact location of the block to fix.


## Pattern retrieval contract

Canonical retrieval owner (single brain):
- Shared constraints: `skills/worker-pattern-retriever/SKILL.md`
- Phase execution: `skills/worker-pattern-retriever-arch-scaffolding/SKILL.md` and `skills/worker-pattern-retriever-solution-architecture/SKILL.md`

This skill **does not perform pattern retrieval**.

Rationale: retrieval must occur **after** spec enrichment (pin explanations + rail summaries) so the scoring blob is maximally semantic.
The orchestrator (`caf-arch-architecture-scaffolding`) invokes the retrieval owner with `profile=arch_scaffolding` after this skill completes.

## File skeleton contract (required blocks)

**Template discipline (ship blocker):**
- When creating missing blocks, **copy templates verbatim**.
- Do **not** prefill script-owned blocks in-band.
- In particular, `pin_value_explanations_v1` is script-owned by `build_pin_value_explanations_v1.mjs`.
  If it is missing, create the block skeleton only (verbatim), leave placeholder, and let the orchestrator run the script.

- `<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 START -->`
- `<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 START -->`
- `<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 START -->`
- `<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 START -->`
- `<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->`
- `<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 START -->`
- `<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->`

Application specification required blocks:

Note: `domain_and_resources_v1` is a lightweight narrative bridge only. It must not become the detailed canonical domain model; that detail belongs in `application_domain_model_v1.md`. Product-facing surface wording belongs in `application_product_surface_v1.md`.

- `<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->`
- `<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->`
- `<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->`
- `<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 START -->`
- `<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->`
- `<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 START -->`

## Spec scaffold debug view (CAF-managed; required)

Always write:
- `reference_architectures/<name>/spec/playbook/spec_scaffold_debug_v1.md`

Minimum contents (Markdown):
- Inputs read (exact file paths)
- CAF-managed blocks written/updated (by block id)
- Architect-edit blocks present and whether they appear empty/default (list block ids + headings)

Retrieval note (required; phase-correct):
- This skill does **not** run pattern retrieval.
- In `architecture_scaffolding`, `/caf arch` will invoke `worker-pattern-retriever-arch-scaffolding` **after** this skill.
- Expected retrieval diagnostics paths (once retrieval runs):
  - `playbook/retrieval_context_blob_arch_scaffolding_v1.md`
  - (optional, script-owned) `spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md`

This file is for debugging only; it must not introduce new architecture choices.

## Fail-closed conditions

- any required input missing
- unresolved placeholders (`{{...}}`, `<...>`, `UNKNOWN`) in pinned inputs
  - attempt to introduce a vendor/product selection (beyond platform pins and approved choice point option sets)
  - `CAF_MANAGED_BLOCK: pin_value_explanations_v1` remains empty or contains placeholder text (e.g. “CAF will populate”)

## Procedure

1) Validate `instance_name` format matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) Read required inputs (fail-closed):

   - `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
   - `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
   - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

   Refuse if any pinned inputs contain unresolved placeholder tokens (`TBD`, `TODO`, `UNKNOWN`, `{{...}}`, `<...>`).

3) Create or update `system_spec_v1.md` (merge-safe):

   - Template seeding is script-owned (deterministic; ship blocker) and is owned by the orchestrator.
     If either playbook spec file is missing, FAIL-CLOSED with a feedback packet instructing:
     - `node tools/caf/seed_playbook_specs_v1.mjs <instance_name>`
     Then re-run `/caf arch <instance_name>`.

   - Update only CAF-managed enrichment blocks on reruns:
     - `pinned_inputs_v1`
     - `pin_derived_system_constraints_v1`
     - `tech_profile_explanations_v1`

     Do NOT update `caf_decision_pattern_candidates_v1` here (owned by `worker-pattern-retriever`).

   - `pin_value_explanations_v1` is script-owned (deterministic).
     Do NOT extract pin definitions in-band.
     Treat the populated block as an authoritative input for this skill.
     If `pin_value_explanations_v1` is missing/empty/placeholder, FAIL-CLOSED with a feedback packet instructing:
     - `node tools/caf/build_pin_value_explanations_v1.mjs <instance_name>`
     Then re-run `/caf arch <instance_name>`.

   - Populate `pin_derived_system_constraints_v1` by deriving constraints from:
     - the pinned inputs (shape + profile pins)
     - the resolved rails view (`guardrails/profile_parameters_resolved.yaml`)
     - the **already populated** `pin_value_explanations_v1` bullets

     Rules (dependency + ordering):
     - Each constraint bullet MUST reference at least one relevant pin explanation (by pin key/value, or by quoting/paraphrasing the explanation bullet).
     - Do not introduce new technology choices; translate pins/explanations/rails into concrete constraints.
     - Keep it compact: 8–20 bullets total, grouped by theme when helpful (lifecycle, packaging/runtime, data, tenancy, security/governance).

     - Populate `tech_profile_explanations_v1`:
       - Source rails: `guardrails/profile_parameters_resolved.yaml`
       - Emit 6–14 bullets summarizing:
         - lifecycle posture (evolution_stage, generation_phase, refusal_posture)
         - allowed_artifact_classes and allowed_write_paths (grouped)
         - forbidden_actions (grouped)
         - plane/runtime shapes (cp/ap + plane.runtime_shape)
         - candidate enforcement bar highlights (test policy + placeholder/runnable policies)
       - Descriptive only; MUST NOT introduce new architecture choices.

   - Preserve any other CAF-managed blocks verbatim.

   - Preserve architect-edit blocks:
     - `system_requirements_v1`
     - `open_questions_v1`

   - Note: `technology_choice_points_v1` is deprecated. Technology choices are pinned in `profile_parameters.yaml` and validated by guardrails; do not require a system_spec block for it.

4) Create or update `application_spec_v1.md` (merge-safe):

   - Template seeding is script-owned (deterministic; ship blocker) and is owned by the orchestrator.
     If either playbook spec file is missing, FAIL-CLOSED with a feedback packet instructing:
     - `node tools/caf/seed_playbook_specs_v1.mjs <instance_name>`
     Then re-run `/caf arch <instance_name>`.

   - Update only the CAF-managed blocks on reruns:
     - `intent_derived_app_plane_constraints_v1`

     Do NOT update `caf_decision_pattern_candidates_v1` here (owned by `worker-pattern-retriever`).

   - Preserve architect-edit blocks:
     - `domain_and_resources_v1`
     - `open_questions_v1`
     - `notes_and_constraints_v1`

   - Populate the CAF-managed app-plane constraints by interpreting the pinned shape parameters.
     The output MUST be grounded in the pins (do not assume multi-tenancy unless the pinned context implies it).

   - Leave `caf_decision_pattern_candidates_v1` blocks intact (scaffolded or previously populated).

     Retrieval is invoked by the orchestrator after this skill completes.

     If this skill would overwrite a populated candidates block, FAIL-CLOSED and write a feedback packet.

5) Refuse (emit a feedback packet) if required markers are missing, duplicated, or out of order in either spec file.

6) Write `playbook/spec_scaffold_debug_v1.md` (CAF-managed; overwrite).

   Include:
   - Inputs read (paths)
   - CAF-managed blocks refreshed (by block id)
   - Architect-edit blocks present and whether they appear empty/default
   - Retrieval debug file path produced by the retriever for this run

