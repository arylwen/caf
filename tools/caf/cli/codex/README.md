# CAF CLI pipeline helpers (context-reset)

These scripts are runner-specific context-reset helpers for multi-step CAF flows. They are not part of the public `/caf` command canon.

## Why these exist

Some agent harnesses (Codex/Claude/Antigravity) will reorder or batch approvals across multiple sub-steps when a single skill tries to orchestrate the entire CAF flow in one session. These helpers run each CAF step in its **own Codex non-interactive run** so the agent context is cleared between calls.

## Prereqs

- OpenAI Codex CLI installed (`codex`).
- Run from the **repo root** (the folder containing `skills/`, `tools/`, `reference_architectures/`).

## Usage

### Bash (macOS/Linux)

```bash
bash tools/caf/cli/run_caf_flow_v1.sh <instance_name>
```

### PowerShell (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File tools/caf/cli/run_caf_flow_v1.ps1 -InstanceName <instance_name>
```

### CMD (Windows)

```cmd
tools\caf\cli\run_caf_flow_v1.cmd <instance_name>
```

## What it runs

1) `caf-saas` (initialize instance)
2) `caf-arch` (phase-correct compile)
3) `caf-next` with `apply` (advance phase)
4) `caf-arch` again (phase-correct compile)
5) `caf-build-candidate`

After each step, the script checks for `reference_architectures/<instance>/feedback_packets/BP-*.md` and stops on the first packet.

## Safety defaults

Each step runs via `codex exec` with:

- `--ephemeral` (do not persist session state)
- `--ask-for-approval never`
- `--sandbox workspace-write`

See Codex non-interactive mode docs for details.
