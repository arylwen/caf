# Quickstart

Create your own SaaS instance and follow the default PRD-first path into architecture, planning, and candidate code.

![CAF end-to-end pipeline](../images/caf_end_to_end_pipeline.svg)

*CAF moves work through a PRD-first progression: product requirements are resolved into a lifecycle-ready shape, architecture scaffolding is derived from that shape, planning turns adopted decisions into work, and implementation follows from the plan, with persistent artifacts produced at each stage.*

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
/caf build <instance>
```

Notes:

- CAF is **fail-closed**: missing or ambiguous inputs produce feedback packets.
- Default starter: `/caf saas <instance>` seeds the simple SaaS path via `intentionally_boring_saas_v1`.
- Agentic review starter: `/caf saas <instance> governed_agentic_review_v1` keeps the same boring review domain but adds governed AI-assisted and bounded agentic workflow seeds.
- Outputs are **candidate-only** and require human review.
- `/caf prd` is a single workflow; you should not need to run any `tools/caf/*` scripts directly.
- The canonical public sample instance for ask-first exploration is `codex-saas`.

## What to expect

- After `/caf saas`, you’ll have a new instance under `reference_architectures/<instance>/`, seeded PRD source docs, and a bootstrap `architecture_shape_parameters.yaml`.
- `/caf prd` turns the seeded or edited PRD documents into a lifecycle-ready architecture shape before the first architecture scaffolding run.
- If you skip `/caf prd`, the first `/caf arch` now warns via an advisory feedback packet, but the recommended launch path is still `/caf prd` first.
- The first `/caf arch` derives architecture scaffolding and decision candidates from that promoted or architect-curated shape.
- `/caf next <instance> apply` checkpoints your adopted decisions so downstream steps can proceed deterministically.
- The second `/caf arch` derives the design bundle that planning consumes, including control-plane/application design docs, contract declarations, and normalized domain-model views.
- `/caf plan` produces obligations, task graph, and backlog artifacts.
- If a detailed PRD is unavailable, CAF also supports an architect-operated fallback starting from curated pins plus domain-model source material; see the architect workflows before using that path.
- `/caf build` generates **candidate** code under `companion_repositories/<instance>/`.

## Find out more

[PRD-first lifecycle](15_prd_first_lifecycle.md) — See why this command order exists and where the human checkpoints live.

## You might also be interested in

- [PRD → Architecture Shape](12_prd_workflow.md) — Understand what `/caf prd` promotes before the first architecture scaffold.
- [Instances, phases, and state](05_instances_phases_and_state.md) — Learn where each lifecycle artifact lands.
- [Answering questions with CAF](14_answering_questions_with_caf.md) — Use the ask surface to inspect the resulting state.
