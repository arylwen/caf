### H-1: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context must be resolved at ingress and remain immutable through execution (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Agent context is session-scoped and tenant-scoped (pin_ref: AI-4=Session-Scoped Context Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Storage identity includes tenant key to preserve context continuity (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern explicitly codifies tenant-context propagation across planes (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml).
**Rationale:** Ingress-bound and session-scoped context pins require a normative propagation mechanism across AP/CP/DP boundaries. This pattern directly matches that need.
**Implications:**
- Add explicit context carrier requirements in CP<->AP and AP<->DP contracts.
- Enforce tenant-id presence in request handling and repository access boundaries.

### H-2: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Isolation is mandatory in pooled infrastructure (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Data access boundary enforces tenant scope (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Storage is shared but tenant-partitioned (pin_ref: ST-1=Shared Storage with Logical Isolation; pin_ref: ST-3=Tenant-Partitioned Placement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern defines tenancy-first architecture posture (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml).
**Rationale:** The architecture pins require tenant isolation as a system invariant, not a feature toggle. This pattern anchors that invariant across planes.
**Implications:**
- Treat tenant scoping as required in every contract and repository API.
- Keep cross-tenant access paths explicitly prohibited.

### H-3: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control-plane unified governance pin requires authoritative governance boundaries (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] App plane invokes agents but does not host orchestration state (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Data plane hosts governed inputs/outputs, not inference control logic (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern defines strict CP/AP/DP role boundaries (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml).
**Rationale:** The selected pins map directly to a tri-plane authority split. This pattern keeps ownership and runtime responsibilities coherent.
**Implications:**
- Keep policy/safety lifecycle in CP.
- Keep workflow orchestration in AP and data governance enforcement in DP.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Safety checks are required before invocation and actions (pin_ref: AP-4=Pre-Invocation Safety Gates; pin_ref: AI-5=Pre-Action Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Invocation is permitted only after policy/safety evaluation (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Control plane owns centralized safety-gate orchestration (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern separates governance ownership from runtime execution (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml).
**Rationale:** AI-related pins require strict pre-execution governance and gate ownership boundaries. This pattern codifies those constraints.
**Implications:**
- Require CP-governed safety policy definitions consumed by AP at runtime.
- Emit deterministic deny paths for failed gate evaluations.

### H-5: CAF-COMP-01 - Evidence Generation & Traceability (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent and application emit evidence synchronously (pin_ref: AI-6=Synchronous Evidence Emission; pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Data/storage layers also emit inline evidence for access and lifecycle operations (pin_ref: DP-5=Inline Evidence Emission; pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [derived_rails_or_posture] Refusal posture is fail-closed, requiring explainable deny outcomes (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E4 [pattern_definition] Pattern defines evidence/traceability as first-class runtime behavior (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml).
**Rationale:** Multiple pin families require synchronous evidence emission. This pattern provides a consistent cross-plane traceability baseline.
**Implications:**
- Define shared audit event schema and correlation strategy.
- Require evidence hooks for policy decisions and data mutations.

### H-6: CTX-01 - Request Context and Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control plane evaluates governance declaratively and configurationally, requiring consistent context boundaries (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Ingress-bound tenant context is an explicit runtime invariant (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern specifies request context carriers and propagation rules (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml).
**Rationale:** The selected pins require deterministic request context handling for policy and data isolation. CTX-01 is a direct fit.
**Implications:**
- Standardize tenant/user/correlation context objects.
- Require propagation through service and repository boundaries.

### M-7: POL-01 - Policy Enforcement Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy authoring is centralized in CP (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Authorization and pre-execution evaluation are inline runtime requirements (pin_ref: AP-2=Inline Enforcement; pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Agent authority is policy-derived (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern defines policy enforcement boundary placement (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml).
**Rationale:** Policy ownership and inline enforcement pins map to a strong control-plane policy boundary with runtime enforcement at AP edges.
**Implications:**
- Define policy decision point placement and AP enforcement adapters.
- Keep policy lifecycle/versioning in CP contracts.

### M-8: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Data access boundary enforcement is explicit (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Data governance includes retention/deletion/lineage (pin_ref: DP-3=Access + Retention + Lineage Enforcement; pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Backup/restore must remain tenant-scoped (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern defines repository boundary over persistence concerns (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml).
**Rationale:** Data-plane enforcement pins require strict repository boundaries and tenant-safe data access contracts.
**Implications:**
- Introduce tenant-keyed repository interfaces.
- Capture retention/deletion semantics in persistence contracts.

### M-9: SVC-01 - Application Service Facade Boundary (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Application plane is invocation/orchestration surface for governed actions (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Inline enforcement constraints require stable service-layer entry points (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Agent sessions bind to a single principal identity (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Pattern defines application service facade boundaries (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml).
**Rationale:** AP orchestration plus inline policy constraints benefits from a clear service facade for use-case entry points and policy hooks.
**Implications:**
- Define explicit use-case services for widget/catalog/collection/admin flows.
- Route policy/safety checks through service boundary adapters.

### M-10: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Pre-execution evaluation and pre-invocation checks require deterministic input validation before action (pin_ref: AP-3=Pre-Execution Evaluation; pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Retention/deletion governance implies strict validation for lifecycle operations (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [derived_rails_or_posture] Fail-closed posture requires explicit reject paths and stable error semantics (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E4 [pattern_definition] Pattern defines validation and error boundary semantics (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml).
**Rationale:** The architecture requires predictable deny/failure behavior before side effects. VAL-01 supports that requirement.
**Implications:**
- Standardize validation envelopes and domain error mapping.
- Ensure failed policy/safety checks produce auditable rejection events.

### M-11: CAF-AIOBS-01 - AI Observability Hooks (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent and app telemetry must be emitted synchronously (pin_ref: AI-6=Synchronous Evidence Emission; pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Unified governance requires cross-plane observability correlation (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pattern_definition] Pattern defines AI observability hook requirements (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml).
**Rationale:** Evidence emission pins need explicit AI-focused observability hooks tied into governance and auditing.
**Implications:**
- Require correlation IDs across prompts, tool calls, policy checks, and outcomes.
- Keep observability fields consistent with CAF evidence contracts.

### M-12: CAF-POL-01 - Policy by Default Deny and Explicit Allow (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Policy lifecycle is CP-owned and centralized (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Safety gate governance is centralized in CP (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [derived_rails_or_posture] Fail-closed refusal posture implies deny-by-default behavior (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml).
- E4 [pattern_definition] Graph-expanded pattern formalizes default-deny policy semantics (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml).
**Rationale:** CP policy ownership and fail-closed rails align with explicit allow semantics as the governing model.
**Implications:**
- Define policy defaults and explicit allow conditions in design artifacts.
- Ensure AP checks unresolved policy states as deny.

### M-13: CAF-POL-02 - Policy Decision Provenance and Version Binding (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control plane is authoritative lifecycle owner for governance state changes (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Identity governance spans human/service/agent principals (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Inline enforcement depends on traceable policy decisions (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Graph-expanded pattern adds provenance/version binding requirements (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml).
**Rationale:** Governance lifecycle and identity pins require decision provenance so runtime checks can be audited and reproduced.
**Implications:**
- Bind authorization outcomes to policy version IDs.
- Record principal context with each decision event.

### M-14: CAF-IAM-02 - Identity and Context Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent sessions bind to one principal identity (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Agent authority is policy-derived within tenant context (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] CP governs principal lifecycle and tenant memberships (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Graph-expanded pattern specifies identity/context propagation expectations (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml).
**Rationale:** Identity governance and authority pins require deterministic context propagation for principal attribution across boundaries.
**Implications:**
- Define identity carrier schema in boundary contracts.
- Require tenant + principal claims on policy and audit events.

### M-15: CAF-COMP-02 - Evidence Taxonomy and Storage Binding (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Unified governance requires consistent evidence model across control/application/data planes (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E2 [pinned_input] Data governance requires retention and lineage-capable evidence storage (pin_ref: DP-3=Access + Retention + Lineage Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E3 [pinned_input] Storage emits inline evidence as authoritative audit substrate (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml).
- E4 [pattern_definition] Graph-expanded complement pattern refines evidence taxonomy concerns (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-02.yaml).
**Rationale:** Existing evidence-emission pins benefit from a complementary pattern that tightens taxonomy and storage binding semantics.
**Implications:**
- Define evidence type taxonomy and retention classes.
- Align evidence schema with storage partitioning and lifecycle controls.
