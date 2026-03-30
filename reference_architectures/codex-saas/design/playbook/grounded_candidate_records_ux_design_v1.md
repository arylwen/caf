### H-1: UX-CRUD-01 - List-Detail-Edit Flow (confidence: HIGH)
- **Plane:** application
- **Rationale:** Core widget create/edit maintenance is the highest-frequency user job and needs resilient list-detail-edit continuity with validation-safe recovery.
**Evidence:**
- E1 [instance_signal] Core journeys emphasize create/edit widgets with validation and save confirmation. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [pattern_definition] UX-CRUD-01 encodes list-detail-edit and dirty-state handling for resource maintenance. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-crud-01.yaml

### H-2: UX-SEARCH-01 - Search, Filter, and Sort Workspace (confidence: HIGH)
- **Plane:** application
- **Rationale:** Widget catalog and collection operations depend on strong filtering, sorting, and query clarity.
**Evidence:**
- E1 [instance_signal] Product surface requires searchable widget catalog with tenant-safe filters and tags. cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- E2 [pattern_definition] UX-SEARCH-01 provides search/filter/sort and query persistence posture. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-search-01.yaml

### H-3: UX-WORKLIST-01 - Operational Worklist and Triage Surface (confidence: HIGH)
- **Plane:** application
- **Rationale:** The primary operator flow is worklist-driven and needs triage-ready status and row actions.
**Evidence:**
- E1 [instance_signal] Main surfaces include dashboard, catalog, activity, and one-click primary actions. cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- E2 [pattern_definition] UX-WORKLIST-01 defines operational worklist and triage behaviors. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-worklist-01.yaml

### H-4: UX-REVIEW-01 - Review and Approval Workspace (confidence: HIGH)
- **Plane:** application
- **Rationale:** Publish and permission changes are consequential and require explicit review/confirmation posture.
**Evidence:**
- E1 [instance_signal] Sharing flows require explicit and confirmable role-based publish/access changes. cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- E2 [pattern_definition] UX-REVIEW-01 captures decision rationale and approval/reject workspace behavior. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-review-01.yaml

### H-5: UX-SESSION-01 - Session, Role, and Tenant-Aware Browser Posture (confidence: HIGH)
- **Plane:** application
- **Rationale:** Tenant context and role consequences must remain visible in primary navigation and action flows.
**Evidence:**
- E1 [instance_signal] UX constraints require visible tenant context and role visibility near publish/share actions. cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- E2 [pattern_definition] UX-SESSION-01 defines role-aware navigation and tenant/session-visible browser posture. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-session-01.yaml

### H-6: UX-RECOVERY-01 - Empty, Error, and Recovery Guidance (confidence: HIGH)
- **Plane:** application
- **Rationale:** Reliable recovery is required across validation failures, permission denials, and transient save issues.
**Evidence:**
- E1 [instance_signal] State model requires explicit empty/loading/error/retry and keep-input-on-failure behavior. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [pattern_definition] UX-RECOVERY-01 provides recovery/partial-failure guidance patterns. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-recovery-01.yaml

### H-7: UX-EXPLAIN-01 - Auditability and Explainability Surface (confidence: HIGH)
- **Plane:** application
- **Rationale:** Activity and evidence readability are explicit product value signals for trust.
**Evidence:**
- E1 [instance_signal] Product value proposition includes audit-friendly activity history and quick traceability. cite: reference_architectures/codex-saas/product/PRD.resolved.md
- E2 [pattern_definition] UX-EXPLAIN-01 formalizes explainability and evidence-surface posture. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-explain-01.yaml

### H-8: UX-VISUAL-01 - Calm Operational Shell and Visual Hierarchy (confidence: HIGH)
- **Plane:** application
- **Rationale:** UX lane explicitly targets a calm operational shell with restrained accents and clear hierarchy.
**Evidence:**
- E1 [instance_signal] UX vision and semantic projection require calm operational shell and readable hierarchy. cite: reference_architectures/codex-saas/product/UX_VISION.md
- E2 [pattern_definition] UX-VISUAL-01 captures shell hierarchy and polished but calm visual posture. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-visual-01.yaml

### H-9: UX-DENSITY-01 - Dense Panel, Card, and Toolbar Rhythm (confidence: HIGH)
- **Plane:** application
- **Rationale:** Medium-dense desktop workspace and data-heavy views require deliberate density rhythm.
**Evidence:**
- E1 [instance_signal] UX cues call for medium-density workspace with readable list/table posture. cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- E2 [pattern_definition] UX-DENSITY-01 defines dense panel/card/toolbar rhythm. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-density-01.yaml

