# Phase 8 Architecture Doc Renderer Contract C (v1)

## Status

Draft — Normative for Phase 8 architecture document generation.

---

## Purpose

Define the minimal renderer/merge contract that:

- translates B1 section kinds + edge walks into markdown
- writes a small progressive-disclosure doc set
- preserves human edits (non-destructive merge)
- fails closed on ambiguity, malformed blocks, or write boundary violations

---

## Inputs

C may read ONLY:
- `<companion_repo_target>/caf/derived/arch_doc_facts_inventory_generated_v1.yaml`
- `<companion_repo_target>/caf/derived/arch_doc_story_plan_generated_v1.yaml`

No other inputs are allowed.

---

## Outputs (fixed set)

Write/update these files under the companion repository:

- `architecture/architecture_summary_v1.md`
- `architecture/constraints_assumptions_v1.md`
- `architecture/intent_traceability_v1.md`

No additional doc files are permitted by this contract.

---

## CAF-managed block syntax (hard rule)

Blocks MUST be delimited exactly:

- `<!-- CAF:BEGIN <block_id> -->`
- `<!-- CAF:END <block_id> -->`

Where `<block_id>` is an ASCII identifier matching:
`^[a-z0-9][a-z0-9_.-]*$`

### Merge rules

- Content outside CAF blocks is human-owned and MUST be preserved verbatim.
- For each CAF block_id, the renderer replaces the entire block content.
- If a required block is missing, the renderer inserts it at the required insertion point.
- If block markers are malformed, unbalanced, nested, or duplicated, the renderer MUST fail closed.

---

## Required block IDs (fixed)

### `architecture/architecture_summary_v1.md`

- `master.intro`
- `master.tech_posture_summary`
- `master.what_intent_summary`
- `master.how_realization_chain`
- `master.constraints_assumptions_links`
- `master.traceability_links`
- `master.generated_footer`

### `architecture/constraints_assumptions_v1.md`

- `ledger.constraints`
- `ledger.assumptions`
- `ledger.generated_footer`

### `architecture/intent_traceability_v1.md`

- `trace.intent_to_adr`
- `trace.adr_to_validation`
- `trace.tech_profile_resolution`
- `trace.adr_to_policy_and_packs`
- `trace.generated_footer`

### Phase-gated blocks (conditional)

- `trace.tech_inventory_observed`
  - Render ONLY when A1 includes observed technology artifact facts.
  - OPTIONAL in v1.
  - MUST NOT be emitted empty.


---

## Rendering rules (high level)

### R1 — Deterministic ordering

- Use the order from B1 sections and walks.
- Within a rendered list/table, order items by:
  1) source ordering when provided (e.g., adr_index order)
  2) otherwise by fact_id / edge_id lexicographic order

### R2 — Grounded citations (internal)

For each rendered item, include a short “Evidence” link line inside the CAF block:

- `Evidence: <path> (<locator>)`

Do not invent paths/locators.

### R3 — Language constraints

- No claims of production readiness.
- No “used/applied/adopted” claims without ADR evidence.
- Prefer neutral phrasing: “Declared in ADR …”, “Derived by policy …”, “Pinned parameter …”.

### R4 — Progressive disclosure

- Master doc is short and story-driven.
- Deep-dives contain tables.
- Master doc links to deep-dives.

### R5 — Technology posture (no invention)

- Always render `master.tech_posture_summary` from A1 facts:
  - `intent.profile_knob` where `attrs.knob_path == platform pins (infra_target/packaging/runtime_language/database_engine)`
- Do NOT claim specific infrastructure/resources unless an ADR explicitly declares it.

---

## Gate C checks (fail-closed)

### GC-01 — Write boundary

All writes are strictly under `companion_repo_target/`.

### GC-02 — Required directories

`architecture/` must exist.

### GC-03 — Block integrity

- All required blocks exist or can be inserted.
- No malformed markers.

### GC-04 — Plan viability

Every required section produces at least one rendered item.

If any gate fails: emit an architecture doc feedback packet and stop.
