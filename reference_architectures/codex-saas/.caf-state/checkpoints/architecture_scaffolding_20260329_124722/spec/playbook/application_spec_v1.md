# Application Specification (v1)

<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->
## Intent-derived app-plane constraints (CAF-managed)

- Tenant context is ingress-bound and immutable for each request/execution path (AP-1).
- Authorization and policy checks execute inline before protected work and before agent invocation (AP-2, AP-3, AP-4).
- Application-plane role is invocation and orchestration of governed workflows; long-lived orchestration state is not hosted in AP (AP-5).
- AP services must emit synchronous execution evidence for policy checks, gate outcomes, and major action transitions (AP-6).
- AP runtime posture is HTTP API service (`planes.ap.runtime_shape=api_service_http`) built on pinned Python/FastAPI stack (`platform.runtime_language=python`, `platform.framework=fastapi`).
- AP integrations with persistence must enforce tenant-scoped access patterns consistent with DP/ST isolation constraints.
- Phase posture is design/scaffolding only; AP outputs must remain non-runnable artifacts in `architecture_scaffolding`.
<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 END -->

## Externalized product/domain sources

The application spec stays lean.
Detailed product-surface and detailed domain-model content belong in these architect-edit source docs:

- `spec/playbook/application_product_surface_v1.md`
- `spec/playbook/application_domain_model_v1.md`

Use this spec for application-plane constraints, candidate decisions, compact bridge notes, and open questions.

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->

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

### M-7: CAF-PLANE-01  -  Tri-Plane Separation (Control/Application/Data) (confidence: medium)
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

### M-8: POL-01  -  Policy Enforcement Boundary (confidence: medium)
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

### M-9: CTX-01  -  Request Context and Propagation (confidence: medium)
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

### M-10: PST-01  -  Persistence Boundary via Repositories (confidence: medium)
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

### M-11: OBS-01  -  Observability Boundary (confidence: medium)
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

### M-12: CAF-POL-02  -  Policy Responsibilities Across Planes (confidence: medium)
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

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
## Decision resolutions (architect-edit; optional)

Use this YAML block only for local application-plane decisions you want to record explicitly.
If you are just trying CAF for the first time, it is fine to leave this empty.

