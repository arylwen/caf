# UX Design (v1)

<!-- CAF_MANAGED_BLOCK: ux_design_meta_v1 START -->
## UX design metadata (CAF-managed)
- instance: <filled by CAF>
- generation_phase: ux_design
- required_upstream_inputs:
  - product/PRD.resolved.md
  - product/PLATFORM_PRD.resolved.md (when present)
  - spec/playbook/application_spec_v1.md#ui_product_surface_v1
  - spec/guardrails/profile_parameters_resolved.yaml#ui
- optional_contextual_inputs:
  - design/playbook/contract_declarations_v1.yaml
  - design/playbook/application_design_v1.md
  - design/playbook/control_plane_design_v1.md
  - design/playbook/application_domain_model_v1.yaml
  - design/playbook/system_domain_model_v1.yaml
- retrieval_profile: ux_design
- pattern_seed_surface: architecture_library/patterns/ux_v1/ux_pattern_pack_input_surface_v1.md
- canonical_artifact_role: inspectable UX design surface; primary semantic input to /caf ux plan and /caf ux build
<!-- CAF_MANAGED_BLOCK: ux_design_meta_v1 END -->

<!-- CAF_TEMPLATE_NOTE: ux_architect_block_posture_v1 START -->
> `/caf ux` may auto-hydrate the architect-edit blocks below with compact derivation pointers rather than full copied payload. Architect edits are optional; replace the pointer or auto-hydration comment block inside a section only when you want that section to become a true manual override.
<!-- CAF_TEMPLATE_NOTE: ux_architect_block_posture_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_scope_seed_v1 START -->
## CAF UX scope seed (CAF-managed)
- status: pending derivation from PRD/spec surfaces
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_scope_and_actors_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_scope_seed_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_scope_semantic_projection_v1 START -->
## CAF UX scope semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_scope_and_actors_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_scope_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_scope_and_actors_v1 START -->
## UX scope and actors (architect-edit)

Use this block to define the UX lane scope for this instance.

Capture:
- which product area or bounded context this UX design covers;
- which human actors and operator roles matter most;
- what this UX lane is intentionally not trying to solve yet.

Starter example (replace or adapt):

- In scope: the tenant-operator workflow for creating workspaces, submitting items, reviewing results, and publishing reports.
- Primary actors: tenant operator, reviewer, tenant admin.
- Non-goals for the first UX lane: advanced collaboration, white-glove onboarding, mobile-native parity, and rich analytics customization.
- This artifact is separate from the smoke-test UI used to prove runnable end-to-end flow.
<!-- ARCHITECT_EDIT_BLOCK: ux_scope_and_actors_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_pm_intent_semantic_projection_v1 START -->
## CAF UX PM intent semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_pm_intent_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_pm_intent_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_pm_intent_v1 START -->
## Product-manager intent signals (architect-edit)

Use this block to capture the interpreted product-manager intent that should shape the UX lane.
This is where `/caf ux` can make the PRD feel more like a product experience brief than a raw capability inventory.
Architect edits are optional; refine this block only when the derived intent needs correction or stronger product taste.

Capture these fields explicitly:
- `primary_product_intent`
- `primary_experience_intent`
- `trust_clarity_intent`
- `visual_tone_intent`

Starter outline (replace or adapt):

```yaml
schema_version: ux_pm_intent_v1
primary_product_intent:
  summary: Help the primary operator complete the core job in one coherent workspace instead of bouncing across disconnected pages.
  cues:
    - reduce friction in the main operational flow
    - keep the product feeling controlled and understandable
primary_experience_intent:
  summary: Make the primary UX realization show the single most compelling end-to-end user outcome with minimal detours.
  cues:
    - foreground the primary operator journey before secondary admin/setup paths
    - make the key before/after value legible on screen
trust_clarity_intent:
  summary: The UX should feel trustworthy, explainable, and safe for consequential actions.
  cues:
    - preserve visible state and status continuity
    - make evidence, confirmations, and recovery paths easy to understand
visual_tone_intent:
  summary: Present the product as calm, professional, polished, and ready for a richer UX realization audience.
  cues:
    - avoid playful or noisy styling
    - prefer readable hierarchy and restrained accents
```
<!-- ARCHITECT_EDIT_BLOCK: ux_pm_intent_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_core_journeys_seed_v1 START -->
## CAF UX core journeys seed (CAF-managed)
- status: pending derivation from PRD capability and flow signal
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_core_journeys_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_core_journeys_seed_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_core_journeys_semantic_projection_v1 START -->
## CAF UX core journeys semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_core_journeys_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_core_journeys_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_core_journeys_v1 START -->
## Core journeys (architect-edit)

