# PRD → Architecture Shape

`/caf prd` is the default second step after `/caf saas`.

Its job is to turn PM/architect-authored PRD source documents into a **lifecycle-ready architecture shape** that the first `/caf arch` run can safely consume.

## Default lifecycle position

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

## What you edit

Human-owned source inputs live under:

- `reference_architectures/<instance>/product/PRD.md`
- `reference_architectures/<instance>/product/PLATFORM_PRD.md`

`/caf saas` seeds both files so the default story is:

1. seed an instance
2. refine the PRD / platform posture if needed
3. run `/caf prd`
4. run the first `/caf arch`

## What `/caf prd` does

`/caf prd` is a single workflow that runs these steps for you:

1. **Validate + extract (deterministic, fail-closed)**
   - validates both PRD source docs against the PRD source contract
   - writes structured extracts under `spec/playbook/` for token-efficient downstream use

2. **Resolve (semantic, constrained)**
   - writes placeholder-free resolved source views:
     - `product/PRD.resolved.md`
     - `product/PLATFORM_PRD.resolved.md`

3. **Infer a proposed architecture shape (semantic)**
   - writes:
     - `spec/playbook/architecture_shape_parameters.proposed.yaml`
     - `spec/playbook/architecture_shape_parameters.proposed.rationale.json`

4. **Validate + promote (deterministic, fail-closed)**
   - validates the proposal against the shape schema / allowed values
   - when validation passes and `promote=true` (the default), promotes the proposal to:
     - `spec/playbook/architecture_shape_parameters.yaml`
   - stamps the authoritative file with:
     - `meta.lifecycle_shape_status: "prd_promoted"`

## Bootstrap shape vs lifecycle-ready shape

`/caf saas` also seeds `spec/playbook/architecture_shape_parameters.yaml`, but that seeded file is only a **bootstrap default**.

It is marked with:

- `meta.lifecycle_shape_status: "seeded_template_default"`

That bootstrap file exists so the instance has a complete editable surface from day one, but it is still only a bootstrap default until `/caf prd` promotes a validated lifecycle-ready shape.

## What becomes canonical vs advisory

Canonical source artifacts:

- `product/PRD.md`
- `product/PLATFORM_PRD.md`
- `spec/playbook/architecture_shape_parameters.yaml`

Derived / advisory artifacts:

- `spec/playbook/prd_product_extract_v1.json`
- `spec/playbook/prd_platform_extract_v1.json`
- `product/PRD.resolved.md`
- `product/PLATFORM_PRD.resolved.md`
- `spec/playbook/architecture_shape_parameters.proposed.yaml`
- `spec/playbook/architecture_shape_parameters.proposed.rationale.json`

The authoritative shape file is canonical for downstream lifecycle consumption, but the rationale sidecar stays separate so CAF preserves **rationale vs binding**.

## Failure mode

If `/caf prd` cannot proceed safely, CAF writes a feedback packet under:

- `reference_architectures/<instance>/feedback_packets/`

If you skip `/caf prd` and run the first `/caf arch` on a bootstrap shape, CAF now writes an **advisory** feedback packet and continues. For the launch workflow, the intended fix is still command-only: review the PRD source docs if needed, run `/caf prd <instance>`, then rerun `/caf arch <instance>` if you want the scaffold refreshed from the promoted shape.

## Find out more

[PRD-first lifecycle](15_prd_first_lifecycle.md) — See how the promoted shape feeds the rest of the default lifecycle.

## You might also be interested in

- [Quickstart](03_quickstart.md) — Run the command flow that puts `/caf prd` in context.
- [Instances, phases, and state](05_instances_phases_and_state.md) — Check where the promoted and advisory artifacts live.
- [Architect workflows](../architect/10_architect_workflows.md) — Compare the default PRD-first path with the architect-curated override.
