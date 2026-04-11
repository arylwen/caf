# Build Dispatch Manifest (v1)

Derived mechanically from:
- `reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml`
- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`

This file is a dispatch aid for `caf-build-candidate` Step 3.
It does **not** execute workers; it resolves deterministic ordering + worker IDs.

## Wave 0

### UX-TG-00-ux-shell-and-visual-system — Realize UX shell and visual system foundations

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: (none)

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Implement the persistent left navigation and top context bar for Dashboard, Catalog, Collections, Activity, and Admin.
- Apply the semantic visual-system token roles and medium-density layout posture across shell primitives.
- Keep tenant identity, role context, and key consequence status visible in shell-level UI.
- Surface one-click shell-level affordances for Create Widget, Publish Collection, and Manage Roles.

**Definition of Done:**
- The richer UX lane provides a stable web shell with navigation order aligned to Dashboard -> Catalog -> Collections -> Activity -> Admin.
- Visual hierarchy and semantic token roles match the bounded visual-system plan without inventing a new design language.
- Tenant/role context and consequence visibility are persistent and legible on all primary surfaces.
- Primary actions remain one click from relevant shell contexts.

**Semantic review questions:**
- Does the shell preserve the declared main navigation order and one-click primary actions?
- Are visual-system token roles and primitive families applied consistently instead of ad-hoc styling?
- Is tenant and role context always visible for consequential operations?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-VISUAL-01
- kind=module_role | pattern_id=UX-SESSION-01
- kind=structural_validation | pattern_id=product_surface:dashboard-catalog-collections-activity-admin

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-00-ux-shell-and-visual-system
title: Realize UX shell and visual system foundations
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - (none)
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Implement the persistent left navigation and top context bar for Dashboard, Catalog, Collections, Activity, and Admin.
  - Apply the semantic visual-system token roles and medium-density layout posture across shell primitives.
  - Keep tenant identity, role context, and key consequence status visible in shell-level UI.
  - Surface one-click shell-level affordances for Create Widget, Publish Collection, and Manage Roles.
definition_of_done:
  - The richer UX lane provides a stable web shell with navigation order aligned to Dashboard -> Catalog -> Collections -> Activity -> Admin.
  - Visual hierarchy and semantic token roles match the bounded visual-system plan without inventing a new design language.
  - Tenant/role context and consequence visibility are persistent and legible on all primary surfaces.
  - Primary actions remain one click from relevant shell contexts.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the shell preserve the declared main navigation order and one-click primary actions?
    - Are visual-system token roles and primitive families applied consistently instead of ad-hoc styling?
    - Is tenant and role context always visible for consequential operations?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-VISUAL-01
  -
    anchor_kind: module_role
    pattern_id: UX-SESSION-01
  -
    anchor_kind: structural_validation
    pattern_id: product_surface:dashboard-catalog-collections-activity-admin
```

## Wave 1

### UX-TG-10-rest-client-and-session-wiring — Wire REST client, session context, and deny/recovery posture

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `UX-TG-00-ux-shell-and-visual-system`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Implement UX-lane API helper posture for list/detail/mutation REST flows with tenant and role context awareness.
- Keep session-expiry, deny, and validation failure states explicit and non-destructive.
- Align UI-side request shaping with thin BFF posture and current REST/OpenAPI boundaries.
- Ensure recovery messaging preserves user input where possible and avoids hidden failure states.

**Definition of Done:**
- REST client wiring supports tenant-scoped list/detail/mutation flows needed by catalog, collections, sharing, activity, and admin surfaces.
- Session and policy denial outcomes are explainable in the UI and consistent with fail-closed behavior.
- Recovery posture preserves user-entered draft state for validation and retry-safe failure paths.
- UX request/response handling does not assume realtime collaboration or cross-tenant capabilities.