### H-10: EXT-AUDITABILITY - Auditability (confidence: HIGH)
- **Plane:** control
- **Rationale:** Cross-surface activity and exportability expectations require auditable event trace posture visible to users.
**Evidence:**
- E1 [instance_signal] PRD and platform brief require immediate evidence and audit trail per action and outcome. cite: reference_architectures/codex-saas/product/PLATFORM_PRD.resolved.md
- E2 [pattern_definition] EXT-AUDITABILITY provides tenant-scoped audit trail and traceability expectations. cite: architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml

### H-11: EXT-SECURITY_TRIMMING - Security Trimming (confidence: HIGH)
- **Plane:** both
- **Rationale:** Role-aware publish and admin surfaces need visibility trimming driven by permissions.
**Evidence:**
- E1 [instance_signal] Sharing and admin flows rely on role-based access and visibility constraints. cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md
- E2 [pattern_definition] EXT-SECURITY_TRIMMING aligns result visibility with permission posture. cite: architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml

### M-12: EXT-GRACEFUL_DEGRADATION - Graceful Degradation (confidence: MEDIUM)
- **Plane:** both
- **Rationale:** The UX state model needs clear behavior under partial failures without hard-stop breakage.
**Evidence:**
- E1 [instance_signal] Recovery principles call for retry-safe actions and stable committed-state visibility on failures. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [pattern_definition] EXT-GRACEFUL_DEGRADATION provides reduced-fidelity fallback posture under dependency issues. cite: architecture_library/patterns/external_v1/definitions_v1/ext-graceful_degradation.yaml

### M-13: VAL-01 - Validation and Error Handling Boundary (confidence: MEDIUM)
- **Plane:** both
- **Rationale:** CAP-001/CAP-004 flows require deterministic validation feedback and stable rejection handling.
**Evidence:**
- E1 [instance_signal] Core journeys include inline validation, explicit denials, and correction paths. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [graph_expansion] VAL-01 was pulled as a direct dependency of UX-CRUD-01. cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_ux_design_v1.yaml
- E3 [pattern_definition] VAL-01 encodes boundary-level validation and error-shape handling. cite: architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml

### M-14: UX-ASYNC-01 - Async Job Progress and Result Surface (confidence: MEDIUM)
- **Plane:** application
- **Rationale:** Activity exports, policy-driven operations, and potential delayed updates benefit from explicit pending/running/completed/failed posture.
**Evidence:**
- E1 [instance_signal] UX state model includes publish_pending and publish_complete states with retry-safe recovery. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [graph_expansion] UX-ASYNC-01 was opened as a complement to UX-RECOVERY-01. cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_ux_design_v1.yaml
- E3 [pattern_definition] UX-ASYNC-01 provides explicit long-running progress/result UX posture. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-async-01.yaml

### M-15: UX-REPORT-01 - Editorial Findings and Report Composition (confidence: MEDIUM)
- **Plane:** application
- **Rationale:** Activity and evidence views should remain editorially readable for operator and admin review.
**Evidence:**
- E1 [instance_signal] UX direction asks for readable timeline/report posture and scan-friendly summaries. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [graph_expansion] UX-REPORT-01 was opened as a complement to UX-VISUAL-01. cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_ux_design_v1.yaml
- E3 [pattern_definition] UX-REPORT-01 captures summary-first editorial report composition. cite: architecture_library/patterns/ux_v1/definitions_v1/ux-report-01.yaml

### M-16: EXT-MATERIALIZED_VIEW - Materialized View (confidence: MEDIUM)
- **Plane:** both
- **Rationale:** Fast and stable filtered catalogs often need pre-shaped read models to avoid chatty or expensive UI-driven query composition.
**Evidence:**
- E1 [instance_signal] Search/filter/sort pressure and detail hydration expectations are explicit in interface contract pressures. cite: reference_architectures/codex-saas/design/playbook/retrieval_context_blob_ux_design_v1.md
- E2 [graph_expansion] EXT-MATERIALIZED_VIEW was opened as a dependency of UX-SEARCH-01. cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_ux_design_v1.yaml
- E3 [pattern_definition] EXT-MATERIALIZED_VIEW defines pre-composed read model posture for query-heavy surfaces. cite: architecture_library/patterns/external_v1/definitions_v1/ext-materialized_view.yaml