Describe only the journeys that materially shape UX architecture and planning.

For each journey, capture:
- actor
- goal
- trigger or starting condition
- entry surface
- major steps
- success outcome
- failure/recovery branches
- notable variants

Starter outline (replace or adapt):

### Journey: Submit item for review
- Actor: tenant operator
- Goal: submit an item and obtain a review outcome
- Trigger: operator wants a new item evaluated
- Entry surface: workspace detail or submission list
- Major steps:
  1. create or open the workspace
  2. enter submission details
  3. validate and submit
  4. monitor progress/result
  5. inspect findings
- Success outcome: submission reaches a visible review state with actionable findings
- Failure/recovery branches:
  - invalid input → inline correction path
  - upstream processing delay → progress/pending state with retry-safe refresh
  - rejected submission → visible reason and next action
- Notable variants:
  - draft-save before final submit
  - privileged reviewer override path (if in scope)
<!-- ARCHITECT_EDIT_BLOCK: ux_core_journeys_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_interaction_surfaces_seed_v1 START -->
## CAF UX interaction surfaces seed (CAF-managed)
- status: pending derivation from PRD capability and UI surface signal
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_interaction_surfaces_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_interaction_surfaces_seed_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_interaction_surfaces_semantic_projection_v1 START -->
## CAF UX interaction surfaces semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_interaction_surfaces_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_interaction_surfaces_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_interaction_surfaces_v1 START -->
## Interaction surfaces (architect-edit)

List meaningful interaction surfaces or route clusters, not every final page/component.

For each surface, capture:
- purpose
- related journeys
- dominant interaction mode (for example: worklist, detail, form, review, reporting, settings)
- key states
- notable transitions or handoffs

Starter outline (replace or adapt):

### Surface: Submission worklist
- Purpose: help operators find, filter, and act on submissions
- Related journeys: submit item for review; inspect review result
- Dominant interaction mode: worklist + bulk triage
- Key states: empty, filtered results, loading, partial failure
- Notable transitions: worklist → detail; worklist → create flow; worklist → bulk action confirmation

### Surface: Submission detail / review result
- Purpose: inspect status, findings, and next actions for one submission
- Related journeys: inspect review result; approve or reject review
- Dominant interaction mode: detail + decision
- Key states: pending, in_review, approved, rejected, read-only
- Notable transitions: detail → report publish; detail → back to worklist; detail → remediation/edit flow
<!-- ARCHITECT_EDIT_BLOCK: ux_interaction_surfaces_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_visual_direction_seed_v1 START -->
## CAF UX visual direction seed (CAF-managed)
- status: pending derivation from PRD, UI product surface, and demo posture
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_visual_direction_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_visual_direction_seed_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_visual_direction_semantic_projection_v1 START -->
## CAF UX visual direction semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_visual_direction_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_visual_direction_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_visual_direction_v1 START -->
## Visual direction and UX-realization posture (architect-edit)

Use this block to define the visual tone for the richer UX lane.
This is where the lane starts to care about CSS, wireframe posture, layout rhythm, and the difference between "runnable" and "presentation-worthy" UI.

Capture:
- visual tone and product vibe (for example: calm, premium, operational, editorial, trustworthy)
- navigation shell posture (for example: left rail + top context bar, stacked mobile shell, split workspace)
- density and spacing expectations
- surface treatment (cards, panels, borders, shadows, contrast)
- typography hierarchy and chart/report readability expectations
- motion/loading polish expectations that should stay subtle
- whether the richer UX realization lane should look distinctly stronger than the smoke-test UI

Starter outline (replace or adapt):

- Visual tone: calm, modern, operational, and presentation-ready without looking playful or noisy.
- Navigation shell: stable left navigation plus a top context bar with page title, primary action, and status context.
- Density: medium-dense desktop-first layout; allow compact data views without collapsing readability.
- Surface treatment: soft card/panel layering, restrained accent color, visible but not heavy borders, minimal gradients.
- Typography: clear title/section hierarchy, readable table/report typography, strong status chips, restrained microcopy.
- Motion: subtle skeleton/loading states, quiet transitions, and no novelty effects that distract from review/reporting flows.
- UX distinction: the richer UX realization lane should look intentionally polished for walkthroughs while the smoke-test UI remains honest and minimal.
<!-- ARCHITECT_EDIT_BLOCK: ux_visual_direction_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_pressures_seed_v1 START -->
## CAF UX pattern pressures seed (CAF-managed)
- status: pending derivation from PRD capability/UI signal
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_pattern_pressures_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_pressures_seed_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_pressures_semantic_projection_v1 START -->
## CAF UX pattern pressures semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_pattern_pressures_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_pressures_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_pattern_pressures_v1 START -->
## UX pattern pressures (architect-edit; retrieval-facing)

