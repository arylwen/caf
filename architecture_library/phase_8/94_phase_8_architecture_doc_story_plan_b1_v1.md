# Phase 8 Architecture Doc Story Plan B1 (v1)

## Status

Draft — Normative for Phase 8 architecture document generation.

---

## Purpose

Define a deterministic **story plan** that converts A1’s facts+edges into a
**progressive disclosure** narrative:

- master summary (stakeholder-friendly)
- deep-dives (constraints/assumptions + traceability)

B1 is the “organize the data” step:
- pick which edges to walk and in what order
- define sections as ordered **walks** over the graph
- enforce the “WHAT -> HOW” reading path mechanically

B1 MUST be fail-closed.

---

## Output

Write (generated):
- `<companion_repo_target>/caf/derived/arch_doc_story_plan_generated_v1.yaml`

---

## Inputs

B1 may read ONLY:
- `<companion_repo_target>/caf/derived/arch_doc_facts_inventory_generated_v1.yaml`

No other inputs are allowed.

---

## B1 schema (normative)

Top-level keys:

- `schema_version`: `arch_doc_story_plan_v1`
- `generated_at`: ISO-8601 timestamp
- `instance_name`: string
- `source_a1_fingerprint_sha256`: string
- `sections`: list of section objects

### Section object

- `section_id`: stable id, format `S-<doc>-<ordinal_2d>`
- `doc`: enum: `master`, `constraints`, `traceability`
- `title`: string
- `audiences`: list of enums:
  - `stakeholders`, `product`, `qa`, `ops`, `arch`, `dev`, `management`, `cfo`
- `walks`: list of walk objects

### Walk object

- `walk_id`: stable id, format `W-<ordinal_3d>`
- `intent`: enum:
  - `what_intent`
  - `how_realization`
  - `constraints_assumptions`
  - `trace_map`
- `start_fact_kinds`: list of fact kind enums
- `edge_kinds`: ordered list of edge kind enums (the walk path)
- `include_fact_kinds`: list of fact kind enums
- `exclude_fact_kinds`: list (optional)
- `render_hints`:
  - `max_items` (int)

---

## Mandatory sections (minimum)

B1 MUST define exactly these sections (order is fixed):

### Master doc

1) `WHAT: Architectural Intent (pinned)`
2) `TECH: Technology Posture (profile -> rails -> packs)`
3) `HOW: Realization Chain (intent -> ADR -> rails -> packs)`
4) `Constraints & Assumptions (ledger link)`
5) `Traceability Maps (link)`

### Constraints/assumptions deep dive

1) `Constraints ledger`
2) `Assumptions ledger`

### Traceability deep dive

1) `Intent -> ADR map`
2) `ADR -> Validation map`
3) `Tech Profile -> Policy/Packs map`
4) `ADR -> Policy/Packs map`

---

## Mechanical rule: WHAT -> HOW narrative

Gate B MUST verify:

- Master section (1) includes ONLY fact kinds:
  - `intent.*`

- Master section (2) (TECH posture) MUST include fact kinds:
  - `intent.profile_knob` (at minimum the `platform pins (infra_target/packaging/runtime_language/database_engine)` knob)
  - `how.policy_rail`
  - `how.candidate_enforcement_bar`
  AND MUST be constructed as a walk over HOW edges (no inference):
  The section MUST include at least one `how.adr` fact to anchor the walk.

- Master section (3) (HOW chain) MUST be constructed by walking these edge paths:
  The section MUST include at least one `how.adr` fact.

---

## Mechanical rule: No “used” claims without ADR

B1 is not allowed to generate story steps that imply “we used pattern/framework X” unless:
- the graph contains an `adr_to_pattern` edge supported by ADR evidence.

Gate B MUST verify:
- If `how.pattern_anchor` facts exist, they are reachable ONLY through `adr_to_pattern` edges.
- If no such facts exist, the narrative MUST use neutral language:
  - “Possible patterns” is forbidden.
  - Only “Declared references” is allowed.

---

## Gate B checks (fail-closed)

### GB-01 — A1 fingerprint match

The referenced A1 fingerprint exists and matches the A1 file.

### GB-02 — Section completeness

All mandatory sections exist, in order.

### GB-03 — Walk validity

Every walk:
- references existing fact kinds and edge kinds
- can produce at least one item (otherwise fail closed as “Missing mapping”)

### GB-04 — WHAT-first

The first master section must be WHAT-only (`intent.*`).

### GB-05 — No “used” claims without ADR

As defined above.

