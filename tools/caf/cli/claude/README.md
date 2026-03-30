# CAF Claude Code full-flow helpers (context-reset + resume)

These scripts are Claude Code-specific helpers for the **current canonical CAF lifecycle**. They are not a new public command surface; they simply run the existing `/caf ...` commands in separate Claude Code print-mode runs so each step starts fresh.

They are also **resume-aware** and use the same lifecycle checkpoints/reset rules as the Codex helpers.

## Why these exist

Some runner sessions carry too much state across a long multi-step lifecycle or try to shortcut later steps. These helpers run each CAF command in its **own Claude Code non-interactive run** so the router, skills, gates, and fail-closed packets behave as if each step were invoked cleanly.

They follow this lifecycle:

1. `/caf saas <instance>`
2. `/caf prd <instance>`
3. `/caf arch <instance>`
4. `/caf next <instance> apply`
5. `/caf arch <instance>`
6. `/caf plan <instance>`
7. `/caf build <instance>`
8. `/caf ux <instance>`
9. `/caf ux plan <instance>`
10. `/caf ux build <instance>`

## Prereqs

- Anthropic Claude Code CLI installed (`claude`).
- Node.js available on PATH (`node`).
- Run from the **repo root**.
- These wrappers assume invoking `claude -p "/caf ..."` works in your environment.

## Usage

### Preferred launcher

From the repo root, prefer the direct Node entrypoint:

```powershell
node .\tools\caf\cli\claude\run_caf_flow_v1.mjs codex-saas
```

With extra Claude CLI flags:

```powershell
node .\tools\caf\cli\claude\run_caf_flow_v1.mjs codex-saas --model sonnet --max-turns 20
```

Use the shell-specific wrappers below only when they fit your environment better.

### Bash (macOS/Linux)

```bash
bash tools/caf/cli/claude/run_caf_flow_v1.sh <instance_name>
```

With extra Claude CLI flags:

```bash
bash tools/caf/cli/claude/run_caf_flow_v1.sh cdx-saas --model sonnet --max-turns 20
```

### PowerShell (Windows)

From an existing PowerShell session in the repo root:

```powershell
.\tools\caf\cli\claude\run_caf_flow_v1.ps1 -InstanceName <instance_name>
```

With extra Claude CLI flags:

```powershell
.\tools\caf\cli\claude\run_caf_flow_v1.ps1 -InstanceName cdx-saas --% --model sonnet --max-turns 20
```

If you need to bypass the local execution policy for a one-off call:

```powershell
powershell -ExecutionPolicy Bypass -File tools/caf/cli/claude/run_caf_flow_v1.ps1 -InstanceName cdx-saas --% --model sonnet --max-turns 20
```

### CMD (Windows)

```cmd
tools\caf\cli\claude\run_caf_flow_v1.cmd <instance_name>
```

With extra Claude CLI flags:

```cmd
tools\caf\cli\claude\run_caf_flow_v1.cmd cdx-saas --model sonnet --max-turns 20
```

## Defaults

- adds `--dangerously-skip-permissions` unless you already provided a Claude permission flag
- otherwise defers to the installed Claude CLI defaults

## Notes

- Prefer `node .\tools\caf\cli\claude\run_caf_flow_v1.mjs <instance_name>` when you want the most portable launcher path across Windows systems.
- Run the `.ps1` script directly from PowerShell as shown above; you do not normally launch `powershell ...` from inside PowerShell unless you need an execution-policy bypass.
- The resume checkpoints, reset rules, and feedback-packet stop behavior match `tools/caf/cli/codex/README.md`.
