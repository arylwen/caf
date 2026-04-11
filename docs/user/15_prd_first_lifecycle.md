# PRD-first lifecycle

CAF’s default mental model is:

1. seed instance
2. shape from PRD
3. scaffold architecture
4. adopt
5. elaborate architecture
6. plan
7. build
8. optional richer UX lane

In commands:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>

# optional richer UX lane
/caf ux <instance>
/caf ux plan <instance>
/caf ux build <instance>
```

The sequence matters because each step makes the next one more trustworthy. The optional richer UX lane builds on that same foundation instead of bypassing it.

## Why `/caf prd` is first-class

`/caf saas` seeds the workspace and the source documents, but it does not prove that the seeded architecture shape matches your product intent.

CAF therefore treats the seeded shape as a **bootstrap default**, not as a lifecycle-ready input for architecture scaffolding.

The default job of `/caf prd` is to:

- validate the PRD source documents
- resolve them into a placeholder-free working form
- infer a proposed architecture shape
- validate the proposal deterministically
- promote a lifecycle-ready authoritative shape for downstream consumption

That makes `/caf prd` the normal bridge from product intent to the first architecture scaffold.

## Source artifacts vs derived artifacts

CAF preserves **source artifacts vs derived artifacts**.

Human-owned source artifacts:

- `product/PRD.md`
- `product/PLATFORM_PRD.md`
- `spec/playbook/architecture_shape_parameters.yaml`
- adopted decision content inside the architecture/design playbooks

Derived artifacts:

- PRD extracts and resolved views
- proposed architecture shape + rationale sidecar
- architecture scaffolding docs
- planning outputs and task graph
- candidate build outputs

This separation matters because CAF keeps the editable human-owned sources distinct from the artifacts it derives from them.

## PRD lifecycle states

CAF now distinguishes the authoritative shape file by explicit lifecycle provenance:

- `seeded_template_default`
  - produced by `/caf saas`
  - useful as a bootstrap editable surface
  - means `/caf prd` has not yet promoted the lifecycle-ready shape
- `prd_promoted`
  - produced by `/caf prd`
  - validated and lifecycle-ready for the first `/caf arch`
- `architect_curated`
  - advanced architect override state
  - documented for advanced architect-operated flows, not the default command flow

## How the lifecycle works

### 1. `/caf saas <instance>`

Seeds the instance, including:

- product source docs
- guardrail pins
- a bootstrap `architecture_shape_parameters.yaml`

This creates the editable starting point, not the final architectural binding.

### 2. `/caf prd <instance>`

Turns the PRD source docs into a lifecycle-ready architecture shape.

Default result:

- `spec/playbook/architecture_shape_parameters.yaml`
- `meta.lifecycle_shape_status: "prd_promoted"`

### 3. First `/caf arch <instance>`

Consumes the authoritative lifecycle-ready shape and generates architecture scaffolding plus decision pattern candidates.

If the shape is still only `seeded_template_default`, CAF now writes an advisory feedback packet and continues for the default command flow.

### 4. `/caf next <instance> apply`

Checkpoints the adopted architecture state and advances the lifecycle phase.

Architects use this command to adopt and checkpoint the high-level architecture so downstream phases inherit a deterministic, auditable baseline.

### 5. Second `/caf arch <instance>`

Consumes the adopted system/spec-side architecture state and elaborates the system design bundle that planning depends on.

Typical inputs include:

- adopted `*_spec` playbooks
- spec-side domain-model source docs
- resolved guardrails and checkpointed lifecycle state
- supporting instance files that materially affect design retrieval

Typical outputs include:

- `design/playbook/control_plane_design_v1.md`
- `design/playbook/application_design_v1.md`
- `design/playbook/contract_declarations_v1.yaml`
- normalized YAML domain-model views
- `design/playbook/design_summary_v1.md`
- CAF-managed planning payload blocks

This is where CAF should currently make UX-relevant **system/design** choices legible, such as interface posture, BFF-adjacent shaping, and application-side interaction structure that planning or a later UX lane may need.

### 6. `/caf plan <instance>`

Consumes the adopted / elaborated architecture state and produces obligations, task graph, and other planning artifacts.

Planning depends mainly on the main design documents, contract declarations, normalized domain-model YAML views, and any CAF-managed planning bridge surfaces emitted by the later architecture step.

Supporting summaries and sidecars make the handoff easier to review later, especially when someone needs to understand what changed and why.

### 7. `/caf build <instance>`

Generates candidate build outputs after the earlier lifecycle gates have been satisfied.

### 8. `/caf ux <instance>`, `/caf ux plan <instance>`, `/caf ux build <instance>`

These are follow-on commands for the richer UX lane.

Run them in order:

- `/caf ux <instance>` after the second `/caf arch <instance>` to derive the canonical UX design and visual-system artifacts
- `/caf ux plan <instance>` after `/caf ux <instance>` to compile the UX task graph, plan, and backlog
- `/caf ux build <instance>` after the main `/caf build <instance>` to realize the richer UX lane against the already-built backend/runtime truth

This lane is additive. It stays on top of the current REST/OpenAPI runtime surfaces and does not replace the smoke-test UI path.

## How architect control is preserved

This lifecycle does **not** collapse PRD rationale into hard bindings.

CAF keeps these separations intact:

- **rationale vs binding**
  - rationale remains in sidecars / source docs
  - bindings remain in authoritative promoted or curated artifacts
- **plan vs build**
  - planning happens after architecture + adoption
  - build depends on the planning / lifecycle gates
- **source artifacts vs derived artifacts**
  - humans own the editable source surfaces
  - generated outputs remain derived and auditable

Most importantly, the lifecycle remains architect-controlled because PRD promotion does not bypass adoption, checkpointing, or later architecture edits.

Architects can also run a curated override path when the default PRD-first flow is not the right fit. That workflow is documented in the [architect workflow guide](../architect/10_architect_workflows.md).

## What `/caf next <instance> apply` means in this model

`/caf next <instance> apply` is the lifecycle checkpoint between the system architecture scaffold and system design and candidate code.

It does **not** reinterpret the PRD.
It checkpoints the current adopted architectural state so downstream work uses an explicit promoted baseline.

The relationship is:

- PRD-derived or architect-curated shape informs the first architecture scaffold
- architect adoption resolves decision pattern candidates into an adopted architecture state
- `/caf next <instance> apply` checkpoints that adopted state for the next phase

## When can `/caf prd` be skipped?

Operationally, CAF now treats `/caf prd` as **strongly expected by default**.

For the default workflow run `/caf prd` before you treat the first `/caf arch` scaffold as your stable baseline. If you skip it, CAF will surface an advisory packet so you can correct course without getting blocked.

Advanced fallback: when a detailed PRD is not yet available, an architect may curate the authoritative shape directly and use domain-model source material to support the later lifecycle. That path is valid, but it is intentionally documented as a fallback rather than the main lifecycle story because CAF will carry less prd-derived product intent downstream.

There is also an architect-operated fallback for cases where a detailed PRD is not yet available. In that path, the architect can:

- curate `spec/playbook/architecture_shape_parameters.yaml` directly,
- mark it as `architect_curated`, and
- provide enough domain-model source material for the first scaffold to be meaningful.

That fallback is valid, but it is intentionally **not** the recommended default because it carries less prose-derived intent downstream than the PRD-first path.

## What to run next

For the default lane:

```text
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

If you want the richer UX lane after the main build:

```text
/caf ux <instance>
/caf ux plan <instance>
/caf ux build <instance>
```

## Find out more

[Quickstart](03_quickstart.md) — Run the default sequence on a fresh instance after you understand the lifecycle model.

## You might also be interested in

- [PRD → Architecture Shape](12_prd_workflow.md) — Go deeper on the promotion step that makes the lifecycle safe.
- [Answering questions with CAF](14_answering_questions_with_caf.md) — Use the ask surface to inspect the lifecycle state you just created.
- [Architect workflows](../architect/10_architect_workflows.md) — Compare the launch-path lifecycle with architect-operated variations.
