# Phase 8 Architecture Doc Pipeline Feedback Packets (v1)

## Status

Draft — Normative for the Phase 8 architecture document pipeline.

This standard is a **specialization** of the general feedback packet minimum fields defined in:
- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md` (Section: “Feedback packet standard”)

A packet conforming to this standard also satisfies the general minimum.

---

## Purpose

Standardize fail-closed reporting for the architecture doc pipeline:

- A1: facts inventory extraction
- B1: story plan generation
- C: rendering + non-destructive merge

Packets are written to disk. Packet contents MUST NOT be printed in chat.

---

## Where to write

Write to the CAF instance:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-arch-doc-<slug>.md`

Do not write packets into the companion repository.

---

## Slugs (fixed set)

- `preconditions_failed`
- `a1_facts_inventory`
- `b1_story_plan`
- `c_renderer`
- `merge_error`

---

## Required packet structure

# Feedback Packet: BP-YYYYMMDD-arch-doc-<slug>

- Stuck At: Preconditions | A1 | B1 | C | Merge
- Required Capability: one sentence
- Observed Constraint: one sentence
- Gap Type: Missing input | Missing mapping | Spec inconsistency | Ambiguous evidence | Parse failure | Block drift | Write boundary violation
- Minimal Fix Proposal: one sentence
- Evidence:
  - <path>:<locator>

Additional required fields for this pipeline:

- Scope: `reference_architectures/<name>`
- Companion Repo Target: `<companion_repo_target>` (if parseable)
- Failed Check IDs: `[<check_id>, ...]`
- Files attempted (paths only):
  - <path>

Optional (when available):
- A1 fingerprint: `<sha256>`
- B1 fingerprint: `<sha256>`

---

## Locator format

Evidence locators MUST be one of:

- YAML path (e.g., `lifecycle.evolution_stage`)
- Markdown heading (e.g., `## 3. Constraints`)
- Table row key (e.g., `row: DP-2`)
- CAF-managed block id (e.g., `block_id: master.what_intent_summary`)
- File glob evidence (e.g., `adrs/ADR-*.md (0 files matched)`)

---

## Notes

- Fail-closed means: do not invent or infer missing facts, edges, or headings.
- Do not erase human edits outside CAF-managed blocks.
- Do not emit “used” claims without ADR-declared references.