Use this block to record the pressures that should drive UX pattern retrieval.
Do not try to name every final widget or framework choice.
Prefer stable interaction/problem language.

Use the YAML payload to keep this retrieval-friendly.

```yaml
schema_version: ux_pattern_pressures_v1
pressures:
  - pressure_id: ux-pressure-001
    journey_ref: submit-item-for-review
    surface_ref: submission-worklist
    category: search_filter_sort
    priority: high
    cues:
      - operators need to filter by status, owner, and date range
      - results must remain understandable under partial failure or delayed updates
    rationale: Worklist usability depends on strong retrieval and visible status handling.
  - pressure_id: ux-pressure-002
    journey_ref: submit-item-for-review
    surface_ref: submission-detail
    category: async_progress_result
    priority: high
    cues:
      - processing may take time
      - users need visible pending, running, complete, and failed states
    rationale: The UX needs clear progress/result posture rather than optimistic page transitions.
  - pressure_id: ux-pressure-003
    journey_ref: review-decision
    surface_ref: submission-detail
    category: review_approval
    priority: medium
    cues:
      - reviewer decision needs clear rationale and audit-friendly confirmation
      - privileged actions may require read-only or locked variants
    rationale: Review and approval flows should retrieve suitable decision/confirmation patterns.
```

Recommended category vocabulary for the first lane:
- worklist_dashboard
- crud_detail_edit
- review_approval
- search_filter_sort
- bulk_actions
- wizard_multistep
- async_progress_result
- settings_admin
- auth_session_role_aware
- empty_error_recovery
- audit_explainability
- visual_shell_hierarchy
- visual_density_rhythm
- editorial_report_readability
<!-- ARCHITECT_EDIT_BLOCK: ux_pattern_pressures_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_state_recovery_seed_v1 START -->
## CAF UX state and recovery seed (CAF-managed)
- status: pending derivation from PRD quality/flow signal
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_state_and_recovery_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_state_recovery_seed_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_state_recovery_semantic_projection_v1 START -->
## CAF UX state and recovery semantic projection (CAF-managed)
- status: pending semantic projection from the instruction-owned UX semantic packet
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or override via `ux_state_and_recovery_v1` only when the semantic projection is wrong
<!-- CAF_MANAGED_BLOCK: caf_ux_state_recovery_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_state_and_recovery_v1 START -->
## State and recovery model (architect-edit)

Describe the UX-visible states and recovery paths that matter enough to shape planning and build quality.

Capture, where relevant:
- empty / loading / success / error
- draft / submitted / pending / running / completed / failed
- approved / rejected / read-only / locked / privileged
- recovery actions, retry posture, and what the user sees when something goes wrong

Starter outline (replace or adapt):

- Empty states should explain what action the user can take next.
- Long-running operations should expose pending/running/completed/failed states explicitly.
- Recoverable validation failures should keep user input in place.
- Irrecoverable failures should provide a stable error contract, a retry or refresh action where safe, and audit-friendly messaging.
<!-- ARCHITECT_EDIT_BLOCK: ux_state_and_recovery_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_touchpoints_constraints_seed_v1 START -->
## CAF UX touchpoints and constraints seed (CAF-managed)
- status: pending derivation from PRD/spec/interface-facing rails
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_touchpoints_and_constraints_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_touchpoints_constraints_seed_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_touchpoints_constraints_semantic_projection_v1 START -->
## CAF UX touchpoints and constraints semantic projection (CAF-managed)
- status: pending semantic projection from the instruction-owned UX semantic packet
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or override via `ux_touchpoints_and_constraints_v1` only when the semantic projection is wrong
<!-- CAF_MANAGED_BLOCK: caf_ux_touchpoints_constraints_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_touchpoints_and_constraints_v1 START -->
## AP/CP touchpoints and UX constraints (architect-edit)

Record the system and platform touchpoints that materially shape UX behavior.

Capture:
- main AP contracts and operations used by journeys/surfaces
- CP/admin touchpoints where they materially affect the user flow
- tenant/auth/session/context assumptions
- notable latency, consistency, policy, or browser constraints

Starter outline (replace or adapt):

