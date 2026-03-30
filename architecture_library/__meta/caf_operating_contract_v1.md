# CAF Operating Contract v1 (normative)

This file is the **single canonical** operating contract for CAF work in this repo.
If any SKILL, template, validator, or practice conflicts with this contract, **this contract wins**.

## 1. Retrieval is semantic (no deterministic scoring requirements)

1. **Pattern retrieval and ranking are semantic.**
   - Applies to any retrieval over natural-language artifacts (CAF/core/external patterns, playbook patterns, design patterns).
   - Numeric scoring is **optional** and **non-authoritative**. Do not require deterministic scoring rules.
   - Every shortlisted item MUST have grounded, human-readable reasons (why it matches the instance).

2. **Mechanical extraction is allowed only to build grounded inputs.**
   - Allowed: extracting pinned inputs, enumerations, IDs, and verbatim excerpts into a retrieval blob.
   - Forbidden: inventing participants, requirements, constraints, vendors, or “helpful” inferred details.

3. **Deterministic matching is allowed only when match keys are explicit and machine-readable.**
   - Examples: TBP/PBP resolution by declared atoms; policy matrix gating by explicit keys.
   - This exception does **not** apply to pattern inclusion/ranking.

## 2. No bespoke if/then inclusion logic in workers

1. Workers MUST NOT contain bespoke inclusion/exclusion logic like:
   - “If pin X == value Y, include pattern Z”,
   - “If instance name == foo, do …”,
   - “If file path contains bar, assume …”.

2. Allowed exception: **purely generic mechanisms driven by data files**, where the behavior is externalized.
   - Examples: retrieval view profiles, top-set shortlists, policy matrices, catalogs, schemas.
   - The worker may load a data file and apply a generic algorithm (filter/merge/transform), but MUST NOT hardcode special cases for specific IDs.

## 3. Fail-closed + feedback packets

Fail-closed is mandatory. If anything required is missing/ambiguous/contradictory, STOP and write a feedback packet.

### 3.1 When to fail-closed

Fail-closed (minimum set):

- A required input file is missing, unreadable, or fails schema/YAML/JSON parsing.
- A required block/field is missing, placeholder, or contradictory.
- A required constraint is violated (including lint contracts).
- You cannot ground outputs to authoritative inputs (pins/rails/spec decisions/pattern definitions).
- You cannot satisfy mandatory coverage floors/guardrails (when declared by a SKILL).
- An output would exceed a hard cap (blob caps, node caps) and you cannot safely reduce without losing required signal.

Execution discipline (ship blocker):

- **Do not fail-closed on "missing required outputs" unless the responsible producer step has actually been executed.**
  - Example: after a reset/wipe step that intentionally deletes `design/`, missing design bundles are expected.
  - The required action is to run the producer (instruction-owned or invocation) that regenerates the bundle, then validate.
- **Do not treat "I checked and outputs are missing" as having "invoked" a producer.**
  - "Invoked" means you executed the producer instructions/skill, not that you inspected the filesystem.
- **Do not substitute cross-instance templates** (e.g., copying from another instance) to satisfy postconditions.
  - If a producer cannot generate the required outputs for the current instance, fail-closed with a packet that attributes the gap to the producer and proposes a producer-side fix.

Interactive checkpoints (allowed; preferred over silent shortcuts):

- For **instruction-heavy semantic stages** (retrieval owner, solution architect, application architect), you MAY ask the user a **single explicit permission question** *before* executing, if you believe the step is unusually expensive or risky.
- The question MUST be actionable and must not be used to stall.
- The question MUST offer concrete options such as:
  1) proceed and run the skill now,
  2) stop and fail-closed with a feedback packet,
  3) stop and take no action.
- **Forbidden:** silently skipping the producer, script-hunting for a replacement, or jumping to a gate that will fail due to missing outputs.

### 3.2 Where to write packets

- **Instance-scoped:** `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-<slug>.md`
- **CAF/library-scoped:** `feedback_packets/caf/BP-YYYYMMDD-<slug>.md`

