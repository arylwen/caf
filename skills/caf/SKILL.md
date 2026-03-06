---
name: caf
version: 1
summary: Single-entry CAF router command. Dispatches to core CAF workflows (help/ask/saas/arch/plan/next/build/prd).
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# CAF Router (single command surface)

## Invocation

Use **one** command:

- `/caf help [optional question...]`
- `/caf ask <question...>`
- `/caf saas <instance_name>`
- `/caf arch <instance_name>`
- `/caf plan <instance_name>`
- `/caf next <instance_name> [apply=true|false]`
- `/caf build <instance_name>`
- `/caf prd <instance_name> [promote=true|false]`

Examples:

- /caf ask Summarize the main features of the cdx-saas reference architecture.

- `/caf saas hello-saas`
- `/caf arch hello-saas`
- `/caf plan hello-saas`
- `/caf next hello-saas`
- `/caf next hello-saas apply=true`
- `/caf build hello-saas`
- `/caf prd hello-saas`

## Routing rules (deterministic)

1) Parse the first token after `/caf` as `subcommand`.
2) Fail closed if `subcommand` is missing or not one of: `help | saas | arch | plan | next | build | prd | ask`.
3) Dispatch by **executing the canonical skill** listed below. Do not invent alternate steps.

Canonical skills (authoritative):

- `help` → `skills/caf-help/SKILL.md`
- `ask` → `skills/caf-ask/SKILL.md`
- `saas` → `skills/caf-saas/SKILL.md`
- `arch` → `skills/caf-arch/SKILL.md`
- `plan` → `skills/caf-plan/SKILL.md`
- `next` → `skills/caf-next/SKILL.md`
- `build` → `skills/caf-build-candidate/SKILL.md`  *(current canonical build skill; invoked via router)*
- `prd` → `skills/caf-prd/SKILL.md`

## Global invariants (router-enforced)

- **No git commands.** Do not run any `git ...` commands for any reason.
- Fail-closed: if required inputs are missing/ambiguous, emit a feedback packet rather than guessing.

## No ad-hoc scripts (router-enforced)

CAF workflows MUST avoid ad-hoc scripting. This default skillpack may invoke explicitly named Node helpers under `tools/caf/` when a sub-skill requires them.

**Forbidden:** ad-hoc inline PowerShell/bash scripts, multi-line command blocks, pipelines that construct arrays/objects, function definitions, or loops.

**Allowed (maintainer-only token savers; mechanical only):** a small, explicitly named set of Node helpers under `tools/caf/` may be invoked *only when referenced by the target sub-skill* (e.g., `seed_saas_v1.mjs`, `companion_init_v1.mjs`, `next_v1.mjs`, `validate_instance_v1.mjs`).

During routed workflows:
- Treat `tools/**` as **read-only**.
- Do NOT modify `tools/**`, `skills/**`, or `architecture_library/**`. If a change seems required, fail-closed with a feedback packet describing the needed producer-side fix.

**Allowed (portable, single-line):**
- list (`ls`, `find`, `Get-ChildItem`)
- bounded reads (`head`, `sed -n`, `Get-Content -TotalCount`)
- grep-style search (`rg`, `grep -RIn`, `Select-String`)
- explicit full-file writes (heredoc / copy templates)

If a step seems to “need scripting,” treat that as a CAF design bug and fail-closed with a feedback packet requesting a more explicit derived artifact or a library declaration.

## Subcommand argument parsing

### `/caf help [question...]`

- If no question is provided, request command discovery guidance.

### `/caf saas <instance_name>`

- `instance_name` is required.
- Do NOT validate that `reference_architectures/<instance_name>/` exists. `/caf saas` is the creator command and will initialize the instance directory if missing.

### `/caf arch <instance_name>`

- `instance_name` is required.

### `/caf next <instance_name> [apply=true|false]`

- `instance_name` is required.
- `apply` is optional.
  - Default: `apply=false`
  - Accept values: `apply=true` or `apply=false`.

### `/caf build <instance_name>`

- `instance_name` is required.


### `/caf prd <instance_name> [promote=true|false]`

- `instance_name` is required.
- `promote` is optional.
  - Default: `promote=true`
  - Accept values: `promote=true` or `promote=false`.
