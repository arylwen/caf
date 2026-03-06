# System Specification (v1)

<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 START -->
## Lifecycle + technology pins (authoritative)
- lifecycle.evolution_stage: `stage_0_local_prototype`
- lifecycle.generation_phase: `architecture_scaffolding`
- platform.auth_mode: `mock`
- platform.database_engine: `postgres`
- platform.eventing_backend: `mock_in_memory`
- platform.framework: `fastapi`
- platform.infra_target: `local`
- platform.packaging: `docker_compose`
- platform.persistence_orm: `sqlalchemy_orm`
- platform.runtime_language: `python`
- platform.schema_management_strategy: `code_bootstrap`
- planes.cp.runtime_shape: `api_service_http`
- planes.ap.runtime_shape: `api_service_http`

Technology choices are pinned in `spec/guardrails/profile_parameters.yaml` under `platform.*` (e.g., `platform.framework: fastapi`) and validated deterministically by CAF guardrails. The spec does not carry technology choice-point YAML.

<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 END -->

<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 START -->
## Architectural intent - pin explanations (CAF-managed)
(1–3 compact bullets per selected pin value, grounded in `architecture_library/07_contura_parameterized_architecture_templates_v1.md`.)

- AI-1=Single-Principal Agent Identity:
  - intent: Define how agent identity is bound and attributed during execution.
  - value: Each agent execution session is bound to exactly one principal identity (human, service, or agent principal) for the duration of the session.
- AI-2=Policy-Derived Authority:
  - intent: Define how an agent’s authority is determined during execution.
  - value: Agent authority is derived strictly from policy evaluations bound to tenant context, identity, and declared action intent.
- AI-3=Pre-Invocation Evaluation Only:
  - intent: Define how tool invocation is bounded and evaluated.
  - value: Tool invocation is permitted only after required policy and Safety Gate checks succeed for the declared tool/action.
- AI-4=Session-Scoped Context Only:
  - intent: Define the allowed use of retrieval and memory during agent execution.
  - value: Agent context is limited to session inputs and explicitly retrieved, tenant-scoped data for the current execution session.
- AI-5=Pre-Action Safety Gates:
  - intent: Define how Safety Gates integrate into agent execution.
  - value: Safety Gates are invoked before agent execution begins and before each action class that can cause side effects.
- AI-6=Synchronous Evidence Emission:
  - intent: Define how agent execution produces auditable evidence.
  - value: Evidence is emitted inline for decisions, tool invocations, and gate outcomes.
- AP-1=Ingress-Bound Context:
  - intent: Define how Tenant Context is established and enforced for execution.
  - value: Tenant Context is resolved exactly once at ingress and is immutable for the duration of execution.
- AP-2=Inline Enforcement:
  - intent: Define how authorization decisions are enforced during execution.
  - value: Authorization checks are enforced synchronously as part of request or workflow execution.
- AP-3=Pre-Execution Evaluation:
  - intent: Define how and when policy evaluations occur at runtime.
  - value: Policies are evaluated before execution begins.
- AP-4=Pre-Invocation Safety Gates:
  - intent: Define how AI Safety Gates are invoked during execution.
  - value: Safety Gates are invoked before AI or agent execution begins.
- AP-5=Agent Invocation Only:
  - intent: Define the Application Plane’s responsibility for agent execution.
  - value: Application Plane invokes agents under policy and Safety Gate constraints but does not host agent orchestration state.
- AP-6=Synchronous Emission:
  - intent: Define how execution produces evidence and observability artifacts.
  - value: Evidence and telemetry are emitted inline with execution.
