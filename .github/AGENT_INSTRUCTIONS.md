# CAF Global Agent Instructions

This repository is **Contura Architecture Framework (CAF)**. Treat the repo contents as authoritative.

## Authoritative instructions

For all work in this repo, the authoritative agent operating contract is:

- `AGENTS.md`

This file is intentionally brief to avoid drift across tool integrations.

## Command surface (router-only)

CAF is operated via a single router command:

`/caf ...`

Use `caf help` for discovery.

Core subcommands:

- `caf help [question...]`
- `caf saas <instance_name>`
- `caf arch <instance_name>`
- `caf next <instance_name> [apply]`
- `caf build <instance_name>`

Canonical router skill (resolved):

- Default: `skills/caf/SKILL.md`
- If `tools/caf-state/active_skillpack.json` contains `"active_pack": "portable"`: `skills_portable/caf/SKILL.md`

## Fail-closed behavior (mandatory)

If required inputs are missing/ambiguous or constraints are violated, **stop and write a feedback packet** (do not guess).

Feedback packets must be written under:

- `reference_architectures/<name>/feedback_packets/`
