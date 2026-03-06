### H-1: CAF-PLANE-01 - Tri-Plane Separation (Control/Application/Data) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] CP and AP runtime shapes are both api_service_http, and CP/AP/DP pins define distinct authority and execution roles (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Data plane is pinned to host inputs/outputs only while AP is agent invocation oriented (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Application-plane execution is constrained to invocation under policy/safety gates (pin_ref: AP-5=Agent Invocation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E4 [derived_rails_or_posture] Generation phase is architecture_scaffolding with no new architecture choices allowed (rail_ref: lifecycle.generation_phase=architecture_scaffolding; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** The pinned three-plane responsibilities and runtime-shape declarations require explicit tri-plane separation as a first-order architectural boundary.
**Implications:**
- Keep CP/AP/DP responsibilities explicit in system/application specs.

### H-2: CAF-TCTX-01 - Tenant Context Propagation (Normative) (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tenant context is ingress-bound in AP and immutable for execution scope (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Agent session context is restricted to session-scoped retrieved context (pin_ref: AI-4=Session-Scoped Context Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Tenant scope enforcement is required at data access boundaries (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E4 [derived_rails_or_posture] Refusal posture is fail_closed, so context propagation constraints must be explicit and auditable (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** The pins require deterministic tenant context carriage across AP, AI, and DP boundaries, which aligns directly with normative tenant context propagation.
**Implications:**
- Define context carrier fields and propagation rules in CP to AP to DP flows.

### H-3: CAF-MTEN-01 - Multi-Tenancy as First-Class Architectural Concern (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Isolation model is logical isolation with mandatory tenant-scoped enforcement (pin_ref: DP-1=Logical Isolation (Enforced); cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Storage is shared but tenant-keyed and tenant-partitioned (pin_ref: ST-1=Shared Storage with Logical Isolation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Persisted objects require tenant-keyed addressing and tenant partitioning (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E4 [pinned_input] Partition placement is first-class in storage behavior (pin_ref: ST-3=Tenant-Partitioned Placement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Multi-tenant isolation and tenant-keyed storage are explicit architecture-shape pins and should be captured as a foundational concern.
**Implications:**
- Require tenant keys in domain and persistence contracts.

### H-4: CAF-AI-01 - AI Safety and Governance Separation Across Planes (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Tool/action invocation requires pre-invocation policy and safety checks (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Safety gates are pre-action and owned centrally by CP governance orchestration (pin_ref: AI-5=Pre-Action Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] AP also requires pre-invocation safety checks (pin_ref: AP-4=Pre-Invocation Safety Gates; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E4 [pinned_input] CP centrally orchestrates safety gate definitions and escalation rules (pin_ref: CP-5=Centralized Safety Gate Orchestration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Safety and policy pins demand explicit CP governance boundaries separate from AP execution behavior.
**Implications:**
- Document CP-owned safety policy lifecycle and AP enforcement touchpoints.

### H-5: CAF-IAM-02 - Identity and Context Propagation (confidence: high)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Agent identity is single-principal per execution session (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Authority derives from policy bound to identity + tenant context (pin_ref: AI-2=Policy-Derived Authority; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] CP governs human/service/agent identities and membership relationships (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E4 [pinned_input] AP enforces authorization inline in request/workflow execution (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** The pinned identity taxonomy and authority model require explicit identity/context propagation across planes.
**Implications:**
- Keep identity and tenant context fields explicit in control and application contracts.

### H-6: POL-01 - Policy Enforcement Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Policies are authored/versioned exclusively in control plane (pin_ref: CP-4=Centralized Policy Authoring; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Policy checks occur before execution at application layer (pin_ref: AP-3=Pre-Execution Evaluation; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Forbidden actions include bypassing refusal conditions and changing architecture shape during this phase (rail_ref: forbidden_actions=policy_safety_enforced; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** CP policy ownership and AP pre-execution enforcement together imply a clear policy enforcement boundary.
**Implications:**
- Add policy decision points at ingress and tool-action boundaries.

