# Invariant taxonomy v1

This page explains the invariant structure CAF now uses across the human-readable catalogs and the machine-readable architecture-library sources.

## Canonical machine-readable sources

- [`../../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml`](../../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml) — target-system invariant catalog.
- [`../../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml`](../../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml) — CAF operational invariant catalog.
- [`../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml`](../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml) — machine-readable taxonomy for row types, activation kinds, references, tags, lineage, and audit-report fields.

## Core rule

CAF uses **one invariant model**, not a separate top-level pin catalog.

That means:

- **atomic invariants** are the main normalized target-system rows
- **option-branch invariants** are the adopted-shape rows
- **family summaries** explain the forest but are not the main counting unit
- **pins and options stay visible as references and classification tags inside invariant rows**

## Row types

- **Family summary** — architect-facing grouping surface.
- **Atomic invariant** — smallest independently meaningful target-system invariant row.
- **Option-branch invariant** — branch-specific truth that becomes binding once that branch is selected.
- **CAF operational invariant** — framework-side rule about carry-through, gating, derivation, or enforcement behavior.

## Reference and tag fields

### `classification_tags`

Lightweight labels that help readers and tools group a row without inventing a second competing taxonomy.

Typical tags include:

- `pin`
- `option`
- `adopted_shape`
- `tenancy`
- `identity`
- `policy`
- `runtime`
- `ui_binding`
- `integration`
- `storage`
- `evidence`

### `pin_reference_ids`

These name the architect-selectable pins or pin families that shape the invariant row.

Examples:

- `tenant_context.ingress_carrier`
- `platform.packaging`
- `planes.ap.runtime_shape`
- `policy.*`

### `option_reference_ids`

These name the relevant option surface.

Examples:

- option-set reference on an atomic row: `tenant_context.ingress_carrier`
- adopted-branch reference on an option row: `tenant_context.ingress_carrier=auth_claim`

## Activation kinds

- `always_on` — the invariant applies whenever the relevant surface exists.
- `always_on_plus_pin_declared` — the base truth is always on, and declared pins become part of intended shape.
- `always_on_plus_option_selected` — the base truth is always on, and option selection sharpens the realization posture.
- `pin_declared` / `pin_declared_plus_pin_value_activated` — the invariant depends on a declared pin and, sometimes, a specific selected value.
- `becomes_active_when_selected` — an option branch becomes a first-class invariant once that branch is adopted.
- `when_artifact_present`, `when_stage_active`, `when_capability_present`, `when_manifest_present`, `when_pin_equals` — CAF-operational activation kinds used for carry-through and audit rows.

## Counting rule

The target-system catalog counts:

- atomic invariants
- option-branch invariants

It does **not** count pins as a separate top-level row type, because pins stay inside invariant rows as references and tags.

That is why a row count and a pin count are not supposed to be the same number.

## Worked examples

### Example 1 — atomic invariant

`SHAPE-FAM-02-A2`

- row type: `atomic_invariant`
- statement: tenant context is bound once, immutable, explicit, and propagated end to end
- classification tags: `tenancy`, `tenant_context`, `boundary`, `pin`
- pin references: `tenancy.*`, `tenant_context.*`, `request_context.*`
- option references: none

This is the **main normalized unit**. It says something durable and architecturally meaningful even before a specific option branch is chosen.

### Example 2 — option-branch invariant

`SHAPE-OPT-001`

- row type: `option_branch_invariant`
- statement: verified auth claims are the authoritative ingress carrier for tenant context
- classification tags: `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`
- pin references: `tenant_context.ingress_carrier`
- option references: `tenant_context.ingress_carrier=auth_claim`

This is the **adopted-shape unit**. It becomes binding once that exact branch is selected.

### Example 3 — family summary

`SHAPE-FAM-02`

The family summary explains the broader truth about explicit multi-tenant isolation and tenant-context discipline. It is helpful for architects reading the forest, but the main normalized units underneath it are still the atomic and option-branch rows.

## Why machine-readable taxonomy matters for audits

Yes — the taxonomy should be machine-readable. Without that, every audit report has to rediscover the row model, activation semantics, references, and reporting fields from prose.

The YAML taxonomy exists so automated audit reports can normalize around stable fields such as:

- `invariant_id`
- `row_type`
- `statement`
- `activation_kind`
- `classification_tags`
- `pin_reference_ids`
- `option_reference_ids`
- `scope`
- `current_status`
- `posture`
- `defined_in`
- `checked_by`
- `evidence_surfaces`
- `lineage`