### 3.3 Packet structure (required)

Keep packets short and actionable. Use this shape:

- H1: `# Feedback Packet - <skill_or_step>`
- Context bullets (at minimum):
  - Date (YYYY-MM-DD)
  - Instance (if applicable)
  - Stuck At (step name)
  - Observed Constraint (what was violated / missing)
  - Gap Type (Missing input | Contradiction | Ungrounded output | Coverage floor | Lint violation | Schema mismatch)
- `## Minimal Fix Proposal`
  - Prefer **producer-side** fixes (skills/templates/library) over patching instance outputs.
  - Include the minimal rerun command path (e.g., `caf arch <name>` then `caf build <name>`).
- `## Evidence`
  - Exact file paths and a small excerpt (YAML/MD snippet) showing the issue.

Do NOT guess. If you are unsure, fail-closed and ask via an open question inside the packet.

### 3.4 Advisory packets (non-blocking)

Some packets are emitted for visibility but are NOT intended to be "fixed" by an agent during the same run.

- Packets may include a context line: `- Severity: advisory`.
- Advisory packets MUST NOT cause fail-closed behavior.
- Downstream workers SHOULD NOT attempt to "repair" advisory packets unless the user explicitly requests it.

## 4. Producer-side only + router-only command surface

1. **Producer-side only:** do not manually edit shipped instance outputs under:
   - `reference_architectures/**`
   - `companion_repositories/**`

   If an instance output is wrong, fix the producer (skills/templates/validators/library) and re-run the workflow.

2. **No ad-hoc user-facing commands:** CAF’s router command surface is fixed to the canonical routed entries below:
   - `caf help`
   - `caf ask <question...>`
   - `caf saas <name>`
   - `caf prd <name>`
   - `caf arch <name>`
   - `caf next <name> [apply]`
   - `caf plan <name>`
   - `caf build <name>`
   - `caf ux <name>`
   - `caf ux plan <name>`

   Internals may be refactored, but MUST NOT add user-facing entrypoints beyond this routed surface.

## 5. Artifact hygiene (read/write discipline)

### 5.0 Authoritative instance surfaces (read discipline)

During an instance run, only these paths are authoritative:

- `reference_architectures/<name>/spec/playbook/**`
- `reference_architectures/<name>/spec/guardrails/**`
- `reference_architectures/<name>/spec/playbook/**`
- `reference_architectures/<name>/feedback_packets/**`

Ignore any sibling folders such as `playbook-1`, `playbook_old`, `tmp`, etc. They are user-created and MUST NOT be searched or read.

When you need to look something up, prefer direct paths over global searches. If a global search is unavoidable, restrict it to the smallest relevant subtree.

1. Each SKILL MUST declare its read/write surfaces and MUST NOT write outside its declared outputs.
2. Merge-safe behavior is required for any architect-editable documents:
   - Preserve architect text outside CAF-managed blocks.
   - Preserve architect edits inside `ARCHITECT_EDIT_BLOCK` sections; CAF may only append missing scaffolds.
3. CAF-managed blocks MUST be clearly labeled and overwrite rules MUST be explicit.

## 5A. Scripted helpers (optional; mechanical only)

Scripted helpers may be used to save tokens **only** for deterministic/mechanical work.

Normative constraints:

- Helpers MUST live under `tools/caf/` and be versioned (`*_v1.mjs`).
- A SKILL MUST explicitly reference the helper and define its success/fail-closed behavior.
- Helpers MUST NOT introduce architecture choices, pattern selection, or vendor/provider selection.
- Helpers MUST enforce write fences: they may write only to the active instance under `reference_architectures/<name>/**` (typically `spec/playbook/**`, `spec/guardrails/**`, `design/playbook/**`, and `feedback_packets/**`) and MUST NOT write to producer surfaces (`skills/**`, `architecture_library/**`, `tools/**`).
- Helpers MUST fail-closed by writing a feedback packet when inputs are missing/invalid or constraints are violated.
- Routed command post-chains are ordered fences, not schedulable sibling tasks. When a command owns a `pre-gate -> instruction-owned write -> post-gate/projection` sequence, execute those phases serially in one lane and wait for each required output to exist and be readable before starting the next phase.
- For the current release track, do not use sub-agents or parallel helper branches inside a routed CAF command to overlap semantic writes with downstream deterministic reads or gates.

