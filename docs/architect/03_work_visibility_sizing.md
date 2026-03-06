# Sizing: how big is the work

This doc targets question (2): **“For this product/architecture intent, how big is the work?”**

CAF treats “work size” as a *traceable* derived view:

- **obligations** (what must exist) → **capabilities** (what type of work) → **tasks** (execution units)

CAF does **not** promise a calendar estimate; it gives you a deterministic, auditable scope surface.

## Primary UX surface

- `/caf ask <question about scope / effort / tasks>`
  - intent: `work_visibility`
  - context pack: `reference_architectures/<instance>/design/caf_meta/ask_context_v1.md` (when planning exists)

## What to read (manual)

These are the core sizing artifacts:

- `design/playbook/pattern_obligations_v1.yaml`
- `design/playbook/task_graph_v1.yaml`
- `design/playbook/task_plan_v1.md` (derived view)
- `design/playbook/task_backlog_v1.md` (if present)

Compact indexes (preferred for “how big” questions):

- `design/playbook/pattern_obligations_index_v1.tsv` (generated)
- `design/playbook/task_graph_index_v1.tsv` (generated)

## How CAF produces the sizing surface

1) Patterns are adopted (or deferred).
2) Adopted patterns promote obligations (deterministic promotion rules).
3) Obligations map to required capabilities.
4) The planner produces a `task_graph_v1.yaml` that satisfies capability coverage and gates.

## Deterministic helpers (mechanical)

- `tools/caf/gen_obligations_index.mjs` → `pattern_obligations_index_v1.tsv`
- `tools/caf/gen_task_graph_index.mjs` → `task_graph_index_v1.tsv`
- `tools/caf/gen_task_plan_v1.mjs` → `task_plan_v1.md` (waves + graph)
- `tools/caf/gen_build_dispatch_manifest_v1.mjs` → `build_dispatch_manifest_v1.md` (capability→worker mapping)

## A deterministic “size summary” recipe (no heuristics)

When you need a quick scope profile, compute these counts from the TSV indexes:

- obligations: count by `capability_id` and `plane_scope`
- tasks: count by `required_capabilities` and `plane_scope`
- topology: number of waves in `task_plan_v1.md` (parallelism ceiling)

## Checklist

- [ ] Do you have planning artifacts? (`/caf plan <instance>`)
- [ ] Are obligation indexes present? If not, generate them.
- [ ] Does task graph coverage satisfy gates? (see `08_gates_and_fail_closed.md`)
- [ ] Use counts + waves as the deterministic “how big” answer.
