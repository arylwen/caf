### H-1: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context and identity are pinned as ingress-bound and immutable: AP-1, AP-2, AI-4, AI-1, CP-3. (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] The run is fail-closed in architecture_scaffolding and requires explicit context-safe scaffolding boundaries. (rail_ref: lifecycle.generation_phase=architecture_scaffolding; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Canonical tenant-context propagation definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml)
**Rationale:** The pins and rails require tenant-scoped context propagation at every boundary. This pattern anchors the cross-plane context contract without introducing new technology choices.
**Implications:**
- Make tenant/principal context mandatory in AP and CP request contracts.
- Carry immutable context metadata through policy and evidence flows.

### H-2: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Multi-tenant isolation intent is explicit in DP and ST pins: DP-1, DP-2, ST-1, ST-2, ST-3, ST-5. (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF tenancy-first pattern definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml)
**Rationale:** The architecture shape is tenancy-first and requires deterministic tenant scoping for data and operations. This pattern prevents drift into implicit single-tenant assumptions.
**Implications:**
- Keep tenant keying explicit in domain model and repository boundaries.
- Preserve tenant isolation checks as fail-closed conditions.

### H-3: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Plane responsibilities are pinned via CP/AP/DP role sets and AP-5 plus DP-4 boundaries. (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Runtime shapes are explicitly cp=api_service_http and ap=api_service_http under phase guardrails. (rail_ref: planes.cp.runtime_shape=api_service_http; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Tri-plane separation definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml)
**Rationale:** The pinned intent is organized by control/application/data responsibilities. A tri-plane separation pattern is directly aligned with those constraints.
**Implications:**
- Keep CP governance paths distinct from AP execution paths.
- Keep DP persistence/governance enforcement distinct from AP orchestration logic.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AI safety and policy sequencing is pinned by AI-3, AI-5, AP-3, AP-4, and CP-5. (pin_ref: AI-5=Pre-Action Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF AI safety/governance separation definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml)
**Rationale:** Safety and policy checks are required before side effects and before agent/tool execution. This pattern keeps governance ownership clear while enabling AP execution.
**Implications:**
- Define pre-execution safety/policy checkpoints in AP entry flows.
- Keep safety rule authoring/orchestration in CP surfaces.

### H-5: CAF-COMP-01 - Evidence Generation and Traceability (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Synchronous evidence is pinned across planes: AI-6, AP-6, DP-5, ST-6, with lifecycle accountability from CP-2. (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Fail-closed posture and architecture scaffolding constraints require explicit traceable decisions. (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] CAF traceability pattern definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml)
**Rationale:** Evidence is not optional in this shape; it is part of normal control flow. This pattern aligns spec decisions with auditable records.
**Implications:**
- Capture decision and action traces in CP/AP/DP interface contracts.
- Ensure evidence hooks are referenced in decision-resolution scaffolds.

### H-6: CTX-01 - Request Context and Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Context propagation semantics are pinned by AP-1, AP-2, AI-4, and CP-3 identity governance. (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core context propagation boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml)
**Rationale:** Core request-context propagation is needed to operationalize tenant and principal constraints in APIs and workflows. This pattern complements CAF normative context rules.
**Implications:**
- Define context carrier requirements for incoming/outgoing service calls.
- Standardize correlation identifiers for evidence stitching.

### H-7: POL-01 - Policy Enforcement Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy centralization and enforcement cues are pinned in CP-4, AP-2, AP-3, and AI-2. (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core policy-enforcement boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml)
**Rationale:** Policy authority is control-plane-owned and must be enforced synchronously at execution boundaries. This pattern codifies that edge.
**Implications:**
- Keep policy definition/versioning in CP artifacts.
- Require AP invocation paths to call policy checks before execution.

