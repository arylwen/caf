# Phase 8 PRD lifecycle integration contract v1

## Purpose

Define how PRD-derived shape participates in the normal CAF lifecycle without collapsing architect ownership.

## Default lifecycle

The default lifecycle is:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

`/caf prd` is the normal bridge between seeded PRD intent and the first architecture scaffold.

## Source artifacts

Human-owned source artifacts:

- `reference_architectures/<instance>/product/PRD.md`
- `reference_architectures/<instance>/product/PLATFORM_PRD.md`
- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`

## Derived artifacts

Derived PRD artifacts include:

- PRD extracts under `spec/playbook/`
- resolved PRD views under `product/*.resolved.md`
- `architecture_shape_parameters.proposed.yaml`
- `architecture_shape_parameters.proposed.rationale.json`

These artifacts may explain or support the authoritative shape, but they do not replace the authoritative source surfaces.

## Authoritative shape lifecycle states

The authoritative shape file is:

- `reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml`

It must carry `meta.lifecycle_shape_status` with one of these values:

- `seeded_template_default`
  - seeded by `/caf saas`
  - bootstrap editable default only
  - not lifecycle-ready for the first architecture scaffold
- `prd_promoted`
  - promoted by `/caf prd` after deterministic validation
  - lifecycle-ready for the first architecture scaffold
- `architect_curated`
  - set by a human architect after manual curation of the authoritative shape
  - lifecycle-ready for the first architecture scaffold

## Lifecycle rules

### Rule 1 — `/caf saas` seeds, but does not finalize

`/caf saas` may seed the authoritative shape file so the instance has a complete editable surface, but the seeded file must be marked `seeded_template_default`.

### Rule 2 — `/caf prd` promotes lifecycle-ready shape

When `/caf prd` validates and promotes a proposed shape, it must stamp the authoritative shape with `meta.lifecycle_shape_status: "prd_promoted"`.

### Rule 3 — first architecture scaffolding must surface bootstrap-only shape explicitly

During `generation_phase == architecture_scaffolding`, CAF must detect when the authoritative shape remains `seeded_template_default`.

For the default command flow, the gate should write an **advisory** feedback packet and continue so the user can stay on the command-only path while learning the lifecycle.

The packet must direct the user to the default recovery path:

- review PRD source docs if needed,
- run `/caf prd <instance>`, and
- rerun `/caf arch <instance>` if they want the architecture scaffold regenerated from the promoted shape.

Architect-curated overrides remain valid, but they are an advanced operator path rather than the default launch-path guidance.

### Rule 4 — architect control is preserved

This lifecycle must preserve:

- rationale vs binding
- source artifacts vs derived artifacts
- architect adoption checkpoints
- plan vs build separation

PRD rationale may be carried by source docs and rationale sidecars, but architect adoption still happens through the normal architecture playbook and `/caf next <instance> apply` checkpoint.

### Rule 5 — downstream phases consume the authoritative shape, not the proposal

Downstream lifecycle stages consume the authoritative `architecture_shape_parameters.yaml` plus the adopted architecture state. They must not treat `*.proposed.*` artifacts as canonical inputs.
