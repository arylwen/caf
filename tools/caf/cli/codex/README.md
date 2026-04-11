# CAF Codex full-flow helpers (context-reset + resume)

These scripts are Codex-specific helpers for the **current canonical CAF lifecycle**. They are not a new public command surface; they simply run the existing `/caf ...` commands in separate Codex runs so each step starts fresh.

They are also **resume-aware**:

- they detect completed lifecycle checkpoints and skip satisfied steps;
- they reconcile explicit routed step state in `.caf-state/routed_step_state_v1.json` so reruns consult step status first and artifact presence second;
- they ignore stale feedback packets that already existed before the current wrapper run as autonomous stop triggers;
- they use the existing CAF reset helpers for the three phases that are intentionally fail-closed on overwrite (`architecture_scaffolding`, second-pass implementation/design scaffolding, and `planning`);
- they treat `/caf build` and `/caf ux build` as loop commands driven by CAF wave-state files instead of inventing a parallel resume path.

## Why these exist

Some agent harnesses will carry too much state across a long multi-step lifecycle or try to shortcut later steps. These helpers run each CAF command in its **own Codex non-interactive run** so the router, skills, gates, and fail-closed packets behave as if each step were invoked cleanly.

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

- OpenAI Codex CLI installed (`codex`).
- Node.js 18+ available on PATH (`node`).
- Run from the **repo root** (the folder containing `skills/`, `tools/`, `reference_architectures/`).
- These wrappers assume the repo-local Codex/CAF instructions are available and that invoking `codex exec "/caf ..."` works in your environment.
- Validate the shell prerequisites before running the wrapper:

```powershell
codex --version
node --version
```

If `codex --version` fails in the same shell, install Codex CLI or add it to `PATH` before running the CAF helpers.

On Windows, the helper now resolves Codex through `where.exe`, prints the fully qualified path it chose, and then runs that resolved path. This avoids relying on interactive shell resolution alone.

## Usage

### Preferred launcher

From the repo root, prefer the direct Node entrypoint:

```powershell
node .\tools\caf\cli\codex\run_caf_flow_v1.mjs codex-saas
```

With extra Codex CLI flags:

```powershell
node .\tools\caf\cli\codex\run_caf_flow_v1.mjs codex-saas -c model_reasoning_effort="high"
```

Use the shell-specific wrappers below only when they fit your environment better.

### Bash (macOS/Linux)

```bash
bash tools/caf/cli/codex/run_caf_flow_v1.sh <instance_name>
```

With extra Codex CLI flags:

```bash
bash tools/caf/cli/codex/run_caf_flow_v1.sh codex-saas -c 'model_reasoning_effort="high"'
```

### PowerShell (Windows)

From an existing PowerShell session in the repo root:

```powershell
.\tools\caf\cli\codex\run_caf_flow_v1.ps1 -InstanceName <instance_name>
```

With extra Codex CLI flags:

```powershell
.\tools\caf\cli\codex\run_caf_flow_v1.ps1 -InstanceName codex-saas --% -c model_reasoning_effort="high"
```

If PowerShell blocks the unsigned `.ps1`, you do **not** need admin for a one-off bypass. Use one of these options:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\tools\caf\cli\codex\run_caf_flow_v1.ps1 -InstanceName codex-saas
```

```powershell
powershell -ExecutionPolicy Bypass -File tools/caf/cli/codex/run_caf_flow_v1.ps1 -InstanceName codex-saas --% -c model_reasoning_effort="high"
```

For a persistent per-user setting, check the current policy and then switch the current user scope instead of requiring elevation:

```powershell
Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

If the script came from a downloaded or unzipped archive, this can also help when the file is blocked:

```powershell
Unblock-File .\tools\caf\cli\codex\run_caf_flow_v1.ps1
```

You can avoid PowerShell script policy entirely by calling the Node entrypoint directly:

```powershell
node .\tools\caf\cli\codex\run_caf_flow_v1.mjs <instance_name>
```

### CMD (Windows)

```cmd
tools\caf\cli\codex\run_caf_flow_v1.cmd <instance_name>
```

With extra Codex CLI flags:

```cmd
tools\caf\cli\codex\run_caf_flow_v1.cmd codex-saas -c model_reasoning_effort="high"
```

## Troubleshooting

### PowerShell says the script is not digitally signed

This is a PowerShell execution-policy issue, not a CAF issue. Your options are:

- use the `.cmd` wrapper from CMD or PowerShell;
- run the Node entrypoint directly (`node tools/caf/cli/codex/run_caf_flow_v1.mjs ...`);
- use a one-off PowerShell bypass with `-Scope Process Bypass` or `-ExecutionPolicy Bypass`; or
- set `CurrentUser` execution policy to `RemoteSigned` if that matches your workstation policy.

You do **not** need administrator privileges for the process-scoped or current-user-scoped options.

### Wrapper says `Codex CLI not found on PATH`

The PowerShell wrapper only launches Node. The actual CAF flow runner resolves Codex from `PATH` using `where.exe`, prints the fully qualified path it selected, and then probes/runs that path.

This matters on Windows because interactive PowerShell resolution, Node direct process spawning, and `.cmd` shell-shim argument handling are not the same thing. The runner now resolves the Codex path first and, when that path is a `.cmd` shim, launches it through `cmd.exe` so prompt arguments with spaces stay intact.

