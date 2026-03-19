# Control Plane Design (v1)

## Scope

Control plane owns identity governance, policy authoring/evaluation, safety-gate orchestration, lifecycle administration, and evidence/audit routing for the codex-saas instance.

## Core boundaries

- CP ingress boundary handles tenant/principal context normalization and baseline policy enforcement.
- CP policy services own policy lifecycle, approval, and publish semantics.
- CP governance/audit services own immutable evidence and audit event persistence.

## Plane Integration Contract (CP ↔ AP)

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->
```yaml
schema_version: plane_integration_contract_choices_v1
choices:
  cp_runtime_shape:
    question_id: cp_runtime_shape
    question: "Which runtime shape should the control plane use?"
    options:
      - option_id: api_service_http
        status: adopt
        summary: "Control plane exposes HTTP APIs."
      - option_id: worker_service_events
        status: defer
        summary: "Control plane runs as event workers."
      - option_id: library_embedded
        status: defer
        summary: "Control plane is embedded as a library."
      - option_id: custom
        status: defer
        summary: "Custom control-plane runtime shape."
  ap_runtime_shape:
    question_id: ap_runtime_shape
    question: "Which runtime shape should the application plane use?"
    options:
      - option_id: api_service_http
        status: adopt
        summary: "Application plane exposes HTTP APIs."
      - option_id: worker_service_events
        status: defer
        summary: "Application plane runs as event workers."
      - option_id: library_embedded
        status: defer
        summary: "Application plane is embedded as a library."
      - option_id: custom
        status: defer
        summary: "Custom application-plane runtime shape."
  cp_ap_contract_surface:
    question_id: cp_ap_contract_surface
    question: "What CP↔AP contract surface should be used?"
    options:
      - option_id: synchronous_http
        status: adopt
        summary: "Use synchronous HTTP contracts for CP↔AP boundaries."
      - option_id: async_events
        status: defer
        summary: "Use asynchronous event contracts."
      - option_id: mixed
        status: defer
        summary: "Use mixed sync and async contracts."
      - option_id: custom
        status: defer
        summary: "Custom contract surface."
```
<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 START -->
```yaml
schema_version: plane_integration_contract_open_questions_v1
questions:
  cp_ap_timeout_budget:
    question_id: cp_ap_timeout_budget
    question: "What timeout budget should CP↔AP synchronous calls use for policy + safety checks?"
    options:
      - option_id: strict_subsecond
        status: defer
        summary: "Sub-second budget for all calls."
      - option_id: tiered_budget
        status: adopt
        summary: "Tiered budgets by operation criticality."
      - option_id: custom
        status: defer
        summary: "Custom timeout budget."
    anchors:
      - anchor_type: caf_pattern
        anchor_ref: "CAF-AI-01"
      - anchor_type: caf_pattern
        anchor_ref: "POL-01"
```
<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 END -->

<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 START -->
### Baseline contract proposal

- CP ingress receives tenant/principal context and evaluates policy/safety.
- AP requests are rejected fail-closed when policy or safety checks fail.
- CP emits evidence for policy decisions and AP-facing authorization outcomes.
- CP↔AP transport is synchronous HTTP for this phase, with explicit request/response schemas.
<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
```yaml
version: 1
decisions: {}
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
```yaml
version: 1
questions:
  ext_anti_corruption_layer__pattern_adoption:
    question_id: "pattern_adoption__ext_anti_corruption_layer"
    question: "Should EXT-ANTI_CORRUPTION_LAYER be adopted for CP-facing external integrations?"
    options:
      - option_id: adopt_pattern
        status: defer
        summary: "Adopt the pattern for CP external integration boundaries."
      - option_id: defer
        status: adopt
        summary: "Keep deferred for this iteration."
      - option_id: reject_pattern
        status: defer
        summary: "Reject pattern adoption."
      - option_id: custom
        status: defer
        summary: "Custom decision."
    anchors:
      - anchor_type: caf_pattern
        anchor_ref: "EXT-ANTI_CORRUPTION_LAYER"
      - anchor_type: evidence_hook_id
        anchor_ref: "M-11"
```
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START -->
## Decision trace (CAF-managed)

- Adopted patterns reflected in this doc include: CAF-TCTX-01, CAF-MTEN-01, CAF-PLANE-01, CAF-AI-01, CAF-COMP-01, CTX-01, POL-01, VAL-01, EXT-API_GATEWAY, EXT-AUDITABILITY.
- Source: `reference_architectures/codex-saas/spec/playbook/system_spec_v1.md` in `ARCHITECT_EDIT_BLOCK: decision_resolutions_v1`.
- Carried-forward open questions count: 1 (from pattern_id `EXT-ANTI_CORRUPTION_LAYER`).
<!-- CAF_MANAGED_BLOCK: decision_trace_v1 END -->

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 START -->

## Planning pattern payload (CAF-managed)

```yaml
schema_version: 'planning_pattern_payload_v1'
generated_from:
  retrieval_surface_path: 'architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl'
  retrieval_profile: 'solution_architecture'
  selected_patterns_source: 'system_spec_v1.md:decision_resolutions_v1 (status: adopt)'
  adopted_option_choices_source: 'system_spec_v1.md:decision_resolutions_v1 (questions.options status: adopt)'
  materialized_by: 'tools/caf/materialize_planning_pattern_payload_v1.mjs'
notes:
  - 'Selected patterns and adopted option choices are materialized here as the design -> planning handoff. Planning still compiles obligations/tasks during /caf plan. Reference:'
  - 'reference_architectures/codex-saas/design/playbook/design_summary_v1.md'
  - 'reference_architectures/codex-saas/design/playbook/pattern_obligations_v1.yaml'
  - 'reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml'
