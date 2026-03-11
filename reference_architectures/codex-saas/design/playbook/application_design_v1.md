# Application Plane Design (v1)

This document defines application-plane design responsibilities for `codex-saas` in `implementation_scaffolding`.

## Scope

- Tenant-facing APIs and workflow orchestration
- Review workspace, submission, and report service boundaries
- Application-side enforcement hooks for CP-governed policy and safety outcomes

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

<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START -->
- adopted decisions traced from `spec/playbook/system_spec_v1.md` decision_resolutions_v1
- carried-forward question sources: EXT-BACKEND_FOR_FRONTEND_BFF, PST-01
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
    - CAF-AI-01
    - CAF-PLANE-01
    - CAF-XPLANE-01
    - CAF-AIOBS-01
    - CAF-COMP-02
    - CAF-COH-02
    - CAF-MTEN-AGOBS-01
    - CAF-COMP-01
  core:
    - PST-01
    - CTX-01
  external:
    - EXT-BACKEND_FOR_FRONTEND_BFF
    - EXT-API_COMPOSITION_AGGREGATOR
    - EXT-BULKHEAD_ISOLATION
promotions:
  semantic_inputs: []
  required_trace_anchors: []
  required_role_bindings: []
  plane_placements: []
```

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 END -->
