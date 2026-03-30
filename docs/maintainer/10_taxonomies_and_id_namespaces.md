# Taxonomies and ID namespaces

This page is the maintainer-facing map for recurring CAF taxonomies and identifier namespaces.

The goal is not to duplicate every schema. The goal is to show where each taxonomy is authoritative and how it is used in the workflow.

## ID namespaces

### `OBL-*`

`OBL-*` ids are **compiler-owned instance obligations** emitted into `design/playbook/pattern_obligations_v1.yaml`.

Examples:

- `OBL-OPT-...`
- `OBL-REPO-README`
- `OBL-RUNTIME-WIRING`

Use them when you need to prove that the final task graph covers a compiled obligation.

### `O-*`

`O-*` ids are **library-local expectation ids** used inside manifests such as TBPs and PBPs.

Examples:

- `O-TBP-PG-01-app-adapter-hook`
- `O-TBP-SQLALCHEMY-01-runtime-env-contract`

These are not the same namespace as `OBL-*`.

Current posture:

- keep both namespaces for now
- document the difference clearly
- avoid a rename-only standardization patch unless there is a concrete workflow benefit

## Taxonomy map

| Taxonomy | Canonical source | Used for |
|---|---|---|
| `obligation_kind` | `architecture_library/phase_8/80_phase_8_pattern_obligations_schema_v1.yaml` | Classifies compiler-owned obligations in `pattern_obligations_v1.yaml` |
| `capability_id` / `required_capabilities` | `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml` and `80_phase_8_task_graph_schema_v1.yaml` | Routes tasks to workers and validates dispatch |
| `anchor_kind` | `architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml` | Explains what kind of trace anchor a task carries |
| `plan_step_archetype` | pattern definition schemas and pattern definitions under `architecture_library/patterns/**/definitions_v1/` | Provides stable semantic anchor points for planner-owned tasks and later attachment |

## `obligation_kind`

Current enum:

- `contract_scaffolding`
- `api_boundary`
- `persistence_boundary`
- `tenant_context`
- `auth`
- `other`

Usage:

- helps classify obligation families for maintainers and downstream analysis
- should stay aligned with the actual compiler output shape
- `other` is allowed but should be treated as a signal to review whether the taxonomy needs expansion

## `capability_id` and `required_capabilities`

`capability_id` is the canonical worker-routing id in the worker capability catalog.

`required_capabilities` is the task-graph field that names the capability a task requires.

Usage:

- planner-owned task structure carries `required_capabilities`
- gates verify that every required capability maps to an active catalog entry
- worker dispatch uses the catalog, not freeform capability names

## `anchor_kind`

Current task-graph enum:

- `plan_step_archetype`
- `module_role`
- `structural_validation`

Usage:

- tells gates and enrichers what kind of trace anchor is being attached
- prevents freeform trace semantics from drifting task by task

## `plan_step_archetype`

`plan_step_archetype` is the main semantic anchor family used for planning.

Usage:

- pattern definitions declare archetypes
- planner-owned tasks cite them in `trace_anchors[]`
- deterministic enrichers and reviewers can then attach pressure to stable semantic anchors without inventing new planner logic every time

## Canonical vs derived projections

The canonical obligations artifact remains YAML:

- `design/playbook/pattern_obligations_v1.yaml`

Optional TSV / JSONL outputs are derived debug or search projections only. They should not replace the canonical YAML artifact unless CAF intentionally changes the ownership/model later.

## You might also be interested in

- [Planning workflows and post-chain](09_planning_workflows_and_post_chain.md)
- [`80_phase_8_pattern_obligations_schema_v1.yaml`](../../architecture_library/phase_8/80_phase_8_pattern_obligations_schema_v1.yaml)
- [`80_phase_8_task_graph_schema_v1.yaml`](../../architecture_library/phase_8/80_phase_8_task_graph_schema_v1.yaml)
- [`80_phase_8_worker_capability_catalog_v1.yaml`](../../architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml)
