# Control Plane Design (v1)

## Purpose
Control-plane governance design for policy lifecycle, safety-gate orchestration, identity governance, and cross-plane integration with the application plane.

## Governance architecture summary
- CP remains the authoritative lifecycle owner for tenant, policy, and safety definitions.
- CP publishes versioned governance decisions consumed by AP inline enforcement points.
- CP emits auditable evidence for policy, approval, and lifecycle transitions.

## Plane Integration Contract (CP ? AP)

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->
## Plane Integration Contract questions (architect-edit)

```yaml
schema_version: plane_integration_contract_choices_v1
choices:
  cp_runtime_shape:
    question_id: Q-CP-RUNTIME-SHAPE-01
    question: Control Plane runtime shape
    options:
      - option_id: api_service_http
        status: adopt
        summary: Separately deployable CP HTTP API service.
      - option_id: worker_service_events
        status: defer
        summary: Event-driven worker runtime.
      - option_id: library_embedded
        status: defer
        summary: Embedded library runtime.
      - option_id: custom
        status: defer
        summary: Custom runtime shape.
  ap_runtime_shape:
    question_id: Q-AP-RUNTIME-SHAPE-01
    question: Application Plane runtime shape
    options:
      - option_id: api_service_http
        status: adopt
        summary: Separately deployable AP HTTP API service.
      - option_id: worker_service_events
        status: defer
        summary: Event-driven worker runtime.
      - option_id: library_embedded
        status: defer
        summary: Embedded library runtime.
      - option_id: custom
        status: defer
        summary: Custom runtime shape.
  cp_ap_contract_surface:
    question_id: Q-CP-AP-SURFACE-01
    question: Primary CP?AP contract surface
    options:
      - option_id: mixed
        status: adopt
        summary: Sync for enforcement; async for lifecycle and audit.
      - option_id: synchronous_http
        status: defer
        summary: Synchronous HTTP APIs only.
      - option_id: async_events
        status: defer
        summary: Async events only.
      - option_id: custom
        status: defer
        summary: Custom contract surface.
```

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 START -->
## Plane Integration Contract open questions (architect-edit)

```yaml
schema_version: open_questions_v1
questions: {}
```

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 END -->

<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 START -->
## Plane Integration Contract (CP ? AP)

### Contract scope
- Boundary: governance control-plane to application-plane orchestration.
- Purpose: authorize and govern AP actions under tenant context.

### Commands and responses
- `POST /cp/policy-decisions/evaluate`: AP requests policy decision for action intent.
- `POST /cp/safety-gates/evaluate`: AP requests pre-invocation safety gate decision.
- `GET /cp/policies/{policy_id}/active`: AP fetches currently active policy metadata.

### Events
- `policy_version_activated`
- `safety_rule_changed`
- `tenant_lifecycle_state_changed`

### Context and invariants
- Tenant context and principal context are required for every CP?AP interaction.
- Requests missing tenant context are rejected fail-closed.
- Policy decision responses carry version/provenance identifiers for audit.
<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 END -->

<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START -->
## Decision trace (CAF-managed)
- Adopted decisions consumed from `system_spec_v1.md` `decision_resolutions_v1` include: CAF-TCTX-01, CAF-MTEN-01, CAF-PLANE-01, CAF-AI-01, CAF-COMP-01, CTX-01, POL-01, VAL-01, CAF-AIOBS-01, CAF-POL-01.
- These decisions influence CP governance boundaries, CP?AP contract choices, and evidence requirements in this design.
- Carried-forward unresolved pattern questions represented as open questions in design docs: 0 for current scaffold.
<!-- CAF_MANAGED_BLOCK: decision_trace_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
## Decision resolutions carried into this design (architect-edit)

```yaml
schema_version: design_decision_resolutions_v1
source_ref: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md#decision_resolutions_v1
notes:
  - This block is a compact design-local bridge and does not replace system_spec decision ownership.
```

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

```yaml
schema_version: open_questions_v1
questions: {}
```

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

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
    - 'CAF-AIOBS-01'
    - 'CAF-POL-01'
    - 'CAF-POL-02'
    - 'CAF-IAM-02'
    - 'CAF-COMP-02'
  core:
    - 'CTX-01'
    - 'VAL-01'
    - 'POL-01'
  external:
    - 'EXT-API_GATEWAY'
    - 'EXT-CIRCUIT_BREAKER'
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
    evidence_hook_id: 'M-11'
    pattern_id: 'CAF-AIOBS-01'
    question_id: 'Q-CAF-AIOBS-01-01'
    option_set_id: 'ai_observability.hook_level'
    option_id: 'trace_metadata'
    summary: 'Include structured trace metadata (no full reasoning content).'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-12'
    pattern_id: 'CAF-POL-01'
    question_id: 'Q-AP-POLICY-POINTS-01'
    option_set_id: 'policy_gating.default_crud'
    option_id: 'gate_all_ops'
    summary: 'Gate all CRUD operations.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-17'
    pattern_id: 'CAF-POL-02'
    question_id: 'Q-POL-DIST-01'
    option_set_id: 'policy.responsibility_distribution'
    option_id: 'cp_central_decision_ap_enforces'
    summary: 'Control Plane centralizes policy decision; Application Plane enforces.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-18'
    pattern_id: 'CAF-IAM-02'
    question_id: 'Q-CAF-IAM-02-01'
    option_set_id: 'iam.identity_context_propagation'
    option_id: 'verified_token_claims'
    summary: 'Propagate identity and tenant context via verified token claims at ingress.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-19'
    pattern_id: 'CAF-COMP-02'
    question_id: 'Q-CAF-COMP-02-01'
    option_set_id: 'compliance.anti_pattern_enforcement_mode'
    option_id: 'warn_then_gate'
    summary: 'Warn during scaffolding; fail closed at gate checks if unresolved.'
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
    evidence_hook_id: 'M-15'
    pattern_id: 'EXT-CIRCUIT_BREAKER'
    question_id: 'Q-EXT-CB-01'
    option_set_id: 'resilience.circuit_breaker_placement'
    option_id: 'client_side_library'
    summary: 'Circuit breaker enforced in client/SDK/library at call sites.'
    payload: {}
  - source: 'system'
    evidence_hook_id: 'M-16'
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