- Submission worklist depends on tenant-scoped REST list/query endpoints with filter, sort, and status posture that the UX can rely on.
- Submission detail depends on REST detail/status endpoints and may surface CP-backed policy/evaluation outcomes indirectly.
- Session expiry, tenant context, and role-based visibility should remain visible UX pressures rather than hidden implementation accidents.
- Browser UX should tolerate refresh/navigation without losing clear state ownership.
<!-- ARCHITECT_EDIT_BLOCK: ux_touchpoints_and_constraints_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_interface_contract_pressures_seed_v1 START -->
## CAF UX interface contract pressures seed (CAF-managed)
- status: pending derivation from PRD capability/UI signal
- refresh_owner: tools/caf/derive_ux_seed_content_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the derived content inside `ux_interface_contract_pressures_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_interface_contract_pressures_seed_v1 END -->


<!-- CAF_MANAGED_BLOCK: caf_ux_interface_contract_pressures_semantic_projection_v1 START -->
## CAF UX interface contract pressures semantic projection (CAF-managed)
- status: pending semantic projection from PRD/spec/seed surfaces
- refresh_owner: tools/caf/derive_ux_semantic_projection_v1.mjs
- hand_edit_posture: do not hand-edit this block; adapt or promote the projected content inside `ux_interface_contract_pressures_v1`
<!-- CAF_MANAGED_BLOCK: caf_ux_interface_contract_pressures_semantic_projection_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_interface_contract_pressures_v1 START -->
## UX interface contract pressures (architect-edit)

Use this block to describe the API/interface shape pressures the UX imposes.
This is not the same as interface binding contracts.
It exists so the UX lane can push top-down contract expectations without pretending the UX artifact is itself the OpenAPI or GraphQL definition.

For 0.4.0, assume the external contract style remains REST/OpenAPI unless the architecture explicitly says otherwise.

Capture pressures such as:
- list/detail/search contract posture
- aggregate/composed reads needed to avoid chatty UI round-trips
- mutation granularity for inline edits, bulk actions, or wizard steps
- status/progress/result endpoints for async flows
- report/export/download contract expectations
- pagination, filtering, sorting, and query persistence
- role/session/tenant-aware contract consequences that must stay visible to the UX lane

Starter outline (replace or adapt):

- Worklist surfaces need tenant-scoped list endpoints with filter, sort, status counts, and stable pagination.
- Detail/review surfaces should prefer composed read models over multiple UI round-trips when evidence, status, and next actions appear together.
- Submit/update flows should expose mutation contracts that preserve validation clarity and draft-safe recovery.
- Async review/report flows need explicit status/result contract posture rather than hiding long-running work behind synchronous navigation.
- The richer UX lane may influence REST resource shape and BFF posture, but it does not replace the authoritative API design artifact.
<!-- ARCHITECT_EDIT_BLOCK: ux_interface_contract_pressures_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_review_pressures_v1 START -->
## UX implementation and review pressures (architect-edit)

Use this block to capture what future `/caf ux plan` and review steps should care about.

Examples:
- where route/component/session complexity is likely to concentrate;
- which surfaces need higher interaction quality than the smoke-test UI;
- where accessibility, auditability, explainability, or approval ergonomics are especially important;
- where the richer UX lane should intentionally diverge from the minimal runnable UI.
<!-- ARCHITECT_EDIT_BLOCK: ux_review_pressures_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ux_open_questions_v1 START -->
## UX open questions (architect-edit)

Keep unresolved UX questions here so they remain visible without overloading spec/design artifacts.

Starter examples:
- Should long-running review progress be modeled as polling, push updates, or explicit refresh in the first version?
- Do reviewers need side-by-side comparison or is sequential detail review enough at first?
- Which settings/admin surfaces belong in the richer UX lane versus the smoke-test UI?
<!-- ARCHITECT_EDIT_BLOCK: ux_open_questions_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_candidates_v1 START -->
## CAF UX pattern candidates (CAF-managed)

Source surfaces:
- `architecture_library/patterns/ux_v1/ux_pattern_pack_input_surface_v1.md`
- `architecture_library/patterns/retrieval_surface_v1/retrieval_view_profiles_v1.yaml` profile: `ux_design`

Current routed behavior:
- the semantic worker should write grounded candidate records to `design/playbook/grounded_candidate_records_ux_design_v1.md`;
- `tools/caf/ux_retrieval_postprocess_v1.mjs` should write those grounded candidates back into this block;
- `tools/caf/ux_retrieval_gate_v1.mjs` should enforce shortlist/open-list/writeback discipline after that writeback.
<!-- CAF_MANAGED_BLOCK: caf_ux_pattern_candidates_v1 END -->
