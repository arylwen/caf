# System Specification (v1)

<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 START -->
## Lifecycle + architecture + technology pins (authoritative)

- lifecycle.evolution_stage: `<filled by CAF>`
- lifecycle.generation_phase: `<filled by CAF>`
- architecture.architecture_style: `<filled by CAF>`
- lifecycle + architecture + platform pins (authoritative scalar values from `spec/guardrails/profile_parameters.yaml`): `<filled by CAF>`
<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 END -->

<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 START -->
## Architectural intent - pin explanations (CAF-managed)

(1-3 compact bullets per selected pin value, grounded in `architecture_library/07_contura_parameterized_architecture_templates_v1.md`.)

- (CAF-managed; populated during CAF run.)
<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 END -->

<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 START -->
## System constraints derived from the architectural intent + guardrails (CAF-managed)

(Derived constraints from pins + Layer 8 resolved rails.)
<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 END -->

<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 START -->
## Technology posture (CAF-managed)

(Deterministic summary of resolved guardrails/posture from `guardrails/profile_parameters_resolved.yaml` and any policy-matrix intent text. No new architecture choices.)

- (CAF-managed; populated during CAF run.)
<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->
## CAF decision pattern candidates (advisory; grounded)

Source retrieval surface: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
View profile: `arch_scaffolding` (default)

### Candidate record format (v1)

For each candidate, emit exactly:

- A heading: `### <EVIDENCE_HOOK_ID>: <PATTERN_ID>  -  <PATTERN_TITLE> (confidence: <low|medium|high>)`
- `**Plane:** <application|control|both>`
- `**Evidence:**` bullets, each with: `- <E#> [<evidence_type>] <short quote or paraphrase> (<machine_ref>; cite: <path>:<section or line range>)`  - evidence_type ∈ {pinned_input, existing_spec_text, derived_rails_or_posture, pattern_definition}  - machine_ref rules:  - if evidence_type==pinned_input: <machine_ref> MUST be `pin_ref: <PIN_ID>=<PIN_VALUE>`  - if evidence_type==derived_rails_or_posture: <machine_ref> MUST be `rail_ref: <RAIL_KEY>=<RAIL_VALUE>`  - otherwise: <machine_ref> MUST be `ref: none`
- `**Rationale:**` 1-3 sentences grounded in the evidence bullets (no new facts)
- `**Implications:**` bullets describing what spec sections or decisions this would affect (advisory)
- `**Open questions:**` bullets, only when semantics are missing (do not invent answers)

(If no grounded candidates apply, emit: `- (CAF-managed run will populate grounded candidates; if none can be grounded, CAF will refuse and write a retrieval diagnostics feedback packet.)`.)

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
## Decision resolutions (architect-edit; required for specs → design)

Use this YAML block for explicit architecture/pattern decisions you want the next phases to honor.
If you are trying CAF for the first time, you may leave the starter shape in place and refine later.

```yaml
schema_version: decision_resolutions_v1
decisions: []
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 START -->
## System requirements (architect-edit)

Use this section for **platform, governance, safety, operational, and compliance** requirements.
This is where the human architect states what the system must guarantee across planes.
Detailed control-plane entities and persistence belong in `spec/playbook/system_domain_model_v1.md`.

What to capture here:

- tenancy, isolation, and context propagation expectations
- policy/governance requirements
- audit/evidence requirements
- retention/deletion requirements
- operational guardrails and reliability expectations

Starter example (replace or adapt):

- Every operation must execute within an explicit tenant context and fail closed when tenant context is missing.
- Policy authoring, approval, and lifecycle management are platform-owned concerns.
- Review or execution actions that matter for governance must emit evidence records that can be inspected later.
- Retention rules and deletion requests must be tracked explicitly rather than handled as invisible background behavior.
- Administrative changes should be traceable to a principal, timestamp, and target object.
- The first release can favor clarity and auditability over high throughput or deep automation.
<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

Keep unresolved cross-plane or platform questions here.

Starter examples:

- Do policy changes take effect immediately, or do they require approval and scheduled activation?
- Which events require immutable evidence capture in the first release?
- Should retention and deletion be centrally managed for all tenant data from day one?
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->
