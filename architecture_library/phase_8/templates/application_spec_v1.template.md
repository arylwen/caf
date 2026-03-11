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

<!-- ARCHITECT_EDIT_BLOCK: ui_product_surface_v1 START -->
## User interface product surface (architect-edit)

Use this section to describe the **product-facing experience**, not implementation details.
Write down what a human user should be able to do and what screens or flows need to exist.

How to use this block:

1. Keep the language product-facing.
2. Describe actors, journeys, and screens.
3. Avoid framework/runtime choices here; those belong in `spec/guardrails/profile_parameters.yaml`.
4. It is acceptable to keep the starter example below for a first CAF run and then refine it later.

Starter example (replace or adapt):

- The product includes a browser-based UI for tenant operators and reviewers.
- The primary navigation includes: Dashboard, Workspaces, Submissions, Review Queue, Reports, and Settings.
- A user can create a workspace, submit an item for review, inspect the review result, and export a report.
- Operators can filter work by tenant, status, owner, and date range.
- Keep the UX lightweight for local/demo runs: straightforward forms, list/detail pages, and clear status labels are enough.
- The UI does not need rich collaboration features in the first iteration; correctness and visible end-to-end flow matter more than polish.
<!-- ARCHITECT_EDIT_BLOCK: ui_product_surface_v1 END -->

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

<!-- ARCHITECT_EDIT_BLOCK: domain_and_capabilities_v1 START -->
## Product domain and capabilities (architect-edit)

Use this section to describe the **business-facing application behavior**.
Do not try to fully normalize entities here; the detailed application-plane domain model belongs in `spec/playbook/application_domain_model_v1.md`.

What to capture here:

- what the product helps users accomplish
- the main business objects users talk about
- the major user-visible operations
- any important business constraints the application must respect

Starter example (replace or adapt):

This product helps tenant teams submit items for automated review, inspect findings, and publish final reports.

Main business objects:

- Workspace: a tenant-scoped container for review activity
- Submission: an item a user sends into the review flow
- Review: the current evaluation state and findings for a submission
- Report: an exported or shareable outcome summarizing the review result

User-visible capabilities:

- create and manage workspaces
- submit an item for review
- list and inspect submissions by status
- review findings and mark a submission as approved or rejected
- export a report for downstream use

Business constraints:

- every business object is tenant-scoped
- status changes must be visible to the user
- reports must be reproducible from the final approved review state
- destructive actions should be limited and intentional in the first release

Move these details into `application_domain_model_v1.md` when you want fields, invariants, and persistence intent.
<!-- ARCHITECT_EDIT_BLOCK: domain_and_capabilities_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

Use this section for unresolved questions that should remain visible to the human architect.

Starter examples:

- Do we need draft autosave for submissions, or is explicit save enough for the first release?
- Should reports be regenerated on demand or stored as immutable snapshots?
- Are review decisions single-step, or do they require multi-person approval later?
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 START -->
## Notes / constraints (optional)

Use this section for compact application-plane constraints that matter architecturally.

Starter examples:

- Prefer simple CRUD + workflow progression over advanced collaboration in the first version.
- Optimize for clear end-to-end demonstration of the product flow rather than UI sophistication.
- Keep terminology stable across UI, APIs, and domain model artifacts.
<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 END -->
