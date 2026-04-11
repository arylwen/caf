# CAF Claude Code full-flow helpers (context-reset + resume)

These scripts are Claude Code-specific helpers for the **current canonical CAF lifecycle**. They are not a new public command surface; they run the existing `/caf ...` commands in separate Claude Code non-interactive runs and, when a step is already in progress, can resume the owned Claude session instead of always starting over.

If you use a local Claude-compatible shim command (for example `claude-local` that injects local endpoint environment variables), use the sibling wrapper under `tools/caf/cli/claude-local/` so CAF preserves the same runner behavior and log capture without changing the canonical `claude` helper.

They are also **resume-aware**:

- they detect completed lifecycle checkpoints and skip satisfied steps;
- they reconcile explicit routed step state in `.caf-state/routed_step_state_v1.json` so reruns consult step status first and artifact presence second;
- for Claude-only runners, they persist per-step session ownership in `.caf-state/runner_session_state_v1.json` and only reuse a stored session when the step id and `/caf ...` command still match exactly;
- if a Claude step is already `in_progress` but has no stored session id, they can fall back to `--continue` once to pick up the most recent conversation in the repo and then record the returned session id for deterministic future resumes;
- they ignore stale feedback packets that already existed before the current wrapper run as autonomous stop triggers;
- they use the existing CAF reset helpers for the three phases that are intentionally fail-closed on overwrite (`architecture_scaffolding`, second-pass implementation/design scaffolding, and `planning`);
- they treat `/caf build` and `/caf ux build` as loop commands driven by CAF wave-state files instead of inventing a parallel resume path.

## Why these exist

Some agent harnesses will carry too much state across a long multi-step lifecycle or try to shortcut later steps. These helpers run each CAF command in its **own Claude Code non-interactive run** so the router, skills, gates, and fail-closed packets behave as if each step were invoked cleanly.

These helpers follow the lifecycle described in the maintainer diagrams and docs:

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

`/caf ux` and `/caf ux plan` can be run earlier in the lifecycle, but this helper chooses the full top-to-bottom path so the final `/caf ux build` step sees the main build lane already completed.

## Prereqs

- Anthropic Claude Code CLI installed (`claude`).
- Node.js 18+ available on PATH (`node`).
- Run from the **repo root** (the folder containing `skills/`, `tools/`, `reference_architectures/`).
- These wrappers assume the repo-local Claude/CAF instructions are available and that invoking `claude -p "/caf ..." --output-format stream-json --include-partial-messages --verbose --dangerously-skip-permissions` works in your environment.
- Validate the shell prerequisites before running the wrapper:

```powershell
claude --version
node --version
```

If `claude --version` fails in the same shell, install Claude Code CLI or add it to `PATH` before running the CAF helpers.

On Windows, the helper resolves Claude through `where.exe`, prints the fully qualified path it chose, and then runs that resolved path. This avoids relying on interactive shell resolution alone.

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

With an explicit Claude permission mode override:

```powershell
node .\tools\caf\cli\claude\run_caf_flow_v1.mjs codex-saas --permission-mode acceptEdits
```

Use the shell-specific wrappers below only when they fit your environment better.

### Bash (macOS/Linux)

```bash
bash tools/caf/cli/claude/run_caf_flow_v1.sh <instance_name>
```

With extra Claude CLI flags:

```bash
bash tools/caf/cli/claude/run_caf_flow_v1.sh codex-saas --model sonnet --max-turns 20
```

### PowerShell (Windows)

From an existing PowerShell session in the repo root:

```powershell
.\tools\caf\cli\claude\run_caf_flow_v1.ps1 -InstanceName <instance_name>
```

With extra Claude CLI flags:

```powershell
.\tools\caf\cli\claude\run_caf_flow_v1.ps1 -InstanceName codex-saas --% --model sonnet --max-turns 20
```

If PowerShell blocks the unsigned `.ps1`, you do **not** need admin for a one-off bypass. Use one of these options:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\tools\caf\cli\claude\run_caf_flow_v1.ps1 -InstanceName codex-saas
```

```powershell
powershell -ExecutionPolicy Bypass -File tools/caf/cli/claude/run_caf_flow_v1.ps1 -InstanceName codex-saas --% --model sonnet --max-turns 20
```

For a persistent per-user setting, check the current policy and then switch the current user scope instead of requiring elevation:

```powershell
Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

If the script came from a downloaded or unzipped archive, this can also help when the file is blocked:

```powershell
Unblock-File .\tools\caf\cli\claude\run_caf_flow_v1.ps1
```

You can avoid PowerShell script policy entirely by calling the Node entrypoint directly:

```powershell
node .\tools\caf\cli\claude\run_caf_flow_v1.mjs <instance_name>
```

### CMD (Windows)

```cmd
tools\caf\cli\claude\run_caf_flow_v1.cmd <instance_name>
```

With extra Claude CLI flags:

```cmd
tools\caf\cli\claude\run_caf_flow_v1.cmd codex-saas --model sonnet --max-turns 20
```

## Defaults

The wrapper now builds Claude invocations in this shape by default:

```text
claude -p "/caf ..." --output-format stream-json --include-partial-messages --verbose --dangerously-skip-permissions
```

It applies those defaults duplicate-safe:

- adds `--output-format stream-json` unless you already supplied `--output-format ...`;
- adds `--include-partial-messages` when output format is implicit or explicitly `stream-json`;
- adds `--verbose` unless you already supplied it;
- adds `--dangerously-skip-permissions` unless you already supplied a Claude permission-mode override;
- respects explicit permission-oriented overrides such as:
  - `--permission-mode ...`
  - `--dangerously-skip-permissions`
  - `--allow-dangerously-skip-permissions`
  - `--enable-auto-mode`
  - `--permission-prompt-tool ...`
