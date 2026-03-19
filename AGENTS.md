# Agent Instructions (CAF repo)

You are operating as an autonomous agent with reasoning capabilities.
Skills are interleaved sequences of semantic reasoning you should perform and deterministic steps implemented as scripts. The order is deterministic and matters. Only execute scripts when mandated by the order of operations.

This repo is Contura Architecture Framework (CAF). Treat the repo contents as authoritative.

## Safety and stability

- **No git commands.** Do not run any `git ...` commands (read or write).
- **No python.** Do not run any `python ...` commands (read or write).
- **Prefer node.** Use `node ...` commands when needed (read or write).

## Token discipline: scripts over shell transcripts (mechanical-only)

To minimize token burn from long shell transcripts (`rg`, `head`, `sed`, `awk`, etc.), prefer **small, deterministic Node scripts** for repeatable *mechanical* work.

### What scripts MAY do (allowed)

Scripts under `tools/caf/*.mjs` are allowed (and preferred) for:

- file existence checks, schema checks, placeholder detection
- YAML/JSON parsing, set coverage, invariant gates
- deterministic report generation and contract materialization
- safe cleanup of known derived artifacts (**explicit paths only**)

All scripts must be:

- **Mechanical-only** (no policy/architecture decisions; no “creative” generation)
- **Deterministic** (same inputs → same outputs)
- **Fail-closed** (non-zero exit + feedback packet when invariants are violated)
- **Repo-scoped** (only read/write within this repo; never external calls)

### What scripts MUST NOT do (prohibited)

- **Do not replace a worker skill with a script call.**
  - “Workers” are semantic steps (retrieval, planning, architecture, design) and must run via the canonical skill procedure.

Clarification (semantic processing):

- When CAF documentation says *LLM-owned semantic processing*, it means **agent reasoning performed by the active agent** (i.e., the model that is running this workflow).
- There is no separate “LLM service” to discover. Do not search for or attempt to invoke an external LLM component.

- **Never invent or “assume” a tool exists.**
  - Do not emit calls like `node tools/caf/worker_*.mjs ...` unless that file actually exists in `tools/caf/` AND is referenced by the relevant `skills/**/SKILL.md` as a preferred scripted path.
- **No ad-hoc wrappers for workers** unless you implement them, document them, and wire them into the skill.

### Execution discipline (avoid hallucination)

- If you choose to use a Node helper:
  - **Execute it** (do not merely print the command as text).
  - **Do not print the invocation** unless explicitly requested.
  - On failure, print **only the feedback packet path**.
- **Never run arch_gate twice.** Run `arch_gate_v1.mjs` at most once per attempt. If it fails, do not rerun it to ‘check the exit code’; use the reset command in the packet, then rerun `/caf arch`.
- Use forward slashes in paths (portable): `tools/caf/...` (not `tools\caf\...`).

Additional hard rules:

- **No script-only runs + gates.** Do not run a few deterministic helpers and then jump to an eval/gate that fails due to missing outputs you were instructed to produce.
- **No cross-instance templating.** Do not copy/adapt outputs from another instance to “satisfy invariants.” Always derive from the active instance’s authoritative inputs.

Allowed (preferred over silent shortcuts):

- For instruction-heavy semantic stages, you may ask the user a single permission question before running (proceed | fail-closed | stop).

## Constrained-model safety: incremental semantic updates

Some agents/models (or low-resource setups) struggle when asked to update large candidate sets (e.g., 10–20 patterns) in one semantic step.

Preferred posture:

- **Incremental loop:** update evidence/decisions **one pattern at a time** (or in small batches), then rerun the relevant gate.
- If a gate reports "missing evidence across pins," iterate: fill the missing evidence for the next pattern, rerun, repeat.
- Avoid "one swoop" rewrites of the whole candidate list (high timeout risk; hard to review).

## Large YAML safety (bitesize batching)

When emitting or editing CAF artifacts that contain large lists (e.g., pattern candidates, task lists, obligations, decisions):

Never dump the deliverables below as one whole blob:

- `reference_architectures/<name>/design/playbook/task_graph_v1.yaml`
- `reference_architectures/<name>/design/playbook/task_backlog_v1.md`

- Do **not** attempt a single-shot write that embeds the entire YAML payload.
- Prefer **multiple small edits/patches**, keeping the file valid YAML after **every** batch.
- Batch list emissions in groups of **at most 3 elements per edit** (rule of thumb: ≤3 items per patch).
- If an item references other sections (IDs/refs), emit the item and its required references in the **same** batch.
- After each batch, re-validate by re-opening the file (and/or running the relevant CAF validation gate) before proceeding.

## Command surface

CAF is operated via a single router command:

 `/caf ...`

Follow the canonical router and sub-skill procedures under `skills/**/SKILL.md`.

## Repo boundaries

- Do not hand-edit generated artifacts under `reference_architectures/` or `companion_repositories/` except where explicitly allowed by an `ARCHITECT_EDIT_BLOCK`.
- Prefer using the canonical skill procedures in `skills/**/SKILL.md`.
- When adding helpers, place them under `tools/caf/` and document them in `tools/caf/README.md`.

## Fail-closed behavior

- **Fail-closed:** if required inputs are missing/ambiguous or constraints are violated, stop and write a feedback packet (do not guess).
- Feedback packets must be written under:
  - `reference_architectures/<name>/feedback_packets/`
  - with a stable ID and a clear “Suggested Next Action”.
