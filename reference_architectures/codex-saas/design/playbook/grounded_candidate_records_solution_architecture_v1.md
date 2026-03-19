### H-1: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context and identity are ingress-bound/session-scoped requirements. (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Guardrails require fail-closed handling when tenant context is absent. (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Canonical pattern anchor. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml)
**Rationale:** The architecture requires immutable tenant and principal context propagation across control/application boundaries.
**Implications:**
- Require tenant/principal context in all CP/AP contracts.
- Reject flows without explicit context binding.

### H-2: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Multi-tenant isolation and tenant-keyed persistence are explicit requirements. (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Canonical tenancy-first pattern anchor. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml)
**Rationale:** The domain and persistence constraints are explicitly tenant-scoped and require first-class multi-tenant boundaries.
**Implications:**
- Keep tenant keys mandatory in application and data paths.
- Treat cross-tenant access as fail-closed.

### H-3: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Plane-role and interaction boundaries are explicitly pinned across the shape. (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Full pin coverage reference for the candidate set: CP-1 CP-2 CP-3 CP-4 CP-5 CP-6 AP-1 AP-2 AP-3 AP-4 AP-5 AP-6 DP-1 DP-2 DP-3 DP-4 DP-5 AI-1 AI-2 AI-3 AI-4 AI-5 AI-6 ST-1 ST-2 ST-3 ST-4 ST-5 ST-6. (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pattern_definition] Canonical tri-plane separation anchor. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml)
**Rationale:** Control/application/data responsibilities must stay explicitly separated while still collaborating through governed interfaces.
**Implications:**
- Keep CP governance and AP execution concerns distinct.
- Keep DP persistence enforcement out of AP orchestration logic.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Safety and policy checks are pre-invocation/pre-action requirements. (pin_ref: AI-5=Pre-Action Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Canonical AI governance-separation anchor. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml)
**Rationale:** The pinned AI posture requires explicit safety/policy gating before side-effecting actions.
**Implications:**
- Define pre-execution safety checkpoints in AP paths.
- Keep safety/policy authoring orchestration in CP.

### H-5: CAF-COMP-01 - Evidence Generation and Traceability (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Synchronous evidence emission is required across AP/AI/DP/ST constraints. (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Canonical evidence/traceability anchor. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml)
**Rationale:** Governance posture is auditable-by-default, so evidence generation is part of core runtime flow.
**Implications:**
- Emit evidence at policy, execution, and persistence decision points.
- Preserve correlation fields across CP/AP/DP boundaries.

### H-6: CTX-01 - Request Context and Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP ingress and inline enforcement require deterministic request context carriage. (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core context-propagation anchor. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml)
**Rationale:** Request context propagation operationalizes tenant/identity safety and evidence stitching.
**Implications:**
- Standardize context carrier fields and correlation identifiers.
- Enforce propagation contracts at all service boundaries.

### M-7: POL-01 - Policy Enforcement Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Centralized policy authoring and pre-execution checks are mandatory. (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core policy-enforcement anchor. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml)
**Rationale:** Control-plane policy authority must be explicit and consistently enforced in AP invocation paths.
**Implications:**
- Keep policy lifecycle/versioning in CP.
- Require AP policy checks before agent/tool execution.

### M-8: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Relational persistence and DAL enforcement are explicit architecture requirements. (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Profile resolves to postgres + sqlalchemy_orm. (rail_ref: platform.database_engine=postgres; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Core persistence-boundary anchor. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml)
**Rationale:** Repository boundaries align with tenant-safe relational persistence and keep domain logic decoupled from storage mechanics.
**Implications:**
- Enforce tenant-scoped repository contracts.
- Route AP persistence via adapters/ports.

### M-9: SVC-01 - Application Service Facade Boundary (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] AP responsibility includes orchestrating policy/safety-guarded use-case flows. (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core service-facade anchor. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml)
**Rationale:** Use-case facade boundaries are consistent with pinned AP orchestration obligations.
**Implications:**
- Model use-case entrypoints per key workflow.
- Separate ingress mapping from domain/persistence internals.

### M-10: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Pre-invocation and fail-closed behavior require strict validation boundaries. (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Refusal posture remains fail_closed in this phase. (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Core validation-boundary anchor. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml)
**Rationale:** Deterministic rejection behavior is required for policy and safety compliance.
**Implications:**
- Define input/schema validation in CP/AP APIs.
- Normalize rejected-action evidence outputs.

### M-11: EXT-ANTI_CORRUPTION_LAYER - Anti-Corruption Layer (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [spec_excerpt] CP/AP must preserve explicit governance boundaries and avoid leaking external semantics into domain contracts. (cite: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md)
- E2 [pinned_input] Plane-boundary responsibilities and governed interactions are explicit in the architecture shape. (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [graph_relation] Graph-open-list candidate from CTX-01 complement edge. (ref: CTX-01 -> EXT-ANTI_CORRUPTION_LAYER; cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml)
**Rationale:** External/control-plane integrations should translate into stable internal contracts instead of leaking provider-specific semantics.
**Implications:**
- Add boundary adapter contracts for external policy/evidence integrations.
- Keep translation logic isolated from core domain models.

### M-12: EXT-API_COMPOSITION_AGGREGATOR - API Composition / Aggregator (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [spec_excerpt] UI product surface requires dashboard/workspace/submission/report flows that benefit from composed read models. (cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] AP runtime shape is API service HTTP and can expose aggregated query contracts. (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [graph_relation] Graph-open-list candidate from CTX-01 complement edge. (ref: CTX-01 -> EXT-API_COMPOSITION_AGGREGATOR; cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml)
**Rationale:** UI-driven workflows need composed data surfaces while preserving application/service boundaries.
**Implications:**
- Define read-composition endpoints for list/detail views.
- Keep composition logic separate from write-side use cases.

### M-13: EXT-API_GATEWAY - API Gateway (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Control-plane policy and identity governance imply a controlled ingress boundary for enforcement and observability. (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [spec_excerpt] CP/AP are both HTTP API runtime shapes, supporting centralized ingress policy checkpoints. (cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [graph_relation] Graph-open-list candidate from CTX-01 complement edge. (ref: CTX-01 -> EXT-API_GATEWAY; cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml)
**Rationale:** Centralized ingress can enforce policy, context propagation, and audit hooks consistently across CP/AP boundaries.
**Implications:**
- Define gateway boundary for authz/context normalization.
- Emit ingress evidence and correlation identifiers consistently.

### M-14: EXT-AUDITABILITY - Auditability (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Synchronous evidence obligations across AI/AP/DP/ST require first-class auditability contracts. (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [spec_excerpt] System domain includes execution/evidence records and policy approvals as auditable entities. (cite: reference_architectures/codex-saas/spec/playbook/system_domain_model_v1.md)
- E3 [graph_relation] Graph-open-list candidate from CTX-01 complement edge. (ref: CTX-01 -> EXT-AUDITABILITY; cite: reference_architectures/codex-saas/design/playbook/graph_expansion_open_list_solution_architecture_v1.yaml)
**Rationale:** Auditability pattern reinforces the compliance and evidence requirements already explicit in the architecture shape.
**Implications:**
- Define immutable audit-event contracts for governance actions.
- Preserve evidence trace linking across planes.
