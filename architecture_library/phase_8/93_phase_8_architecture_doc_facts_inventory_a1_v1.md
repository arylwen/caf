# Phase 8 Architecture Doc Facts Inventory A1 (v1)

## Status

Draft — Normative for Phase 8 architecture document generation.

---

## Purpose

Define a deterministic **facts inventory** produced by CAF for architecture docs.

A1 is the “gather data” step:
- collect grounded facts from CAF instance inputs/derived views
- normalize them into a stable schema
- emit edges so downstream steps can walk **WHAT -> HOW** without inventing

A1 MUST be fail-closed.

---

## Output

Write (generated):
- `<companion_repo_target>/caf/derived/arch_doc_facts_inventory_generated_v1.yaml`

A1 is CAF-owned and MUST be cache-aware:
- If the generated file already exists and the `source_manifest` fingerprints are unchanged, CAF MUST reuse the existing file without rewriting it (do not touch timestamps).
- If any allowed source fingerprint changes, CAF MUST update the file (it may rewrite the full file as long as IDs remain deterministic).

---

## Allowed sources (hard rule)

A1 may read ONLY:

From companion repo grounding copies:
- `<companion_repo_target>/caf/profile_parameters_resolved.yaml`
- `<companion_repo_target>/caf/architecture_shape_parameters.yaml`
- `<companion_repo_target>/caf/inputs/guardrails_profile_parameters.yaml`
- `<companion_repo_target>/caf/inputs/layer_7_adr_index.md`
- `<companion_repo_target>/caf/inputs/layer_7_validation_mapping.md`

From the CAF instance (reference_architectures):
- `reference_architectures/<name>/layer_7/adrs/ADR-*.md` (full ADR bodies)

Reference-only standards (read-only grounding, no inference):
- `architecture_library/07_contura_parameterized_architecture_templates_v1.md`
- `architecture_library/40_contura_adr_standard_v1.md`
- `architecture_library/phase_8/90_phase_8_profile_derivation_policy_matrix_v1.yaml`
- (optional) `architecture_library/phase_8/pattern_anchor_registry_v1.yaml` (only if a referenced pattern_id exists)

If additional facts are needed, emit a feedback packet; do not expand sources.

---

## A1 schema (normative)

Top-level keys:

- `schema_version`: `arch_doc_facts_inventory_v1`
- `generated_at`: ISO-8601 timestamp
- `instance_name`: string
- `profile_version`: string (copied from resolved profile)
- `companion_repo_target`: string (copied)
- `source_manifest`: list of source file entries
- `facts`: list of fact objects
- `edges`: list of edge objects

### `source_manifest` entry

- `path`: repo-relative path
- `kind`: one of `yaml`, `markdown`, `catalog_yaml`
- `fingerprint_sha256`: hex string

### Fact object

- `fact_id`: stable id, format `F-<kind>-<ordinal_4d>`
- `kind`: enum (see below)
- `title`: short human label
- `statement`: single sentence, grounded and non-speculative
- `source`: 
  - `path`
  - `locator`
- `attrs`: mapping (kind-specific, always scalar values)

### Edge object

- `edge_id`: stable id, format `E-<edge_kind>-<ordinal_4d>`
- `edge_kind`: enum (see below)
- `from_fact_id`
- `to_fact_id`
- `evidence`: 
  - `path`
  - `locator`

---

## Fact kinds (minimum required)

### WHAT (intent)

- `intent.template_instance`
  - attrs: `template_id`, `template_version`
- `intent.pinned_parameter`
  - attrs: `template_id`, `param_id`, `pinned_value`
- `intent.pin_definition_excerpt`
  - attrs: `template_id`, `param_id`, `excerpt_path`, `excerpt_locator`
  - statement MUST be a short excerpt reference, not a paraphrase
- `intent.profile_knob`
  - attrs: `knob_path`, `value`
- `intent.constraint`
  - attrs: `scope` (e.g., `lifecycle_rails`, `write_paths`, `candidate_bar`)
- `intent.assumption`
  - attrs: `scope`

### HOW (realization)

- `how.adr`
  - attrs: `adr_id`, `adr_title`, `status` (if present)
- `how.adr_claim`
  - attrs: `claim_kind` (e.g., `decision`, `rationale`, `consequence`)
- `how.validation_anchor`
  - attrs: `anchor_kind` (e.g., `checklist_row`, `evidence_expectation`)
- `how.policy_rail`
  - attrs: `rail_kind` (e.g., `forbidden_action`, `allowed_write_path`, `allowed_artifact_class`)
