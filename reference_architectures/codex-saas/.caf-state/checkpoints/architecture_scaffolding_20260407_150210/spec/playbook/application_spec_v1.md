# Application Specification (v1)

<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 START -->
## Intent-derived app-plane constraints (CAF-managed)

- Resolve tenant context once at ingress and propagate it immutably through every application workflow (`pin_ref: AP-1=Ingress-Bound Context`).
- Perform policy evaluation and authorization checks before execution and inline with request handling (`pin_ref: AP-2=Inline Enforcement`; `pin_ref: AP-3=Pre-Execution Evaluation`).
- Run safety-gate checks before AI/agent invocation and before side-effecting actions (`pin_ref: AP-4=Pre-Invocation Safety Gates`; `pin_ref: AI-3=Pre-Invocation Evaluation Only`).
- Limit AP responsibility to orchestrating governed agent invocations; long-lived governance state remains control-plane owned (`pin_ref: AP-5=Agent Invocation Only`; `pin_ref: CP-2=Authoritative Lifecycle Owner`).
- Emit synchronous evidence for key request, decision, and publish/admin transitions (`pin_ref: AP-6=Synchronous Emission`; `pin_ref: AI-6=Synchronous Evidence Emission`).
- Model product capabilities around tenant-scoped widget CRUD, organization (tags/collections), sharing by role, and tenant administration from the resolved PRD.
- Keep first release intentionally limited (no cross-tenant sharing, no realtime collaboration, no complex workflow automation) to match PRD constraints.
- Honor prototype rails: no runnable production code claims, no vendor selection, and no writes outside allowed CAF instance surfaces.
<!-- CAF_MANAGED_BLOCK: intent_derived_app_plane_constraints_v1 END -->

## Externalized product/domain sources

The application spec stays lean.
Detailed product-surface and detailed domain-model content belong in these architect-edit source docs:

- `spec/playbook/application_product_surface_v1.md`
- `spec/playbook/application_domain_model_v1.md`

Use this spec for application-plane constraints, candidate decisions, compact bridge notes, and open questions.

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->

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
    rationale: "Ingress-bound and session-scoped context pins require a normative propagation mechanism across AP/CP/DP boundaries. This pattern directly matches that need."
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
    rationale: "The architecture pins require tenant isolation as a system invariant, not a feature toggle. This pattern anchors that invariant across planes."
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
    rationale: "The selected pins map directly to a tri-plane authority split. This pattern keeps ownership and runtime responsibilities coherent."
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
    rationale: "AI-related pins require strict pre-execution governance and gate ownership boundaries. This pattern codifies those constraints."
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
    rationale: "Multiple pin families require synchronous evidence emission. This pattern provides a consistent cross-plane traceability baseline."
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
    rationale: "The selected pins require deterministic request context handling for policy and data isolation. CTX-01 is a direct fit."
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
    rationale: "The architecture requires predictable deny/failure behavior before side effects. VAL-01 supports that requirement."
    resolved_values: {}
  - evidence_hook_id: M-11
    pattern_id: CAF-AIOBS-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-AIOBS-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Evidence emission pins need explicit AI-focused observability hooks tied into governance and auditing."
    resolved_values:
      questions:
        - question_id: Q-CAF-AIOBS-01-01
          question: "Which observability hook level will you adopt for AI/agent runs?"
          description: ""
          option_set_id: ai_observability.hook_level
          options:
            - option_id: minimal
              status: defer
              summary: "Minimal request/response telemetry (IDs, timing, outcome)."
              payload: {}
            - option_id: tools
              status: defer
              summary: "Include tool invocation telemetry (names, timings, outcomes)."
              payload: {}
            - option_id: trace_metadata
              status: adopt
              summary: "Include structured trace metadata (no full reasoning content)."
              payload: {}
            - option_id: full_trace
              status: defer
              summary: "Capture full trace content (requires strict redaction and access controls)."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              payload: {}
  - evidence_hook_id: M-12
    pattern_id: CAF-POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-POL-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "CP policy ownership and fail-closed rails align with explicit allow semantics as the governing model."
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
  - evidence_hook_id: M-13
    pattern_id: CAF-POL-02
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-POL-02
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Governance lifecycle and identity pins require decision provenance so runtime checks can be audited and reproduced."
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
  - evidence_hook_id: M-14
    pattern_id: CAF-IAM-02
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-IAM-02
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Identity governance and authority pins require deterministic context propagation for principal attribution across boundaries."
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
  - evidence_hook_id: M-15
    pattern_id: CAF-COMP-02
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-COMP-02
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-02.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Existing evidence-emission pins benefit from a complementary pattern that tightens taxonomy and storage binding semantics."
    resolved_values:
      questions:
        - question_id: Q-CAF-COMP-02-01
          question: "How should compliance anti-patterns be enforced?"
          description: "Choose advisory-only, warn-then-gate, or fail-closed enforcement."
          option_set_id: compliance.anti_pattern_enforcement_mode
          options:
            - option_id: advisory_only
              status: defer
              summary: "Detect and report anti-patterns; do not block."
              notes: ""
              payload: {}
            - option_id: warn_then_gate
              status: adopt
              summary: "Warn during scaffolding; fail closed at gate checks if unresolved."
              notes: ""
              payload: {}
            - option_id: fail_closed
              status: defer
              summary: "Fail closed immediately on detected anti-patterns."
              notes: ""
              payload: {}
  - evidence_hook_id: M-7
    pattern_id: POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: POL-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Policy ownership and inline enforcement pins map to a strong control-plane policy boundary with runtime enforcement at AP edges."
    resolved_values: {}
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
    rationale: "Data-plane enforcement pins require strict repository boundaries and tenant-safe data access contracts."
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
    rationale: "AP orchestration plus inline policy constraints benefits from a clear service facade for use-case entry points and policy hooks."
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
