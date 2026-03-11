### H-1: CAF-TCTX-01  -  Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context is established once at ingress and remains immutable through execution. (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Agent context is session-scoped and limited to explicit retrieval for the active execution. (pin_ref: AI-4=Session-Scoped Context Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] Normative tenant-context propagation pattern aligns with cross-plane context carriage boundaries. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml)
**Rationale:** The pins require deterministic tenant and session context handling, so explicit propagation rules are foundational. This pattern grounds those constraints into enforceable cross-plane contracts.
**Implications:**
- Add explicit context-carrier requirements in API contracts and service boundaries.
- Record mandatory tenant/principal/correlation fields in request and event envelopes.
**Open questions:**
- None.

### H-2: CAF-MTEN-01  -  Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Data-plane isolation must be enforced with fail-closed tenant scoping. (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Storage model is shared with logical isolation and tenant-keyed/partitioned placement. (pin_ref: ST-1=Shared Storage with Logical Isolation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Primary addressing and placement are explicitly tenant-keyed and tenant-partitioned. (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Storage placement remains tenant-partitioned as a first-class storage invariant. (pin_ref: ST-3=Tenant-Partitioned Placement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pinned_input] Backup/restore obligations are tenant-scoped. (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E6 [pattern_definition] MTEN pattern defines multi-tenant invariants as first-class architecture obligations. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml)
**Rationale:** The architecture shape pins encode strict tenant isolation and tenant-scoped storage semantics. A first-class multi-tenancy pattern is needed to keep these invariants explicit across control, application, and data boundaries.
**Implications:**
- Require tenant-key presence in persistence keys and repository interfaces.
- Add explicit tenant isolation checks to design acceptance criteria.
**Open questions:**
- None.

### H-3: CAF-IAM-01  -  Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Identity governance covers human, service, and agent principals at platform scope. (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Agent execution is bound to one principal identity per session. (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] IAM taxonomy pattern defines principal classes and governance boundaries. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml)
**Rationale:** Identity constraints require a clear principal taxonomy to avoid ambiguous authority and ownership. This pattern grounds identity classification and governance responsibilities in the control plane.
**Implications:**
- Define principal types and lifecycle ownership in system domain model and policy model.
- Ensure agent principal mapping is explicit in control-plane governance APIs.
**Open questions:**
- None.

### H-4: CAF-POL-01  -  Policy as a First-Class System Artifact (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Control plane is declarative/evaluative and centralizes policy authoring. (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Policies are authored centrally and enforced inline before execution. (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] App-plane authorization is inline and pre-execution. (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Policy evaluation is required before execution starts. (pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pinned_input] Agent authority is policy-derived at invocation time. (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E6 [pattern_definition] Policy artifact pattern formalizes lifecycle, versioning, and cross-plane enforcement references. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml)
**Rationale:** Multiple pins converge on policy-first authority and enforcement behavior. Treating policy as a first-class artifact keeps decision paths auditable and deterministic across phases.
**Implications:**
- Add explicit policy object/version references to control-plane APIs.
- Require policy evaluation references in application execution traces.
**Open questions:**
- None.

### H-5: CAF-AI-01  -  AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Safety gate orchestration is centrally governed by control plane. (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] App plane must run pre-invocation safety checks before AI execution. (pin_ref: AP-4=Pre-Invocation Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Agent execution is invocation-only and pre-action gated. (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Tool invocation requires pre-invocation evaluation and pre-action safety gates. (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pinned_input] Safety gates must run before side-effect actions. (pin_ref: AI-5=Pre-Action Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E6 [pattern_definition] CAF AI separation pattern defines governance-vs-execution boundary responsibilities. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml)
**Rationale:** The pinned model separates AI governance control from application invocation behavior. This pattern preserves that separation and prevents implicit bypasses.
**Implications:**
- Separate safety-gate definition lifecycle (CP) from invocation enforcement (AP).
- Add explicit gate outcome artifacts to execution traces.
**Open questions:**
- None.

### H-6: CAF-PLANE-01  -  Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control plane owns authoritative lifecycle transitions. (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Unified governance integration is a control-plane concern. (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Data plane hosts inputs/outputs, not inference orchestration. (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [derived_rails_or_posture] Both CP/AP runtime shapes are `api_service_http`, reinforcing explicit plane boundaries. (rail_ref: planes.cp.runtime_shape=api_service_http; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml:lifecycle)
- E5 [pattern_definition] Tri-plane pattern defines separation and allowed responsibility boundaries. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml)
**Rationale:** The pins explicitly assign responsibilities by plane and restrict data-plane behavior. This pattern turns those assignments into enforceable architectural boundaries.
**Implications:**
- Keep CP/AP/DP responsibilities explicit in system and application domain model docs.
- Enforce no cross-plane role collapse in upcoming design scaffolding.
**Open questions:**
- None.

### M-1: CAF-COMP-01  -  Evidence Generation & Traceability (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Application execution emits synchronous evidence. (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Data and storage paths require inline evidence and lineage/retention governance. (pin_ref: DP-3=Access + Retention + Lineage Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Data-plane and storage operations emit inline evidence. (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Storage lifecycle includes hard deletion and evidence on lifecycle events. (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pattern_definition] Evidence pattern aligns with cross-plane traceability obligations. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml)
**Rationale:** Multiple pins require evidence as a normal operational artifact, not an afterthought. This pattern keeps auditability and traceability consistent across planes.
**Implications:**
- Add evidence event taxonomy and required fields to design backlog.
- Tie policy/safety outcomes to trace records by correlation IDs.
**Open questions:**
- None.