- `how.candidate_enforcement_bar`
  - attrs: `bar_id`
- `how.pattern_anchor`
  - attrs: `pattern_id`

Notes:
- Additional fact kinds MAY be added only by updating this standard.

---

## Edge kinds (minimum required)

- `intent_supports_intent` (within intent layer)
- `intent_to_adr` (WHAT -> ADR)
- `adr_to_validation` (ADR -> validation anchor)
- `adr_to_policy` (ADR -> derived rail/policy)
- `adr_to_pattern` (ADR declares a pattern reference)

---

## Gate A checks (fail-closed)

### GA-01 — Required source set present

All required sources exist and hash.

### GA-02 — Parse correctness

- YAML sources parse as mappings
- ADR markdown files parse enough to identify:
  - title
  - id (from filename)
  - section headings (at least H2)

If ADR structure is incompatible with `40_contura_adr_standard_v1.md`, emit Spec inconsistency.

### GA-03 — No placeholder content

Fail if any extracted pinned value contains:
- empty string
- placeholder tokens such as `TODO` or `UNKNOWN` (case-insensitive)
- `{{...}}` or `<...>`

### GA-04 — Fact grounding

Every fact MUST point to at least one concrete source locator.

### GA-05 — Edge grounding

Every edge MUST cite evidence in an ADR OR in a derived YAML field.

### GA-06 — No “used” claims without ADR evidence

A1 MUST NOT create any fact implying adoption/usage of a pattern/framework unless:
- a specific ADR explicitly declares that reference

Mechanically: `how.pattern_anchor` facts may be created ONLY when an ADR contains an explicit `Pattern Anchors` section (exact heading) listing `pattern_id` values.

### GA-07 — Pattern id resolution (optional)

If any `how.pattern_anchor.attrs.pattern_id` exists, then:
- `architecture_library/phase_8/pattern_anchor_registry_v1.yaml` MUST exist
- every referenced `pattern_id` MUST resolve to exactly one registry entry

If not, fail-closed (Missing mapping / Spec inconsistency).

### GA-08 — Minimum coverage (no empty stories)

A1 MUST include at least:

- 1+ `intent.template_instance`
- 1+ `intent.pinned_parameter`
- 3+ `intent.profile_knob` (the three knobs)
- 1+ `how.adr`
- 1+ `how.policy_rail`
- 1+ `how.candidate_enforcement_bar`

If any of the above cannot be produced from the allowed sources, fail-closed as Missing input or Missing mapping.

---

## Deterministic extraction rules (summary)

### Required extraction (mechanical)

From pinned architecture shape (`architecture_shape_parameters.yaml`):

1) For each entry in `template_instances` (in list order):
   - emit one `intent.template_instance`
   - emit one `intent.pinned_parameter` for each pinned parameter

2) For each pinned parameter id, extract the parameter definition heading from:
   - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

   Then emit one `intent.pin_definition_excerpt` referencing that heading.

From pinned profile parameters (`guardrails_profile_parameters.yaml`):

3) Emit exactly three `intent.profile_knob` facts:
   - `lifecycle.evolution_stage`
   - `lifecycle.generation_phase`
   - `platform pins (infra_target/packaging/runtime_language/database_engine)`

From resolved profile (`caf/profile_parameters_resolved.yaml`):

4) For each derived rail value:
   - `lifecycle.allowed_artifact_classes[]`
   - `lifecycle.allowed_write_paths[]`
   - `lifecycle.forbidden_actions[]`
   emit one `how.policy_rail` fact.


6) Emit exactly one `how.candidate_enforcement_bar` fact from:
   - `candidate_enforcement_bar.bar_id`

From Layer 7 ADRs:

7) For each ADR listed in `adr_index.md`, emit one `how.adr` fact.
   - If the ADR cannot be found on disk, fail-closed (Missing input).

8) If the ADR contains a section heading exactly `## Pattern Anchors`:
   - parse each bullet as a `pattern_id`
   - emit `how.pattern_anchor` facts and `adr_to_pattern` edges

From Layer 7 validation mapping:

9) For each row in `validation_mapping.md`, emit `how.validation_anchor` facts with evidence locators.

- Preserve the instance’s ordering when enumerating template instances.
- For pinned parameters, order by template instance list order, then ascending parameter id.
- ADR order is taken from `layer_7/adrs/adr_index.md`.
- Do not infer relationships that are not explicitly declared.

