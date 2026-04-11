# Release and public bundle hygiene

Use this page when preparing a public CAF bundle or GitHub release.

## Public-surface rules

Public-facing docs should tell one coherent story:

- two quick starts:
  - ask-first: `/caf ask <question...>`
  - create-your-own-instance: `/caf saas` → `/caf prd` → `/caf arch` → `/caf next <instance> apply` → `/caf arch` → `/caf plan` → `/caf build`
- one canonical public sample name:
  - `codex-saas`
- one canonical router surface:
  - `/caf help`
  - `/caf ask`
  - `/caf saas`
  - `/caf prd`
  - `/caf arch`
  - `/caf next <instance> apply`
  - `/caf plan`
  - `/caf backlog`
  - `/caf build`
  - `/caf ux`
  - `/caf ux plan`
  - `/caf ux build`

Do not mix in retired commands, alternate sample names, or internal helper syntax on public pages.

## Public/private boundary

Public docs may explain that private maintainer material exists, but they should not depend on private working notes to complete the public story.

Good public destinations:

- `docs/user/**`
- `docs/architect/**`
- `docs/maintainer/**`
- `architecture_library/patterns/caf_meta_v1/**`
- `tools/caf-meta/README.md`

Private or working surfaces:

- `docs/dev/maintainer/**`
- `docs/dev/history/**`
- `docs/dev/patch_notes/**`
- `docs/dev/launch/**`

If a public page still needs a private note to make sense, move the essential guidance into the public page or a public maintainer page before release.

## Sample packaging posture

Generated instance folders are often runtime artifacts. For release work, the important public contract is that `codex-saas` is the canonical sample name.

You may ship it:

- in the main release bundle,
- as sanitized release assets, or
- in a companion sample bundle.

Whichever packaging path you choose, keep the naming and examples consistent across the public docs.

## Release checklist

Before publishing:

1. scrub retired command names from public docs and onboarding copy
2. scrub mixed sample names from public docs and onboarding copy
3. remove or relocate transitional pages that only explain old structure
4. check that public docs do not send readers into `docs/dev/**` for essential understanding
5. make sure release-facing examples use `/caf next <instance> apply`
6. make sure `codex-saas` is the sample name used in public ask-first examples
