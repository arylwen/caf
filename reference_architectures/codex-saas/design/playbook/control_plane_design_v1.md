# Control Plane Design (v1)

This document defines control-plane design responsibilities for `codex-saas` in `implementation_scaffolding`.

## Scope

- Control-plane governance APIs and policy lifecycle ownership
- Identity and tenant governance records
- Plane integration contract with the application plane

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
```yaml
version: 1
decisions: {}
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
```yaml
version: 1
questions: {}
```
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

## Plane Integration Contract (CP <-> AP)

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->
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
    question: Primary CP/AP contract surface
    options:
      - option_id: mixed
        status: adopt
        summary: Sync for policy checks; async for lifecycle/audit.
      - option_id: synchronous_http
        status: defer
        summary: Synchronous HTTP only.
      - option_id: async_events
        status: defer
        summary: Event-driven only.
      - option_id: custom
        status: defer
        summary: Custom contract surface.
```
<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 START -->
```yaml
version: 1
questions: {}
```
<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 END -->

<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 START -->
Control-plane enforces tenant, identity, policy, and safety decisions before AP execution.
AP executes request workflows with immutable tenant context and emits synchronous evidence.
<!-- DESIGNER_MANAGED_BLOCK: plane_integration_contract_v1 END -->

<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START -->
- adopted decisions traced from `spec/playbook/system_spec_v1.md` decision_resolutions_v1
- carried-forward question sources: CAF-TCTX-01, CAF-POL-01
<!-- CAF_MANAGED_BLOCK: decision_trace_v1 END -->

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 START -->

## Planning pattern payload (CAF-managed)

```yaml
schema_version: planning_pattern_payload_v1
generated_from:
  retrieval_surface_path: architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl
  retrieval_profile: solution_architecture
  selected_patterns_source: 'system_spec_v1.md:decision_resolutions_v1 (status: adopt)'
  materialized_by: tools/caf/materialize_planning_pattern_payload_v1.mjs
notes:
  - 'Enrichment/promotions are deferred to planning (/caf plan). Reference:'
  - reference_architectures/codex-saas/design/playbook/design_summary_v1.md
  - reference_architectures/codex-saas/design/playbook/pattern_obligations_v1.yaml
  - reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml
selected_patterns:
  caf:
    - CAF-TCTX-01
    - CAF-MTEN-01
    - CAF-IAM-01
    - CAF-POL-01
    - CAF-AI-01
    - CAF-PLANE-01
    - CAF-XPLANE-01
    - CAF-AIOBS-01
    - CAF-IAM-GOV-04
    - CAF-COMP-02
    - CAF-COH-02
    - CAF-MTEN-AGOBS-01
    - CAF-COMP-01
  core:
    - CTX-01
  external:
    - EXT-API_COMPOSITION_AGGREGATOR
    - EXT-AUDITABILITY
    - EXT-BULKHEAD_ISOLATION
    - EXT-API_GATEWAY
promotions:
  semantic_inputs: []
  required_trace_anchors: []
  required_role_bindings: []
  plane_placements: []
```

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 END -->
