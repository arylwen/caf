# Instances, phases, and state

## Instances

An instance is a named workspace under `reference_architectures/<instance>/` created by `/caf saas <instance>`.

Typical high-level layout:

```text
reference_architectures/<instance>/
  spec/                  # pinned inputs + decision surfaces
  architecture/          # derived architecture scaffolding (phase-dependent)
  design/                # derived design/planning artifacts (phase-dependent)
  feedback_packets/      # fail-closed outputs (blockers/advisories)
  guardrails/            # resolved guardrails / enforcement receipts
```

## Phases

CAF progresses through phases (e.g., intent → architecture → design → build). Some steps require you to explicitly adopt decisions.

Two common “phase boundaries” you’ll notice:

- **Architecture scaffolding → design** (after you checkpoint adopted decisions)
- **Design/planning → build** (after gates confirm required artifacts exist)

## Checkpointing / apply

`/caf next <instance> apply=true` checkpoints the adopted decision set so downstream stages can build deterministically.

In the command surface this is usually invoked as:

```text
/caf next <instance> apply=true
```

## Generated outputs

Generated outputs are typically gitignored and should be treated as **build artifacts**, not source.

If you need samples for documentation or onboarding, export sanitized snapshots under `docs/user/samples/`.
