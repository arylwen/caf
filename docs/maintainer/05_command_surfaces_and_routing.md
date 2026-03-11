# Command surfaces and routing

`/caf-meta` is the maintainer-focused command surface for evolving the CAF library.

Scope:

- Allowed: `architecture_library/**`, `skills/**`, `skills_portable/**`, maintainer docs under `docs/dev/**`.
- Not allowed: instance artifacts under `reference_architectures/**` or `companion_repositories/**`.

## Commands

### Add an approved technology atom

Use this when you want to extend the Phase 8 approved technology atoms schema.

```bash
/caf-meta add-atom <atom_path> <atom_value>
```

`atom_path` values:

- `providers`
- `runtimes.languages`
- `runtimes.frameworks`
- `persistence.orms`
- `databases`
- `deployments.modes`
- `deployments.targets`
- `iac_tools`
- `ci_systems`
- `observability_postures`

Example (add Rust as an approved runtime language):

```bash
/caf-meta add-atom runtimes.languages rust
```

Edits:

- `architecture_library/phase_8/86_phase_8_approved_technology_atoms_schema_v1.yaml`

### Add a worker skill for a capability

Use this when introducing a new capability that needs a worker.

```
/caf-meta add-skill <capability_id> [worker_id]
```

Defaults:

- If `worker_id` is omitted, CAF uses: `worker-<capability_id>` with `_` replaced by `-`.

Examples:

```bash
/caf-meta add-skill graph_ingestion
```

or, with an explicit worker id:

```bash
/caf-meta add-skill graph_ingestion worker-graph-expander
```

Edits:

- `architecture_library/phase_8/80_phase_8_worker_capability_catalog_v1.yaml`
- `skills/<worker_id>/SKILL.md`
- `skills_portable/<worker_id>/SKILL.md`

### Audit and scoring

Heavy, intentional ops:

- `/caf-meta audit <command|csv|all>`
- `/caf-meta score-playbook <instance_name>`

These are deterministic helpers and write under:

- `architecture_library/__meta/caf_library__evals/**`

## Troubleshooting: capability / dispatch drift

### If build fails: "capability not mapped" or "no worker"

Preferred posture:
- First, check whether the planner emitted a **new capability name** that should have reused an existing canonical capability.
  - Example: prefer `policy_enforcement` over introducing `policy_enforcement_boundary`.
  - Example: prefer `runtime_wiring` or `plane_runtime_scaffolding` over introducing `tenant_context_propagation` as a separate capability.

If it is truly a new capability and you want a new worker:

```
/caf-meta add-skill <capability_id> [worker_id]
```

Then implement the worker behavior in:
- `skills/<worker_id>/SKILL.md`
- `skills_portable/<worker_id>/SKILL.md`

### If arch fails: task id contract drift

CAF workers often enforce strict `task_id` naming contracts.
If the planner emits sequential task ids (e.g., `TG-03-*`) for worker-dispatched capabilities, build dispatch will fail.

Fix:
- Re-run `/caf arch <instance>` so the planner emits canonical ids (examples: `TG-20-*`, `TG-90-*`, `TG-TBP-*`, `TG-10-OPTIONS-*`).
- Do not patch task ids by hand unless you are intentionally taking ownership of the contract.


## Related canonical sources

- `architecture_library/patterns/caf_meta_v1/caf_command_surface_meta_patterns_v1.md`
- `architecture_library/patterns/caf_meta_v1/caf_skill_portability_and_adapter_shim_meta_patterns_v1.md`

## Next

[Feedback packets and fail-closed](07_feedback_packets_and_fail_closed.md) — See how routing mistakes or missing prerequisites surface when CAF stops progression.

## Related

- [Skill authoring](03_skill_authoring.md) — Pair command-surface changes with the worker and skill changes they often require.
- [Debugging generated outputs](06_debugging_generated_outputs.md) — Inspect the most useful maintainer-facing evidence when routing or dispatch goes wrong.
- [`tools/caf-meta/README.md`](../../tools/caf-meta/README.md) — Review the maintainer command surface directly from the tool entrypoint.

