# Application Specification (v1)

<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->
## Intent-derived app-plane constraints (CAF-managed)

CAF will derive compact app-plane constraints here from shape pins and resolved rails.
<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 END -->

## Externalized product/domain sources

The application spec stays lean.
Detailed product-surface and detailed domain-model content belong in these architect-edit source docs:

- `spec/playbook/application_product_surface_v1.md`
- `spec/playbook/application_domain_model_v1.md`

Use this spec for application-plane constraints, candidate decisions, compact bridge notes, and open questions.

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

Use this YAML block only for local application-plane decisions you want to record explicitly.
If you are just trying CAF for the first time, it is fine to leave this empty.

```yaml
schema_version: decision_resolutions_v1
decisions: []
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 START -->
## Domain and resources bridge (architect-edit)

Use this block only as a compact narrative bridge for the planner when you need to summarize:

- the main business resources or aggregates
- the user-visible capabilities that matter architecturally
- any compact notes that should remain visible in the spec itself

Do not duplicate the detailed domain model here.
That detail belongs in `spec/playbook/application_domain_model_v1.md`.

Suggested content:

- main resources / aggregates the product revolves around
- the most important tenant-facing capabilities
- any compact domain terminology notes that should remain stable across spec/design/planning
<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

Use this section for unresolved questions that should remain visible to the human architect.
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 START -->
## Notes / constraints (optional)

Use this section for compact application-plane constraints that matter architecturally.
<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 END -->
