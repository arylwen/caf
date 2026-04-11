# CAF skill portability and adapter shim meta-patterns v1

## Purpose

Define the canonical CAF posture for portable skills and runner adapters:

- canonical skill semantics live in `skills/**`
- runner adapters are discovery and delegation shims only
- routing must be silent unless the runtime guarantees hidden protocol capture
- runner vocabulary must never leak into user-visible CAF behavior
- fail-closed behavior and feedback packet discipline remain framework-wide invariants

This document replaces the old technical-note split between skill portability and adapter-shim rules.

---


## Purpose

Define a skills architecture that supports multi-step flows (routing, follow-on actions)
**without coupling CAF to a specific agent system**, and without requiring any proprietary
callback or orchestration runtime.

This note establishes:

- Where skills live (portable source of truth)
- Where agent workflows live (thin adapters)
- How routing / follow-on execution works **without leaking runner theory**
- How agent runtimes inject runner-specific command syntax **silently**
- Execution and safety assumptions for all CAF skills

## Design goals

CAF must be:

- **Runner-neutral:** ``skills/**/SKILL.md`` is the source of truth and must run on any agent runtime.
- **Adapter-thin:** ``.agent/workflows/**`` are runner-specific shims only (no CAF theory, no UX ownership).
- **Executable:** skills describe actions and checks, not essays.
- **Fail-closed:** ambiguity, missing inputs, missing files, or invalid states must refuse and emit a feedback packet.
- **Non-leaky:** workflows must not print runtime vocabulary, adapter prose, or helper file contents.
- **Low-automation assumptions:** do not rely on shell scripts for local file ops; assume the runtime supports basic file operations.

## Repository structure (canonical)

Portable layer (source of truth):

- ``skills/**/SKILL.md`` — runner-neutral, executable procedures

Runner adapter layer (compiled shims):

