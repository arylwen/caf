---
name: caf
version: 1
summary: Single-entry CAF router command. Dispatches to core CAF workflows (help/ask/saas/prd/arch/plan/backlog/next/build/ux and ux plan).
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
- `/caf backlog <instance_name>`
- `/caf next <instance_name> [apply]`
- `/caf build <instance_name> [wave_index]`
- `/caf ux <instance_name>`
- `/caf ux plan <instance_name>`
- `/caf prd <instance_name> [promote=true|false]`

Examples:

- /caf ask Summarize the main features of the codex-saas reference architecture.

- `/caf saas hello-saas`
- `/caf arch hello-saas`
- `/caf plan hello-saas`
- `/caf backlog hello-saas`
- `/caf next hello-saas`
- `/caf next hello-saas apply`
- `/caf build hello-saas`
- `/caf build hello-saas 0`
- `/caf ux hello-saas`
- `/caf ux plan hello-saas`
- `/caf ux build hello-saas`
- `/caf prd hello-saas`

## Routing rules (deterministic)

1) Parse the first token after `/caf` as `subcommand`.
2) Fail closed if `subcommand` is missing or not one of: `help | saas | arch | plan | backlog | next | build | prd | ask | ux`.
3) Special case: if the first token is `ux` and the second token is the literal `plan`, dispatch to the canonical `/caf ux plan` skill.
4) Special case: if the first token is `ux` and the second token is the literal `build`, dispatch to the canonical `/caf ux build` skill.
5) Dispatch by **executing the canonical skill** listed below. Do not invent alternate steps.

Canonical skills (authoritative):

- `ux plan` → `skills/caf-ux-plan/SKILL.md`
- `ux build` → `skills/caf-ux-build/SKILL.md`

- `help` → `skills/caf-help/SKILL.md`
- `ask` → `skills/caf-ask/SKILL.md`
- `saas` → `skills/caf-saas/SKILL.md`
- `arch` → `skills/caf-arch/SKILL.md`
- `plan` → `skills/caf-plan/SKILL.md`
- `backlog` → `skills/caf-backlog/SKILL.md`
- `next` → `skills/caf-next/SKILL.md`
- `build` → `skills/caf-build-candidate/SKILL.md`  *(current canonical build skill; invoked via router)*
- `ux` → `skills/caf-ux/SKILL.md`
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
- If a temporary runner-local helper is absolutely necessary, keep it under the active shim `scripts/` folder, not under `tools/caf/`.

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

### `/caf plan <instance_name>`

- `instance_name` is required.
- `/caf plan` owns the semantic planning artifacts (`pattern_obligations_v1.yaml`, `task_graph_v1.yaml`, `interface_binding_contracts_v1.yaml`, and `task_plan_v1.md`).
- `/caf plan` does **not** need to emit the human backlog view inline when the task graph is large.

### `/caf backlog <instance_name>`

- `instance_name` is required.
- `/caf backlog` is the on-demand human backlog projection. It reads the existing `task_graph_v1.yaml` and writes `task_backlog_v1.md` without rerunning semantic planning.

### `/caf next <instance_name> [apply]`

- `instance_name` is required.
- `apply` is optional.
  - Omit it to preview the recommended next phase.
  - Include the literal token `apply` to checkpoint and advance.

### `/caf build <instance_name> [wave_index]`

- `instance_name` is required.
- `wave_index` is optional at the router level, but build policy may make it required for larger task graphs.
- Do not invent a different multi-wave control surface. The canonical operator-managed form is `/caf build <instance_name> <wave_index>`.
- In build wave mode, prior-wave completion evidence is read from `companion_repositories/<instance_name>/profile_v1/caf/task_reports/` and `companion_repositories/<instance_name>/profile_v1/caf/reviews/`, not from `reference_architectures/<instance_name>/`.

### `/caf ux <instance_name>`

- `instance_name` is required.
- `/caf ux` is the bounded UX derivation lane. It materializes and refreshes `ux_design_v1.md`, runs the same retrieval discipline as the other lanes, writes grounded UX candidates back into the canonical UX artifact, and stops before `/caf ux plan`.
- `/caf ux` is expected after the second `/caf arch <instance_name>`. It may be run after `/caf plan` or `/caf build` when the goal is a richer governed UX surface over the existing REST APIs.

### `/caf ux plan <instance_name>`

- Parse this as a special routed form: first token `ux`, second token `plan`, third token `instance_name`.
- `instance_name` is required.
- `/caf ux plan` is the first bounded UX planning proof. It reads `ux_design_v1.md`, `ux_visual_system_v1.md`, and the UX retrieval blob, invokes an instruction-owned UX planner that emits `ux_task_graph_v1.yaml`, then projects `ux_task_plan_v1.md` and `ux_task_backlog_v1.md`, and stops before `/caf ux build`.
- `/caf ux plan` keeps the current smoke-test UI lane separate and assumes the richer UX lane remains on top of the current REST/OpenAPI AP/CP surfaces.

### `/caf ux build <instance_name>`

- Parse this as a special routed form: first token `ux`, second token `build`, third token `instance_name`.
- `instance_name` is required.
- `/caf ux build` realizes the separate UX build lane from `ux_task_graph_v1.yaml`.
- `/caf ux build` requires the main `/caf build <instance_name>` lane to have completed first; it does not replace the smoke-test UI build path.
- `/caf ux build` writes the richer UX surface into a separate companion-repo namespace/root so it does not conflict with the smoke-test UI lane.

### `/caf prd <instance_name> [promote=true|false]`

- `instance_name` is required.
- `promote` is optional.
  - Default: `promote=true`
  - Accept values: `promote=true` or `promote=false`.
