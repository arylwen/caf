### HIGH-1: UX-WORKLIST-01 - Operational Worklist and Triage Surface (confidence: high)
**Evidence:**
- E1 [pinned_input] Product surface requires a searchable widget catalog with tenant-scoped filters and status visibility.
- E2 [pinned_input] Primary journeys begin in dashboard and catalog workspaces with one-click actions.
- E3 [pattern_definition] UX-WORKLIST-01 maps directly to queue-like worklist triage and status counts.
**Rationale:** Core operator flow depends on a strong list-first triage surface.

### HIGH-2: UX-CRUD-01 - List-Detail-Edit Flow (confidence: high)
**Evidence:**
- E1 [pinned_input] CAP-001 requires create/edit/save widget behavior with validation and stable identifiers.
- E2 [pinned_input] UX core journey `widget-lifecycle` anchors list to detail to edit transitions.
- E3 [pattern_definition] UX-CRUD-01 defines draft-safe list-detail-edit mechanics.
**Rationale:** Widget lifecycle is the product center, so CRUD detail flow is mandatory.

### HIGH-3: UX-SEARCH-01 - Search, Filter, and Sort Workspace (confidence: high)
**Evidence:**
- E1 [pinned_input] Widget catalog surface requires searchable/sortable list with tenant-scoped filters.
- E2 [pinned_input] UX pressure `search_filter_sort` is marked high priority.
- E3 [pattern_definition] UX-SEARCH-01 covers faceted filtering, saved views, and no-results handling.
**Rationale:** Fast discovery and narrowing are prerequisites for all widget and collection actions.

### HIGH-4: UX-REVIEW-01 - Review and Approval Workspace (confidence: high)
**Evidence:**
- E1 [pinned_input] CAP-003 publish flow requires role-targeted permissions and confirmation.
- E2 [pinned_input] UX pressure `review_approval` is high priority for publish decisions.
- E3 [pattern_definition] UX-REVIEW-01 captures explicit approval/denial rationale posture.
**Rationale:** Publish decisions are consequential and require review-grade clarity.

### HIGH-5: UX-SESSION-01 - Session, Role, and Tenant-Aware Browser Posture (confidence: high)
**Evidence:**
- E1 [pinned_input] UI posture requires tenant and role consequences to remain visible.
- E2 [pinned_input] Product constraints require explicit tenant isolation in user-facing flows.
- E3 [pattern_definition] UX-SESSION-01 enforces role-aware navigation and session-expiry consequences.
**Rationale:** Tenant/role context visibility is a first-class UX safety rail.

### HIGH-6: UX-RECOVERY-01 - Empty, Error, and Recovery Guidance (confidence: high)
**Evidence:**
- E1 [pinned_input] UX state/recovery requires explicit empty/loading/error/deny states.
- E2 [pinned_input] Fail-closed posture requires non-destructive deny and retry-safe guidance.
- E3 [pattern_definition] UX-RECOVERY-01 codifies recovery and remediation guidance.
**Rationale:** Reliability and trust depend on clear recovery behavior.

### HIGH-7: UX-EXPLAIN-01 - Auditability and Explainability Surface (confidence: high)
**Evidence:**
- E1 [pinned_input] Activity/audit visibility is explicitly first-class in product constraints.
- E2 [pinned_input] Admin and publish journeys require visible request/decision/outcome continuity.
- E3 [pattern_definition] UX-EXPLAIN-01 provides explainability and evidence presentation posture.
**Rationale:** Governance-focused product value requires explainable outcomes in the UI.

### HIGH-8: UX-VISUAL-01 - Calm Operational Shell and Visual Hierarchy (confidence: high)
**Evidence:**
- E1 [pinned_input] UX vision calls for calm operational shell and medium-density readability.
- E2 [pinned_input] Visual direction requires persistent navigation shell and restrained accents.
- E3 [pattern_definition] UX-VISUAL-01 targets polished but calm shell hierarchy.
**Rationale:** The richer UX lane must be visibly stronger than smoke-test UI without visual noise.

### MEDIUM-9: UX-DENSITY-01 - Dense Panel, Card, and Toolbar Rhythm (confidence: medium)
**Evidence:**
- E1 [pinned_input] UX vision sets a medium-dense desktop workspace bias.
- E2 [pinned_input] Product surfaces include dashboard, catalog, collections, activity, and admin.
- E3 [pattern_definition] UX-DENSITY-01 supports dense but readable panel rhythm.
**Rationale:** Density rhythm improves operational scanability across multiple surfaces.

