# Completeness report (v1)

## Metadata
- instance: (required)
- generated_by: caf-arch | caf-build (required)
- generated_at: ISO-8601 UTC timestamp (required)
- state_source: guardrails/derivation_cascade_contract_v1.md (required; cite an evidence item)
- generation_phase: (required; derive from state_source)
- evolution_stage: (required; derive from state_source)
- platform_spine: (required; derive from state_source; include infra_target/packaging/runtime_language/database_engine)

## Required gates and obligations
(List what is required for the current phase and enforcement bar, plus any required derived obligations from the top-20 pattern TSV. Every requirement MUST cite its source.)
(List what is required for the current phase and enforcement bar. Every requirement MUST cite its source.)

### Requirement Q-001
- requirement_type: phase_gate | enforcement_bar | task_graph_acceptance_check | tbp_gate | pbp_gate | derived_obligation | other
- requirement_id: (required)
- description: (required)
- source: E-001

## Status summary
### Gate status G-001
- requirement_id: Q-001
- status: pass | fail | not_applicable
- evidence: E-001

## Missing required artifacts
- (none)

## Violations and blockers
- (none)

## Next actions
- (none)

## Pattern obligations coverage (required)

When `reference_architectures/<instance>/design/playbook/pattern_obligations_v1.yaml` exists, the completeness report MUST include:

### Pattern obligations (missing = fail-closed)
Table columns:
- obligation_id
- obligation_kind
- plane_scope
- capability_id
- source_anchors
- implementing_task_ids (0+ task_ids from task_graph_v1.yaml trace_anchors scan)
- status (present|missing)

An obligation is **missing** if:
- it exists in `pattern_obligations_v1.yaml`, and
- no task in `playbook/task_graph_v1.yaml` contains `pattern_obligation_id:<obligation_id>` in `tasks[].trace_anchors[].pattern_id`.

## Derived obligations completeness

- archetype
- source_anchor
- implementing_task_ids (0+ task_ids from task_graph_v1.yaml trace_anchors scan)
- status (present|missing)

A required derived obligation is **missing** if:

- its `pattern_id` is selected in the Planning Pattern Payload, and
- no task in `playbook/task_graph_v1.yaml` contains `derived_obligation_id:<obligation_id>` in `tasks[].trace_anchors[].pattern_id`.

## Cross-plane contract materialization completeness

When `reference_architectures/<instance>/design/playbook/contract_declarations_v1.yaml` exists, the completeness report MUST include:

### Material cross-plane contracts (missing = fail-closed)

Table columns:

- boundary_id
- plane_a
- plane_b
- contract_ref
- expected_task_ids (TG-00-CONTRACT-<boundary_id>-<plane_id>)
- status (both_present|missing_one_or_more)

A material cross-plane contract is **missing** if:
- `materiality.is_material: true`, and
- any expected task id is absent from `task_graph_v1.yaml`.  ## Task completion evidence coverage (required)

CAF MUST report whether each *materialized* candidate-code task output includes a **Task completion evidence** section.

Rules:
- Target artifacts: any generated README under:  - `companion_repositories/<instance>/profile_v1/code/**/boundaries/**/README.md`  - `companion_repositories/<instance>/profile_v1/code/**/contracts/**/README.md`
- An artifact is compliant iff it contains the exact heading: `## Task completion evidence`.
- If any target artifact is missing the section, CAF MUST fail-closed and list each missing path.

### Missing evidence sections
- (required list; empty if none)
