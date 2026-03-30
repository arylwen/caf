### H-1: CAF-TCTX-01  -  Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context is established at ingress and remains immutable through execution (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Agent context is session-scoped and tenant-scoped retrieval only (pin_ref: AI-4=Session-Scoped Context Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Data access is tenant-scoped and enforced in the data access layer (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Storage identity is tenant-keyed and tenant-partitioned (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pattern_definition] Pattern defines normative context propagation across planes (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml)
**Rationale:**
Tenant context is a first-order invariant in the pins and in system/app constraints. CAF-TCTX-01 directly captures this invariant and provides a normalized cross-plane propagation posture.
**Implications:**
- Keep context-carrier requirements explicit across CP/AP boundaries.
- Require tenant context fields on app-plane service and persistence contracts.
**Open questions:**
- None.

### H-2: CAF-MTEN-01  -  Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Logical isolation is mandatory for tenant data access (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Data plane hosts tenant-scoped inputs/outputs and governance constraints (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Shared storage requires logical isolation with tenant partitioning (pin_ref: ST-1=Shared Storage with Logical Isolation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Storage placement is tenant-partitioned (pin_ref: ST-3=Tenant-Partitioned Placement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E6 [pattern_definition] Pattern codifies tenancy as architectural baseline, not optional feature (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml)
**Rationale:**
The pinned architecture is explicitly multi-tenant with enforced tenant-scoped access and storage partitioning. CAF-MTEN-01 is the most direct architectural fit and satisfies the tenancy coverage rule.
**Implications:**
- Keep tenant key mandatory across domain entities and persistence mappings.
- Retain fail-closed handling when tenant context is missing.
**Open questions:**
- None.

### H-3: CAF-POL-01  -  Policy as a First-Class System Artifact (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Control plane evaluates governance artifacts declaratively/evaluatively (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Policy authoring is centralized in control plane (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Application path enforces authorization inline and pre-execution (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Policy evaluation is required before execution (pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pattern_definition] Pattern defines policy lifecycle as governable artifact with controlled propagation (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml)
**Rationale:**
Pins establish centralized policy ownership with inline enforcement at execution boundaries. CAF-POL-01 aligns these constraints into a coherent policy lifecycle and enforcement architecture.
**Implications:**
- Keep policy lifecycle concerns in CP surfaces.
- Preserve AP contract requirement to block execution on policy denial.
**Open questions:**
- None.

### H-4: CAF-AID-01  -  Agent Identity Pattern (Normative Summary) (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Agent execution uses single-principal identity per session (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Agent authority is policy-derived (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Tool invocation is gated pre-invocation (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] AP invokes agent execution without owning orchestration state (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pinned_input] Identity governance across human/service/agent principals is control-plane owned (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E6 [pattern_definition] Pattern defines normative agent identity boundaries and attribution model (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml)
**Rationale:**
The architecture includes explicit agent identity governance and authority constraints. CAF-AID-01 preserves these requirements as architecture-level obligations.
**Implications:**
- Keep explicit actor identity fields in evidence and audit records.
- Ensure AP/CP APIs carry identity context and policy decision linkage.
**Open questions:**
- None.

### H-5: CAF-AI-01  -  AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Safety gates are required before AI/agent execution (pin_ref: AP-4=Pre-Invocation Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Control plane centrally orchestrates safety gate definitions and escalation rules (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Safety gates also apply before side-effecting actions (pin_ref: AI-5=Pre-Action Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [derived_rails_or_posture] Run posture is fail-closed for missing/ambiguous requirements (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml:lifecycle)
- E5 [pattern_definition] Pattern separates safety/governance responsibilities across planes (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml)
**Rationale:**
Pins demand pre-action/pre-invocation safety enforcement and centralized governance ownership. CAF-AI-01 provides the cross-plane separation needed to implement that posture consistently.
**Implications:**
- Keep CP as owner of safety policy/state; AP consumes decisions.
- Retain explicit evidence for every gate outcome.
**Open questions:**
- None.

### H-6: CAF-COMP-01  -  Evidence Generation & Traceability (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP emits synchronous evidence inline with execution (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] AI execution emits synchronous evidence for decisions and tool actions (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Data-plane governance actions emit inline evidence (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pinned_input] Storage lifecycle events emit inline evidence (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E5 [pinned_input] Control plane owns lifecycle transitions requiring auditability (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E6 [pattern_definition] Pattern requires evidence as first-class output rather than optional logging (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml)
**Rationale:**
Evidence is explicitly mandated across AP/AI/DP/ST pins and governance posture. CAF-COMP-01 aligns these into end-to-end traceability constraints.
**Implications:**
- Keep evidence schema links visible in system/application specs.
- Preserve synchronous decision-to-evidence coupling in AP interfaces.
**Open questions:**
- None.