## 5B. CAF trace headers in generated artifacts

CAF-produced code and config MUST be traceable back to the Task Graph.

1. **Header required.** Any file that a CAF worker **creates** or **substantially rewrites** under `companion_repositories/**` MUST include a `CAF_TRACE:` header block near the top of the file, using the correct comment syntax for the file type.

2. **Header fields (minimum).** The header MUST include these keys:
   - `generated_by=Contura Architecture Framework (CAF)`
   - `task_id=<task_id>`
   - `capability=<capability_id>`
   - `instance=<instance_name>`
   - `trace_anchor=<trace_anchor>` (prefer `pattern_obligation_id:<obligation_id>` from the task's trace_anchors)

3. **Comment syntax.** Use the native comment style:
   - Python / YAML / Dockerfile / Containerfile: `# CAF_TRACE: ...`
   - TypeScript / JavaScript: `// CAF_TRACE: ...`
   - Shell scripts: `# CAF_TRACE: ...` (after any shebang)

4. **Placement.** Place the header at the top of the file.
   - If a shebang exists, the header MUST begin on the next line after the shebang.

5. **Non-comment formats.** For formats that do not support comments (e.g., JSON), do not invent invalid syntax. Either:
   - embed trace in a schema-valid metadata field (only if the schema explicitly allows it), or
   - omit the header and record trace in the task report evidence anchors.


### 5.3 Task report minimum structure (mandatory)

For every dispatched Task Graph task, the producer worker MUST write a task report to:

- `caf/task_reports/<task_id>.md`

The task report MUST include the following sections (in this order):

1) `## Task Spec Digest`
   - task_id + title
   - primary capability
   - source path for the task graph (typically `caf/task_graph_v1.yaml`)
2) `## Inputs declared by task`
   - list every `inputs[].path` declared on the task (mark required vs optional)
3) `## Inputs consumed`
   - list every input actually consulted and a one-line extraction note
4) `## Step execution evidence`
   - for each task `steps[]` item, include a bullet with concrete evidence (files touched + what changed)
5) `## Outputs produced`
   - file list written/modified
6) `## Rails and TBP satisfaction`
   - state which rails/TBPs constrained the work (when applicable) and how they were honored

If a step is not applicable, the report MUST explicitly state why.

Rationale (meta-pattern alignment): task reports are the primary proof that the worker consumed the full task spec (steps + DoD) and respected resolved rails/TBPs.

## 6. Traceability mindmap expectation

1. The traceability mindmap MUST be runnable at any time.
   - Missing inputs become explicit “missing” nodes; the mindmap must still render.
2. The mindmap MUST use `decision_resolutions_v1` as a **primary source** for pattern selection.
   - Do not rely only on derived obligations/tasks to infer adopted patterns.

## 7. Pin handling (specs compact; retrieval blobs full-fidelity)

**Platform pins naming is strict:** the pinned platform keys live under `platform.*` in `guardrails/profile_parameters.yaml`, and the resolved rails MUST mirror them under `platform.*` in `guardrails/profile_parameters_resolved.yaml`. Do not invent alternative key names (e.g., `platform_pins.*`).

1. **Specs remain compact**: pins are referenced, not re-explained.
   - Specs should not become “summary-of-summary” mirrors of the template catalog.

2. **Retrieval blobs must include full selected pins** plus value explanations.
   - Always include the complete selected pins list (no paraphrase).
   - Value explanations must be grounded in the authoritative template definitions (prefer verbatim excerpts).
   - Avoid multi-hop summarization that drifts meaning across runs.