### MEDIUM-10: UX-REPORT-01 - Editorial Findings and Report Composition (confidence: medium)
**Evidence:**
- E1 [pinned_input] Report readability and history scanning are explicit UX brief signals.
- E2 [pinned_input] Activity history surface should feel editorial and easy to scan.
- E3 [pattern_definition] UX-REPORT-01 captures summary-first readability patterns.
**Rationale:** Timeline and evidence-oriented views benefit from editorial composition patterns.

### MEDIUM-11: EXT-BACKEND_FOR_FRONTEND_BFF - Backend-for-Frontend (BFF) (confidence: medium)
**Evidence:**
- E1 [pinned_input] UI posture and planning payload adopt a thin BFF option.
- E2 [pinned_input] UX journeys need composed list/detail/admin reads with reduced chatty calls.
- E3 [pattern_definition] EXT-BACKEND_FOR_FRONTEND_BFF addresses UI-tailored contract shaping.
**Rationale:** Thin BFF posture supports richer UX without changing core API ownership.

### MEDIUM-12: CTX-01 - Request Context and Propagation (confidence: medium)
**Evidence:**
- E1 [pinned_input] Tenant and principal context must remain visible and consistent across flows.
- E2 [pinned_input] CP/AP contracts rely on stable context carriers for policy outcomes.
- E3 [pattern_definition] CTX-01 defines context propagation boundaries.
**Rationale:** UX role-aware behavior depends on reliable context propagation semantics.

### MEDIUM-13: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Evidence:**
- E1 [pinned_input] CAP-001 and admin flows require validation clarity before persistence.
- E2 [pinned_input] Fail-closed posture requires explicit deny/reject contracts.
- E3 [pattern_definition] VAL-01 codifies consistent validation and error boundary behavior.
**Rationale:** UX recovery and trust rely on stable validation/error semantics.

### MEDIUM-14: EXT-AUDITABILITY - Auditability (confidence: medium)
**Evidence:**
- E1 [pinned_input] Product value includes audit-friendly activity history and exportable evidence.
- E2 [pinned_input] Platform posture requires immediate decision/execution evidence.
- E3 [pattern_definition] EXT-AUDITABILITY defines traceable cross-plane audit posture.
**Rationale:** UX audit views need external auditability constraints to stay grounded.

### MEDIUM-15: UX-ASYNC-01 - Async Job Progress and Result Surface (confidence: medium)
**Evidence:**
- E1 [pinned_input] Graph expansion opened UX-ASYNC-01 from UX-RECOVERY-01 complement relation.
- E2 [pinned_input] Recovery model includes loading, retry, and explicit outcome states.
- E3 [pattern_definition] UX-ASYNC-01 structures pending/running/completed/failed UX feedback.
**Rationale:** Async progress patterns strengthen recovery quality for operations with delayed outcomes.

### MEDIUM-16: EXT-GRACEFUL_DEGRADATION - Graceful Degradation (confidence: medium)
**Evidence:**
- E1 [pinned_input] Graph expansion opened EXT-GRACEFUL_DEGRADATION from UX-RECOVERY-01 dependency.
- E2 [pinned_input] UX constraints require non-destructive failure handling and retry-safe actions.
- E3 [pattern_definition] EXT-GRACEFUL_DEGRADATION defines reduced-fidelity behavior under partial failure.
**Rationale:** Graceful fallback posture complements fail-closed behavior for user trust.

### MEDIUM-17: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Evidence:**
- E1 [pinned_input] Graph expansion opened CAF-IAM-01 from UX-SESSION-01 dependency.
- E2 [pinned_input] Session and role-aware UX relies on consistent principal semantics.
- E3 [pattern_definition] CAF-IAM-01 clarifies identity taxonomy across governance and UX touchpoints.
**Rationale:** Identity taxonomy grounding helps keep role-aware UX behavior coherent.

### MEDIUM-18: EXT-API_COMPOSITION_AGGREGATOR - API Composition / Aggregator (confidence: medium)
**Evidence:**
- E1 [pinned_input] Graph expansion opened EXT-API_COMPOSITION_AGGREGATOR from CTX-01 complement relation.
- E2 [pinned_input] UX journeys require composed reads to avoid multi-call UI stitching.
- E3 [pattern_definition] EXT-API_COMPOSITION_AGGREGATOR supports bounded fan-in response composition.
**Rationale:** Aggregation posture improves journey continuity while keeping REST contract style.
