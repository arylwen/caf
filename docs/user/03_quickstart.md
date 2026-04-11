# Quickstart

Create your own SaaS instance and follow the default PRD-first path into architecture, planning, candidate code, and the optional richer UX lane.

![CAF end-to-end pipeline](../images/caf_end_to_end_pipeline.svg)

*CAF moves work through a PRD-first progression: product requirements are resolved into a lifecycle-ready shape, architecture scaffolding is derived from that shape, planning turns adopted decisions into work, implementation follows from the plan, and the richer UX lane can be added after the main build lane is in place.*

Replace `<instance>` with your own instance name. `/caf saas` also accepts an optional second argument for a profile template id. The default remains the simple boring SaaS starter.

If you are using the packaged terminal helpers, prefer the direct Node entrypoints from the repo root:

```powershell
node .\tools\caf\cli\codex\run_caf_flow_v1.mjs codex-saas
node .\tools\caf\cli\claude\run_caf_flow_v1.mjs codex-saas
```

The `.cmd`, `.sh`, and `.ps1` wrappers remain available, but the direct Node entrypoint avoids PowerShell script-policy friction on some systems.

```text
/caf saas <instance>
/caf prd <instance>           # default next step: resolve PRD and promote a lifecycle-ready shape
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf backlog <instance>
/caf build <instance>

# optional richer UX lane after the main build lane
/caf ux <instance>
/caf ux plan <instance>
/caf ux build <instance>
```

Notes:

- CAF is **fail-closed**: missing or ambiguous inputs produce feedback packets.
- Default starter: `/caf saas <instance>` seeds the simple SaaS path via `intentionally_boring_saas_v1`.
- Agentic review starter: `/caf saas <instance> governed_agentic_review_v1` keeps the same boring review domain but adds governed AI-assisted and bounded agentic workflow seeds.
- Outputs are **candidate-only** and require human review.
- `/caf prd` is a single workflow; you should not need to run any `tools/caf/*` scripts directly.
- The canonical sample instance for ask-first exploration is `codex-saas`.
- `/caf ux`, `/caf ux plan`, and `/caf ux build` are optional follow-on commands for the richer UX lane; they do not replace the main `/caf build` lane.

## What to expect

- After `/caf saas`, you’ll have a new instance under `reference_architectures/<instance>/`, seeded PRD source docs, and a bootstrap `architecture_shape_parameters.yaml`.
- `/caf prd` turns the seeded or edited PRD documents into a lifecycle-ready architecture shape before the first architecture scaffolding run.
- If you skip `/caf prd`, the first `/caf arch` now warns via an advisory feedback packet, but the recommended launch path is still `/caf prd` first.
- The first `/caf arch` derives architecture scaffolding and decision candidates from that promoted or architect-curated shape.
- `/caf next <instance> apply` checkpoints your adopted decisions so downstream steps can proceed deterministically.
- The second `/caf arch` derives the design bundle that planning consumes, including control-plane/application design docs, contract declarations, normalized domain-model views, and the design material a later richer UX lane may consume.
- `/caf plan` produces the semantic planning bundle (obligations, task graph, interface bindings, and task plan). Use `/caf backlog <instance>` when you want the human backlog projection.
- If a detailed PRD is unavailable, CAF also supports an architect-operated fallback starting from curated pins plus domain-model source material; see the architect workflows before using that path.
- `/caf build` generates **candidate** code under `companion_repositories/<instance>/`.
- `/caf ux` derives the richer UX design bundle, `/caf ux plan` turns it into a UX task graph and backlog, and `/caf ux build` realizes the richer UX lane against the already-built backend/runtime truth.

## What to run next

If you want the default lifecycle:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

If you want the optional richer UX lane after the main build:

```text
/caf ux <instance>
/caf ux plan <instance>
/caf ux build <instance>
```

## Find out more

[PRD-first lifecycle](15_prd_first_lifecycle.md) — See why this command order exists and where the human checkpoints live.

## You might also be interested in

- [PRD → Architecture Shape](12_prd_workflow.md) — Understand what `/caf prd` promotes before the first architecture scaffold.
- [Instances, phases, and state](05_instances_phases_and_state.md) — Learn where each lifecycle artifact lands.
- [Skills, runners, and command surface](07_skills_runners_and_command_surface.md) — See the full command surface, including the richer UX lane.
- [Answering questions with CAF](14_answering_questions_with_caf.md) — Use the ask surface to inspect the resulting state.