**Semantic review questions:**
- Do client/session wiring decisions keep tenant and role context explicit across all primary flows?
- Are deny and recovery states implemented as explicit UX outcomes instead of generic error banners?
- Does the task stay within current REST/OpenAPI and thin-BFF posture without introducing contract drift?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-SESSION-01
- kind=module_role | pattern_id=UX-RECOVERY-01
- kind=structural_validation | pattern_id=EXT-BACKEND_FOR_FRONTEND_BFF

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-10-rest-client-and-session-wiring
title: Wire REST client, session context, and deny/recovery posture
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - UX-TG-00-ux-shell-and-visual-system
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Implement UX-lane API helper posture for list/detail/mutation REST flows with tenant and role context awareness.
  - Keep session-expiry, deny, and validation failure states explicit and non-destructive.
  - Align UI-side request shaping with thin BFF posture and current REST/OpenAPI boundaries.
  - Ensure recovery messaging preserves user input where possible and avoids hidden failure states.
definition_of_done:
  - REST client wiring supports tenant-scoped list/detail/mutation flows needed by catalog, collections, sharing, activity, and admin surfaces.
  - Session and policy denial outcomes are explainable in the UI and consistent with fail-closed behavior.
  - Recovery posture preserves user-entered draft state for validation and retry-safe failure paths.
  - UX request/response handling does not assume realtime collaboration or cross-tenant capabilities.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Do client/session wiring decisions keep tenant and role context explicit across all primary flows?
    - Are deny and recovery states implemented as explicit UX outcomes instead of generic error banners?
    - Does the task stay within current REST/OpenAPI and thin-BFF posture without introducing contract drift?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-SESSION-01
  -
    anchor_kind: module_role
    pattern_id: UX-RECOVERY-01
  -
    anchor_kind: structural_validation
    pattern_id: EXT-BACKEND_FOR_FRONTEND_BFF
```

## Wave 2

### UX-TG-20-primary-worklist-surface — Realize primary catalog worklist and triage surface

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `UX-TG-10-rest-client-and-session-wiring`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`

**Steps:**
- Build the Widget Catalog surface with searchable/sortable tenant-scoped worklist behavior.
- Keep create-widget and quick triage actions visible from list and empty states.
- Preserve transitions from worklist to widget detail/editor without losing applied filters.
- Represent loading, empty, validation, and failure states with clear next actions.

**Definition of Done:**
- Catalog worklist supports search/filter/sort posture and stable status visibility for widget operations.
- Create Widget action is directly discoverable from primary worklist contexts, including empty state.
- Worklist to detail transitions preserve user orientation and applied query context.
- Recovery messaging and state rendering maintain readability under medium-density operational usage.

**Semantic review questions:**
- Is the catalog worklist realized as the primary operational entry surface, not a secondary page?
- Are search/filter/sort and empty/loading/error states complete enough for day-to-day triage?
- Does Create Widget remain one click away from relevant worklist states?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-WORKLIST-01
- kind=module_role | pattern_id=UX-SEARCH-01
- kind=structural_validation | pattern_id=UX-CRUD-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-20-primary-worklist-surface
title: Realize primary catalog worklist and triage surface
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - UX-TG-10-rest-client-and-session-wiring
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
    required: required
steps:
  - Build the Widget Catalog surface with searchable/sortable tenant-scoped worklist behavior.
  - Keep create-widget and quick triage actions visible from list and empty states.
  - Preserve transitions from worklist to widget detail/editor without losing applied filters.
  - Represent loading, empty, validation, and failure states with clear next actions.
definition_of_done:
  - Catalog worklist supports search/filter/sort posture and stable status visibility for widget operations.
  - Create Widget action is directly discoverable from primary worklist contexts, including empty state.
  - Worklist to detail transitions preserve user orientation and applied query context.
  - Recovery messaging and state rendering maintain readability under medium-density operational usage.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Is the catalog worklist realized as the primary operational entry surface, not a secondary page?
    - Are search/filter/sort and empty/loading/error states complete enough for day-to-day triage?
    - Does Create Widget remain one click away from relevant worklist states?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-WORKLIST-01
  -
    anchor_kind: module_role
    pattern_id: UX-SEARCH-01
  -
    anchor_kind: structural_validation
    pattern_id: UX-CRUD-01
