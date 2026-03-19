# System Specification (v1)

<!-- CAF_MANAGED_BLOCK: pinned_inputs_v1 START -->
## Lifecycle + technology pins (authoritative)
- lifecycle.evolution_stage: `stage_0_local_prototype`
- lifecycle.generation_phase: `architecture_scaffolding`
- platform.auth_mode: `mock`
- platform.database_engine: `postgres`
- platform.dependency_wiring_mode: `manual_composition_root`
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

- Lifecycle and phase:
  - The current phase is `architecture_scaffolding`; artifacts must stay at specification/scaffold level and must not claim production readiness.
  - All changes must remain within the allowed write paths in `profile_parameters_resolved.yaml`.
- Runtime and packaging:
  - The runtime language is pinned to Python and framework is pinned to FastAPI, so AP/CP service contracts and examples must be expressed for HTTP API service boundaries.
  - Packaging is pinned to Docker Compose for local infrastructure; deployment assumptions must remain local and compose-oriented.
- Data and persistence:
  - Persistence is constrained to PostgreSQL with SQLAlchemy ORM and code-bootstrap schema strategy; data model planning must assume relational schema ownership in code artifacts.
  - All persisted objects and query pathways must preserve tenant-scoped access expectations from storage/data plane intent (logical isolation and tenant-keyed addressing).
- Auth, policy, and safety posture:
  - Auth mode and eventing backend are pinned to mocks; architecture outputs must model integration seams without introducing production identity or broker dependencies.
  - Safety and policy checks are pre-action/pre-invocation constraints and must be represented as synchronous control points in request/workflow flows.
- Evidence and governance:
  - Decision points, tool invocations, and governance-relevant state transitions must emit synchronous evidence suitable for later audit traces.
  - Retention/deletion and lineage obligations remain explicit platform constraints and cannot be deferred to undocumented background behavior.
- Plane/runtime shape:
  - Both CP and AP are pinned to `api_service_http`; design artifacts must preserve clear control-plane versus application-plane responsibilities while using compatible HTTP service boundaries.
- Guardrail posture:
  - Forbidden actions in the resolved rails (for example generating runnable production code or modifying architecture shape parameters) are hard constraints for this phase and must be treated as fail-closed.
<!-- CAF_MANAGED_BLOCK: pin_derived_system_constraints_v1 END -->

<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 START -->
## Technology posture (CAF-managed)

- Lifecycle posture:
  - `evolution_stage=stage_0_local_prototype`, `generation_phase=architecture_scaffolding`, `refusal_posture=fail_closed`.
  - This run is constrained to architecture scaffolding outputs and explicit refusal on missing/ambiguous required inputs.
- Allowed artifact and path envelope:
  - Allowed artifact classes are directories, markdown docs, non-executable config stubs, non-runnable code placeholders, and TODO comments.
  - Allowed write paths are scoped to `companion_repositories/codex-saas/profile_v1/`, `reference_architectures/codex-saas/spec/playbook/`, `reference_architectures/codex-saas/spec/caf_meta/`, `reference_architectures/codex-saas/layer_7/`, `reference_architectures/codex-saas/spec/guardrails/`, and `reference_architectures/codex-saas/feedback_packets/`.
- Forbidden actions:
  - The rails prohibit generating runnable production code, deploying to production, claiming production readiness, selecting vendors/providers, changing architecture shape parameters, bypassing refusal conditions, writing outside allowed paths, and altering safety posture without explicit choice updates.
- Runtime and planes:
  - Runtime/profile pins resolve to Python + FastAPI + PostgreSQL + SQLAlchemy ORM with Docker Compose local deployment.
  - Plane runtime shapes are `cp=api_service_http`, `ap=api_service_http`, and `plane.runtime_shape=api_service_http`.
- Candidate enforcement bar:
  - `contract_scaffolding_bar_v1` currently requires no unit/smoke/contract test gates at this phase.
  - Placeholder policy forbids `<...>` tokens and runnable-policy requirements are disabled for this stage.
<!-- CAF_MANAGED_BLOCK: tech_profile_explanations_v1 END -->

<!-- CAF_MANAGED_BLOCK: caf_decision_pattern_candidates_v1 START -->

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

### M-15: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Identity governance is explicitly pinned in CP-3 and AI-1 with policy-derived authority AI-2. (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF identity principal taxonomy definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml)
**Rationale:** Control-plane identity taxonomy is needed to keep principal classes and authority assignment explicit. This pattern supports policy and evidence consistency.
**Implications:**
- Define principal classes and lifecycle ownership in CP docs.
- Link principal types to policy enforcement and audit events.

