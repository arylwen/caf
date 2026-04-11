# Instances, phases, and state

## Instances

An instance is a named workspace under `reference_architectures/<instance>/` created by `/caf saas <instance>`.

Typical high-level layout:

```text
reference_architectures/<instance>/
  product/               # human-owned PRD source docs
  spec/                  # pinned inputs + architecture playbooks
  design/                # derived design/planning artifacts
  feedback_packets/      # fail-closed outputs (blockers/advisories)
  .caf-state/            # checkpoints / lifecycle receipts / runner state
```

CAF now uses `.caf-state/` for two different kinds of execution truth:

- lifecycle checkpoints such as `/caf next <instance> apply` receipts under `.caf-state/checkpoints/`
- explicit runner state such as build-wave summaries and routed step status

Important examples:

- `.caf-state/build_wave_state_v1.json`
- `.caf-state/ux_build_wave_state_v1.json`
- `.caf-state/routed_step_state_v1.json`

The routed step state file is owned by the shared full-flow runner. It records deterministic step status for routed lifecycle commands (`not_started`, `in_progress`, `blocked`, `completed`, `invalidated`) so reruns do not have to infer everything from artifact presence alone.

CAF also provides a framework-owned Node helper for state recovery and manual mixed-mode work:

```text
node tools/caf/routed_step_state_v1.mjs <instance> reconcile
node tools/caf/routed_step_state_v1.mjs <instance> status
node tools/caf/routed_step_state_v1.mjs <instance> mark <step_id> <status> [reason]
node tools/caf/routed_step_state_v1.mjs <instance> invalidate <step_id> [reason]
```

Use `reconcile` when the state file is missing or you want CAF to rebuild step status conservatively from checkpoints, build-wave state, artifact completeness, and unresolved feedback packets. Use `status` to print the absolute state-file path plus the next suggested routed steps. Use `mark` for manual lifecycle work when you intentionally want to record that a routed step is now `in_progress`, `blocked`, `completed`, or `invalidated` before running another helper or wrapper.

Use `invalidate` when you want CAF to reopen a routed lifecycle step and every downstream dependent step. The helper is framework-owned and intentionally mechanical:

- it marks the selected step and all transitive downstream steps as `invalidated`
- it deletes the canonical evidence artifacts that would otherwise cause reconciliation to restore `completed`
- when invalidation crosses `nextApply`, it rewrites `spec/guardrails/profile_parameters.yaml` back to `lifecycle.generation_phase: "architecture_scaffolding"` and deletes `profile_parameters_resolved.yaml`
- it prints the deleted artifacts and lifecycle rewrites so the reset is explicit rather than silent

Current guardrail: `seeded` invalidation is intentionally unsupported because the seeded evidence is the bootstrap workspace itself. For that case, create a new instance instead.

## Default lifecycle

CAF’s default lifecycle is now:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf backlog <instance>
/caf build <instance>
```

The important transition is that `/caf prd` is the normal bridge between seeded PRD intent and the first architecture scaffold.

## Shape state before the first scaffold

`/caf saas` seeds:

- `product/PRD.md`
- `product/PLATFORM_PRD.md`
- `spec/playbook/architecture_shape_parameters.yaml`

The seeded shape file is a bootstrap editable surface, but it is marked:

- `meta.lifecycle_shape_status: "seeded_template_default"`

CAF now treats that state as **not ready** for the first `/caf arch`.

The first architecture scaffold requires the authoritative shape file to be in one of these lifecycle-ready states:

- `prd_promoted`
- `architect_curated` (advanced architect override)

## Checkpointing / apply

`/caf next <instance> apply` checkpoints the adopted decision set so downstream stages can build deterministically.

In the command surface this is usually invoked as:

```text
/caf next <instance> apply
```

This checkpoint happens **after** the first architecture scaffold and decision adoption. It does not replace the architect review step.

## How to correctly invalidate and restart from a step

The safe recovery pattern is:

1. identify the routed step you want to reopen
2. invalidate that step with the shared helper
3. optionally run `status` to confirm the new routed-state picture
4. rerun the owning top-level CAF command for that step

The syntax is the same for every supported step:

```text
node tools/caf/routed_step_state_v1.mjs <instance> invalidate <step_id> [reason]
```

What changes by step is the `step_id`, the downstream cascade, and the command you rerun afterward.

### Quick examples

```powershell
# Reopen planning and everything after it
node .\tools\caf\routed_step_state_v1.mjs codex-saas invalidate plan architect requested planning rerun
/caf plan codex-saas

# Reopen build after deleting or mistrusting generated companion code
node .\tools\caf\routed_step_state_v1.mjs codex-saas invalidate build manual witness code removed
/caf build codex-saas

