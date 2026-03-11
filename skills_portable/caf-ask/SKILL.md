---
name: caf-ask
version: 2
summary: Instruction-only fallback for `/caf ask`.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-ask (portable)

## Goal

Provide a usable `/caf ask` experience **without node helpers**.

This is best-effort and must remain instruction-only.

## Deterministic rules

### 1) Instance selection (no backticks required)

- List folders under `reference_architectures/`.
- Choose the instance whose folder name best matches the question using case-insensitive matching and common separators:
  - treat spaces / `_` / `-` as equivalent
  - example: “codex saas” → `codex-saas`
- If no match is found:
  - default to `codex-saas` if present
  - else pick the first instance folder

### 2) Intent classification (keyword-only)

Pick exactly one:

- `impact_assessment`: contains “if I change”, “impact”, “affected”, “risk”, or a file-like token (`foo/bar.py`).
- `work_visibility`: contains “task”, “obligation”, “work”, “scope”, “cost”, “backlog”, “dependency”.
- `decision_visibility`: contains “pattern”, “decision”, “why”, “pin”, “selected”, “adopted”.
- Otherwise: `feature_summary`.

### 3) Context selection (minimal)

- If `reference_architectures/<instance>/design/caf_meta/ask_context_v1.md` exists, read it and answer **only from it**.
- Else, read the smallest set of files that match the intent:
  - `feature_summary` / `decision_visibility`:
    - `design/caf_meta/traceability_mindmap_v3.md` (else `spec/caf_meta/traceability_mindmap_v3.md`)
    - the newest `pattern_candidate_selection_report_*.md` in the same caf_meta folder
  - `work_visibility` / `impact_assessment`:
    - `design/playbook/pattern_obligations_index_v1.tsv`
    - `design/playbook/task_graph_index_v1.tsv`
    - (optional) `design/playbook/task_backlog_v1.md`

## Output rules

- Answer the question directly.
- Do not print file lists.
- If needed artifacts are missing, say which `/caf` command usually produces them (e.g. `/caf arch`, `/caf plan`, `/caf build`).