### M-16: CAF-IAM-02 - Identity and Context Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Cross-plane identity/context propagation is implied by AP-1, AP-2, AI-1, AI-4, and CP-3. (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF identity and context propagation definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml)
**Rationale:** This pattern complements context propagation by defining identity-carrying obligations across boundaries.
**Implications:**
- Require identity and tenant fields in cross-plane contract schemas.
- Align context propagation with policy evaluation checkpoints.

### M-17: OBS-01 - Observability Boundary (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Evidence and observability requirements are pinned by AP-6, AI-6, DP-5, and ST-6. (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] Core observability boundary definition. (ref: none; cite: architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml)
**Rationale:** The graph expansion introduced observability as a close complement to evidence-generation seeds. It is grounded by synchronous emission pins.
**Implications:**
- Define cross-plane telemetry/evidence correlation keys.
- Keep observability ingestion and policy views in CP scope.

### M-18: CAF-POL-01 - Control Plane Policy Decision Pipeline (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policy/governance ownership and evaluation sequence are pinned by CP-4, CP-5, AP-3, AI-2, AI-3. (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pattern_definition] CAF policy pipeline definition. (ref: none; cite: architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml)
**Rationale:** Graph expansion surfaced this as a direct dependency of AI safety separation. It is grounded in centralized policy-authoring and pre-execution evaluation pins.
**Implications:**
- Capture policy lifecycle states and evaluation checkpoints in CP specs.
- Keep AP callers dependent on CP policy decision outcomes.

### M-19: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: medium)
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
## Decision resolutions (architect-edit; required for specs → design)

Use this YAML block for explicit architecture/pattern decisions you want the next phases to honor.
If you are trying CAF for the first time, you may leave the starter shape in place and refine later.

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
  - evidence_hook_id: M-15
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
  - evidence_hook_id: M-16
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
  - evidence_hook_id: M-17
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
  - evidence_hook_id: M-18
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
  - evidence_hook_id: M-19
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
  - evidence_hook_id: M-11
    pattern_id: EXT-ANTI_CORRUPTION_LAYER
    status: defer
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-ANTI_CORRUPTION_LAYER
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-anti_corruption_layer.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "External/control-plane integrations should translate into stable internal contracts instead of leaking provider-specific semantics."
    resolved_values: {}
  - evidence_hook_id: M-12
    pattern_id: EXT-API_COMPOSITION_AGGREGATOR
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-API_COMPOSITION_AGGREGATOR
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-api_composition_aggregator.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "UI-driven workflows need composed data surfaces while preserving application/service boundaries."
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
  - evidence_hook_id: M-13
    pattern_id: EXT-API_GATEWAY
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-API_GATEWAY
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Centralized ingress can enforce policy, context propagation, and audit hooks consistently across CP/AP boundaries."
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
  - evidence_hook_id: M-14
    pattern_id: EXT-AUDITABILITY
    status: adopt
    anchors:
      - anchor_type: caf_pattern_requirement
        anchor_id: EXT-AUDITABILITY
        anchor_path: "architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml"
      - anchor_type: guardrail_ref
        anchor_id: ""
        anchor_path: "reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml"
    rationale: "Auditability pattern reinforces the compliance and evidence requirements already explicit in the architecture shape."
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

Use this section for **platform, governance, safety, operational, and compliance** requirements.
This is where the human architect states what the system must guarantee across planes.
Detailed control-plane entities and persistence belong in `spec/playbook/system_domain_model_v1.md`.

What to capture here:

- tenancy, isolation, and context propagation expectations
- policy/governance requirements
- audit/evidence requirements
- retention/deletion requirements
- operational guardrails and reliability expectations

Starter example (replace or adapt):

- Every operation must execute within an explicit tenant context and fail closed when tenant context is missing.
- Policy authoring, approval, and lifecycle management are platform-owned concerns.
- Review or execution actions that matter for governance must emit evidence records that can be inspected later.
- Retention rules and deletion requests must be tracked explicitly rather than handled as invisible background behavior.
- Administrative changes should be traceable to a principal, timestamp, and target object.
- The first release can favor clarity and auditability over high throughput or deep automation.
<!-- ARCHITECT_EDIT_BLOCK: system_requirements_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

Keep unresolved cross-plane or platform questions here.

Starter examples:

- Do policy changes take effect immediately, or do they require approval and scheduled activation?
- Which events require immutable evidence capture in the first release?
- Should retention and deletion be centrally managed for all tenant data from day one?
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->
