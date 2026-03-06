# Phase 8 Plan Artifact Contract (v1)
> **DEPRECATED (CAF repo root):** CAF no longer uses repo-root `PLANS.md`, and runner shims no longer roll it over. Companion repositories may still use `PLANS.md` as a planning artifact.


## Purpose

Define a deterministic, rerunnable plan artifact used by build and multi-file editing workflows to reduce thrash and make changes auditable.

## Planning-first rule (normative)

Before any multi-file change:
1) write or update `PLANS.md`,
2) list exact files to be created/edited and why,
3) then apply the smallest set of edits needed to complete the plan.

## Canonical location

Within a companion repository:
- `PLANS.md` at the repository root.

Optionally:
- `PLAN_STATUS.md` at the repository root.

## CAF repository `PLANS.md` (run log)

`PLANS.md` at the CAF repo root is a **lightweight run log** used by Codex runner shims under `.codex/`.

This CAF-root run log is **not** the companion-repo plan artifact described above.

### Codex shim protocol (CAF-root run log)

Applies to `.codex/skills/*/SKILL.md` shims only.

- Before running the source skill:
  - If CAF-root `PLANS.md` exists and contains at least one non-whitespace character, snapshot it under:
    - `docs/codex/run_logs/PLANS-<YYYYMMDD-HHMMSS>-<shim>-pre.md`
  - Truncate CAF-root `PLANS.md` to start the run with a clean plate.

- After running the source skill:
  - If CAF-root `PLANS.md` contains at least one non-whitespace character, snapshot it under:
    - `docs/codex/run_logs/PLANS-<YYYYMMDD-HHMMSS>-<shim>-post.md`
    - Keep CAF-root `PLANS.md` (it will be archived and cleared at the start of the next shim run).
  - Otherwise, remove CAF-root `PLANS.md` (do not keep empty logs).

### Git hygiene

The contents of `docs/codex/run_logs/` are ignored by Git (see `.gitignore`).

## Required structure (strict)

Each plan block in `PLANS.md` MUST include:
- `PLAN_ID:` stable identifier (e.g., `PLAN-YYYYMMDD-<slug>`)
- `SCOPE:` one line (design implementer, scaffolding, refactor)
- `INPUTS:` authoritative inputs (design/spec paths)
- `FILES_TO_EDIT:` explicit repo-relative paths
- `FILES_TO_CREATE:` explicit repo-relative paths
- `CONTRACT_CHECKS:` structural checks only (no execution)
- `DONE_DEFINITION:` completion criteria expressed in observable artifacts

Recommended:
- `ASSUMPTIONS:` explicit assumptions
- `NOTES:` short optional notes

## Rerun safety (hard rule)

Plans MUST be rerunnable without manual deletes:
- edits are non-destructive by default
- regeneration is explicit (e.g., replace CAF-managed blocks only)
- no interactive cleanup requirements

If rerun safety cannot be achieved within the allowed write boundary, the workflow MUST fail-closed and write a feedback packet.

## Structural validation expectations

A plan validator MAY enforce:
- all file paths are within `allowed_write_paths`
- required fields exist for each plan block
- `FILES_TO_EDIT` exist before editing
- `CONTRACT_CHECKS` do not request toolchain probing or execution
