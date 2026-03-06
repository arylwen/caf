# Application Specification (v1)

<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->
## Intent-derived app-plane constraints (CAF-managed)

### Multi-tenancy

- Required: `<filled by CAF>`
- Tenant isolation: `<filled by CAF>`
- Required identity attribute: `<filled by CAF>`

### Identity (core)

- Required: `<filled by CAF>`
- Notes: AuthN/Z mechanism is intentionally unspecified at this stage unless pinned elsewhere.
<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ui_requirements_v1 START -->
## User interface requirements (architect-edit; marketing-default)

(YAML. This section is used to ground UI-driven pattern candidates such as BFF/API composition.)

```yaml
ui:
  present: true
  kind: web_spa
  framework_preference: react
  deployment_preference: separate_ui_service  # options: separate_ui_service | served_by_application_plane
  notes: "Marketing demo default: include a React SPA UI."
```
<!-- ARCHITECT_EDIT_BLOCK: ui_requirements_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->
## CAF decision pattern candidates (advisory; grounded)

Source retrieval surface: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`
View profile: `arch_scaffolding` (default)

### Candidate record format (v1)

For each candidate, emit exactly:

- A heading: `### <EVIDENCE_HOOK_ID>: <PATTERN_ID>  -  <PATTERN_TITLE> (confidence: <low|medium|high>)`
- `**Plane:** <application|control|both>`
- `**Evidence:**` bullets, each with:  - `- <E#> [<evidence_type>] <short quote or paraphrase> (<machine_ref>; cite: <path>:<section or line range>)`  - evidence_type ∈ {pinned_input, existing_spec_text, derived_rails_or_posture, pattern_definition}  - machine_ref rules:  - if evidence_type==pinned_input: <machine_ref> MUST be `pin_ref: <PIN_ID>=<PIN_VALUE>`  - if evidence_type==derived_rails_or_posture: <machine_ref> MUST be `rail_ref: <RAIL_KEY>=<RAIL_VALUE>`  - otherwise: <machine_ref> MUST be `ref: none`
- `**Rationale:**` 1-3 sentences grounded in the evidence bullets (no new facts)
- `**Implications:**` bullets describing what spec sections or decisions this would affect (advisory)
- `**Open questions:**` bullets, only when semantics are missing (do not invent answers)

(If no grounded candidates apply, emit: `- (CAF-managed run will populate grounded candidates; if none can be grounded, CAF will refuse and write a retrieval diagnostics feedback packet.)`.)

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
## Decision resolutions (architect-edit; optional)

(YAML. Optional local approvals for application-plane decisions. System spec is canonical if conflicts exist.)

```yaml
schema_version: decision_resolutions_v1
decisions: []
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 START -->
## Domain

(Example only  -  replace with your real domain/resources.)

This application manages widgets with a name, description, and content (all text).

## Resources

### Widget

Fields:

- name: text (required)
- description: text (required)
- content: text (required)

Operations:

- list
- get
- create
- update
- delete
<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

(Unresolved questions discovered during scaffolding.)
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 START -->
## Notes / constraints (optional)

(Add any domain constraints, invariants, or nonfunctional requirements relevant to the application plane.)
<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 END -->
