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
  .caf-state/            # checkpoints / lifecycle receipts
```

## Default lifecycle

CAF’s default lifecycle is now:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
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

## Generated outputs

Generated outputs are typically gitignored and should be treated as **build artifacts**, not source.

If you need samples for documentation or onboarding, export sanitized snapshots under `docs/user/samples/`.
