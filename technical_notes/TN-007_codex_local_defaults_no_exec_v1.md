# TN-007 — Codex local defaults for CAF (no-exec, file-edit only)

## Goal

Make Codex:

- create/update CAF outputs and candidate code **by editing files**
- avoid generating large helper scripts for local file operations
- avoid “run-and-fix” loops (no ReAct execution)

## Recommended user-level Codex settings

Codex reads user configuration from `~/.codex/config.toml`.

Add (or merge) the following:

```toml
# CAF recommended defaults (current maturity)
approval_policy = "on-request"

[features]
# Prefer direct file edits over shell scripting.
apply_patch_freeform = true

# Disable command execution. CAF is non-ReAct right now.
shell_tool = false
unified_exec = false
```

## Notes

- `apply_patch_freeform` enables Codex’s freeform apply_patch tool.
- Disabling `shell_tool` and `unified_exec` prevents Codex from trying to run app/test commands.
- Project guidance lives in repo-root `AGENTS.md`. Codex discovers it automatically (no `CODEX_HOME` required).