```

## Wave 3

### UX-TG-30-detail-review-report-surface — Realize widget detail editor and review/report experience

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `UX-TG-20-primary-worklist-surface`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Build widget detail and editor flow with clear validation, save outcomes, and version/history cues.
- Include review-style presentation for consequential actions and outcome summaries.
- Keep transitions from detail to activity/evidence context legible and reversible.
- Preserve user-entered changes during validation and retry flows.

**Definition of Done:**
- Widget detail/editor supports full create-edit-save-confirm loop with explicit outcome messaging.
- Review/report presentation makes decision and outcome continuity understandable for operators.
- Version/history context is visible from detail flows without breaking catalog navigation continuity.
- Validation and failure handling preserve draft state and provide clear remediation actions.

**Semantic review questions:**
- Does the detail/editor flow keep list-detail continuity while supporting safe create/edit/save cycles?
- Are review and report-style outcome summaries clear for consequential actions?
- Does the implementation preserve user drafts across validation and retry scenarios?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-CRUD-01
- kind=module_role | pattern_id=UX-REVIEW-01
- kind=structural_validation | pattern_id=UX-REPORT-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-30-detail-review-report-surface
title: Realize widget detail editor and review/report experience
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - UX-TG-20-primary-worklist-surface
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Build widget detail and editor flow with clear validation, save outcomes, and version/history cues.
  - Include review-style presentation for consequential actions and outcome summaries.
  - Keep transitions from detail to activity/evidence context legible and reversible.
  - Preserve user-entered changes during validation and retry flows.
definition_of_done:
  - Widget detail/editor supports full create-edit-save-confirm loop with explicit outcome messaging.
  - Review/report presentation makes decision and outcome continuity understandable for operators.
  - Version/history context is visible from detail flows without breaking catalog navigation continuity.
  - Validation and failure handling preserve draft state and provide clear remediation actions.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does the detail/editor flow keep list-detail continuity while supporting safe create/edit/save cycles?
    - Are review and report-style outcome summaries clear for consequential actions?
    - Does the implementation preserve user drafts across validation and retry scenarios?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-CRUD-01
  -
    anchor_kind: module_role
    pattern_id: UX-REVIEW-01
  -
    anchor_kind: structural_validation
    pattern_id: UX-REPORT-01
```

## Wave 4

### UX-TG-40-collections-and-sharing-surface — Realize collections curation and role-targeted sharing surfaces

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `UX-TG-30-detail-review-report-surface`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Implement Collections workspace for list, membership edits, and tag curation.
- Implement sharing/permissions panel for publish actions with role-targeted access choices.
- Keep Publish Collection action one click from collection contexts and preserve confirmation clarity.
- Show deny/failure reasons and retry posture for publish and permission updates.

**Definition of Done:**
- Collections workspace supports membership management and tag updates as first-class operator actions.
- Sharing and permissions flow supports role-targeted publish/update decisions with explicit confirmation outcomes.
- Publish Collection action remains direct and visible in collection contexts.
- Publish deny/failure paths expose explainable reasons and non-destructive retry behavior.

**Semantic review questions:**
- Are collection curation and sharing controls realized as distinct, operable surfaces rather than deferred placeholders?
- Does publish flow preserve role-targeted decision clarity and explicit confirmation behavior?
- Are deny and partial-failure outcomes actionable without losing current membership context?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-REVIEW-01
- kind=module_role | pattern_id=UX-EXPLAIN-01
- kind=structural_validation | pattern_id=product_surface:collections-sharing-permissions

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-40-collections-and-sharing-surface
title: Realize collections curation and role-targeted sharing surfaces
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - UX-TG-30-detail-review-report-surface
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Implement Collections workspace for list, membership edits, and tag curation.
  - Implement sharing/permissions panel for publish actions with role-targeted access choices.
  - Keep Publish Collection action one click from collection contexts and preserve confirmation clarity.
  - Show deny/failure reasons and retry posture for publish and permission updates.
definition_of_done:
  - Collections workspace supports membership management and tag updates as first-class operator actions.
  - Sharing and permissions flow supports role-targeted publish/update decisions with explicit confirmation outcomes.
  - Publish Collection action remains direct and visible in collection contexts.
  - Publish deny/failure paths expose explainable reasons and non-destructive retry behavior.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Are collection curation and sharing controls realized as distinct, operable surfaces rather than deferred placeholders?
    - Does publish flow preserve role-targeted decision clarity and explicit confirmation behavior?
    - Are deny and partial-failure outcomes actionable without losing current membership context?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-REVIEW-01
  -
    anchor_kind: module_role
    pattern_id: UX-EXPLAIN-01
  -
    anchor_kind: structural_validation
    pattern_id: product_surface:collections-sharing-permissions
```

## Wave 5

### UX-TG-50-admin-and-activity-surface — Realize tenant admin and activity history surfaces

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `UX-TG-10-rest-client-and-session-wiring`, `UX-TG-40-collections-and-sharing-surface`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_spec_v1.md`

**Steps:**
- Implement Tenant Admin surface for user-role assignments and tenant settings updates.
- Implement Activity History timeline/list with request, decision, and outcome continuity.
- Keep Manage Roles action quickly reachable from admin and shell contexts.
- Ensure admin deny/failure states are explicit, recoverable, and role-aware.

**Definition of Done:**
- Tenant Admin surface supports role assignment and tenant settings actions with clear state transitions.
- Activity History provides auditable timeline visibility across widget, collection, and admin changes.
- Manage Roles action is discoverable in relevant admin contexts without deep navigation.
- Admin failures and denials remain explainable and preserve operator context.

**Semantic review questions:**
- Does tenant administration remain a first-class surface with explicit role/settings actions?
- Is activity history sufficiently auditable and tied to request/decision/outcome continuity?
- Are admin deny paths explicit and safe for recovery without hidden side effects?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-EXPLAIN-01
- kind=module_role | pattern_id=EXT-AUDITABILITY
- kind=structural_validation | pattern_id=product_surface:tenant-admin-activity

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-50-admin-and-activity-surface
title: Realize tenant admin and activity history surfaces
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - UX-TG-10-rest-client-and-session-wiring
  - UX-TG-40-collections-and-sharing-surface
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md
    required: required
steps:
  - Implement Tenant Admin surface for user-role assignments and tenant settings updates.
  - Implement Activity History timeline/list with request, decision, and outcome continuity.
  - Keep Manage Roles action quickly reachable from admin and shell contexts.
  - Ensure admin deny/failure states are explicit, recoverable, and role-aware.
definition_of_done:
  - Tenant Admin surface supports role assignment and tenant settings actions with clear state transitions.
  - Activity History provides auditable timeline visibility across widget, collection, and admin changes.
  - Manage Roles action is discoverable in relevant admin contexts without deep navigation.
  - Admin failures and denials remain explainable and preserve operator context.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does tenant administration remain a first-class surface with explicit role/settings actions?
    - Is activity history sufficiently auditable and tied to request/decision/outcome continuity?
    - Are admin deny paths explicit and safe for recovery without hidden side effects?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-EXPLAIN-01
  -
    anchor_kind: module_role
    pattern_id: EXT-AUDITABILITY
  -
    anchor_kind: structural_validation
    pattern_id: product_surface:tenant-admin-activity
```

## Wave 6

### UX-TG-90-ux-polish — Apply bounded UX polish across primary surfaces

- required_capability: `ux_frontend_realization`
- worker_id: `worker-ux-frontend`
- depends_on: `UX-TG-30-detail-review-report-surface`, `UX-TG-40-collections-and-sharing-surface`, `UX-TG-50-admin-and-activity-surface`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`

**Steps:**
- Harmonize spacing, typography, status chips, and panel hierarchy across dashboard, catalog, collections, activity, and admin.
- Improve loading/empty/error/deny microcopy for trust and scanability without novelty motion.
- Tighten keyboard and focus behavior for medium-density operational usage.
- Validate visual continuity between worklist, detail, publish, and admin journeys.

**Definition of Done:**
- UX polish improves clarity and continuity across all declared main surfaces without adding new product scope.
- Empty/loading/error/deny states are consistent, readable, and aligned with recovery posture.
- Interaction density and focus behavior support keyboard-friendly desktop operation.
- Motion and decoration remain restrained in governance-critical flows.