Confirm what Windows can resolve in the same shell:

```powershell
Get-Command codex
where.exe codex
codex --version
```

If these fail, install Codex CLI or update your `PATH`, then open a fresh shell and retry.

When resolution succeeds, the wrapper prints a line like:

```text
INFO: Using Codex CLI at C:\devtools\nodejs\codex.cmd (via shell shim).
```

If that line is missing, the failure happened before runner resolution. If the line is present, CAF is using that exact path for both the version probe and the full flow run.

The runner also prints the absolute routed-step-state path at startup and logs when the first state write completes, so you can verify that recovery/state persistence is happening in the expected instance root.

If the wrapper prints `INFO: Using Codex CLI at ...` and Codex then errors with `unexpected argument 'saas' found` for a CAF command like `/caf saas <instance>`, that points to a Windows quoting/order bug at the runner boundary. The wrapper now addresses this in two ways:

- it passes `--full-auto` and any extra Codex flags before the `exec` prompt positional; and
- for `.cmd` shims on Windows, it routes execution through `cmd.exe` so the full CAF prompt is preserved as a single argument.

### Recommended Windows invocation order

When troubleshooting on Windows, prefer these invocation paths in order:

1. `node .\tools\caf\cli\codex\run_caf_flow_v1.mjs <instance_name>`
2. `tools\caf\cli\codex\run_caf_flow_v1.cmd <instance_name>`
3. `.\tools\caf\cli\codex\run_caf_flow_v1.ps1 -InstanceName <instance_name>` once your PowerShell policy allows it

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

### Partial-run recovery rules

- **Partial architecture scaffolding**
  - The wrapper runs:
    - `node tools/caf/architecture_scaffolding_reset_v1.mjs <instance> overwrite`
  - Then reruns the first `/caf arch` step.

- **Partial second-pass implementation/design bundle**
  - The wrapper runs:
    - `node tools/caf/implementation_scaffolding_reset_v1.mjs <instance> overwrite`
  - Then reruns the second `/caf arch` step.

- **Partial planning bundle**
  - The wrapper runs:
    - `node tools/caf/planning_reset_v1.mjs <instance> overwrite`
  - Then reruns `/caf plan`.

- **Partial main build lane**
  - No reset by default.
  - The wrapper keeps rerunning `/caf build <instance>` until `build_wave_state_v1.json` reports `completed=true`, or a fresh/newly-updated blocking packet is produced during the current run.
  - Resume authority stays with CAF's wave state, companion task reports, and reviews; the wrapper does not guess wave numbers.

- **Partial UX build lane**
  - No reset by default.
  - The wrapper keeps rerunning `/caf ux build <instance>` until `ux_build_wave_state_v1.json` reports `completed=true`, or a fresh/newly-updated blocking packet is produced during the current run.
  - Resume authority stays with CAF's UX wave state and companion evidence; the wrapper does not guess wave numbers.

### Feedback-packet behavior

- Existing packets already present before the wrapper starts are treated as **historical** and do not block resume by themselves.
- When the current run writes or updates a blocking packet, the wrapper stops and labels it as either **produced** or **updated**.
- When the runner exits non-zero without writing a fresh blocker packet, the wrapper now says so explicitly and only shows the **newest existing blocking packet for convenience**. That packet is context, not proof that it was the first failing helper path in the current run.
- New **advisory** packets are surfaced on-screen, captured in the run log, and do not stop the flow.
- When a rerun completes a routed step successfully, the shared runner now best-effort resolves any step-scoped blocker packets that still match that step so `.caf-state/routed_step_state_v1.json` can return the step to `completed` deterministically.

## Agent log capture

- By default, the wrapper tees its own progress lines plus runner stdout/stderr to: `reference_architectures/<instance>/agent-logs/<run-id>.log`
- The same output still appears on-screen during the run.
- Use `CAF_AGENT_LOG_MODE=off` to disable file capture and keep console-only output.
- The log path is printed at wrapper startup so you can correlate a run with the generated evidence and feedback packets.

## Defaults

- model: `gpt-5.3-codex` unless you override it with `-m` / `--model`
- reasoning effort: `medium` unless you pass your own `model_reasoning_effort` config
- approval posture: `--full-auto`

## What each helper does

- invokes the **canonical** `/caf ...` commands, not direct skill paths;
- adds `--full-auto` by default to each Codex run;
- allows extra Codex CLI flags after the instance name;
- skips already-satisfied checkpoints;
- runs the matching reset helper when a fail-closed overwrite phase is only partially present, including second-pass implementation/design scaffolding;
- stops on the first blocking packet that is freshly produced or freshly updated during the current wrapper run, or reports that only a newest-existing blocker was surfaced after a runner failure;
- surfaces and logs new advisory packets without stopping the flow.

## Safety posture

- The helpers intentionally keep each lifecycle command isolated in its own Codex run.
- They do **not** bypass CAF routing, gates, or fail-closed behavior.
- They do **not** treat `/caf ux build` as a replacement for the main `/caf build` lane.
- They do **not** invent a parallel build-resume mechanism; they defer to CAF wave-state files for `/caf build` and `/caf ux build`.