- ``.agent/workflows/**`` — runner-specific adapter glue only
- ``.agent/runtime/runtime_vocabulary.md`` — runtime command templates (never shown to users)
- ``.kiro/skills/**`` — Kiro IDE workspace skill shims only
- ``.kiro/runtime/runtime_vocabulary.md`` — runtime command templates (never shown to users)

CAF library layer (authoritative content):

- ``architecture_library/**`` — standards, templates, catalogs, glossaries, process documents

Instance layer (user-owned artifacts):

- ``reference_architectures/<name>/**`` — created/modified by init/derivation tools

## Portable layer: skills (source of truth)

### What a skill is

A skill is a runner-neutral **procedure** that:

- declares inputs and outputs
- declares authoritative sources (paths) in the repo
- defines preconditions and refusal rules
- defines file operations abstractly (create directory, copy file, write file)
- defines fail-closed behavior
- writes feedback packets to disk on failures

Skills must not:

- embed runner command syntax
- print “Runtime Next steps”
- list other skills by default
- echo template contents or helper files into chat output

### Skill file format

Each skill lives at:

- `skills/<skill-name>/SKILL.md`

Skills must use stable, explicit path names, and must avoid “magic discovery” (e.g., scanning the repo for “something that looks right”) unless explicitly declared as part of the procedure.

## Adapter layer: workflows (runner-specific)

### What a workflow is

A workflow is a thin adapter that:

- reads the skill spec(s)
- injects runtime-specific command syntax **silently**
- executes the skill-defined actions
- enforces output constraints (no adapter prose, no runtime vocabulary leakage)

Workflows must not:

- re-explain CAF
- redefine skill semantics
- invent UX steps
- print command templates
- print helper files or adapter-only notes

### Where workflows live

- `/.agent/workflows/<name>.md`

Workflows are allowed to parse invocation arguments and route execution to other skills **silently**.

## Visibility contract for protocol / routing blocks (critical)

**Do NOT assume protocol blocks are hidden.**

Some agent runtimes display the model output verbatim. In those runners, any “packet” blocks
(e.g., ROUTE_PACKET / ACTION_REQUEST style blocks) will appear in the user-visible chat output.

Therefore:

- Protocol blocks are OPTIONAL and may be used only when the runner explicitly supports
  structured/hidden capture of these blocks.
- If the runner does not support hidden capture, routing MUST be performed in the workflow adapter
  (silent parsing + delegation), not via printed packets.
- Skills must remain correct and usable even when protocol blocks are not available.

Practical consequence:

- Prefer “silent routing” in ``.agent/workflows/**`` for multi-step flows.
- Keep user-visible skill output minimal and stable.

## Multi-step flows without proprietary callbacks

CAF supports multi-step flows in two runner-neutral ways:

### Pattern A: Workflow-level routing (preferred)

The workflow:

1) Parses invocation args
2) Chooses which skill(s) to execute
3) Executes them in sequence
4) Returns only the allowed user-visible output

This avoids printing any routing metadata.

### Pattern B: Skill-level routing packets (only when supported)

A skill may emit routing metadata only if the runtime guarantees it is captured and not printed.
If the runtime cannot guarantee hidden capture, do not use this pattern.

## Execution assumptions for file operations

CAF skills assume the agent runtime can perform basic file operations without requiring scripts:

- create directories
- read files
- copy files
- write files
- check existence

Skills should define these actions abstractly; workflows inject the concrete runtime commands silently.

## Fail-closed behavior and feedback packets

### Fail-closed means

If any of the following occur, the skill must refuse:

- required inputs missing or invalid
- authoritative source files missing
- preconditions unmet
- ambiguity in required selections
- destination files already exist (unless overwrite is explicitly permitted)
- verification checks fail

No silent fallback behavior. No inferred defaults where prohibited.

### Feedback packets

When a skill refuses (or fails mid-procedure), it must write a feedback packet to disk under the contract-owned packet surfaces described in `architecture_library/__meta/caf_operating_contract_v1.md`.

For instance work, the default location is:

- `reference_architectures/<name>/feedback_packets/<timestamp>__<skill>__failed.md`

Feedback packets must include:

- Summary (1 short paragraph)
- Preconditions checked (bullets)
- Exact failure reason(s) (bullets; include missing paths)
- Files attempted (paths only)
- Corrective actions (short bullets)

Feedback packets are written to disk, not printed in chat.

## Quiet success output (init/executor skills)

For init and executor skills, default success output must be minimal:

- a short success line (optional)
- created/modified paths

Avoid:

- “Next steps” sections (even runner-neutral)
- workflow UX guidance
- listing other skills

Guidance belongs in `caf-help` unless the user explicitly asked for it.

## Template packs: keep them template-shaped

Template packs must not look like “instances living in the library.”

Practical rules:

- Keep template packs **machine-consumable** (prefer YAML-only for init surfaces).
- Move narrative docs elsewhere (e.g., `profile_template_docs/`) if needed.
- Remove or refuse templates that hard-bind to a specific instance path/name.

### Tokenization is a hard gate

If a template requires instance binding, it must expose explicit tokens (e.g., `{{instance_name}}`).
If required tokens are missing, skills should refuse rather than performing broad “best effort” substitutions.

## Copy verification (determinism)

When a skill copies templates with minimal substitutions, it should be deterministic:

1) read source
2) apply allowed substitutions (token-only)
3) write destination
4) re-open destination and verify exact content matches the expected post-substitution content

If verification fails: refuse and emit a feedback packet.

## Drift control

- `/skills/**` is the source of truth.
- ``.agent/workflows/**`` are compiled adapters.
- Update skills first, then workflows.
- Workflows must not accrete CAF theory or helper prose.

## Summary

CAF skills are executable, portable, fail-closed procedures.
They remain runner-neutral and user-output-safe by default.
Runner adapters inject runtime-specific command syntax silently and must not leak adapter theory or
routing metadata into user output—especially in runtimes that print model output verbatim.


---

## Shim-only reinforcement


## Rule

Runner adapters must be **shims only**:

- `.agent/workflows/**`
- `.codex`skills/**/SKILL.md``

They must not duplicate CAF semantics, procedures, policies, or constraints.

## Source of truth

The canonical skill content lives only in:

- `skills/<skill_name>/SKILL.md`

Adapters may only:

- include the *minimum runner-required metadata* (for discovery)
- reference `skills/<skill_name>/SKILL.md`
- instruct the runner to execute it exactly as written

## Required adapter metadata (allowed)

Some runners require YAML front matter for discovery.

Adapters MAY include YAML front matter (`--- ... ---`) **only** for:

- `name`
- `description`
- optional runner-facing fields like `status`

No other content belongs in front matter.

## Why

- Prevents “split-brain” drift across runners (Antigravity vs Codex).
- Keeps skills portable and single-sourced.
- Reduces maintenance cost and token waste.
- Makes drift evaluation deterministic.

## Enforcement

`skills/drift-eval-caf/SKILL.md` includes a ship-blocker check that fails if any adapter:

- contains CAF semantics (purpose/inputs/procedure/checklists/validators)
- references `architecture_library/**`
- includes CAF block markers
- includes feedback packet formats
- includes additional headings beyond the shim body

Fix violations by rewriting the adapter to a minimal shim that points to the canonical skill.
