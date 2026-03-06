# Patch notes — Public launch prep (no retrieval rebuild + gitignore-aware bundle)

Date: 2026-03-04

## Goals

1) `prepare_public_launch_v1.mjs` must **not** rebuild retrieval surfaces by default.
2) Keep only one canonical public sample (`cdx-saas`) under:
   - `reference_architectures/`
   - `companion_repositories/`
   via nested `.gitignore` rules.
3) Release bundle build should be able to **honor `.gitignore`** and include untracked (non-ignored) files when requested.

## Changes

### A) Stop rebuilding retrieval surfaces by default

File: `tools/caf-meta/prepare_public_launch_v1.mjs`

- Removed unconditional call to `build_split_retrieval_surfaces_v1.mjs`.
- Added opt-in flag: `--rebuild-retrieval=true`.
- Improved flag parsing to support both `--flag value` and `--flag=value`.

### B) Keep only `cdx-saas` instances in public surface

Files added:

- `reference_architectures/.gitignore`
- `companion_repositories/.gitignore`

Both ignore everything except `cdx-saas/**`.

### C) Honor `.gitignore` when packing release bundle

File: `tools/caf-meta/build_release_bundle_v1.mjs`

- Added flag: `--honor-gitignore`.
  - Default mode (no flag): uses tracked files only (`git ls-files`).
  - With flag: includes tracked + untracked (excluding ignored) via
    `git ls-files --cached --others --exclude-standard`.
- Added `SAMPLE_INCLUDE_PREFIXES` allowlist to permit:
  - `reference_architectures/cdx-saas/**`
  - `companion_repositories/cdx-saas/**`
  while keeping the rest of those directories excluded.

### D) Ensure prepare_public_launch passes gitignore-aware bundle args

File: `tools/caf-meta/prepare_public_launch_v1.mjs`

- When `--bundle=true`, calls `build_release_bundle_v1.mjs` with:
  - `--out tools/caf-meta/out/caf_release_bundle_v1.zip`
  - `--overwrite`
  - `--honor-gitignore`

## Maintainer next steps

1) If non-`cdx-saas` instances are currently **tracked**, `.gitignore` won’t remove them.
   Before publishing, remove them from the index:

   - `git rm -r --cached reference_architectures/<other>`
   - `git rm -r --cached companion_repositories/<other>`

2) Build the public bundle:

   - `node tools/caf-meta/prepare_public_launch_v1.mjs --bundle=true`

3) Post-launch (optional): rebuild retrieval surfaces only when ready:

   - `node tools/caf-meta/prepare_public_launch_v1.mjs --rebuild-retrieval=true`
