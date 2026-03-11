# PRD-first lifecycle

CAF’s default mental model is:

1. seed instance
2. shape from PRD
3. scaffold architecture
4. adopt
5. elaborate architecture
6. plan
7. build

In commands:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

This page explains why that sequence exists and how it stays architect-controlled.

## Why `/caf prd` is now first-class

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

This matters because CAF is not meant to hide what the human can inspect or change.

## Shape lifecycle states

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

### 1) `/caf saas <instance>`

Seeds the instance, including:

- product source docs
- guardrail pins
- a bootstrap `architecture_shape_parameters.yaml`

This creates the editable starting point, not the final architectural binding.

### 2) `/caf prd <instance>`

Turns the PRD source docs into a lifecycle-ready architecture shape.

Default result:

- `spec/playbook/architecture_shape_parameters.yaml`
- `meta.lifecycle_shape_status: "prd_promoted"`

### 3) First `/caf arch <instance>`

Consumes the authoritative lifecycle-ready shape and generates architecture scaffolding plus decision candidates.

If the shape is still only `seeded_template_default`, CAF now writes an advisory feedback packet and continues for the default command flow.

### 4) `/caf next <instance> apply`

Checkpoints the adopted architecture state and advances the lifecycle phase.

This does **not** replace architect adoption. It exists so downstream phases can consume a deterministic, auditable checkpoint.

### 5) Second `/caf arch <instance>`

Elaborates the next phase, typically design-oriented outputs that planning depends on.

### 6) `/caf plan <instance>`

Consumes the adopted / elaborated architecture state and produces obligations, task graph, and other planning artifacts.

### 7) `/caf build <instance>`

Generates candidate build outputs after the earlier lifecycle gates have been satisfied.

## How architect control is preserved

This lifecycle does **not** collapse PRD rationale into hard bindings.

CAF keeps these separations intact:

- **rationale vs binding**
  - rationale remains in sidecars / source docs
  - bindings remain in authoritative promoted or curated artifacts
- **plan vs build**
  - planning still happens after architecture + adoption
  - build still depends on the planning / lifecycle gates
- **source artifacts vs derived artifacts**
  - humans still own the editable source surfaces
  - generated outputs remain derived and auditable

Most importantly, the lifecycle remains architect-controlled because PRD promotion does not bypass adoption, checkpointing, or later architecture edits.

CAF still supports an advanced architect-curated override, but that is documented in the architect workflow docs rather than the default launch-path guidance.

## What `/caf next <instance> apply` means in this model

`/caf next <instance> apply` is the lifecycle checkpoint between the first architecture scaffold and the next elaboration stage.

It does **not** reinterpret the PRD.
It checkpoints the current adopted architectural state so downstream work uses an explicit promoted baseline.

The relationship is:

- PRD-derived or architect-curated shape informs the first architecture scaffold
- architect adoption resolves decision candidates into an adopted architecture state
- `/caf next <instance> apply` checkpoints that adopted state for the next phase

## When can `/caf prd` be skipped?

Operationally, CAF now treats `/caf prd` as **strongly expected by default**.

For the launch workflow, the practical rule is simple: run `/caf prd` before you treat the first `/caf arch` scaffold as your stable baseline. If you skip it, CAF will surface an advisory packet so you can correct course without getting blocked.

## Related docs

- [Quickstart](03_quickstart.md)
- [PRD → Architecture Shape](12_prd_workflow.md)
- [Instances, phases, and state](05_instances_phases_and_state.md)
- [Architect workflows](../architect/10_architect_workflows.md)