**Semantic review questions:**
- Does polish improve coherence and readability across all main surfaces rather than only isolated screens?
- Are state and recovery cues consistent and trustworthy across list, detail, publish, and admin contexts?
- Is visual motion restrained and appropriate for governance-critical workflows?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=UX-VISUAL-01
- kind=module_role | pattern_id=UX-DENSITY-01
- kind=structural_validation | pattern_id=UX-RECOVERY-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-90-ux-polish
title: Apply bounded UX polish across primary surfaces
required_capability: ux_frontend_realization
worker_id: worker-ux-frontend
depends_on:
  - UX-TG-30-detail-review-report-surface
  - UX-TG-40-collections-and-sharing-surface
  - UX-TG-50-admin-and-activity-surface
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
steps:
  - Harmonize spacing, typography, status chips, and panel hierarchy across dashboard, catalog, collections, activity, and admin.
  - Improve loading/empty/error/deny microcopy for trust and scanability without novelty motion.
  - Tighten keyboard and focus behavior for medium-density operational usage.
  - Validate visual continuity between worklist, detail, publish, and admin journeys.
definition_of_done:
  - UX polish improves clarity and continuity across all declared main surfaces without adding new product scope.
  - Empty/loading/error/deny states are consistent, readable, and aligned with recovery posture.
  - Interaction density and focus behavior support keyboard-friendly desktop operation.
  - Motion and decoration remain restrained in governance-critical flows.
semantic_review:
  severity_threshold: high
  review_questions:
    - Does polish improve coherence and readability across all main surfaces rather than only isolated screens?
    - Are state and recovery cues consistent and trustworthy across list, detail, publish, and admin contexts?
    - Is visual motion restrained and appropriate for governance-critical workflows?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: UX-VISUAL-01
  -
    anchor_kind: module_role
    pattern_id: UX-DENSITY-01
  -
    anchor_kind: structural_validation
    pattern_id: UX-RECOVERY-01
```

## Wave 7

### UX-TG-92-ux-service-packaging — Package richer UX lane as separate service wiring

- required_capability: `ux_service_packaging_wiring`
- worker_id: `worker-runtime-wiring`
- depends_on: `UX-TG-90-ux-polish`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md`

**Steps:**
- Materialize separate UX runtime packaging posture so richer UX lane does not collide with smoke-test UI lane.
- Preserve contract-compatible AP/CP integration boundaries and current stack assumptions.
- Ensure UX service wiring supports deployment_preference separate_ui_service.
- Keep packaging notes explicit for local compose operation.

**Definition of Done:**
- Richer UX lane is packaged and wired as a separate UI service path consistent with resolved profile pins.
- Packaging and wiring maintain compatibility with existing REST/AP/CP contract boundaries.
- UX service wiring remains clearly separated from smoke-test UI lane assets and control surfaces.
- Operator-facing runtime posture for UX service startup is clear and reproducible.

**Semantic review questions:**
- Does UX packaging preserve separate service posture without mutating the smoke-test lane?
- Are AP/CP interface assumptions unchanged and contract-compatible after UX service wiring?
- Is the local runtime startup posture for the richer UX lane explicit and consistent?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=profile_pin:ui.deployment_preference=separate_ui_service
- kind=module_role | pattern_id=UX-SESSION-01
- kind=structural_validation | pattern_id=UX-EXPLAIN-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-92-ux-service-packaging
title: Package richer UX lane as separate service wiring
required_capability: ux_service_packaging_wiring
worker_id: worker-runtime-wiring
depends_on:
  - UX-TG-90-ux-polish
inputs:
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/ux_visual_system_v1.md
    required: required
steps:
  - Materialize separate UX runtime packaging posture so richer UX lane does not collide with smoke-test UI lane.
  - Preserve contract-compatible AP/CP integration boundaries and current stack assumptions.
  - Ensure UX service wiring supports deployment_preference separate_ui_service.
  - Keep packaging notes explicit for local compose operation.
definition_of_done:
  - Richer UX lane is packaged and wired as a separate UI service path consistent with resolved profile pins.
  - Packaging and wiring maintain compatibility with existing REST/AP/CP contract boundaries.
  - UX service wiring remains clearly separated from smoke-test UI lane assets and control surfaces.
  - Operator-facing runtime posture for UX service startup is clear and reproducible.