- CP-1=Declarative + Evaluative:
  - intent: Define how the Control Plane expresses and evaluates authoritative intent.
  - value: Control Plane expresses intent declaratively and performs **definition-time and configuration-time evaluation** of governance artifacts (e.g., policy validation, Safety Gate definition validation, co…
- CP-2=Authoritative Lifecycle Owner:
  - intent: Define the Control Plane’s role in tenant lifecycle management.
  - value: Control Plane is the system of record for tenant creation, state transitions, suspension, and termination.
- CP-3=Human, Service, and Agent Identity Governance:
  - intent: Define the scope of identity governance owned by the Control Plane.
  - value: Control Plane governs identity lifecycle and registration for all principals, including AI agents. **Constraints:** - Identity MAY be global; **authority is never global**. - Tenant membership and en…
- CP-4=Centralized Policy Authoring:
  - intent: Define how policies are authored, versioned, and distributed.
  - value: Policies are authored and versioned exclusively within the Control Plane.
- CP-5=Centralized Safety Gate Orchestration:
  - intent: Define the Control Plane’s responsibility for AI Safety Gate orchestration.
  - value: All Safety Gate definitions, risk classes, and escalation rules are owned and coordinated by the Control Plane.
- CP-6=Unified Governance Integration:
  - intent: Define how cost governance and compliance enforcement are integrated.
  - value: Cost, compliance, and entitlement rules are governed as a single, integrated policy surface.
- DP-1=Logical Isolation (Enforced):
  - intent: Define the isolation model used to prevent cross-tenant data access.
  - value: Tenants share physical infrastructure; isolation is enforced through mandatory tenant-scoped access constraints and fail-closed query patterns.
- DP-2=Data-Access-Layer Enforcement:
  - intent: Define where tenant scope is enforced for data access and computation.
  - value: Tenant scope is enforced at the storage/retrieval access boundary for all reads and writes.
- DP-3=Access + Retention + Lineage Enforcement:
  - intent: Define which governance constraints are enforced within the Data Plane.
  - value: Data Plane enforces access constraints, retention/deletion rules, and records lineage/provenance artifacts for governed datasets. **Constraints:** - Governance enforcement MUST be policy-driven and v…
- DP-4=Data Plane Hosts Inputs/Outputs Only:
  - intent: Define whether inference/embedding workloads execute in the Data Plane.
  - value: Inference executes outside the Data Plane; Data Plane stores inputs/outputs and enforces tenant-scoped access and governance. **Constraints:** - Any inference-related data access MUST remain tenant-s…
- DP-5=Inline Evidence Emission:
  - intent: Define how the Data Plane emits evidence for access and governance.
  - value: Evidence is emitted synchronously with data access and governance enforcement.
- ST-1=Shared Storage with Logical Isolation:
  - intent: Define the isolation topology used for persistent multi-tenant storage.
  - value: Tenants share storage infrastructure; isolation is enforced via tenant-scoped keys, access patterns, and fail-closed enforcement.
- ST-2=Tenant-Keyed Primary Addressing:
  - intent: Define how tenant identity participates in persisted object addressing.
  - value: All persisted objects are addressable via tenant-scoped primary keys (tenant key is a required component of the object’s identity).
- ST-3=Tenant-Partitioned Placement:
  - intent: Define how tenant data is partitioned and placed within storage.
  - value: Storage placement is partitioned by tenant identity as a first-class key.
- ST-4=Retention + Hard Deletion:
  - intent: Define the storage system’s obligations for retention and deletion.
  - value: Data is retained per policy and deleted irreversibly when required.
- ST-5=Tenant-Scoped Backup and Restore:
  - intent: Define how backups and restores preserve tenant isolation and auditability.
  - value: Backup and restore operations can be performed per tenant without exposing or requiring access to other tenants’ data.
- ST-6=Inline Evidence Emission:
  - intent: Define how storage emits auditable evidence for access and lifecycle events.
  - value: Evidence is emitted synchronously with reads/writes/deletes/restores.
<!-- CAF_MANAGED_BLOCK: pin_value_explanations_v1 END -->

<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 START -->
## System constraints derived from the architectural intent + guardrails (CAF-managed)

- Generation phase is `architecture_scaffolding`; outputs are limited to specs, docs, and non-runnable scaffolding.
- Runtime stack is pinned to Python + FastAPI + SQLAlchemy ORM; avoid introducing alternate frameworks in this phase.
- Packaging and execution target are pinned to local `docker_compose`; design assumptions must remain local-first.
- Data persistence is pinned to Postgres with bootstrap schema management; migrations and production data ops are out of scope.
- CP and AP runtime shapes are both `api_service_http`; control-plane governance and app-plane invocation remain separate concerns.
- AP execution must enforce ingress-bound tenant context and inline authorization/safety checks before agent/action execution.
- Agent execution must remain single-principal, policy-derived, and session-scoped, with synchronous evidence emission.
- Data-plane behavior must enforce logical isolation and tenant-scoped access at the data access layer for reads and writes.
- Storage behavior must retain tenant-keyed addressing and tenant-partitioned placement with retention plus hard-deletion posture.
- Guardrails forbid vendor selection and architecture-shape changes in this run; decisions must remain within pinned choices.
<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 END -->

<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 START -->
## Technology posture (CAF-managed)

- Lifecycle posture: `stage_0_local_prototype` + `architecture_scaffolding` with `refusal_posture: fail_closed`.
- Allowed artifact classes are constrained to docs/scaffolds/non-runnable placeholders during this phase.
- Allowed write paths are limited to this instance's `spec/playbook`, `spec/caf_meta`, `spec/guardrails`, `layer_7`, and `feedback_packets`.
- Forbidden actions include production code generation, deployment/readiness claims, vendor selection, and architecture-shape mutation.
- Plane runtime shape is `api_service_http` for both CP and AP; no alternate runtime topology is implied here.
- Candidate enforcement bar is `contract_scaffolding_bar_v1`; unit/smoke/contract tests are not required in this phase.
- Placeholder policy forbids `<...>` token leakage in governed outputs.
- Runnable infrastructure/runtime wiring is not required while runnable code remains unapproved.
<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->

### H-1: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] CP and AP are both pinned to api_service_http while DP responsibilities remain distinct (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP is pinned to host inputs/outputs while AP is pinned to agent invocation responsibilities (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Generation phase remains implementation_scaffolding with no architecture-shape mutation allowed (rail_ref: lifecycle.generation_phase=implementation_scaffolding; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** The active pins enforce explicit separation of CP/AP/DP ownership.

### H-2: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context is established at ingress and immutable through AP execution (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Agent context is constrained to session-scoped retrieval and tenant-scoped data (pin_ref: AI-4=Session-Scoped Context Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Data access must enforce tenant scope at the access boundary (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Tenant context propagation is mandatory across AP, AI, and DP boundaries.

### H-3: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Isolation model is logical and fail-closed for tenant access (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Storage is tenant-keyed and tenant-partitioned by default (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Storage placement explicitly partitions by tenant identity (pin_ref: ST-3=Tenant-Partitioned Placement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Multi-tenancy must be explicit in contracts and persistence boundaries.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tool invocation requires pre-invocation evaluation and safety gates (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Safety gate definitions and escalation are centrally orchestrated by CP (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] AP enforces safety checks before invocation at runtime boundaries (pin_ref: AP-4=Pre-Invocation Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Governance and runtime enforcement responsibilities are intentionally split across planes.

### H-5: CAF-IAM-02 - Identity and Context Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent identity is single-principal per execution session (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Authority is policy-derived from identity and tenant context (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] CP governs identity lifecycle for human, service, and agent principals (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Identity and context fields must remain explicit at cross-plane boundaries.

### H-6: POL-01 - Policy Enforcement Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy authoring/versioning is centralized in CP (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP evaluates policy before execution starts (pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Refusal posture is fail_closed and forbids bypassing safety/policy gates (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Policy intent ownership and enforcement points must be explicit and auditable.

### H-7: OBS-01 - Observability Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] AI decisions and actions require synchronous evidence emission (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP emits telemetry and evidence inline with execution flow (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] DP and storage access events are also synchronously auditable (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Cross-plane operations require a shared observability envelope and correlation semantics.

### H-8: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] CP governance integration requires controlled interaction contracts into AP and DP surfaces (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP is constrained to data responsibilities while AP handles invocation flows (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] AP enforces inline authorization for all request/workflow execution (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Cross-plane interaction modes must be explicit, bounded, and deny unsupported crossings.

### H-9: CTX-01 - Request Context and Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Ingress establishes immutable tenant context for each AP request (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] CP lifecycle authority requires context carriers that support auditable transitions (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Policy/evaluation model in CP requires stable context metadata across boundaries (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Request context propagation is foundational for tenancy, policy, and traceability.

### H-10: VAL-01 - Validation and Error Handling Boundary (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP inline enforcement requires deterministic validation before side effects (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AI invocations require pre-invocation checks and fail-closed rejection behavior (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Placeholder leakage is disallowed under fail_closed guardrails (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Validation and error contracts must be explicit at ingress and cross-plane boundaries.

### M-11: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Tenant scope must be enforced at data access boundaries (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Tenant-keyed addressing is required for persisted objects (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Runtime pins are Python/FastAPI with Postgres for implementation scaffolding (rail_ref: runtime.framework=fastapi; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Repository boundaries isolate persistence concerns while preserving tenant guarantees.

### M-12: CAF-EDGE-01 - Backend-for-Frontend (BFF) / API Composition Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [spec_excerpt] UI requirements specify `web_spa` with `separate_ui_service`, signaling a dedicated UI-facing boundary (ref: ui_requirements_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] AP runtime shape is api_service_http, compatible with API composition at the UI edge (pin_ref: planes.ap.runtime_shape=api_service_http; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** A BFF/API composition boundary stabilizes UI contracts without changing plane authority.

### M-13: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP governs identities for human, service, and agent principals (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP authorization depends on explicit principal and tenant membership context (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Principal taxonomy should be explicit to keep policy and audit behavior deterministic.

### M-14: CAF-MTEN-ANTI-01 - Multi-Tenant Isolation Anti-Patterns to Avoid (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant-scoped backup/restore is required and cannot leak cross-tenant state (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Retention and hard deletion obligations require tenant-specific lifecycle enforcement (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Explicit anti-pattern guidance prevents accidental cross-tenant operations.

### M-15: CAF-MTEN-AGOBS-01 - Multi-Tenant Agent Observability Boundaries (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP and AI both require synchronous telemetry/evidence emission (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP and storage evidence signals must remain tenant-scoped (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Observability boundaries must enforce tenant-safe audit and correlation behavior.

### M-16: EXT-BACKEND_FOR_FRONTEND_BFF - Backend-for-Frontend (BFF) (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [spec_excerpt] UI signal explicitly calls for a React web SPA with separate UI deployment, which maps to a UI-specific facade pattern (ref: ui_requirements_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] AP runtime shape is HTTP service and supports a separate BFF boundary in implementation scaffolding (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** The instance has direct UI signals requiring a dedicated frontend-oriented API facade.

### M-17: EXT-API_COMPOSITION_AGGREGATOR - API Composition / Aggregator (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [spec_excerpt] The UI is deployed as a separate service, which benefits from composition of CP/AP data into UI-facing contracts (ref: ui_requirements_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [pinned_input] CP/AP split plus synchronous API surfaces imply explicit composition at boundary edges (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** API composition is needed to prevent UI coupling to internal plane contracts.

### M-18: EXT-API_GATEWAY - API Gateway (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP centrally authors policy and governs safety orchestration, which requires a stable ingress policy boundary (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [spec_excerpt] Tenant context is required at ingress for AP requests, favoring an ingress gateway that validates/request-shapes context (ref: intent_derived_app_plane_constraints_v1; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
**Rationale:** An API gateway pattern grounds ingress policy/context enforcement without changing pinned runtime.

### M-19: EXT-AUDITABILITY - Auditability (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Synchronous evidence emission is required across AI/AP/DP/ST paths (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP governance includes lineage and retention constraints, requiring durable audit trails (pin_ref: DP-3=Access + Retention + Lineage Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Auditability is directly required by the pinned evidence and lineage obligations.

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
## Decision resolutions (architect-edit; required for specs → design)

(YAML. Onboarding default: CAF may prepopulate entries with `status: adopt` so you can experiment. You may flip to `defer` / `reject` at any time.)

```yaml
schema_version: decision_resolutions_v1
decisions:
  - evidence_hook_id: H-1
    pattern_id: CAF-PLANE-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-PLANE-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pinned three-plane responsibilities and runtime-shape declarations require explicit tri-plane separation as a first-order architectural boundary."
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
  - evidence_hook_id: H-2
    pattern_id: CAF-TCTX-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-TCTX-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pins require deterministic tenant context carriage across AP, AI, and DP boundaries, which aligns directly with normative tenant context propagation."
    resolved_values:
      questions:
        - question_id: Q-AP-TENANT-CARRIER-01
          question: "What is the tenant context carrier at the AP ingress boundary (kind/name/type) and what are the rejection conditions?"
          description: "Select how tenant context is carried and validated at the application ingress boundary."
          option_set_id: tenant_context.ingress_carrier
          options:
            - option_id: auth_claim
              status: adopt
              summary: "Tenant context from verified auth claims (e.g., JWT claim)."
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
              summary: "Tenant context from verified auth claims (e.g., JWT claim)."
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
  - evidence_hook_id: H-3
    pattern_id: CAF-MTEN-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-MTEN-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Multi-tenant isolation and tenant-keyed storage are explicit architecture-shape pins and should be captured as a foundational concern."
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
    rationale: "Safety and policy pins demand explicit CP governance boundaries separate from AP execution behavior."
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
    pattern_id: CAF-IAM-02
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-IAM-02
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The pinned identity taxonomy and authority model require explicit identity/context propagation across planes."
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
  - evidence_hook_id: H-6
    pattern_id: POL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: POL-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "CP policy ownership and AP pre-execution enforcement together imply a clear policy enforcement boundary."
    resolved_values: {}
  - evidence_hook_id: H-7
    pattern_id: OBS-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: OBS-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Synchronous evidence pins across AI/AP/DP/ST require an explicit cross-plane observability boundary."
    resolved_values: {}
  - evidence_hook_id: H-10
    pattern_id: VAL-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: VAL-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Pre-execution evaluation and fail-closed rails require explicit validation/error boundaries."
    resolved_values: {}
  - evidence_hook_id: M-12
    pattern_id: CAF-EDGE-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-EDGE-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "UI signal and AP runtime posture support introducing a dedicated composition boundary without changing pinned platform choices."
    resolved_values:
      questions:
        - question_id: Q-CAF-EDGE-01-01
          question: "If internal interactions are async, how will the UI-facing boundary bridge async completion?"
          description: "Choose polling via job handles, callbacks/webhooks, or a hybrid approach."
          option_set_id: edge.async_bridge_strategy
          options:
            - option_id: job_handle_polling
              status: adopt
              summary: "Return a job handle and provide status polling endpoints."
              notes: ""
              payload: {}
            - option_id: callbacks_webhooks
              status: defer
              summary: "Use callbacks/webhooks for completion and state transitions."
              notes: ""
              payload: {}
            - option_id: hybrid
              status: defer
              summary: "Support both polling and callbacks/webhooks."
              notes: ""
              payload: {}
        - question_id: Q-EDGE-SHAPE-01
          question: "What is the UI-facing boundary shape (BFF service, gateway composition, embedded adapter, or custom)?"
          description: "Select the boundary shape used to stabilize UI contracts while hiding internal plane contracts."
          option_set_id: edge.boundary_shape
          options:
            - option_id: bff_service
              status: adopt
              summary: "Separate deployable BFF/API composition service."
              payload: {}
            - option_id: gateway_composition
              status: defer
              summary: "Composition at an API gateway layer (if available) without leaking internal contracts."
              payload: {}
            - option_id: embedded_adapter
              status: defer
              summary: "Embedded adapter layer within the UI host/runtime (still a contract boundary)."
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom shape (document details)."
              payload: {}
  - evidence_hook_id: M-13
    pattern_id: CAF-IAM-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-IAM-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Identity governance pins support explicit principal taxonomy to stabilize authorization and context contracts."
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
  - evidence_hook_id: H-8
    pattern_id: CAF-XPLANE-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-XPLANE-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Cross-plane interactions must be explicit and constrained to preserve pinned authority and data boundaries."
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
  - evidence_hook_id: M-14
    pattern_id: CAF-MTEN-ANTI-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-MTEN-ANTI-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The tenant retention and lineage pins justify explicitly documenting anti-patterns that violate isolation or lifecycle controls."
    resolved_values:
      questions:
        - question_id: Q-CAF-MTEN-ANTI-01-01
          question: "How will implicit tenancy be prevented and explicit tenancy binding be enforced?"
          description: "Choose runtime validation, build-time guardrails, or both."
          option_set_id: tenancy.binding_enforcement
          options:
            - option_id: runtime_validation
              status: defer
              summary: "Runtime validation of explicit tenant context on every boundary crossing."
              notes: ""
              payload: {}
            - option_id: compile_time_guardrails
              status: defer
              summary: "Compile-time or build-time guardrails to prevent missing tenant binding."
              notes: ""
              payload: {}
            - option_id: both
              status: adopt
              summary: "Combine runtime validation and compile/build guardrails."
              notes: ""
              payload: {}
  - evidence_hook_id: M-15
    pattern_id: CAF-MTEN-AGOBS-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CAF-MTEN-AGOBS-01
        anchor_path: "architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-AGOBS-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Tenant-safe observability constraints across AP/AI/DP/ST support a dedicated multi-tenant observability boundary pattern."
    resolved_values:
      questions:
        - question_id: Q-CAF-MTEN-AGOBS-01-01
          question: "What minimum observability level is required for agent/autonomous execution?"
          description: "Choose basic metrics, step-level telemetry, or full trace with redaction controls."
          option_set_id: agent_observability.level
          options:
            - option_id: basic_metrics
              status: defer
              summary: "Basic metrics and high-level events only."
              notes: ""
              payload: {}
            - option_id: step_level_telemetry
              status: adopt
              summary: "Step-level telemetry and explicit decision points (no full text)."
              notes: ""
              payload: {}
            - option_id: full_trace_redacted
              status: defer
              summary: "Full trace capture with mandatory redaction/PII controls."
              notes: ""
              payload: {}
  - evidence_hook_id: M-11
    pattern_id: PST-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: PST-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Tenant-scoped data enforcement and tenant-keyed persistence align with an explicit repository boundary in AP."
    resolved_values: {}
  - evidence_hook_id: H-9
    pattern_id: CTX-01
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: CTX-01
        anchor_path: "architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Governance and ingress-bound context pins imply explicit request context propagation structures across boundaries."
    resolved_values: {}
  - evidence_hook_id: M-16
    pattern_id: EXT-BACKEND_FOR_FRONTEND_BFF
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-BACKEND_FOR_FRONTEND_BFF
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "The instance has direct UI signals requiring a dedicated frontend-oriented API facade."
    resolved_values:
      questions:
        - question_id: Q-EXT-BFF-01
          question: "What is the BFF shape (single vs per-client) and responsibility level?"
          description: "Select the BFF façade shape for UI boundary concerns and aggregation/adaptation responsibilities."
          option_set_id: ui.bff_shape
          options:
            - option_id: single_bff_for_all_ui
              status: defer
              summary: "Single BFF façade for all UI clients (web/mobile/etc.)."
              notes: ""
              payload: {}
            - option_id: per_client_bff
              status: defer
              summary: "Separate BFF per client type (e.g., web vs mobile) with tailored aggregation/adaptation."
              notes: ""
              payload: {}
            - option_id: thin_facade_only
              status: adopt
              summary: "Thin BFF focused on auth/session/context and minor shaping; minimal aggregation."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-17
    pattern_id: EXT-API_COMPOSITION_AGGREGATOR
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-API_COMPOSITION_AGGREGATOR
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-api_composition_aggregator.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "API composition is needed to prevent UI coupling to internal plane contracts."
    resolved_values:
      questions:
        - question_id: Q-EXT-AGG-01
          question: "Where does API composition/orchestration live and what fan-out safeguards apply?"
          description: "Select the ownership/placement strategy for API composition and the default safeguards for fan-out (timeouts/partial responses)."
          option_set_id: api.composition_ownership
          options:
            - option_id: bff_composes_downstreams
              status: defer
              summary: "BFF performs composition/orchestration and returns UI-friendly responses."
              notes: ""
              payload: {}
            - option_id: dedicated_composition_endpoint
              status: adopt
              summary: "Application plane exposes dedicated composition endpoints that orchestrate downstream calls."
              notes: ""
              payload: {}
            - option_id: precomputed_read_model
              status: defer
              summary: "Prefer precomputed/materialized read models for heavy read paths; minimize runtime fan-out."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-18
    pattern_id: EXT-API_GATEWAY
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-API_GATEWAY
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "An API gateway pattern grounds ingress policy/context enforcement without changing pinned runtime."
    resolved_values:
      questions:
        - question_id: Q-EXT-API-GW-01
          question: "Where are API gateway policies enforced and how are responsibilities distributed?"
          description: "Select the enforcement/responsibility distribution for API policy enforcement at the ingress boundary."
          option_set_id: ingress.api_gateway_policy_placement
          options:
            - option_id: gateway_enforces_most_policies
              status: defer
              summary: "Gateway enforces most cross-cutting policies; services focus on business logic and service-level authorization."
              notes: ""
              payload: {}
            - option_id: shared_gateway_and_services
              status: adopt
              summary: "Default: implement the gateway inside the Control Plane ingress boundary (no standalone gateway product). CP enforces baseline policies; services enforce additional policies with explicit boundaries."
              notes: "Use this default when the stack does not pin a gateway product/technology. Treat the CP ingress boundary as the gateway responsibility boundary and evolve later if needed."
              payload: {}
            - option_id: services_enforce_gateway_routes_only
              status: defer
              summary: "Gateway provides routing/versioning; services enforce most policies."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
  - evidence_hook_id: M-19
    pattern_id: EXT-AUDITABILITY
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-AUDITABILITY
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Auditability is directly required by the pinned evidence and lineage obligations."
    resolved_values:
      questions:
        - question_id: Q-EXT-AUDIT-01
          question: "What audit event scope is required (security only vs broader)?"
          description: "Select the audit log scope to meet governance/compliance and traceability needs."
          option_set_id: ops.audit_event_scope
          options:
            - option_id: security_events_only
              status: defer
              summary: "Audit security-sensitive events (authn/authz failures, privilege changes, access)."
              notes: ""
              payload: {}
            - option_id: security_plus_admin_actions
              status: adopt
              summary: "Audit security events plus privileged admin/operator actions."
              notes: ""
              payload: {}
            - option_id: security_plus_business_events
              status: defer
              summary: "Audit security events plus key business actions requiring traceability."
              notes: ""
              payload: {}
            - option_id: custom
              status: defer
              summary: "Custom (fill fields)."
              notes: ""
              payload: {}
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->
<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 START -->
## System requirements (architect-edit)

(Non-functional requirements, governance constraints, tenancy posture, compliance posture, audit posture, operational constraints, etc.)
<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

(Unresolved questions discovered during scaffolding. CAF may add suggested questions in feedback packets, but never answers them.)
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->
