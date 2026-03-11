---
name: caf-ask
version: 2
description: >
  Ask a natural-language question about a CAF instance.
  This skill first performs semantic intent+instance selection, then runs a deterministic node helper
  (tools/caf/ask_v1.mjs) to build a minimal context pack (ask_context_v1.md), and answers using only that pack.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

> **Tools guardrail:** During routed workflows, treat `tools/**` as read-only. Do NOT modify scripts or other producer surfaces (`skills/**`, `architecture_library/**`) while executing this command.


# caf-ask

## Purpose

Provide a launch-grade **ask-first** UX:

- User asks a question in stakeholder terms.
- CAF selects the minimal relevant context pack for the intended instance.
- The assistant answers without dumping internal file lists.

## Invocation

- `/caf ask <question...>`

Examples (no backticks required):

- `/caf ask Summarize the main features of the codex-saas reference architecture.`
- `/caf ask Which patterns were selected for codex-saas, and which pins drove them?`
- `/caf ask For pin CP-4, what obligations and tasks are implied?`
- `/caf ask If we change code/ap/widgets/service.py, what intent/work is most likely impacted?`

## Procedure

### 1) Validate input

- If the user did not provide a question after `ask`, respond with the first example above and STOP.

### 2) Semantic selection (instance + intent)

Pick:

- `instance_name`: the CAF instance the user is asking about.
  - If the question mentions an instance in natural language, map it to an existing folder under `reference_architectures/`.
  - If unclear, default to `codex-saas` if present; otherwise use the first instance folder under `reference_architectures/`.

- `intent` (exactly one):
  - `feature_summary`
  - `decision_visibility`
  - `work_visibility`
  - `impact_assessment`

Notes:
- Be willing to infer intent from the question (this is a semantic step; tokens are fine).
- Do not ask the user follow-ups for launch. Use the defaults above.

### 3) Create the question file

- Write exactly the user question (verbatim) to: `tools/caf/out/caf_ask_question_v1.txt`
- Use a single-quoted heredoc delimiter (e.g. `<<'EOF'`) so shell metacharacters are never executed.

### 4) Run the deterministic helper

- Required helper: `tools/caf/ask_v1.mjs`
- Run (do not print the command invocation):
  - `node tools/caf/ask_v1.mjs --question-file tools/caf/out/caf_ask_question_v1.txt --instance <instance_name> --intent <intent>`

Constraints:
- If the helper exits non-zero: STOP and return the single-line error message it printed.

### 5) Read the generated context pack

- The helper prints a line like: `wrote: reference_architectures/.../ask_context_v1.md`
- Open that file and use it as the **only** context for answering.

### 6) Answer

- Answer the user’s question directly.
- Do **not** print file paths, file lists, or internal routing details.
- If the context pack is missing required information, say what is missing and which high-level CAF step usually produces it (e.g. “run `/caf plan <instance>` to materialize task graph/backlog”).
