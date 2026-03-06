### H-1: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] CP and AP are both pinned to api_service_http while DP responsibilities remain distinct (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP is pinned to host inputs/outputs while AP is pinned to agent invocation responsibilities (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Generation phase remains implementation_scaffolding with no architecture-shape mutation allowed (rail_ref: lifecycle.generation_phase=implementation_scaffolding; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** The active pins enforce explicit separation of CP/AP/DP ownership.

### H-2: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context is established at ingress and immutable through AP execution (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Agent context is constrained to session-scoped retrieval and tenant-scoped data (pin_ref: AI-4=Session-Scoped Context Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Data access must enforce tenant scope at the access boundary (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Tenant context propagation is mandatory across AP, AI, and DP boundaries.

### H-3: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Isolation model is logical and fail-closed for tenant access (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Storage is tenant-keyed and tenant-partitioned by default (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Storage placement explicitly partitions by tenant identity (pin_ref: ST-3=Tenant-Partitioned Placement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Multi-tenancy must be explicit in contracts and persistence boundaries.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tool invocation requires pre-invocation evaluation and safety gates (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Safety gate definitions and escalation are centrally orchestrated by CP (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] AP enforces safety checks before invocation at runtime boundaries (pin_ref: AP-4=Pre-Invocation Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Governance and runtime enforcement responsibilities are intentionally split across planes.

### H-5: CAF-IAM-02 - Identity and Context Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent identity is single-principal per execution session (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Authority is policy-derived from identity and tenant context (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] CP governs identity lifecycle for human, service, and agent principals (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Identity and context fields must remain explicit at cross-plane boundaries.

### H-6: POL-01 - Policy Enforcement Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy authoring/versioning is centralized in CP (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP evaluates policy before execution starts (pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Refusal posture is fail_closed and forbids bypassing safety/policy gates (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Policy intent ownership and enforcement points must be explicit and auditable.

### H-7: OBS-01 - Observability Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] AI decisions and actions require synchronous evidence emission (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP emits telemetry and evidence inline with execution flow (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] DP and storage access events are also synchronously auditable (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Cross-plane operations require a shared observability envelope and correlation semantics.

### H-8: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] CP governance integration requires controlled interaction contracts into AP and DP surfaces (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP is constrained to data responsibilities while AP handles invocation flows (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] AP enforces inline authorization for all request/workflow execution (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Cross-plane interaction modes must be explicit, bounded, and deny unsupported crossings.

### H-9: CTX-01 - Request Context and Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Ingress establishes immutable tenant context for each AP request (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] CP lifecycle authority requires context carriers that support auditable transitions (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Policy/evaluation model in CP requires stable context metadata across boundaries (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Request context propagation is foundational for tenancy, policy, and traceability.

### H-10: VAL-01 - Validation and Error Handling Boundary (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP inline enforcement requires deterministic validation before side effects (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AI invocations require pre-invocation checks and fail-closed rejection behavior (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Placeholder leakage is disallowed under fail_closed guardrails (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Validation and error contracts must be explicit at ingress and cross-plane boundaries.

### M-11: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Tenant scope must be enforced at data access boundaries (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Tenant-keyed addressing is required for persisted objects (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Runtime pins are Python/FastAPI with Postgres for implementation scaffolding (rail_ref: runtime.framework=fastapi; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Repository boundaries isolate persistence concerns while preserving tenant guarantees.

### M-12: CAF-EDGE-01 - Backend-for-Frontend (BFF) / API Composition Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [spec_excerpt] UI requirements specify `web_spa` with `separate_ui_service`, signaling a dedicated UI-facing boundary (ref: ui_requirements_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] AP runtime shape is api_service_http, compatible with API composition at the UI edge (pin_ref: planes.ap.runtime_shape=api_service_http; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** A BFF/API composition boundary stabilizes UI contracts without changing plane authority.

### M-13: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP governs identities for human, service, and agent principals (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP authorization depends on explicit principal and tenant membership context (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Principal taxonomy should be explicit to keep policy and audit behavior deterministic.

### M-14: CAF-MTEN-ANTI-01 - Multi-Tenant Isolation Anti-Patterns to Avoid (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant-scoped backup/restore is required and cannot leak cross-tenant state (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Retention and hard deletion obligations require tenant-specific lifecycle enforcement (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Explicit anti-pattern guidance prevents accidental cross-tenant operations.

### M-15: CAF-MTEN-AGOBS-01 - Multi-Tenant Agent Observability Boundaries (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP and AI both require synchronous telemetry/evidence emission (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP and storage evidence signals must remain tenant-scoped (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Observability boundaries must enforce tenant-safe audit and correlation behavior.

### M-16: EXT-BACKEND_FOR_FRONTEND_BFF - Backend-for-Frontend (BFF) (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [spec_excerpt] UI signal explicitly calls for a React web SPA with separate UI deployment, which maps to a UI-specific facade pattern (ref: ui_requirements_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] AP runtime shape is HTTP service and supports a separate BFF boundary in implementation scaffolding (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** The instance has direct UI signals requiring a dedicated frontend-oriented API facade.

### M-17: EXT-API_COMPOSITION_AGGREGATOR - API Composition / Aggregator (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [spec_excerpt] The UI is deployed as a separate service, which benefits from composition of CP/AP data into UI-facing contracts (ref: ui_requirements_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] CP/AP split plus synchronous API surfaces imply explicit composition at boundary edges (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** API composition is needed to prevent UI coupling to internal plane contracts.

### M-18: EXT-API_GATEWAY - API Gateway (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP centrally authors policy and governs safety orchestration, which requires a stable ingress policy boundary (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [spec_excerpt] Tenant context is required at ingress for AP requests, favoring an ingress gateway that validates/request-shapes context (ref: intent_derived_app_plane_constraints_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
**Rationale:** An API gateway pattern grounds ingress policy/context enforcement without changing pinned runtime.

### M-19: EXT-AUDITABILITY - Auditability (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Synchronous evidence emission is required across AI/AP/DP/ST paths (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP governance includes lineage and retention constraints, requiring durable audit trails (pin_ref: DP-3=Access + Retention + Lineage Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Auditability is directly required by the pinned evidence and lineage obligations.
