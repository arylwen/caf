# Application Specification (v1)

<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->
## Intent-derived app-plane constraints (CAF-managed)

### Multi-tenancy

- Required: Yes. All application operations execute in explicit tenant context derived at ingress and treated as immutable for request/session scope.
- Tenant isolation: Logical isolation is mandatory; application workflows and data access calls must carry tenant-scoped identifiers and fail closed when tenant context is absent.
- Required identity attribute: Principal identity must be present and bound to tenant context for authorization and evidence attribution.

### Identity (core)

- Required: Yes. Each AP invocation must execute under a bound principal identity with policy-derived authority.
- Notes: Auth mode is currently pinned to `mock`; architecture must preserve explicit identity/policy seams without introducing production IAM assumptions in this phase.
<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: ui_product_surface_v1 START -->
## User interface product surface (architect-edit)

Use this section to describe the **product-facing experience**, not implementation details.
Write down what a human user should be able to do and what screens or flows need to exist.

How to use this block:

1. Keep the language product-facing.
2. Describe actors, journeys, and screens.
3. Avoid framework/runtime choices here; those belong in `spec/guardrails/profile_parameters.yaml`.
4. It is acceptable to keep the starter example below for a first CAF run and then refine it later.

Starter example (replace or adapt):

- The product includes a browser-based UI for tenant operators and reviewers.
- The primary navigation includes: Dashboard, Workspaces, Submissions, Review Queue, Reports, and Settings.
- A user can create a workspace, submit an item for review, inspect the review result, and export a report.
- Operators can filter work by tenant, status, owner, and date range.
- Keep the UX lightweight for local/demo runs: straightforward forms, list/detail pages, and clear status labels are enough.
- The UI does not need rich collaboration features in the first iteration; correctness and visible end-to-end flow matter more than polish.
<!-- ARCHITECT_EDIT_BLOCK: ui_product_surface_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->

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

### M-8: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Relational persistence and access boundary intent are pinned by DP-2, ST-2, ST-3 plus Postgres/SQLAlchemy platform pins. (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Resolved profile pins data stack to postgres + sqlalchemy_orm with code-bootstrap schema management. (rail_ref: platform.database_engine=postgres; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Core persistence boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml)
**Rationale:** Repository boundaries fit the pinned persistence strategy and tenant-enforcement constraints. This enables clear AP-to-DP interfaces without coupling domain logic to storage mechanics.
**Implications:**
- Keep tenant-scoped repository contracts explicit.
- Route persistence through AP ports/adapters rather than direct storage access.

### M-9: SVC-01 - Application Service Facade Boundary (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] AP execution responsibilities and synchronous checks are pinned by AP-2, AP-3, AP-5, AP-6. (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core service-facade boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml)
**Rationale:** An application service facade aligns with pinned AP responsibilities and supports deterministic orchestration entry points.
**Implications:**
- Define use-case style service facades per major product workflow.
- Keep UI/API ingress mapping separate from domain/persistence internals.

### M-10: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Fail-closed and pre-execution constraints require strict validation boundaries: AP-3, AP-4, AI-3, AI-5. (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [derived_rails_or_posture] Resolved guardrails include refusal posture fail_closed and forbidden action constraints. (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
- E3 [pattern_definition] Core validation boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml)
**Rationale:** Validation and deterministic failure behavior are mandatory for the pinned safety/governance posture. This pattern defines that contract boundary.
**Implications:**
- Document input/schema validation points for CP and AP APIs.
- Normalize error/evidence output semantics for rejected actions.

### M-11: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Identity governance is explicitly pinned in CP-3 and AI-1 with policy-derived authority AI-2. (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF identity principal taxonomy definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml)
**Rationale:** Control-plane identity taxonomy is needed to keep principal classes and authority assignment explicit. This pattern supports policy and evidence consistency.
**Implications:**
- Define principal classes and lifecycle ownership in CP docs.
- Link principal types to policy enforcement and audit events.

### M-12: CAF-IAM-02 - Identity and Context Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Cross-plane identity/context propagation is implied by AP-1, AP-2, AI-1, AI-4, and CP-3. (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF identity and context propagation definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml)
**Rationale:** This pattern complements context propagation by defining identity-carrying obligations across boundaries.
**Implications:**
- Require identity and tenant fields in cross-plane contract schemas.
- Align context propagation with policy evaluation checkpoints.