- places `-p "/caf ..."` first, then the runner flags, matching the command line that has proven to work locally.

## Troubleshooting

### PowerShell says the script is not digitally signed

This is a PowerShell execution-policy issue, not a CAF issue. Your options are:

- use the `.cmd` wrapper from CMD or PowerShell;
- run the Node entrypoint directly (`node tools/caf/cli/claude/run_caf_flow_v1.mjs ...`);
- use a one-off PowerShell bypass with `-Scope Process Bypass` or `-ExecutionPolicy Bypass`; or
- set `CurrentUser` execution policy to `RemoteSigned` if that matches your workstation policy.

You do **not** need administrator privileges for the process-scoped or current-user-scoped options.

### Wrapper says `Claude Code CLI not found on PATH`

The PowerShell wrapper only launches Node. The actual CAF flow runner resolves Claude from `PATH` using `where.exe`, prints the fully qualified path it selected, and then probes/runs that path.

This matters on Windows because interactive PowerShell resolution, Node direct process spawning, and shell-shim argument handling are not always the same thing. The runner resolves the Claude path first and, when that path is a `.cmd` shim, launches it through `cmd.exe` so the full CAF prompt survives intact.

Confirm what Windows can resolve in the same shell:

```powershell
Get-Command claude
where.exe claude
claude --version
```

If these fail, install Claude Code CLI or update your `PATH`, then open a fresh shell and retry.

When resolution succeeds, the wrapper prints a line like:

```text
INFO: Using Claude Code CLI at C:\Users\you\AppData\Local\Programs\claude\claude.cmd (via shell shim).
```

If that line is missing, the failure happened before runner resolution. If the line is present, CAF is using that exact path for both the version probe and the full flow run.

The runner also prints the absolute routed-step-state path at startup and logs when the first state write completes, so you can verify that recovery/state persistence is happening in the expected instance root.

## Resume / idempotence behavior

The wrappers use these lifecycle checkpoints to decide where to resume:

1. **Seeded** — `/caf saas` outputs exist:
   - `product/PRD.md`
   - `product/PLATFORM_PRD.md`
   - `product/UX_VISION.md`
   - `spec/guardrails/profile_parameters.yaml`
   - `spec/playbook/architecture_shape_parameters.yaml`

2. **PRD promoted** — `/caf prd` outputs exist:
   - `product/PRD.resolved.md`
   - `product/PLATFORM_PRD.resolved.md`
   - `spec/playbook/architecture_shape_parameters.proposed.yaml`
   - `spec/playbook/architecture_shape_parameters.proposed.rationale.json`

3. **Architecture scaffolding complete** — first `/caf arch` outputs exist:
   - `spec/playbook/system_spec_v1.md`
   - `spec/playbook/application_spec_v1.md`
   - `spec/playbook/application_domain_model_v1.md`
   - `spec/playbook/system_domain_model_v1.md`
   - `spec/playbook/application_product_surface_v1.md`

4. **Checkpoint applied** — `lifecycle.generation_phase` is no longer `architecture_scaffolding`

5. **Design bundle complete** — second `/caf arch` outputs exist (after the implementation/design pass):
   - `design/playbook/contract_declarations_v1.yaml`
   - `design/playbook/control_plane_design_v1.md`
   - `design/playbook/application_design_v1.md`
   - `design/playbook/application_domain_model_v1.yaml`
   - `design/playbook/system_domain_model_v1.yaml`

6. **Planning complete** — `/caf plan` outputs exist:
   - `design/playbook/pattern_obligations_v1.yaml`
   - `design/playbook/task_graph_v1.yaml`
   - `design/playbook/interface_binding_contracts_v1.yaml`
   - `design/playbook/task_plan_v1.md`
   - `design/playbook/task_backlog_v1.md`

7. **Build complete** — `.caf-state/build_wave_state_v1.json` exists with `completed=true`
   - `/caf build` is treated as a loop command whose authoritative resume state lives in `build_wave_state_v1.json`

8. **UX derived** — `/caf ux` outputs exist:
   - `design/playbook/ux_design_v1.md`
   - `design/playbook/ux_visual_system_v1.md`
   - `design/playbook/ux_semantic_derivation_packet_v1.yaml`
   - `design/playbook/retrieval_context_blob_ux_design_v1.md`

9. **UX planning complete** — `/caf ux plan` outputs exist:
   - `design/playbook/ux_task_graph_v1.yaml`
   - `design/playbook/ux_task_plan_v1.md`
   - `design/playbook/ux_task_backlog_v1.md`

10. **UX build complete** — `.caf-state/ux_build_wave_state_v1.json` exists with `completed=true`
    - `/caf ux build` is treated as a loop command whose authoritative resume state lives in `ux_build_wave_state_v1.json`

## Notes

- Prefer `node .\tools\caf\cli\claude\run_caf_flow_v1.mjs <instance_name>` when you want the most portable launcher path across Windows systems.
- Run the `.ps1` script directly from PowerShell as shown above; you do not normally launch `powershell ...` from inside PowerShell unless you need an execution-policy bypass.
- The resume checkpoints, reset rules, packet-attribution behavior, and feedback-packet stop semantics are shared through `tools/caf/cli/lib_run_caf_flow_v1.mjs` and intentionally stay aligned with the Codex helper family.