### M-1: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Relational persistence and access boundary intent are pinned by DP-2, ST-2, ST-3 plus Postgres/SQLAlchemy platform pins. (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Resolved profile pins data stack to postgres + sqlalchemy_orm with code-bootstrap schema management. (rail_ref: platform.database_engine=postgres; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Core persistence boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml)
**Rationale:** Repository boundaries fit the pinned persistence strategy and tenant-enforcement constraints. This enables clear AP-to-DP interfaces without coupling domain logic to storage mechanics.
**Implications:**
- Keep tenant-scoped repository contracts explicit.
- Route persistence through AP ports/adapters rather than direct storage access.

### M-2: SVC-01 - Application Service Facade Boundary (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] AP execution responsibilities and synchronous checks are pinned by AP-2, AP-3, AP-5, AP-6. (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core service-facade boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml)
**Rationale:** An application service facade aligns with pinned AP responsibilities and supports deterministic orchestration entry points.
**Implications:**
- Define use-case style service facades per major product workflow.
- Keep UI/API ingress mapping separate from domain/persistence internals.

### M-3: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Fail-closed and pre-execution constraints require strict validation boundaries: AP-3, AP-4, AI-3, AI-5. (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Resolved guardrails include refusal posture fail_closed and forbidden action constraints. (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Core validation boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml)
**Rationale:** Validation and deterministic failure behavior are mandatory for the pinned safety/governance posture. This pattern defines that contract boundary.
**Implications:**
- Document input/schema validation points for CP and AP APIs.
- Normalize error/evidence output semantics for rejected actions.

### M-4: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Identity governance is explicitly pinned in CP-3 and AI-1 with policy-derived authority AI-2. (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF identity principal taxonomy definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml)
**Rationale:** Control-plane identity taxonomy is needed to keep principal classes and authority assignment explicit. This pattern supports policy and evidence consistency.
**Implications:**
- Define principal classes and lifecycle ownership in CP docs.
- Link principal types to policy enforcement and audit events.

### M-5: CAF-IAM-02 - Identity and Context Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Cross-plane identity/context propagation is implied by AP-1, AP-2, AI-1, AI-4, and CP-3. (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF identity and context propagation definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml)
**Rationale:** This pattern complements context propagation by defining identity-carrying obligations across boundaries.
**Implications:**
- Require identity and tenant fields in cross-plane contract schemas.
- Align context propagation with policy evaluation checkpoints.

### M-6: OBS-01 - Observability Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Evidence and observability requirements are pinned by AP-6, AI-6, DP-5, and ST-6. (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core observability boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml)
**Rationale:** The graph expansion introduced observability as a close complement to evidence-generation seeds. It is grounded by synchronous emission pins.
**Implications:**
- Define cross-plane telemetry/evidence correlation keys.
- Keep observability ingestion and policy views in CP scope.

### M-7: CAF-POL-01 - Control Plane Policy Decision Pipeline (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy/governance ownership and evaluation sequence are pinned by CP-4, CP-5, AP-3, AI-2, AI-3. (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF policy pipeline definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml)
**Rationale:** Graph expansion surfaced this as a direct dependency of AI safety separation. It is grounded in centralized policy-authoring and pre-execution evaluation pins.
**Implications:**
- Capture policy lifecycle states and evaluation checkpoints in CP specs.
- Keep AP callers dependent on CP policy decision outcomes.

### M-8: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Cross-plane interaction constraints are implied by CP-6, AP-5, DP-4, and tenant isolation pins DP-1/ST-1. (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF allowed cross-plane interaction definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml)
- E3 [pinned_input] Pin coverage aggregate reference: CP-1 CP-2 CP-3 CP-4 CP-5 CP-6 AP-1 AP-2 AP-3 AP-4 AP-5 AP-6 DP-1 DP-2 DP-3 DP-4 DP-5 AI-1 AI-2 AI-3 AI-4 AI-5 AI-6 ST-1 ST-2 ST-3 ST-4 ST-5 ST-6. (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** The architecture requires explicit allowed interactions across planes while maintaining authority and isolation boundaries. This graph-derived candidate is grounded by plane and governance pins.
**Implications:**
- Document allowed CP?AP and AP?DP interaction shapes.
- Flag prohibited interaction paths as explicit anti-patterns for later phases.
