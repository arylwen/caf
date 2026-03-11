# Samples

CAF is easiest to understand with a concrete instance story.

## Canonical public sample

CAF uses one canonical public sample name across the public docs, demos, and ask-first UX:

- `codex-saas`

Use that name consistently in release-facing guidance. Do not mix it with older sample names on the same public surface.

## Packaging posture

Generated instance folders under `reference_architectures/` and `companion_repositories/` are usually runtime artifacts, not source.

For a public release, provide sanitized `codex-saas` sample material in one of these ways:

1. include a curated snapshot in the release bundle
2. attach sanitized sample archives as release assets
3. provide a separate sample bundle alongside the main CAF repo

The public docs should describe `codex-saas` as the canonical sample whether it ships inline or as a companion release asset.

## What to sanitize

Before publishing a sample:

- remove secrets, tokens, and machine-specific paths
- remove stale feedback packets that only reflect a local run
- keep enough architecture, planning, and candidate-code state to support `/caf ask` and the PRD-first walkthrough
- prefer a small, coherent snapshot over a long history of generated runs

## Suggested release contents

- architecture snapshot after:
  - `/caf prd codex-saas`
  - `/caf arch codex-saas`
  - `/caf next codex-saas apply`
  - `/caf plan codex-saas`
- candidate-code snapshot after:
  - `/caf build codex-saas`

## Related

- [Answering questions with CAF](14_answering_questions_with_caf.md)
- [Quickstart](03_quickstart.md)
- [PRD-first lifecycle](15_prd_first_lifecycle.md)