### M-2: PST-01  -  Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Data-access-layer enforcement is required for tenant scope on reads/writes. (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [derived_rails_or_posture] Runtime stack is `python/fastapi` with `postgres` and `sqlalchemy_orm`, supporting explicit repository boundaries. (rail_ref: platform.database_engine=postgres; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml:platform)
- E3 [pattern_definition] Repository boundary pattern isolates persistence concerns from app services. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml)
**Rationale:** The shape pins require strict tenant-scoped DAL enforcement. Repository boundaries reduce accidental bypass and localize data access obligations.
**Implications:**
- Define repository interfaces keyed by tenant-scoped identifiers.
- Keep app services free of direct persistence engine coupling.
**Open questions:**
- None.

### M-3: CTX-01  -  Request Context and Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Ingress establishes immutable tenant context for execution. (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Single-principal identity must persist through execution flow. (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] Core request-context pattern defines context carrier and propagation boundaries. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml)
**Rationale:** Context propagation is required to make tenant and principal constraints enforceable at every boundary. This pattern operationalizes context continuity across control and application interactions.
**Implications:**
- Standardize context envelope fields in contracts.
- Require context propagation checks in boundary tests for later phases.
**Open questions:**
- None.

### M-4: CAF-XPLANE-01  -  Allowed Cross-Plane Interaction Patterns (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Governance integration is unified but must preserve plane authority boundaries. (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Data plane role is constrained to input/output hosting with governance enforcement. (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] X-plane allowed-interaction pattern enumerates sanctioned cross-plane shapes. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml)
**Rationale:** Cross-plane boundaries are explicit in the pins, but allowed interaction paths still need architectural codification. This pattern prevents boundary drift as more features are scaffolded.
**Implications:**
- Capture allowed CP->AP->DP interaction contracts in design artifacts.
- Add anti-pattern checks for direct boundary bypasses.
**Open questions:**
- None.

### M-5: CAF-AIOBS-01  -  AI Observability Hooks (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent decisions and tool invocations emit synchronous evidence. (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Application execution emits inline telemetry/evidence. (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] AI observability hooks pattern defines trace hook points around prompts, retrieval, and actions. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml)
**Rationale:** Evidence requirements already exist in pins, and AI-specific hook placement is needed to maintain end-to-end auditability. This pattern adds that observability granularity without changing core architecture choices.
**Implications:**
- Define hook event points for AI invocation lifecycle.
- Map AI hook artifacts to governance evidence streams.
**Open questions:**
- None.

### M-6: CAF-IAM-GOV-04  -  Identity Governance Separation for Policy Runtime (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Identity governance spans principal lifecycle at control-plane scope. (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Runtime authority is policy-derived and tenant-bound. (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] Graph-expanded IAM governance pattern refines runtime identity-policy coupling boundaries. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-04.yaml)
**Rationale:** This graph-expanded candidate strengthens identity-to-policy governance links already required by pins. It complements baseline IAM and policy candidates with clearer governance/runtime separation.
**Implications:**
- Add explicit identity-governance to policy-binding interface contracts.
- Separate identity lifecycle admin responsibilities from runtime policy decision flow.
**Open questions:**
- None.

### M-7: CAF-COMP-02  -  Evidence Schema Consistency Across Planes (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Retention and hard deletion obligations require durable evidence semantics. (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Tenant-scoped backup/restore requires tenant-safe audit surfaces. (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] Graph-expanded evidence pattern refines schema consistency for cross-plane traceability. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-02.yaml)
**Rationale:** Existing evidence obligations need consistent schemas to remain queryable and enforceable across lifecycle events. This graph-expanded refinement improves interoperability of evidence artifacts.
**Implications:**
- Standardize evidence schema versioning and field naming across planes.
- Include retention/deletion evidence events in the common schema.
**Open questions:**
- None.

### M-8: CAF-COH-02  -  Canonical Term Registry for Cross-Plane Contracts (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control-plane declarative/evaluative governance relies on stable, shared contract language. (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [derived_rails_or_posture] Refusal posture is fail-closed, which benefits from unambiguous term definitions in guardrail and evidence flows. (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml:refusal_posture)
- E3 [pattern_definition] Graph-expanded coherence pattern strengthens canonical terminology controls. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COH-02.yaml)
**Rationale:** Cross-plane governance and evidence flows become brittle when terms drift. This candidate improves consistency without introducing new technology choices.
**Implications:**
- Establish a canonical glossary reference in architecture/design docs.
- Tie term registry updates to policy/evidence schema reviews.
**Open questions:**
- None.

### M-9: CAF-MTEN-AGOBS-01  -  Tenant-Scoped Auditability for Multi-Tenant Operations (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Data-plane governance requires inline evidence for access/enforcement outcomes. (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Storage lifecycle events emit inline evidence for auditability. (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pattern_definition] Graph-expanded multi-tenant observability pattern refines tenant-scoped audit hooks. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-AGOBS-01.yaml)
**Rationale:** Tenant isolation needs tenant-scoped audit traces to be operationally enforceable. This graph-expanded candidate complements baseline MTEN and evidence patterns with observability detail.
**Implications:**
- Add tenant-scoped audit query requirements to reporting capabilities.
- Require tenant key and principal key in all governance evidence events.
**Open questions:**
- None.
