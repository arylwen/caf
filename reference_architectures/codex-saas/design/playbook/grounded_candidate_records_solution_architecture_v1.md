### H-1: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
- **Plane:** both
- **Rationale:** Preserve immutable tenant context from ingress through cross-plane interactions.
- **Evidence:**
- E1 [pattern_definition] Canonical pattern definition for tenant context propagation. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml
- E2 [pinned_input] pin_ref: AP-1=Ingress-Bound Context; pin_ref: AI-4=Session-Scoped Context Only. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### H-2: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
- **Plane:** both
- **Rationale:** Keep tenant isolation and tenant-scoped addressing explicit in CP/AP/DP design.
- **Evidence:**
- E1 [pattern_definition] Canonical multi-tenancy pattern definition. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml
- E2 [pinned_input] pin_ref: DP-1=Logical Isolation (Enforced); pin_ref: ST-2=Tenant-Keyed Primary Addressing. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### H-3: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: high)
- **Plane:** control
- **Rationale:** Control-plane governance needs explicit principal classes and tenant-bound authority.
- **Evidence:**
- E1 [pattern_definition] Canonical identity taxonomy pattern definition. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml
- E2 [pinned_input] pin_ref: CP-3=Human, Service, and Agent Identity Governance; pin_ref: AI-1=Single-Principal Agent Identity. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### H-4: CAF-POL-01 - Policy as a First-Class System Artifact (confidence: high)
- **Plane:** control
- **Rationale:** Policy authoring, versioning, and evaluation are control-plane responsibilities in this instance.
- **Evidence:**
- E1 [pattern_definition] Canonical policy artifact pattern definition. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml
- E2 [pinned_input] pin_ref: CP-1=Declarative + Evaluative; pin_ref: CP-4=Centralized Policy Authoring. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### H-5: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
- **Plane:** both
- **Rationale:** The instance posture requires explicit CP/AP/DP boundaries and responsibilities.
- **Evidence:**
- E1 [pattern_definition] Canonical tri-plane separation definition. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml
- E2 [pinned_input] pin_ref: CP-6=Unified Governance Integration; pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### H-6: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: high)
- **Plane:** both
- **Rationale:** Cross-plane calls must remain constrained and auditable for policy-governed execution.
- **Evidence:**
- E1 [pattern_definition] Canonical cross-plane interaction pattern definition. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml
- E2 [pinned_input] pin_ref: AI-6=Synchronous Evidence Emission; pin_ref: AP-6=Synchronous Emission. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### M-7: CTX-01 - Request Context and Propagation (confidence: medium)
- **Plane:** both
- **Rationale:** Request-scoped tenant and identity context must flow consistently across boundaries.
- **Evidence:**
- E1 [pattern_definition] Core request context propagation definition. cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml
- E2 [pinned_input] pin_ref: AP-1=Ingress-Bound Context; pin_ref: AI-2=Policy-Derived Authority. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### M-8: PST-01 - Persistence Boundary via Repositories (confidence: medium)
- **Plane:** application
- **Rationale:** Application persistence should stay behind repository boundaries for tenant-safe data access.
- **Evidence:**
- E1 [pattern_definition] Core persistence boundary definition. cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml
- E2 [pinned_input] pin_ref: DP-2=Data-Access-Layer Enforcement; pin_ref: ST-3=Tenant-Partitioned Placement. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### M-9: EXT-API_GATEWAY - API Gateway (confidence: medium)
- **Plane:** control
- **Rationale:** External ingress policy enforcement and routing for CP->AP traffic need a stable edge boundary.
- **Evidence:**
- E1 [pattern_definition] External API gateway pattern definition. cite: architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml
- E2 [pinned_input] pin_ref: AP-2=Inline Enforcement; pin_ref: CP-4=Centralized Policy Authoring. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### M-10: EXT-BACKEND_FOR_FRONTEND_BFF - Backend-for-Frontend (BFF) (confidence: medium)
- **Plane:** application
- **Rationale:** The pinned React SPA surface benefits from an application-plane facade tuned for UI workflows.
- **Evidence:**
- E1 [pattern_definition] External BFF pattern definition. cite: architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml
- E2 [pinned_input] pin_ref: AP-5=Agent Invocation Only; pin_ref: AP-6=Synchronous Emission. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### M-11: EXT-ANTI_CORRUPTION_LAYER - Anti-Corruption Layer (confidence: medium)
- **Plane:** both
- **Rationale:** Graph expansion suggests adapter isolation where cross-boundary models can drift.
- **Evidence:**
- E1 [pattern_definition] External anti-corruption layer definition. cite: architecture_library/patterns/external_v1/definitions_v1/ext-anti_corruption_layer.yaml
- E2 [derived_rails_or_posture] generation_phase=implementation_scaffolding and refusal_posture=fail_closed favor explicit adapter seams. cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

### M-12: EXT-API_COMPOSITION_AGGREGATOR - API Composition / Aggregator (confidence: medium)
- **Plane:** application
- **Rationale:** Graph expansion adds a composition option for SPA-facing read models without coupling core domain boundaries.
- **Evidence:**
- E1 [pattern_definition] External API composition pattern definition. cite: architecture_library/patterns/external_v1/definitions_v1/ext-api_composition_aggregator.yaml
- E2 [derived_rails_or_posture] ui.present=true and ui.kind=web_spa support composition endpoints in application design. cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml

### M-13: EXT-AUDITABILITY - Auditability (confidence: medium)
- **Plane:** both
- **Rationale:** Graph expansion aligns with required synchronous evidence trails across governed actions.
- **Evidence:**
- E1 [pattern_definition] External auditability pattern definition. cite: architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml
- E2 [pinned_input] pin_ref: AI-6=Synchronous Evidence Emission; pin_ref: DP-5=Inline Evidence Emission. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml

### M-14: EXT-BULKHEAD_ISOLATION - Bulkhead Isolation (confidence: medium)
- **Plane:** both
- **Rationale:** Graph expansion indicates isolation boundaries to contain failures in cross-service interactions.
- **Evidence:**
- E1 [pattern_definition] External bulkhead isolation definition. cite: architecture_library/patterns/external_v1/definitions_v1/ext-bulkhead_isolation.yaml
- E2 [derived_rails_or_posture] fail_closed posture and api_service_http runtime shape justify explicit failure-containment seams. cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml
