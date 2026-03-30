### H-1: CAF-TCTX-01 - Tenant Context Propagation (confidence: HIGH)
- **Plane:** both
- **Rationale:** Tenant context is an explicit architectural invariant across ingress, AP execution, and CP governance.
**Evidence:**
- E1 [pinned_input] pin_ref: AP-1=Ingress-Bound Context and AI-4=Session-Scoped Context Only require deterministic tenant-context propagation. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-TCTX-01 defines normative tenant context propagation across planes. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml

### H-2: CAF-MTEN-01 - Multi-Tenancy First-Class (confidence: HIGH)
- **Plane:** both
- **Rationale:** The instance is explicitly multi-tenant with fail-closed tenant isolation constraints.
**Evidence:**
- E1 [pinned_input] pin_ref: DP-1=Logical Isolation (Enforced) and ST-2=Tenant-Keyed Primary Addressing require tenant-scoped boundaries. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-MTEN-01 formalizes tenant isolation and partitioning as first-class concerns. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml

### H-3: CAF-POL-01 - Policy as First-Class Artifact (confidence: HIGH)
- **Plane:** control
- **Rationale:** Policy authoring, lifecycle, and governance are centralized in CP.
**Evidence:**
- E1 [pinned_input] pin_ref: CP-1=Declarative + Evaluative and CP-4=Centralized Policy Authoring require policy artifacts to be explicit and versioned. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-POL-01 captures policy-as-artifact posture for CP governance. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml

### H-4: CAF-AID-01 - Agent Identity Pattern (confidence: HIGH)
- **Plane:** control
- **Rationale:** Agent identity and authority need explicit principal/governance modeling.
**Evidence:**
- E1 [pinned_input] pin_ref: AI-1=Single-Principal Agent Identity and AI-2=Policy-Derived Authority require explicit identity governance. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-AID-01 codifies agent identity and authority semantics in governance posture. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml

### H-5: CAF-PLANE-01 - Tri-Plane Separation (confidence: HIGH)
- **Plane:** both
- **Rationale:** The system posture depends on clear CP/AP/DP separation and boundaries.
**Evidence:**
- E1 [pinned_input] pin_ref: CP-6=Unified Governance Integration and DP-4=Data Plane Hosts Inputs/Outputs Only require explicit plane separation. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-PLANE-01 defines tri-plane authority separation and interaction boundaries. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml

### H-6: CAF-POL-02 - Policy Lifecycle Integration (confidence: HIGH)
- **Plane:** both
- **Rationale:** Policy lifecycle decisions need cross-plane consistency from CP to AP enforcement.
**Evidence:**
- E1 [pinned_input] pin_ref: AP-3=Pre-Execution Evaluation and AI-3=Pre-Invocation Evaluation Only require policy lifecycle consistency. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-POL-02 refines policy integration across design-time and runtime boundaries. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml

### M-7: POL-01 - Policy Enforcement Boundary (confidence: MEDIUM)
- **Plane:** control
- **Rationale:** CP ingress and governance flows require explicit policy enforcement boundary controls.
**Evidence:**
- E1 [pinned_input] pin_ref: AP-2=Inline Enforcement and CP-4=Centralized Policy Authoring require deterministic enforcement points. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] POL-01 defines policy enforcement boundaries and guard points. cite: architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml

### M-8: CTX-01 - Request Context and Propagation (confidence: MEDIUM)
- **Plane:** both
- **Rationale:** Request and execution context must carry tenant and identity data across plane boundaries.
**Evidence:**
- E1 [pinned_input] pin_ref: AP-1=Ingress-Bound Context and ST-1=Shared Storage with Logical Isolation require propagated context keys. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CTX-01 defines request context propagation across service boundaries. cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml

### M-9: PST-01 - Persistence Boundary via Repositories (confidence: MEDIUM)
- **Plane:** application
- **Rationale:** AP persistence integration should stay behind explicit repository boundaries.
**Evidence:**
- E1 [pinned_input] pin_ref: DP-2=Data-Access-Layer Enforcement and ST-2=Tenant-Keyed Primary Addressing require tenant-scoped persistence boundaries. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] PST-01 defines repository-based persistence boundaries for AP components. cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml

### M-10: OBS-01 - Observability Boundary (confidence: MEDIUM)
- **Plane:** control
- **Rationale:** Governance operations require traceability and evidence-oriented observability boundaries.
**Evidence:**
- E1 [pinned_input] pin_ref: AI-6=Synchronous Evidence Emission and DP-5=Inline Evidence Emission require explicit observability boundaries. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] OBS-01 defines cross-plane observability and traceability boundary expectations. cite: architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml

### M-11: CAF-IAM-01 - Identity Principal Taxonomy (confidence: MEDIUM)
- **Plane:** control
- **Rationale:** Principal classes and identity governance need explicit CP taxonomy to support policy derivation.
**Evidence:**
- E1 [pinned_input] pin_ref: CP-3=Human, Service, and Agent Identity Governance and AI-1=Single-Principal Agent Identity require principal taxonomy alignment. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-IAM-01 defines platform/tenant/service/agent principal taxonomy. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml

### M-12: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: MEDIUM)
- **Plane:** both
- **Rationale:** CP and AP integration requires explicit allowed transport/surface constraints.
**Evidence:**
- E1 [pinned_input] pin_ref: CP-6=Unified Governance Integration and AP-5=Agent Invocation Only require explicit cross-plane interaction contracts. cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml
- E2 [pattern_definition] CAF-XPLANE-01 defines permitted cross-plane interaction boundaries and shapes. cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml
