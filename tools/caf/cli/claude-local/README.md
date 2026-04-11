# CAF Claude Local full-flow helpers (context-reset + resume)

These scripts are the `claude-local` counterpart to `tools/caf/cli/claude/*`.

They keep the same routed-step-state, packet handling, reset/resume behavior, and per-instance agent log capture, but they no longer require a separate `claude-local` executable on `PATH`.

Instead, the helper resolves the normal `claude` CLI, injects the local-endpoint environment for that child process, and now follows the same high-detail Claude invocation shape that has proven to work locally.

## What this gives you

- the same canonical CAF lifecycle wrapper used by the Claude helper;
- log capture under `reference_architectures/<instance>/agent-logs/` for later diagnosis;
- richer turn-by-turn Claude output in the normal CAF agent log without PTY transport or sidecar debug files;
- a clean runner boundary so local-endpoint experiments do not require edits to the canonical `claude` wrapper;
- no dependency on a shell-specific `claude-local` function or wrapper command.

## Resolution model

The helper launches `claude` and sets these child-process environment variables:

- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_AUTH_TOKEN`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
- `DISABLE_PROMPT_CACHING`

Override order:

1. `CAF_CLAUDE_LOCAL_*` overrides
2. already-present process environment (`ANTHROPIC_*`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `DISABLE_PROMPT_CACHING`)
3. built-in defaults that mirror the current workstation helper:
   - `ANTHROPIC_BASE_URL=http://rig90:1234`
   - `ANTHROPIC_AUTH_TOKEN=lm-studio`
   - `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`
   - `DISABLE_PROMPT_CACHING=1`

Recommended local overrides when you do not want to rely on the built-in defaults:

```powershell
$env:CAF_CLAUDE_LOCAL_BASE_URL = "http://your-host:1234"
$env:CAF_CLAUDE_LOCAL_AUTH_TOKEN = "your-token"
```

## Default Claude logging behavior

The wrapper now builds Claude invocations in this shape by default:

```text
claude -p "/caf ..." --output-format stream-json --include-partial-messages --verbose --dangerously-skip-permissions
```

That keeps the normal CAF pipe-based log capture, but asks Claude to emit fuller structured turn-by-turn text into the same run log.

The defaults are duplicate-safe:

- `--output-format stream-json` is added unless you already supplied `--output-format ...`;
- `--include-partial-messages` is added when output format is implicit or explicitly `stream-json`;
- `--verbose` is added unless you already passed it yourself;
- `--dangerously-skip-permissions` is added unless you already passed an explicit Claude permission override.

The wrapper does **not** create a separate debug sidecar log file.

## Prereqs

- `claude` installed and available on `PATH`
- Node.js 18+ available on `PATH` (`node`)
- run from the repo root

Validate before use:

```powershell
claude --version
node --version
```

## Central claude-local configuration map

All claude-local runner and LM Studio recovery variables are defined in one place:

- `tools/caf/cli/claude-local/lib_claude_local_config_v1.mjs`

That file is the canonical source for:

- variable names
- default values
- category (`runner` vs `recovery`)
- alias/fallback environment variables

The LM Studio-specific recovery/load knobs now live there too, including:

- `CAF_CLAUDE_LOCAL_ENABLE_MODEL_RECOVERY`
- `CAF_CLAUDE_LOCAL_LMSTUDIO_LOAD_MODE`
- `CAF_CLAUDE_LOCAL_RECOVERY_MODEL_KEY`
- `CAF_CLAUDE_LOCAL_RECOVERY_CONTEXT_LENGTH`
- `CAF_CLAUDE_LOCAL_RECOVERY_OFFLOAD_KV_CACHE_TO_GPU`
- `CAF_CLAUDE_LOCAL_RECOVERY_FLASH_ATTENTION`
- `CAF_CLAUDE_LOCAL_RECOVERY_EVAL_BATCH_SIZE`
- `CAF_CLAUDE_LOCAL_RECOVERY_NUM_EXPERTS`
- `CAF_CLAUDE_LOCAL_RECOVERY_MAX_RELOADS_PER_STEP`
- `CAF_CLAUDE_LOCAL_RECOVERY_POLL_MS`
- `CAF_CLAUDE_LOCAL_RECOVERY_LOAD_WAIT_TIMEOUT_MS`

## Usage

### Preferred launcher

```powershell
node .\tools\caf\cli\claude-local\run_caf_flow_v1.mjs <instance_name>
```

With extra runner flags:

```powershell
node .\tools\caf\cli\claude-local\run_caf_flow_v1.mjs qwen35-saas --model qwen-3.5 --max-turns 20
```

If you want to be explicit, this is also fine:

```powershell
node .\tools\caf\cli\claude-local\run_caf_flow_v1.mjs qwen35-saas --output-format stream-json --include-partial-messages --verbose --dangerously-skip-permissions --model qwen-3.5 --max-turns 20
```

### PowerShell

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\tools\caf\cli\claude-local\run_caf_flow_v1.ps1 -InstanceName <instance_name>
```

### CMD

```cmd
tools\caf\cli\claude-local\run_caf_flow_v1.cmd <instance_name>
```

### Bash

```bash
bash tools/caf/cli/claude-local/run_caf_flow_v1.sh <instance_name>
```

## Claude session continuation behavior

For `claude-local`, CAF now persists per-step session ownership in:

- `reference_architectures/<instance>/.caf-state/runner_session_state_v1.json`

Behavior:

- a fresh step starts a fresh Claude session;
- if the same CAF step is already `in_progress`, CAF first tries to resume the exact stored Claude session id for that step;
- if the step is `in_progress` but there is no stored session id yet, CAF can fall back to `--continue` once, then records the returned session id for deterministic future resumes;
- the stored session is reused only when the **step id** and the exact `/caf ...` command still match;
- when the step completes, blocks, or invalidates, CAF forgets that stored step session so the next step starts clean.

This keeps the “at most one `/caf` command per Claude session” shape while still helping smaller local models finish a step across multiple runner invocations.

## Logging

The helper uses the shared CAF runner logger. Unless `CAF_AGENT_LOG_MODE=off`, each run writes a log file to:

- `reference_architectures/<instance>/agent-logs/<timestamp>-claude-local-pid<id>.log`

The log remains the normal CAF merged stdout/stderr capture. The extra detail now comes from Claude's own verbose text output rather than from a PTY relay or a separate debug-file path.

That log is the first place to inspect when a smaller model appears to follow the wrong branch from a feedback packet.
