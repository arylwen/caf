# CAF Agent Surface

CAF exposes a single user-facing command:

- `/caf <subcommand> [...args]`

Core subcommands:

- `/caf help [question...]`
- `/caf saas <instance_name>`
- `/caf arch <instance_name>`
- `/caf plan <instance_name>`
- `/caf next <instance_name> [apply=true|false]`
- `/caf build <instance_name>`
- `/caf prd <instance_name> [promote=true|false]`

Canonical router skill (resolved at runtime):

- Default: `skills/caf/SKILL.md`
- If `tools/caf-state/active_skillpack.json` contains `"active_pack": "portable"`: `skills_portable/caf/SKILL.md`
