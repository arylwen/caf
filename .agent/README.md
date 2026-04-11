# CAF Agent Surface

CAF exposes a single user-facing command:

- `/caf <subcommand> [...args]`

Core subcommands:

- `/caf help [question...]`
- `/caf ask <question...>`
- `/caf saas <instance_name>`
- `/caf prd <instance_name> [promote=true|false]`
- `/caf arch <instance_name>`
- `/caf next <instance_name> [apply]`
- `/caf plan <instance_name>`
- `/caf backlog <instance_name>`
- `/caf build <instance_name>`
- `/caf ux <instance_name>`
- `/caf ux plan <instance_name>`
- `/caf ux build <instance_name>`

Canonical router skill (resolved at runtime):

- Default: `skills/caf/SKILL.md`
- If `tools/caf-state/active_skillpack.json` contains `"active_pack": "portable"`: `skills_portable/caf/SKILL.md`

Agent-local helper scripts:

- Use `.agent/scripts/` for runner-local helpers.
- Do **not** place temporary helper scripts under `tools/caf/` unless they are being promoted as maintainer-vetted framework helpers.