```yaml
schema_version: decision_resolutions_v1
decisions:
  - evidence_hook_id: H-1
    pattern_id: CAF-TCTX-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-TCTX-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Tenant context is a first-order invariant in the pins and in system/app constraints. CAF-TCTX-01 directly captures this invariant and provides a normalized cross-plane propagation posture."
    resolved_values:
      questions:
        - question_id: Q-AP-TENANT-CARRIER-01
          question: "What is the tenant context carrier at the AP ingress boundary (kind/name/type) and what are the rejection conditions?"
          description: "Select how tenant context is carried and validated at the application ingress boundary. For `auth_claim`, the carrier lives inside verified auth material (for example Authorization/Bearer claims), not as a generic tenant header."
          option_set_id: tenant_context.ingress_carrier
          options:
            - option_id: auth_claim
              status: adopt
              summary: "Tenant context from a verified auth claim inside the Authorization credential (for example a JWT `tenant_id` claim), not from client-supplied tenant headers."
              payload: {}
            - option_id: signed_gateway_header
              status: defer
              summary: "Tenant context from a trusted gateway header (not client-controlled)."
              payload: {}
            - option_id: path_segment
              status: defer
              summary: "Tenant id from URL path segment."
              payload: {}
            - option_id: subdomain
              status: defer
              summary: "Tenant id from host/subdomain."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              payload: {}
        - question_id: Q-CPAP-TENANT-CARRIER-01
          question: "What tenant context carrier is used on CP↔AP interactions (kind/name/type) and what are the rejection conditions?"
          description: "Select how tenant context is carried and validated for CP↔AP contract interactions (control signals and governance coordination)."
          option_set_id: tenant_context.ingress_carrier
          options:
            - option_id: auth_claim
              status: adopt
              summary: "Tenant context from a verified auth claim inside the Authorization credential (for example a JWT `tenant_id` claim), not from client-supplied tenant headers."
              payload: {}
            - option_id: signed_gateway_header
              status: defer
              summary: "Tenant context from a trusted gateway header (not client-controlled)."
              payload: {}
            - option_id: path_segment
              status: defer
              summary: "Tenant id from URL path segment."
              payload: {}
            - option_id: subdomain
              status: defer
              summary: "Tenant id from host/subdomain."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              payload: {}
        - question_id: Q-CPAP-TCTX-CONFLICT-01
          question: "If multiple potential tenant carriers are present (e.g., claim + header), which is authoritative and what is the rejection rule?"
          description: "Define precedence and conflict handling when more than one tenant carrier could be observed."
          option_set_id: tenant_context.conflict_precedence_rule
          options:
            - option_id: claim_over_header
              status: adopt
              summary: "Verified claim wins; reject if any other carrier conflicts."
              payload: {}
            - option_id: path_over_claim
              status: defer
              summary: "Path segment wins; reject if any other carrier conflicts."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              payload: {}
  - evidence_hook_id: H-2
    pattern_id: CAF-MTEN-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-MTEN-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pinned architecture is explicitly multi-tenant with enforced tenant-scoped access and storage partitioning. CAF-MTEN-01 is the most direct architectural fit and satisfies the tenancy coverage rule."
    resolved_values:
      questions:
        - question_id: Q-MTEN-ISO-MODE-01
          question: "Which tenancy isolation mode is intended for the default product tier?"
          description: "Select one option. Use 'custom' only if none fit."
          option_set_id: tenancy.isolation_mode
          options:
            - option_id: pooled_everything
              status: defer
              summary: "Pooled everything (logical isolation; shared infra)."
              payload: {}
            - option_id: pooled_compute_partitioned_data
              status: defer
              summary: "Pooled compute + partitioned data (bridge isolation)."
              payload: {}
            - option_id: silo_tenants_dedicated_infra
              status: defer
              summary: "Silo tenants (dedicated infrastructure per tenant)."
              payload: {}
            - option_id: hybrid_tiered
              status: adopt
              summary: "Hybrid isolation (selective and tiered by tenant)."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (describe your isolation approach; prefer adopting an existing mode when possible)."
              notes: ""
              payload: {}
  - evidence_hook_id: H-3
    pattern_id: CAF-POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-POL-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Pins establish centralized policy ownership with inline enforcement at execution boundaries. CAF-POL-01 aligns these constraints into a coherent policy lifecycle and enforcement architecture."
    resolved_values:
      questions:
        - question_id: Q-AP-POLICY-POINTS-01
          question: "Which operations require policy gating (list/get/create/update/delete), and what decision inputs are required?"
          description: "Select default policy gating posture for CRUD ops; specialize resource_id token to the actual resource id field."
          option_set_id: policy_gating.default_crud
          options:
            - option_id: gate_all_ops
              status: adopt
              summary: "Gate all CRUD operations."
              payload: {}
            - option_id: gate_write_only
              status: defer
              summary: "Gate write operations; list may be ungated; gate get."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom policy gates (fill fields)."
              payload: {}
  - evidence_hook_id: H-4
    pattern_id: CAF-AID-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-AID-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The architecture includes explicit agent identity governance and authority constraints. CAF-AID-01 preserves these requirements as architecture-level obligations."
    resolved_values:
      questions:
        - question_id: Q-AID-KIND-01
          question: "What identity kind does the agent present (service, per-agent, delegated user) and what claims are required?"
          description: "Select the agent identity mode and required verification claims."
          option_set_id: agent.identity_kind
          options:
            - option_id: service_identity_only
              status: adopt
              summary: "Agent uses a service identity (no per-agent individuality)."
              payload: {}
            - option_id: per_agent_identity
              status: defer
              summary: "Each agent instance has a distinct identity bound to a tenant and role."
              payload: {}
            - option_id: delegated_user_identity
              status: defer
              summary: "Agent acts on behalf of a user with explicit delegation scope."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              payload: {}
  - evidence_hook_id: H-5
    pattern_id: CAF-AI-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-AI-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Pins demand pre-action/pre-invocation safety enforcement and centralized governance ownership. CAF-AI-01 provides the cross-plane separation needed to implement that posture consistently."
    resolved_values:
      questions:
        - question_id: Q-AI-PART-01
          question: "How are AI safety governance and enforcement partitioned across planes?"
          description: "Select the governance/enforcement partitioning for AI safety controls."
          option_set_id: ai_safety.governance_partitioning
          options:
            - option_id: cp_governs_ap_enforces
              status: adopt
              summary: "Control Plane governs policy; Application Plane enforces at runtime."
              notes: ""
              payload: {}
            - option_id: cp_only
              status: defer
              summary: "Control Plane both governs and enforces (AP delegates decisions)."
              notes: ""
              payload: {}
            - option_id: shared_governance_shared_enforcement
              status: defer
              summary: "Governance and enforcement responsibilities are shared with explicit boundaries."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
  - evidence_hook_id: H-6
    pattern_id: CAF-COMP-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-COMP-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Evidence is explicitly mandated across AP/AI/DP/ST pins and governance posture. CAF-COMP-01 aligns these into end-to-end traceability constraints."
    resolved_values:
      questions:
        - question_id: Q-CAF-COMP-01-01
          question: "Where and how is compliance evidence persisted as an immutable byproduct of normal operation?"
          description: "Choose an append-only stream, an immutable store, or both."
          option_set_id: compliance_evidence.persistence_strategy
          options:
            - option_id: append_only_event_stream
              status: defer
              summary: "Persist evidence to an append-only event stream (durable, ordered)."
              notes: ""
              payload: {}
            - option_id: immutable_evidence_store
              status: defer
              summary: "Persist evidence to an immutable evidence store with retention controls."
              notes: ""
              payload: {}
            - option_id: stream_plus_immutable_store
              status: adopt
              summary: "Use an event stream plus an immutable store (preferred for audit readiness)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-10
    pattern_id: PST-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: PST-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pinned data posture requires strict tenant-safe persistence boundaries and retention controls. PST-01 is consistent with the chosen runtime/data stack and boundary model."
    resolved_values: {}
  - evidence_hook_id: M-11
    pattern_id: OBS-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: OBS-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Given explicit evidence obligations and governance posture, observability boundaries should be architectural rather than incidental. OBS-01 captures that requirement."
    resolved_values: {}
  - evidence_hook_id: M-12
    pattern_id: CAF-POL-02
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-POL-02
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pinned posture separates policy lifecycle ownership, evaluation, and governed data enforcement across planes. CAF-POL-02 is a direct fit for this responsibility split."
    resolved_values:
      questions:
        - question_id: Q-POL-DIST-01
          question: "How are policy responsibilities distributed across planes (decision point vs enforcement point)?"
          description: "Select where policy decisions are made and where enforcement occurs."
          option_set_id: policy.responsibility_distribution
          options:
            - option_id: cp_central_decision_ap_enforces
              status: adopt
              summary: "Control Plane centralizes policy decision; Application Plane enforces."
              notes: ""
              payload: {}
            - option_id: ap_local_decision_and_enforcement
              status: defer
              summary: "Application Plane performs local policy decisions and enforcement (CP provides intent)."
              notes: ""
              payload: {}
            - option_id: gateway_or_edge_enforcement
              status: defer
              summary: "Edge/gateway enforces policy at ingress with CP-governed intent."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-7
    pattern_id: CAF-PLANE-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-PLANE-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pins and constraints already encode tri-plane separation. CAF-PLANE-01 reinforces these boundaries and limits cross-plane responsibility leakage."
    resolved_values:
      questions:
        - question_id: Q-CP-AP-SURFACE-01
          question: "What is the primary CP↔AP contract surface (sync HTTP APIs, async events/messages, or a mixed approach)?"
          description: "Select the primary integration surface between Control Plane and Application Plane for governance and coordination flows."
          option_set_id: cp_ap.contract_surface
          options:
            - option_id: synchronous_http
              status: defer
              summary: "CP↔AP calls via HTTP APIs."
              payload: {}
            - option_id: async_events
              status: defer
              summary: "CP↔AP coordination via async events/messages."
              payload: {}
            - option_id: mixed
              status: adopt
              summary: "Mix: sync for enforcement, async for lifecycle and audit."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill notes)."
              payload: {}
  - evidence_hook_id: M-8
    pattern_id: POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: POL-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Core POL-01 complements CAF policy patterns by defining explicit enforcement boundaries for request handling and side-effect control."
    resolved_values: {}
  - evidence_hook_id: M-9
    pattern_id: CTX-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CTX-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The architecture relies on strict context continuity for tenant isolation and policy correctness. CTX-01 provides implementation-neutral boundary requirements."
    resolved_values: {}
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 START -->
## Domain and resources bridge (architect-edit)

Use this block only as a compact narrative bridge for the planner when you need to summarize:

- the main business resources or aggregates
- the user-visible capabilities that matter architecturally
- any compact notes that should remain visible in the spec itself

Do not duplicate the detailed domain model here.
That detail belongs in `spec/playbook/application_domain_model_v1.md`.

Suggested content:

- main resources / aggregates the product revolves around
- the most important tenant-facing capabilities
- any compact domain terminology notes that should remain stable across spec/design/planning
<!-- ARCHITECT_EDIT_BLOCK: domain_and_resources_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

Use this section for unresolved questions that should remain visible to the human architect.
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 START -->
## Notes / constraints (optional)

Use this section for compact application-plane constraints that matter architecturally.
<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 END -->
