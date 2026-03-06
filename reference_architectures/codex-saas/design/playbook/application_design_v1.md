# Application Plane Design (v1)

## Scope

Application plane design for `codex-saas` in `implementation_scaffolding`, focused on tenant-scoped request handling, agent invocation boundaries, and UI-facing composition.

## Application Structure

- API service boundary (`api_service_http`) handling ingress, validation, and context establishment.
- Service facade boundary for widget domain use cases.
- Persistence boundary via repositories over tenant-keyed Postgres storage.
- BFF/API composition boundary for the React SPA deployed as a separate service.

## Request and Context Flow

1. Resolve tenant/principal context at ingress.
2. Enforce policy and safety checks before agent/tool invocation.
3. Execute application use case with tenant-scoped persistence access.
4. Emit synchronous evidence for decisions, actions, and data operations.

<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 START -->
## Decision resolutions (architect-edit)

```yaml
version: 1
notes:
  - Application-plane design applies adopted decisions from system spec decision_resolutions_v1.
```
<!-- ARCHITECT_EDIT_BLOCK: decision_resolutions_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 START -->
## Open questions (architect-edit)

```yaml
version: 1
questions: {}
```
<!-- ARCHITECT_EDIT_BLOCK: open_questions_v1 END -->

<!-- CAF_MANAGED_BLOCK: decision_trace_v1 START -->
## Decision trace (CAF-managed)

- Adopted pattern decisions consumed: CAF-PLANE-01, CAF-TCTX-01, CAF-MTEN-01, CAF-AI-01, CAF-IAM-02, POL-01, OBS-01, CAF-EDGE-01, CAF-IAM-01, CAF-XPLANE-01, CAF-MTEN-ANTI-01, CAF-MTEN-AGOBS-01, PST-01, CTX-01, VAL-01.
- Source: reference_architectures/codex-saas/spec/playbook/system_spec_v1.md (ARCHITECT_EDIT_BLOCK: decision_resolutions_v1).
- Influenced sections: Application Structure, Request and Context Flow.
- Carried-forward unresolved pattern questions: 0 (none).
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
    - CAF-PLANE-01
    - CAF-TCTX-01
    - CAF-MTEN-01
    - CAF-AI-01
    - CAF-IAM-02
    - CAF-EDGE-01
    - CAF-XPLANE-01
    - CAF-MTEN-ANTI-01
    - CAF-MTEN-AGOBS-01
  core:
    - VAL-01
    - PST-01
    - CTX-01
  external:
    - EXT-BACKEND_FOR_FRONTEND_BFF
    - EXT-API_COMPOSITION_AGGREGATOR
promotions:
  semantic_inputs: []
  required_trace_anchors: []
  required_role_bindings: []
  plane_placements: []
```

<!-- CAF_MANAGED_BLOCK: planning_pattern_payload_v1 END -->