### H-7: OBS-01 - Observability Boundary (confidence: high)
**Plane:** control
**Evidence:**
- E1 [pinned_input] Agent path requires synchronous evidence emission for decisions and tool calls (pin_ref: AI-6=Synchronous Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AP emits telemetry/evidence inline with execution (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Data/storage layers emit evidence for access/lifecycle events (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E4 [pinned_input] Storage read/write/delete/restore events are synchronously auditable (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Synchronous evidence pins across AI/AP/DP/ST require an explicit cross-plane observability boundary.
**Implications:**
- Standardize correlation and evidence envelope fields.

### M-8: PST-01 - Persistence Boundary via Repositories (confidence: medium)
**Plane:** application
**Evidence:**
- E1 [pinned_input] Data access must enforce tenant scope at access boundary (pin_ref: DP-2=Data-Access-Layer Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Storage addressing is tenant-keyed and therefore repository APIs must require tenant keys (pin_ref: ST-2=Tenant-Keyed Primary Addressing; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Runtime pins are Python/FastAPI with Postgres and bootstrap schema strategy (rail_ref: runtime.framework=fastapi; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Tenant-scoped data enforcement and tenant-keyed persistence align with an explicit repository boundary in AP.
**Implications:**
- Keep persistence contracts isolated from domain/application orchestration.

### M-9: CTX-01 - Request Context and Propagation (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP ingress establishes request context and CP is lifecycle authority for tenant state (pin_ref: CP-2=Authoritative Lifecycle Owner; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] CP declarative/evaluative governance requires context carriers to support validation and audits (pin_ref: CP-1=Declarative + Evaluative; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] AP ingress-bound context pin requires stable propagation semantics (pin_ref: AP-1=Ingress-Bound Context; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Governance and ingress-bound context pins imply explicit request context propagation structures across boundaries.
**Implications:**
- Define request context schema (tenant_id, principal_id, trace/correlation ids).

### M-10: VAL-01 - Validation and Error Handling Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP inline enforcement requires deterministic validation before action execution (pin_ref: AP-2=Inline Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] AI pre-invocation evaluation demands fail-closed validation behavior (pin_ref: AI-3=Pre-Invocation Evaluation Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Refusal posture is fail_closed and placeholder leakage is disallowed (rail_ref: refusal_posture=fail_closed; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Pre-execution evaluation and fail-closed rails require explicit validation/error boundaries.
**Implications:**
- Define consistent error taxonomy and deny-by-default invalid request behavior.

### M-11: CAF-EDGE-01 - Backend-for-Frontend (BFF) / API Composition Boundary (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [existing_spec_text] UI requirements specify a web SPA with separate UI deployment preference, suggesting an API composition edge boundary (ref: none; cite: reference_architectures/codex-saas/spec/playbook/application_spec_v1.md)
- E2 [derived_rails_or_posture] AP runtime shape is api_service_http in local docker_compose scaffolding, compatible with a BFF/API composition layer (rail_ref: planes.ap.runtime_shape=api_service_http; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** UI signal and AP runtime posture support introducing a dedicated composition boundary without changing pinned platform choices.
**Implications:**
- Keep BFF concerns as boundary composition, not domain/policy ownership.

### M-12: CAF-IAM-01 - Identity Principal Taxonomy (Platform/Tenant/Service/Agent) (confidence: medium)
**Plane:** control
**Evidence:**
- E1 [pinned_input] CP explicitly governs human, service, and agent identities (pin_ref: CP-3=Human, Service, and Agent Identity Governance; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Agent identity is single-principal and policy-bound authority must be evaluated against taxonomy (pin_ref: AI-1=Single-Principal Agent Identity; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Forbidden actions block ad hoc authority model changes during this run (rail_ref: forbidden_actions=alter_security_or_safety_posture_without_explicit_choice; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Identity governance pins support explicit principal taxonomy to stabilize authorization and context contracts.
**Implications:**
- Define principal kinds and tenant binding semantics in CP schemas.

### M-13: CAF-XPLANE-01 - Allowed Cross-Plane Interaction Patterns (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] CP governance integration and DP scope constraints require controlled CP/AP/DP interaction paths (pin_ref: CP-6=Unified Governance Integration; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP hosts inputs/outputs only, so interaction surfaces should keep inference and governance responsibilities separated (pin_ref: DP-4=Data Plane Hosts Inputs/Outputs Only; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [derived_rails_or_posture] Generation phase forbids introducing new architecture shape changes outside governed choices (rail_ref: forbidden_actions=modify_architecture_shape_parameters; cite: reference_architectures/codex-saas/spec/guardrails/profile_parameters_resolved.yaml)
**Rationale:** Cross-plane interactions must be explicit and constrained to preserve pinned authority and data boundaries.
**Implications:**
- Capture allowed interaction contracts and deny unsupported plane crossings.

### M-14: CAF-MTEN-ANTI-01 - Multi-Tenant Isolation Anti-Patterns to Avoid (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] Storage retention and tenant-scoped backup/restore requirements imply anti-pattern avoidance for cross-tenant operational actions (pin_ref: ST-4=Retention + Hard Deletion; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] Tenant-scoped backup/restore and lineage constraints require strict anti-cross-tenant controls (pin_ref: ST-5=Tenant-Scoped Backup and Restore; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] DP governance includes access/retention/lineage enforcement at the data plane (pin_ref: DP-3=Access + Retention + Lineage Enforcement; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** The tenant retention and lineage pins justify explicitly documenting anti-patterns that violate isolation or lifecycle controls.
**Implications:**
- Add guardrails against shared admin paths that bypass tenant scope.

### M-15: CAF-MTEN-AGOBS-01 - Multi-Tenant Agent Observability Boundaries (confidence: medium)
**Plane:** both
**Evidence:**
- E1 [pinned_input] AP and AI both require synchronous evidence emission, and observability must remain tenant-scoped (pin_ref: AP-6=Synchronous Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E2 [pinned_input] DP and storage also require inline evidence emission for tenant-scoped access and lifecycle events (pin_ref: DP-5=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
- E3 [pinned_input] Storage evidence requirements reinforce tenant-safe auditing boundaries (pin_ref: ST-6=Inline Evidence Emission; cite: reference_architectures/codex-saas/spec/playbook/architecture_shape_parameters.yaml)
**Rationale:** Tenant-safe observability constraints across AP/AI/DP/ST support a dedicated multi-tenant observability boundary pattern.
**Implications:**
- Define tenant-scoped telemetry routing and evidence retention boundaries.
