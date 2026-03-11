# Phase 8 System Specification Contract (v1)

## Purpose

This contract is complemented by **Human Signal Blocks Contract**:
- `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`

Define a deterministic, fail-closed **system specification** artifact that bridges pinned inputs to an initial, traceable system-level specification.

This artifact is intended for **architecture_scaffolding** runs and supports:
- pin-driven constraints (evolution_stage, generation_phase, architecture style, and platform pins)
- selection of **CAF decision patterns** as traceable advisory candidates (grounded; no invented cues)
- a human-editable area for system requirements (non-functional, governance, tenancy posture, compliance posture, etc.)

## Canonical path

- `reference_architectures/<instance_name>/spec/playbook/system_spec_v1.md`

## Lifecycle rules (fail-closed)

- MUST NOT exist prior to `lifecycle.generation_phase == architecture_scaffolding`.
- MUST be created/updated only via CAF-managed blocks + architect-edit blocks (merge-safe).
- MUST NOT introduce vendor/product selection beyond the pinned architecture/platform choices.
- Machine-consumed binding choices are pinned in `spec/guardrails/profile_parameters.yaml` under:
  - `architecture.*`
  - `platform.*`
  - `ui.*` (when a browser UI is in scope)
- Vendor/service selection (for example, specific SaaS products) remains out of scope for scaffolding.

## Required blocks

The file MUST contain at minimum:

- `<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 START -->` ... `END`
- `<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 START -->` ... `END`
- `<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 START -->` ... `END`
- `<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 START -->` ... `END`
- `<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->` ... `END`
- `<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 START -->` ... `END`

## Relationship to application specification and plane domain models

- `application_spec_v1.md` remains the **application-plane functional spec** (product-facing intent, resources, operations, UI narrative).
- `system_spec_v1.md` is the **system-level constraints spec** (cross-plane constraints + governance requirements).
- Detailed domain/system entity modeling should be externalized into:
  - `spec/playbook/application_domain_model_v1.md`
  - `spec/playbook/system_domain_model_v1.md`
- Planner-consumable derived views should be written to:
  - `design/playbook/application_domain_model_v1.yaml`
  - `design/playbook/system_domain_model_v1.yaml`

## Retrieval linkage

Pattern retrieval for pin→spec is now owned by the canonical retrieval surface + retrieval owner worker:

- Surface: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
- View profiles: `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml`
- Retrieval owner: `skills/worker-pattern-retriever/SKILL.md`

For pins→spec scaffolding, the default view profile is `arch_scaffolding`.

Legacy playbooks/indices remain present until the new surface is stable, but are no longer retrieval-authoritative.

---

## Required human-signal blocks

The system specification MUST include the following `ARCHITECT_EDIT_BLOCK` (see Human Signal Blocks Contract):

- `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1`
  - Contains YAML decision resolutions keyed by `evidence_hook_id`.
  - CAF may prepopulate with `status: defer`; the architect flips to `adopt` / `reject`.
