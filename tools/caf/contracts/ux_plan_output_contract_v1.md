# UX plan output contract v1

**Owner:** `skills/worker-ux-planner/SKILL.md` for `ux_task_graph_v1.yaml`; deterministic `/caf ux plan` post-chain for projected views  
**Status:** maintainer-facing contract for the first bounded `/caf ux plan` proof

## Purpose

Define the bounded output contract for `/caf ux plan` while reusing CAF's existing task-graph schema and review/enrichment posture.

## Canonical outputs

`/caf ux plan` should emit:
- `reference_architectures/<instance>/design/playbook/ux_task_graph_v1.yaml` (instruction-owned semantic worker output)
- `reference_architectures/<instance>/design/playbook/ux_task_plan_v1.md` (deterministic projection)
- `reference_architectures/<instance>/design/playbook/ux_task_backlog_v1.md` (deterministic projection)

## Canonical inputs

`/caf ux plan` should consume:
- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `reference_architectures/<instance>/design/playbook/retrieval_context_blob_ux_design_v1.md`
- grounded UX pattern candidates
- relevant second-pass design/context artifacts when present

Within `ux_design_v1.md`, planning should prefer the selected semantic/manual content in this order:
1. manual architect override
2. semantic projection block
3. deterministic seed fallback

Planning must not depend on full-copy architect hydration.

## Ownership split

- `ux_task_graph_v1.yaml` is planner-owned semantic output from `skills/worker-ux-planner/SKILL.md`.
- `ux_task_plan_v1.md` and `ux_task_backlog_v1.md` are mechanical downstream views; they must not become alternate planner-owned sources of truth.
- If the semantic task graph is missing, fail closed and strengthen the worker/gate seam rather than reintroducing script-authored UX task shaping.
- The `/caf ux plan` command is a serialized fence: precondition checks, planner-owned `ux_task_graph_v1.yaml`, then deterministic projection/gates. Those phases must not be scheduled in parallel.
- Downstream deterministic reads should wait for the planner-owned YAML file to be present and readable before projection begins.
