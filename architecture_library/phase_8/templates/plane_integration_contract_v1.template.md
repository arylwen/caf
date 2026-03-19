# Plane Integration Contract (v1)

<!-- CAF_MANAGED_BLOCK: contract_scope_v1 START -->
## Contract scope (CAF-managed)
- planes: control_plane ↔ application_plane
- purpose: tenant lifecycle + governance signals ↔ application behavior
<!-- CAF_MANAGED_BLOCK: contract_scope_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->
## Plane Integration Contract questions (architect-edit)
(YAML. Low-friction: each question embeds its option list. Flip exactly one option to `status: adopt`. Options MUST be hydrated from CAF library patterns; do not hand-author option inventories here. If any scalar value contains `: `, quote it or rephrase it.)

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
        summary: Custom runtime shape (document explicitly).
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
        summary: Custom runtime shape (document explicitly).
  cp_ap_contract_surface:
    question_id: Q-CP-AP-SURFACE-01
    question: Primary CP↔AP contract surface
    options:
      - option_id: mixed
        status: adopt
        summary: Sync for enforcement; async for lifecycle and audit.
      - option_id: synchronous_http
        status: defer
        summary: Synchronous HTTP API only.
      - option_id: async_events
        status: defer
        summary: Async events only.
      - option_id: custom
        status: defer
        summary: Custom contract surface.
```

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 START -->
## Plane Integration Contract open questions (architect-edit; optional)
(YAML. Deprecated in v1: prefer adding a new question to the main contract questions block above, sourced from a CAF pattern `human_questions` template.)

```yaml
version: 1
questions: {}
```

<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_open_questions_v1 END -->

<!-- CAF_MANAGED_BLOCK: plane_event_command_catalog_v1 START -->
## Events and commands (CAF-managed; semantic only)
(Enumerate event/command types, required fields, and producer/consumer responsibilities.)
<!-- CAF_MANAGED_BLOCK: plane_event_command_catalog_v1 END -->

<!-- CAF_MANAGED_BLOCK: context_propagation_rules_v1 START -->
## Context propagation rules (CAF-managed)
(Tenant context, correlation, auth context requirements; rejection rules if missing.)
<!-- CAF_MANAGED_BLOCK: context_propagation_rules_v1 END -->

<!-- CAF_MANAGED_BLOCK: invariants_and_definition_of_done_v1 START -->
## Invariants and acceptance checks (CAF-managed)
(Idempotency expectations, replay safety, failure semantics, audit expectations.)
<!-- CAF_MANAGED_BLOCK: invariants_and_definition_of_done_v1 END -->

<!-- ARCHITECT_EDIT_BLOCK: open_questions_and_constraints_v1 START -->
## Open questions and constraints (architect-edit)
(Anything ambiguous or requiring explicit human decision.)
<!-- ARCHITECT_EDIT_BLOCK: open_questions_and_constraints_v1 END -->