### M-1: CAF-PLANE-01  -  Tri-Plane Separation (Control/Application/Data) (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Control plane governance is unified and authoritative (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Data plane role is constrained to governed input/output persistence (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] AP remains execution/invocation boundary with inline checks (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pattern_definition] Pattern formalizes CP/AP/DP boundary separation and authority partitioning (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml)
**Rationale:**
The pins and constraints already encode tri-plane separation. CAF-PLANE-01 reinforces these boundaries and limits cross-plane responsibility leakage.
**Implications:**
- Keep boundaries explicit in architecture and planning artifacts.
- Reject designs that relocate CP governance into AP/DP runtime.
**Open questions:**
- None.

### M-2: POL-01  -  Policy Enforcement Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] AP policy checks run inline before execution (pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Control plane centralizes policy authoring and authority definitions (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [derived_rails_or_posture] Guardrails enforce fail-closed posture and forbid bypass actions (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml:lifecycle)
- E4 [pattern_definition] Core policy boundary pattern defines ingress/egress enforcement envelope (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml)
**Rationale:**
Core POL-01 complements CAF policy patterns by defining explicit enforcement boundaries for request handling and side-effect control.
**Implications:**
- Keep boundary validation requirements in AP ingress contracts.
- Link policy decision artifacts to denial/success responses.
**Open questions:**
- None.

### M-3: CTX-01  -  Request Context and Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Request context is tenant-bound and immutable from ingress (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Identity context includes principal governance and propagation expectations (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Authority remains policy-derived at execution time (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pattern_definition] Core context propagation pattern formalizes context carriers and boundary transfer rules (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml)
**Rationale:**
The architecture relies on strict context continuity for tenant isolation and policy correctness. CTX-01 provides implementation-neutral boundary requirements.
**Implications:**
- Keep context fields mandatory at ingress and internal boundary transitions.
- Tie observability/evidence events to stable context identifiers.
**Open questions:**
- None.

### M-4: PST-01  -  Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Persistence stack is PostgreSQL + SQLAlchemy (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Data access layer must enforce tenant scope for reads/writes (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Tenant backup/restore obligations remain tenant-scoped (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pattern_definition] Core persistence boundary pattern keeps data-plane coupling behind explicit repository contracts (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml)
**Rationale:**
The pinned data posture requires strict tenant-safe persistence boundaries and retention controls. PST-01 is consistent with the chosen runtime/data stack and boundary model.
**Implications:**
- Keep repository/port boundaries explicit in application design.
- Ensure retention and deletion obligations are represented in persistence contracts.
**Open questions:**
- None.

### M-5: OBS-01  -  Observability Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Evidence must be synchronous across AP/AI/DP/ST operations (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Control plane owns lifecycle governance requiring auditable transitions (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] AP emits inline execution evidence to support traceability (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pattern_definition] Core observability boundary pattern defines cross-plane telemetry/correlation expectations (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml)
**Rationale:**
Given explicit evidence obligations and governance posture, observability boundaries should be architectural rather than incidental. OBS-01 captures that requirement.
**Implications:**
- Keep cross-plane correlation IDs and tenant/principal context in evidence records.
- Ensure audit paths remain available throughout lifecycle phases.
**Open questions:**
- None.
### M-6: CAF-POL-02  -  Policy Responsibilities Across Planes (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Data governance includes retention and lineage enforcement in the data plane (pin_ref: DP-3=Access + Retention + Lineage Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E2 [pinned_input] Policy authoring is control-plane centralized (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E3 [pinned_input] Application execution enforces policy decisions inline (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml:template_instances)
- E4 [pattern_definition] Pattern defines split policy responsibilities across planes (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml)
**Rationale:**
The pinned posture separates policy lifecycle ownership, evaluation, and governed data enforcement across planes. CAF-POL-02 is a direct fit for this responsibility split.
**Implications:**
- Keep control-plane policy lifecycle authoritative.
- Keep AP/DP policy enforcement points explicit in design artifacts.
**Open questions:**
- None.
