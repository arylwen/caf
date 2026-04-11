# CAF invariants

A good architecture is full of truths people protect almost without thinking.

Tenant boundaries should not blur. Context should not be guessed. Trust should be earned at the boundary. Protected operations should not slip around policy. Audit trails should survive handoffs and failure paths. Agents should be governed instead of treated like magic.

CAF tries to make that discipline intentional.

## Start here

- [Twenty invariants architects use every day](20_invariants_architects_use_every_day.md) — the quickest way to see the kinds of truths CAF is designed to protect.
- [Target system invariant catalog](target_system_invariant_catalog_v1.md) — the full catalog of system-shape invariants the generated system is supposed to keep true, including option-branch rows.
- [CAF operational invariant catalog](caf_operational_invariant_catalog_v1.md) — the framework-side invariant catalog for carry-through, derivation, gates, and enforcement posture.
- [Invariant taxonomy](invariant_taxonomy_v1.md) — the row model and activation taxonomy behind the catalogs.

## Machine-readable sources

- [`../../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml`](../../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml)
- [`../../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml`](../../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml)
- [`../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml`](../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml)

Pins and options stay visible as references and lightweight tags inside invariant rows. They are not modeled here as a separate competing top-level catalog.

## Two kinds of invariants

### 1. Target system invariants

These describe the system you are trying to build.

### 2. CAF operational invariants

These describe how CAF itself behaves while it is carrying architecture forward.

## Recommended reading order

1. [Twenty invariants architects use every day](20_invariants_architects_use_every_day.md)
2. [Target system invariant catalog](target_system_invariant_catalog_v1.md)
3. [CAF operational invariant catalog](caf_operational_invariant_catalog_v1.md)
4. [Invariant taxonomy](invariant_taxonomy_v1.md)