### M-13: OBS-01 - Observability Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Evidence and observability requirements are pinned by AP-6, AI-6, DP-5, and ST-6. (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core observability boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml)
**Rationale:** The graph expansion introduced observability as a close complement to evidence-generation seeds. It is grounded by synchronous emission pins.
**Implications:**
- Define cross-plane telemetry/evidence correlation keys.
- Keep observability ingestion and policy views in CP scope.

### M-14: CAF-POL-01 - Control Plane Policy Decision Pipeline (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy/governance ownership and evaluation sequence are pinned by CP-4, CP-5, AP-3, AI-2, AI-3. (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF policy pipeline definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml)
**Rationale:** Graph expansion surfaced this as a direct dependency of AI safety separation. It is grounded in centralized policy-authoring and pre-execution evaluation pins.
**Implications:**
- Capture policy lifecycle states and evaluation checkpoints in CP specs.
- Keep AP callers dependent on CP policy decision outcomes.

### M-15: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Cross-plane interaction constraints are implied by CP-6, AP-5, DP-4, and tenant isolation pins DP-1/ST-1. (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF allowed cross-plane interaction definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml)
- E3 [pinned_input] Pin coverage aggregate reference: CP-1 CP-2 CP-3 CP-4 CP-5 CP-6 AP-1 AP-2 AP-3 AP-4 AP-5 AP-6 DP-1 DP-2 DP-3 DP-4 DP-5 AI-1 AI-2 AI-3 AI-4 AI-5 AI-6 ST-1 ST-2 ST-3 ST-4 ST-5 ST-6. (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** The architecture requires explicit allowed interactions across planes while maintaining authority and isolation boundaries. This graph-derived candidate is grounded by plane and governance pins.
**Implications:**
- Document allowed CP?AP and AP?DP interaction shapes.
- Flag prohibited interaction paths as explicit anti-patterns for later phases.

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
    rationale: "The pins and rails require tenant-scoped context propagation at every boundary. This pattern anchors the cross-plane context contract without introducing new technology choices."
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
    rationale: "The architecture shape is tenancy-first and requires deterministic tenant scoping for data and operations. This pattern prevents drift into implicit single-tenant assumptions."
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
    pattern_id: CAF-PLANE-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-PLANE-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pinned intent is organized by control/application/data responsibilities. A tri-plane separation pattern is directly aligned with those constraints."
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
  - evidence_hook_id: H-4
    pattern_id: CAF-AI-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-AI-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Safety and policy checks are required before side effects and before agent/tool execution. This pattern keeps governance ownership clear while enabling AP execution."
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
  - evidence_hook_id: H-5
    pattern_id: CAF-COMP-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-COMP-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Evidence is not optional in this shape; it is part of normal control flow. This pattern aligns spec decisions with auditable records."
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
  - evidence_hook_id: H-6
    pattern_id: CTX-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CTX-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Core request-context propagation is needed to operationalize tenant and principal constraints in APIs and workflows. This pattern complements CAF normative context rules."
    resolved_values: {}
  - evidence_hook_id: H-7
    pattern_id: POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: POL-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Policy authority is control-plane-owned and must be enforced synchronously at execution boundaries. This pattern codifies that edge."
    resolved_values: {}
  - evidence_hook_id: M-10
    pattern_id: VAL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: VAL-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Validation and deterministic failure behavior are mandatory for the pinned safety/governance posture. This pattern defines that contract boundary."
    resolved_values: {}
  - evidence_hook_id: M-11
    pattern_id: CAF-IAM-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-IAM-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Control-plane identity taxonomy is needed to keep principal classes and authority assignment explicit. This pattern supports policy and evidence consistency."
    resolved_values:
      questions:
        - question_id: Q-CAF-IAM-01-AUTO-01
          question: "Select an option for iam.principal_taxonomy_scope."
          description: ""
          option_set_id: iam.principal_taxonomy_scope
          options:
            - option_id: minimal_tenant_and_service
              status: defer
              summary: "Minimal taxonomy: tenant user + service principals."
              payload: {}
            - option_id: standard_platform_tenant_service
              status: adopt
              summary: "Standard taxonomy: platform user + tenant user + service principals."
              payload: {}
            - option_id: full_including_agent
              status: defer
              summary: "Full taxonomy: platform user + tenant user + service + agent principals."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (describe your approach; prefer adopting a bounded variant when possible)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-12
    pattern_id: CAF-IAM-02
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-IAM-02
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "This pattern complements context propagation by defining identity-carrying obligations across boundaries."
    resolved_values:
      questions:
        - question_id: Q-CAF-IAM-02-01
          question: "Which option best matches your intended choice for `iam.identity_context_propagation` and what constraints/rejection conditions apply?"
          description: ""
          option_set_id: iam.identity_context_propagation
          options:
            - option_id: verified_token_claims
              status: adopt
              summary: "Propagate identity and tenant context via verified token claims at ingress."
              payload: {}
            - option_id: signed_gateway_header
              status: defer
              summary: "Propagate identity context via a trusted gateway signed header (not client-controlled)."
              payload: {}
            - option_id: mtls_client_cert_identity
              status: defer
              summary: "Propagate service identity via mTLS client cert identity (service-to-service)."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (describe your approach; prefer adopting a bounded variant when possible)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-13
    pattern_id: OBS-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: OBS-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The graph expansion introduced observability as a close complement to evidence-generation seeds. It is grounded by synchronous emission pins."
    resolved_values: {}
  - evidence_hook_id: M-14
    pattern_id: CAF-POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-POL-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Graph expansion surfaced this as a direct dependency of AI safety separation. It is grounded in centralized policy-authoring and pre-execution evaluation pins."
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
  - evidence_hook_id: M-15
    pattern_id: CAF-XPLANE-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-XPLANE-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The architecture requires explicit allowed interactions across planes while maintaining authority and isolation boundaries. This graph-derived candidate is grounded by plane and governance pins."
    resolved_values:
      questions:
        - question_id: Q-XPLANE-MODE-01
          question: "Which cross-plane interaction mode(s) are allowed (synchronous API, async message, artifact handoff)?"
          description: "Select allowed interaction modes for cross-plane boundaries."
          option_set_id: cross_plane.interaction_mode
          options:
            - option_id: synchronous_api
              status: adopt
              summary: "Synchronous request/response API call across the plane boundary."
              notes: ""
              payload: {}
            - option_id: async_message
              status: defer
              summary: "Asynchronous message/event across the plane boundary."
              notes: ""
              payload: {}
            - option_id: artifact_handoff
              status: defer
              summary: "Artifact/handle handoff (e.g., contract, plan, or data artifact) across the boundary."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-8
    pattern_id: PST-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: PST-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Repository boundaries fit the pinned persistence strategy and tenant-enforcement constraints. This enables clear AP-to-DP interfaces without coupling domain logic to storage mechanics."
    resolved_values: {}
  - evidence_hook_id: M-9
    pattern_id: SVC-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: SVC-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "An application service facade aligns with pinned AP responsibilities and supports deterministic orchestration entry points."
    resolved_values: {}
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: domain_and_capabilities_v1 START -->
## Product domain and capabilities (architect-edit)

Use this section to describe the **business-facing application behavior**.
Do not try to fully normalize entities here; the detailed application-plane domain model belongs in `spec/playbook/application_domain_model_v1.md`.

What to capture here:

- what the product helps users accomplish
- the main business objects users talk about
- the major user-visible operations
- any important business constraints the application must respect

Starter example (replace or adapt):

This product helps tenant teams submit items for automated review, inspect findings, and publish final reports.

Main business objects:

- Workspace: a tenant-scoped container for review activity
- Submission: an item a user sends into the review flow
- Review: the current evaluation state and findings for a submission
- Report: an exported or shareable outcome summarizing the review result

User-visible capabilities:

- create and manage workspaces
- submit an item for review
- list and inspect submissions by status
- review findings and mark a submission as approved or rejected
- export a report for downstream use

Business constraints:

- every business object is tenant-scoped
- status changes must be visible to the user
- reports must be reproducible from the final approved review state
- destructive actions should be limited and intentional in the first release

Move these details into `application_domain_model_v1.md` when you want fields, invariants, and persistence intent.
<!-- ARCHITECT_EDIT_BLOCK: domain_and_capabilities_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

Use this section for unresolved questions that should remain visible to the human architect.

Starter examples:

- Do we need draft autosave for submissions, or is explicit save enough for the first release?
- Should reports be regenerated on demand or stored as immutable snapshots?
- Are review decisions single-step, or do they require multi-person approval later?
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 START -->
## Notes / constraints (optional)

Use this section for compact application-plane constraints that matter architecturally.

Starter examples:

- Prefer simple CRUD + workflow progression over advanced collaboration in the first version.
- Optimize for clear end-to-end demonstration of the product flow rather than UI sophistication.
- Keep terminology stable across UI, APIs, and domain model artifacts.
<!-- ARCHITECT_EDIT_BLOCK: notes_and_constraints_v1 END -->