# Reopen richer UX build without disturbing the main build lane
node .\tools\caf\routed_step_state_v1.mjs codex-saas invalidate uxBuild manual richer ux rerun
/caf ux build codex-saas
```

### Supported routed steps

| Step id | Owning CAF command | What invalidation does | What you rerun next |
| --- | --- | --- | --- |
| `seeded` | `/caf saas <instance>` | Unsupported. The seeded workspace is itself the bootstrap evidence. | Create a new instance instead of invalidating `seeded`. |
| `prd` | `/caf prd <instance>` | Deletes resolved PRD extracts and proposed shape outputs, then invalidates `arch1`, `nextApply`, `arch2`, `plan`, `build`, `ux`, `uxPlan`, and `uxBuild`. | `/caf prd <instance>` |
| `arch1` | `/caf arch <instance>` (first pass) | Deletes first-pass scaffold outputs, then invalidates `nextApply`, `arch2`, `plan`, `build`, `ux`, `uxPlan`, and `uxBuild`. | `/caf arch <instance>` |
| `nextApply` | `/caf next <instance> apply` | Deletes `profile_parameters_resolved.yaml`, rewinds `lifecycle.generation_phase` to `architecture_scaffolding`, then invalidates `arch2`, `plan`, `build`, `ux`, `uxPlan`, and `uxBuild`. | `/caf next <instance> apply` |
| `arch2` | `/caf arch <instance>` (second pass) | Deletes design-phase architecture outputs, then invalidates `plan`, `build`, `ux`, `uxPlan`, and `uxBuild`. | `/caf arch <instance>` |
| `plan` | `/caf plan <instance>` | Deletes planning outputs (`pattern_obligations`, task graph, interface bindings, task plan, and any existing task backlog view), then invalidates `build` and `uxBuild`. | `/caf plan <instance>` |
| `build` | `/caf build <instance>` | Deletes `.caf-state/build_wave_state_v1.json`, `companion_repositories/<instance>/profile_v1/caf/task_reports/`, and `.../caf/reviews/`. The helper does **not** delete companion code folders directly. | `/caf build <instance>` |
| `ux` | `/caf ux <instance>` | Deletes richer UX derivation outputs, then invalidates `uxPlan` and `uxBuild`. | `/caf ux <instance>` |
| `uxPlan` | `/caf ux plan <instance>` | Deletes richer UX task graph, plan, and backlog, then invalidates `uxBuild`. | `/caf ux plan <instance>` |
| `uxBuild` | `/caf ux build <instance>` | Deletes `.caf-state/ux_build_wave_state_v1.json`. It does not touch the main build wave state. | `/caf ux build <instance>` |

### Why build invalidation matters after code changes

CAF currently trusts build completion from the canonical build evidence surfaces:

- `.caf-state/build_wave_state_v1.json`
- `companion_repositories/<instance>/profile_v1/caf/task_reports/`
- `companion_repositories/<instance>/profile_v1/caf/reviews/`

If you manually delete or edit generated companion code without invalidating `build`, CAF can still believe the build lane is complete and only fail later in a post-gate that inspects the actual code tree.

That is why the safe command after removing or distrusting generated `code/ui`, `code/ux`, or other companion surfaces is:

```powershell
node .\tools\caf\routed_step_state_v1.mjs codex-saas invalidate build manual witness code removed
/caf build codex-saas
```

### Recommended operator flow

When you are unsure what to reopen:

```powershell
node .\tools\caf\routed_step_state_v1.mjs codex-saas status
```

When you want CAF to recompute routed state conservatively from what is actually present:

```powershell
node .\tools\caf\routed_step_state_v1.mjs codex-saas reconcile
node .\tools\caf\routed_step_state_v1.mjs codex-saas status
```

A practical mixed-mode recovery loop looks like this:

```powershell
# 1. Inspect current routed-step state
node .\tools\caf\routed_step_state_v1.mjs codex-saas status

# 2. Reopen the step you want to rerun
node .\tools\caf\routed_step_state_v1.mjs codex-saas invalidate build manual witness code removed

# 3. Confirm the cascade and deleted evidence
node .\tools\caf\routed_step_state_v1.mjs codex-saas status

# 4. Rerun the owning CAF command
/caf build codex-saas
```

## Generated outputs

Generated outputs are typically gitignored and should be treated as **build artifacts**, not source.

If you need samples for documentation or onboarding, export sanitized snapshots under `docs/user/samples/`.

## Backlog projection

- `task_graph_v1.yaml` remains the authoritative planning structure.
- `task_backlog_v1.md` is a human-facing derived view projected separately by `/caf backlog <instance>`.
- Missing `task_backlog_v1.md` by itself does not mean the semantic planning bundle is missing.