selected_patterns:
  caf:
    - 'CAF-TCTX-01'
    - 'CAF-MTEN-01'
    - 'CAF-PLANE-01'
    - 'CAF-AI-01'
    - 'CAF-COMP-01'
    - 'CAF-IAM-01'
    - 'CAF-IAM-02'
    - 'CAF-POL-01'
    - 'CAF-XPLANE-01'
  core:
    - 'CTX-01'
    - 'POL-01'
    - 'VAL-01'
    - 'OBS-01'
  external:
    - 'EXT-API_COMPOSITION_AGGREGATOR'
    - 'EXT-API_GATEWAY'
    - 'EXT-AUDITABILITY'
adopted_option_choices:
  - source: 'system'
    evidence_hook_id: 'H-1'
    pattern_id: 'CAF-TCTX-01'
    question_id: 'Q-AP-TENANT-CARRIER-01'
    option_set_id: 'tenant_context.ingress_carrier'
    option_id: 'auth_claim'
    summary: 'Tenant context from a verified auth claim inside the Authorization credential (for example a JWT `tenant_id` claim), not from client-supplied tenant headers.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'H-1'
    pattern_id: 'CAF-TCTX-01'
    question_id: 'Q-CPAP-TENANT-CARRIER-01'
    option_set_id: 'tenant_context.ingress_carrier'
    option_id: 'auth_claim'
    summary: 'Tenant context from a verified auth claim inside the Authorization credential (for example a JWT `tenant_id` claim), not from client-supplied tenant headers.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'H-1'
    pattern_id: 'CAF-TCTX-01'
    question_id: 'Q-CPAP-TCTX-CONFLICT-01'
    option_set_id: 'tenant_context.conflict_precedence_rule'
    option_id: 'claim_over_header'
    summary: 'Verified claim wins; reject if any other carrier conflicts.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'H-2'
    pattern_id: 'CAF-MTEN-01'
    question_id: 'Q-MTEN-ISO-MODE-01'
    option_set_id: 'tenancy.isolation_mode'
    option_id: 'hybrid_tiered'
    summary: 'Hybrid isolation (selective and tiered by tenant).'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'H-3'
    pattern_id: 'CAF-PLANE-01'
    question_id: 'Q-CP-AP-SURFACE-01'
    option_set_id: 'cp_ap.contract_surface'
    option_id: 'mixed'
    summary: 'Mix: sync for enforcement, async for lifecycle and audit.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'H-4'
    pattern_id: 'CAF-AI-01'
    question_id: 'Q-AI-PART-01'
    option_set_id: 'ai_safety.governance_partitioning'
    option_id: 'cp_governs_ap_enforces'
    summary: 'Control Plane governs policy; Application Plane enforces at runtime.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'H-5'
    pattern_id: 'CAF-COMP-01'
    question_id: 'Q-CAF-COMP-01-01'
    option_set_id: 'compliance_evidence.persistence_strategy'
    option_id: 'stream_plus_immutable_store'
    summary: 'Use an event stream plus an immutable store (preferred for audit readiness).'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-15'
    pattern_id: 'CAF-IAM-01'
    question_id: 'Q-CAF-IAM-01-AUTO-01'
    option_set_id: 'iam.principal_taxonomy_scope'
    option_id: 'standard_platform_tenant_service'
    summary: 'Standard taxonomy: platform user + tenant user + service principals.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-16'
    pattern_id: 'CAF-IAM-02'
    question_id: 'Q-CAF-IAM-02-01'
    option_set_id: 'iam.identity_context_propagation'
    option_id: 'verified_token_claims'
    summary: 'Propagate identity and tenant context via verified token claims at ingress.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-18'
    pattern_id: 'CAF-POL-01'
    question_id: 'Q-AP-POLICY-POINTS-01'
    option_set_id: 'policy_gating.default_crud'
    option_id: 'gate_all_ops'
    summary: 'Gate all CRUD operations.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-19'
    pattern_id: 'CAF-XPLANE-01'
    question_id: 'Q-XPLANE-MODE-01'
    option_set_id: 'cross_plane.interaction_mode'
    option_id: 'synchronous_api'
    summary: 'Synchronous request/response API call across the plane boundary.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-12'
    pattern_id: 'EXT-API_COMPOSITION_AGGREGATOR'
    question_id: 'Q-EXT-AGG-01'
    option_set_id: 'api.composition_ownership'
    option_id: 'dedicated_composition_endpoint'
    summary: 'Application plane exposes dedicated composition endpoints that orchestrate downstream calls.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-13'
    pattern_id: 'EXT-API_GATEWAY'
    question_id: 'Q-EXT-API-GW-01'
    option_set_id: 'ingress.api_gateway_policy_placement'
    option_id: 'shared_gateway_and_services'
    summary: 'Default: implement the gateway inside the Control Plane ingress boundary (no standalone gateway product). CP enforces baseline policies; services enforce additional policies with explicit boundaries.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-14'
    pattern_id: 'EXT-AUDITABILITY'
    question_id: 'Q-EXT-AUDIT-01'
    option_set_id: 'ops.audit_event_scope'
    option_id: 'security_plus_admin_actions'
    summary: 'Audit security events plus privileged admin/operator actions.'
    payload: {}
promotions:
  semantic_inputs: []
  required_trace_anchors: []
  required_role_bindings: []
  plane_placements: []
```

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 END -->
