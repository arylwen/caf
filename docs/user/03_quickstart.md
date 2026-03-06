# Quickstart

Create a new SaaS instance and generate architecture, design, and candidate code.

```text
/caf saas hello-saas
/caf prd hello-saas           # optional: infer/pin an architecture shape from a PRD
/caf arch hello-saas
/caf next hello-saas apply=true
/caf arch hello-saas
/caf plan hello-saas
/caf build hello-saas
```

Notes:

- CAF is **fail-closed**: missing/ambiguous inputs produce feedback packets.
- Outputs are **candidate-only** and require human review.
- `/caf prd` is a single workflow; you should not need to run any `tools/caf/*` scripts directly.

## What to expect

- After `/caf saas`, you’ll have a new instance under `reference_architectures/hello-saas/`.
- The first `/caf arch` derives architecture scaffolding and decision candidates.
- `/caf next ... apply=true` checkpoints your adopted decisions so downstream steps can proceed deterministically.
- The second `/caf arch` derives the next phase (typically design/planning inputs).
- `/caf plan` produces obligations + task graph + backlog artifacts.
- `/caf build` generates **candidate** code under `companion_repositories/<instance>/`.
