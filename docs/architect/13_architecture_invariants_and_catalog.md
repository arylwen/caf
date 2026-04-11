# Architecture invariants and catalog

Architecture is not only about components and diagrams. It is also about the truths a system needs to keep intact while people and agents keep changing it.

CAF now exposes three linked surfaces for that work:

1. a short human entry point
2. a full human-readable catalog
3. machine-readable catalog and taxonomy files in the architecture library

## 1. Target system invariants

These are truths about the system you are building.

Read the full catalog here:
- [Target system invariant catalog v1](invariants/target_system_invariant_catalog_v1.md)

Machine-readable source:
- [`../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml`](../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml)

## 2. CAF operational invariants

These are truths about how CAF itself behaves while it carries architecture forward.

Read the full catalog here:
- [CAF operational invariant catalog v1](invariants/caf_operational_invariant_catalog_v1.md)

Machine-readable source:
- [`../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml`](../../architecture_library/17_contura_caf_operational_invariant_catalog_v1.yaml)

## 3. Shared taxonomy

The taxonomy explains row types, activation kinds, lineage, and audit fields.

Read it here:
- [Invariant taxonomy v1](invariants/invariant_taxonomy_v1.md)

Machine-readable source:
- [`../../architecture_library/18_contura_invariant_taxonomy_v1.yaml`](../../architecture_library/18_contura_invariant_taxonomy_v1.yaml)

## Start with the short version

If you want the fastest introduction, start here:
- [Twenty invariants architects use every day](invariants/20_invariants_architects_use_every_day.md)