semantic_review:
  severity_threshold: blocker
  review_questions:
    - Does UX packaging preserve separate service posture without mutating the smoke-test lane?
    - Are AP/CP interface assumptions unchanged and contract-compatible after UX service wiring?
    - Is the local runtime startup posture for the richer UX lane explicit and consistent?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: profile_pin:ui.deployment_preference=separate_ui_service
  -
    anchor_kind: module_role
    pattern_id: UX-SESSION-01
  -
    anchor_kind: structural_validation
    pattern_id: UX-EXPLAIN-01
```

## Wave 8

### UX-TG-95-ux-operator-notes — Produce truthful UX operator notes for bounded realization lane

- required_capability: `repo_documentation`
- worker_id: `worker-tech-writer`
- depends_on: `UX-TG-92-ux-service-packaging`

**Inputs (paths only; open as needed):**
- (required) `reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml`
- (required) `reference_architectures/codex-saas/design/playbook/ux_design_v1.md`
- (required) `reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md`
- (required) `reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml`

**Steps:**
- Document how to access the richer UX lane and which primary actions are expected to be verifiable.
- Describe demo posture truthfully, including fixed persona assumptions when dynamic persona switching is not implemented.
- Document known bounded scope exclusions and deferred flows explicitly.
- Provide operator validation checks for create, publish, manage-roles, and activity visibility outcomes.

**Definition of Done:**
- Operator notes describe only controls and flows that the bounded UX lane actually realizes.
- Persona and session posture are documented honestly, with fixed demo assumptions made explicit when applicable.
- Deferred or out-of-scope behaviors are clearly called out rather than implied as available.
- Validation checklist covers Create Widget, Publish Collection, Manage Roles, and Activity History outcomes.

**Semantic review questions:**
- Are operator notes runtime-truthful and free of aspirational controls not present in the bounded UX lane?
- Do notes clearly distinguish implemented behaviors from deferred or out-of-scope flows?
- Is the validation checklist aligned with declared primary actions and main surfaces?

**Trace anchors (compact):**
- kind=plan_step_archetype | pattern_id=product_surface:primary-actions
- kind=module_role | pattern_id=UX-EXPLAIN-01
- kind=structural_validation | pattern_id=UX-RECOVERY-01

**Dispatch packet (copy into worker prompt):**

```yaml
task_id: UX-TG-95-ux-operator-notes
title: Produce truthful UX operator notes for bounded realization lane
required_capability: repo_documentation
worker_id: worker-tech-writer
depends_on:
  - UX-TG-92-ux-service-packaging
inputs:
  - path: reference_architectures/codex-saas/design/playbook/ux_task_graph_v1.yaml
    required: required
  - path: reference_architectures/codex-saas/design/playbook/ux_design_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
    required: required
  - path: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
    required: required
steps:
  - Document how to access the richer UX lane and which primary actions are expected to be verifiable.
  - Describe demo posture truthfully, including fixed persona assumptions when dynamic persona switching is not implemented.
  - Document known bounded scope exclusions and deferred flows explicitly.
  - Provide operator validation checks for create, publish, manage-roles, and activity visibility outcomes.
definition_of_done:
  - Operator notes describe only controls and flows that the bounded UX lane actually realizes.
  - Persona and session posture are documented honestly, with fixed demo assumptions made explicit when applicable.
  - Deferred or out-of-scope behaviors are clearly called out rather than implied as available.
  - Validation checklist covers Create Widget, Publish Collection, Manage Roles, and Activity History outcomes.
semantic_review:
  severity_threshold: high
  review_questions:
    - Are operator notes runtime-truthful and free of aspirational controls not present in the bounded UX lane?
    - Do notes clearly distinguish implemented behaviors from deferred or out-of-scope flows?
    - Is the validation checklist aligned with declared primary actions and main surfaces?
trace_anchors:
  -
    anchor_kind: plan_step_archetype
    pattern_id: product_surface:primary-actions
  -
    anchor_kind: module_role
    pattern_id: UX-EXPLAIN-01
  -
    anchor_kind: structural_validation
    pattern_id: UX-RECOVERY-01
```
