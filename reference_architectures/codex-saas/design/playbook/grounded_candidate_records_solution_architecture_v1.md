### H-1: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context is resolved once at ingress and propagated immutably (`pin_ref: AP-1=Ingress-Bound Context`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Agent context is session-scoped and tenant-scoped (`pin_ref: AI-4=Session-Scoped Context Only`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern codifies cross-plane tenant context propagation (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml).
**Rationale:** Tenant context propagation is foundational for every authorization and data access decision in this instance.
**Implications:** Require explicit tenant/principal/correlation carriers in CP<->AP and AP<->DP contracts.

### H-2: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Isolation is required in shared infrastructure (`pin_ref: DP-1=Logical Isolation (Enforced)`; `pin_ref: ST-1=Shared Storage with Logical Isolation`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Storage identity is tenant-keyed and partitioned (`pin_ref: ST-2=Tenant-Keyed Primary Addressing`; `pin_ref: ST-3=Tenant-Partitioned Placement`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern anchors tenancy as a system invariant (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml).
**Rationale:** Multi-tenancy and isolation are hard constraints from the architecture pins and PRD scope.
**Implications:** Enforce tenant scope in every repository, query, and permission boundary.

### H-3: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control plane is authoritative for governance lifecycle (`pin_ref: CP-2=Authoritative Lifecycle Owner`; `pin_ref: CP-6=Unified Governance Integration`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Application plane orchestrates requests and agent invocation only (`pin_ref: AP-5=Agent Invocation Only`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Data plane enforces access/retention while hosting governed inputs/outputs (`pin_ref: DP-3=Access + Retention + Lineage Enforcement`; `pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern defines CP/AP/DP responsibility boundaries (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml).
**Rationale:** The selected plane runtime shapes require explicit authority separation.
**Implications:** Keep policy and safety lifecycle in CP, orchestration in AP, and persistence governance in DP/ST.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Safety gates run before invocation and side effects (`pin_ref: AP-4=Pre-Invocation Safety Gates`; `pin_ref: AI-5=Pre-Action Safety Gates`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Agent authority is policy-derived and pre-evaluated (`pin_ref: AI-2=Policy-Derived Authority`; `pin_ref: AI-3=Pre-Invocation Evaluation Only`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern separates governance ownership from runtime execution (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml).
**Rationale:** AI invocation must be governance-bounded for this fail-closed posture.
**Implications:** Keep CP-governed policy/safety definitions as required AP preconditions.

### H-5: CAF-COMP-01 - Evidence Generation and Traceability (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Evidence emission is synchronous across AI/AP/DP/ST (`pin_ref: AI-6=Synchronous Evidence Emission`; `pin_ref: AP-6=Synchronous Emission`; `pin_ref: DP-5=Inline Evidence Emission`; `pin_ref: ST-6=Inline Evidence Emission`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [derived_rails_or_posture] Refusal posture is fail-closed (`rail_ref: refusal_posture=fail_closed`; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E3 [pattern_definition] Pattern requires traceable runtime evidence behavior (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml).
**Rationale:** Compliance and auditability are explicit product/system requirements.
**Implications:** Define a shared event schema and correlation strategy for all decision and mutation paths.

### H-6: CTX-01 - Request Context and Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Context is ingress-bound and immutable (`pin_ref: AP-1=Ingress-Bound Context`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Control-plane policies and identities require stable context carriers (`pin_ref: CP-1=Declarative + Evaluative`; `pin_ref: CP-3=Human, Service, and Agent Identity Governance`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern defines request context propagation contract (cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml).
**Rationale:** Context propagation is a prerequisite for policy and data isolation correctness.
**Implications:** Standardize tenant/user/correlation context in boundary contracts.

### M-7: POL-01 - Policy Enforcement Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy lifecycle and authoring are centralized in CP (`pin_ref: CP-4=Centralized Policy Authoring`; `pin_ref: CP-5=Centralized Safety Gate Orchestration`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] AP authorization checks are inline at execution boundaries (`pin_ref: AP-2=Inline Enforcement`; `pin_ref: AP-3=Pre-Execution Evaluation`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern defines the policy decision/enforcement boundary (cite: architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml).
**Rationale:** CP ownership plus AP enforcement needs explicit PDP/PEP boundaries.
**Implications:** Bind enforcement calls to versioned policy decisions.

### M-8: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Data access must enforce tenant boundaries (`pin_ref: DP-2=Data-Access-Layer Enforcement`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Storage lifecycle obligations include retention/deletion and tenant-scoped backup (`pin_ref: ST-4=Retention + Hard Deletion`; `pin_ref: ST-5=Tenant-Scoped Backup and Restore`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern defines repository boundary over persistence concerns (cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml).
**Rationale:** Application repositories should encapsulate tenant-safe persistence and lifecycle constraints.
**Implications:** Use tenant-keyed repository ports and explicit retention semantics.

### M-9: SVC-01 - Application Service Facade Boundary (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] AP is the orchestrating service surface (`pin_ref: AP-5=Agent Invocation Only`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [spec_excerpt] Product flows require explicit service entry points for widget, collection, sharing, and tenant-admin capabilities (cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md).
- E3 [pattern_definition] Pattern defines service-facade boundary semantics (cite: architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml).
**Rationale:** A use-case service facade supports consistent policy/safety hooks and orchestration.
**Implications:** Expose stable application services per primary journey.

### M-10: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Pre-execution and pre-invocation checks require deterministic validation paths (`pin_ref: AP-3=Pre-Execution Evaluation`; `pin_ref: AI-3=Pre-Invocation Evaluation Only`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [derived_rails_or_posture] Fail-closed refusal posture requires explicit reject semantics (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E3 [pattern_definition] Pattern defines validation and error boundary behavior (cite: architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml).
**Rationale:** Validation and error contracts are required for safe denial behavior.
**Implications:** Standardize validation envelopes and rejection event semantics.

### M-11: CAF-AIOBS-01 - AI Observability Hooks (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Evidence/telemetry must be emitted inline (`pin_ref: AI-6=Synchronous Evidence Emission`; `pin_ref: AP-6=Synchronous Emission`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Unified governance needs cross-plane observability correlation (`pin_ref: CP-6=Unified Governance Integration`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern defines AI observability hook levels (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml).
**Rationale:** Agent execution needs structured observability tied to governance context.
**Implications:** Capture correlation IDs and structured trace metadata for policy and tool actions.

### M-12: CAF-POL-01 - Policy as a First-Class System Artifact (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP owns policy definition and lifecycle (`pin_ref: CP-1=Declarative + Evaluative`; `pin_ref: CP-4=Centralized Policy Authoring`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Agent authority and AP enforcement consume policy outcomes (`pin_ref: AI-2=Policy-Derived Authority`; `pin_ref: AP-2=Inline Enforcement`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern treats policy as explicit system artifact (cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml).
**Rationale:** Policy artifacts need first-class lifecycle, versioning, and distribution semantics.
**Implications:** Keep policy version references in governance and enforcement contracts.

### M-13: EXT-API_GATEWAY - API Gateway (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP/AP runtime surfaces are HTTP API services and enforce ingress controls (`pin_ref: AP-2=Inline Enforcement`; `pin_ref: CP-5=Centralized Safety Gate Orchestration`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [spec_excerpt] System constraints call for fail-closed tenant-context ingress and synchronized policy/safety checks (cite: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md).
- E3 [pattern_definition] Graph-expanded external edge pattern for ingress policy enforcement (cite: architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml).
**Rationale:** A governed ingress boundary complements control-plane policy orchestration.
**Implications:** Define ingress authentication, routing, and enforcement hooks with tenant context propagation.

### M-14: EXT-BACKEND_FOR_FRONTEND_BFF - Backend-for-Frontend (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] UI posture is web SPA with separate UX service preference (`rail_ref: ui.kind=web_spa`; `rail_ref: ui.deployment_preference=separate_ui_service`; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E2 [spec_excerpt] Product surfaces include dashboard, catalog, collections, activity, and admin flows requiring UI-tailored composition (cite: reference_architectures/codex-saas/spec/playbook/application_product_surface_v1.md).
- E3 [pattern_definition] Graph-expanded external UI integration boundary pattern (cite: architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml).
**Rationale:** UI-specific response shaping can reduce coupling between SPA and domain services.
**Implications:** Define BFF contracts aligned to core journeys and policy/safety context propagation.

### M-15: EXT-CIRCUIT_BREAKER - Circuit Breaker (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Fail-closed posture and synchronous checks require bounded dependency failure behavior (`rail_ref: refusal_posture=fail_closed`; `pin_ref: AP-3=Pre-Execution Evaluation`; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E2 [spec_excerpt] Operational constraints prioritize reliability and auditable outcomes over complex automation (cite: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md).
- E3 [pattern_definition] Graph-expanded resilience boundary pattern (cite: architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml).
**Rationale:** Controlled failure handling prevents cascading faults across governed boundaries.
**Implications:** Define timeout, trip, and recovery policy contracts at integration edges.

### M-16: EXT-AUDITABILITY - Auditability (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Inline evidence emission is required across planes (`pin_ref: AI-6=Synchronous Evidence Emission`; `pin_ref: AP-6=Synchronous Emission`; `pin_ref: DP-5=Inline Evidence Emission`; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [spec_excerpt] Product and system domains both require auditable activity and governance events (cite: reference_architectures/codex-saas/spec/playbook/application_domain_model_v1.md).
- E3 [pattern_definition] Graph-expanded external auditability pattern (cite: architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml).
**Rationale:** Auditability strengthens existing CAF evidence commitments with explicit operational posture.
**Implications:** Align event retention, correlation, and inspection workflows across AP/CP/DP.