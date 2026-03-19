# Playbook blocks: ownership and invariants (v1)

This document is the **single source of truth** for:
- Which component *owns* each playbook block (script vs skill vs architect).
- The invariants validators/gates may enforce.
- Shared parsing/normalization requirements to avoid drift across tools.

Scope: Phase 8 playbook specs under `reference_architectures/<instance>/spec/playbook/`.

## Ownership model

### system_spec_v1.md

- `CAF_MANAGED_BLOCK: pinned_inputs_v1`
  - Owner: **script** (`node tools/caf/build_pinned_inputs_v1.mjs <instance>`)
  - Inputs: `spec/guardrails/profile_parameters.yaml` (authoritative)
  - Invariants:
    - MUST NOT contain placeholders (`<...>`).
    - MUST enumerate pinned lifecycle + platform pins (and optional plane pins if set).
    - This block is human-facing and should remain compact and explicit.

- `CAF_MANAGED_BLOCK: pin_value_explanations_v1`
  - Owner: **script** (`node tools/caf/build_pin_value_explanations_v1.mjs <instance>`)
  - Inputs:
    - `spec/playbook/architecture_shape_parameters.yaml` (template_instances pins)
    - `architecture_library/07_contura_parameterized_architecture_templates_v1.md` (intent templates)
  - Invariants:
    - MUST be populated deterministically (no LLM paraphrase loops).
    - Bullets MUST be grounded in the template doc (cite paths in the content where applicable).

- `CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1`
  - Owner: **caf-system-architect** (single call per phase)
  - Inputs:
    - `pinned_inputs_v1` (authoritative pins)
    - `pin_value_explanations_v1` (architectural intent)
    - guardrails posture (`spec/guardrails/profile_parameters_resolved.yaml`)
  - Invariants:
    - MUST be derived from pinned intent + rails; avoid inventing constraints not implied by pins/rails.
    - During `architecture_scaffolding`, retrieval preflight MUST fail closed if this block is missing or empty.

- `CAF_MANAGED_BLOCK: tech_profile_explanations_v1`
  - Owner: **caf-system-architect**
  - Inputs:
    - guardrails outputs (TBP resolution + validated technology pins)
  - Invariants:
    - MUST explain the chosen technology posture without redefining pins (pins are already authoritative).
    - During `architecture_scaffolding`, retrieval preflight MUST fail closed if this block is missing or empty.

- `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
  - Owner: **worker-pattern-retriever-arch-scaffolding** (LLM-owned grounding)
  - Inputs:
    - retrieval surfaces (semantic + graph)
    - guardrails posture and pins for evidence types
  - Invariants:
    - MUST contain ≥1 canonical candidate record in each required spec file (system + application).
    - Candidate parsing MUST be resilient to common markdown drift.
    - Do not leave the placeholder skeleton intact.

- `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1`
  - Owner: **architect**
  - Invariants:
    - YAML must parse; adopt/defer/reject must be explicit.

- `CAF_MANAGED_BLOCK: spec_scaffold_debug_v1`
  - Owner: **caf-system-architect**
  - Invariants:
    - MUST truthfully list which CAF-managed blocks were refreshed/hydrated.

### application_spec_v1.md

- `CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1`
  - Owner: **caf-system-architect** (or a deterministic helper if/when introduced)
  - Inputs:
    - pins + intent + rails
  - Invariants:
    - Must be concise and derived; no speculative requirements.

- `CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1`
  - Owner + invariants: same as system spec.

## Shared parsing and normalization (no drift)

If a script needs to parse the candidates section, it MUST reuse the shared helper(s) rather than introducing a new regex:

- Candidates block parsing: `tools/caf/lib_caf_decision_candidates_v1.mjs`
  - Gate, mindmap, and reports must share the same candidate + evidence normalization.

- Pin recognition inside evidence: `tools/caf/lib_pin_recognition_v1.mjs`
  - Recognize pins within `[pinned_input]` evidence lines (machine_ref variants + inline pin ids).

## Plane runtime shape pins (guardrails-owned)

Authoritative surface: `spec/guardrails/profile_parameters.yaml`

Optional pins:
- `planes.cp.runtime_shape`
- `planes.ap.runtime_shape`

Allowed values:
- `api_service_http`
- `worker_service_events`
- `library_embedded`

Notes:
- If omitted, CAF derives deterministic defaults in guardrails.
- Guardrails must fail-closed if invalid values are provided.

