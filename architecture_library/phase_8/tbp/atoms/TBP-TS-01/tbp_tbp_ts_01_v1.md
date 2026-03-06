# TBP-TS-01 — TypeScript language conventions

## Binds to

- `runtime.language: typescript`

## Intent

Provide deterministic base project structure and role bindings for TypeScript-based stacks.

This TBP is language-level only:

- It does not select a framework.
- Framework binding (e.g., Express or NestJS) is handled by a framework TBP.

## Deterministic layout

The manifest defines:

- standard scaffold directories (`code/`, `tests/`, `infrastructure/`, `docs/`, `validation/`)
- role bindings for common AP artifacts (domain model, repository, service façade, tests)

These bindings exist to let planners and workers compute paths without hardcoding language assumptions.
