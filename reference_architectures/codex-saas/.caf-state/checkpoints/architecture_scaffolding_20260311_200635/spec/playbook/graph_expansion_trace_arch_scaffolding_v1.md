# CAF Graph Expansion Trace (deterministic) - arch_scaffolding

Instance: codex-saas
Surface: architecture_library/patterns/retrieval_surface_v1/pattern_graph_surface_v1.jsonl
Excluded candidate ids: CAF-MODEL-01

## Config
```yaml
enabled: true
max_hops: 2
reserve_slots: 4
oversample_factor: 4
open_list_target: 16
relation_kinds:
  - depends_on
  - refines
  - complements
  - alternative_to
include_namespaces:
  - caf_v1
  - core_v1
deny_namespaces:
  - external_v1
exclude_candidate_ids:
  - CAF-MODEL-01
```

## Suppressed by deny_namespaces
```yaml
by_namespace:
  caf_v1: 45
  external_v1: 294
examples:
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: caf_v1
    id: CAF-MODEL-01
    reason: excluded_candidate_id
  -
    namespace: external_v1
    id: EXT-ANTI_CORRUPTION_LAYER
    reason: denied_namespace
  -
    namespace: external_v1
    id: EXT-API_COMPOSITION_AGGREGATOR
    reason: denied_namespace
  -
    namespace: external_v1
    id: EXT-API_GATEWAY
    reason: denied_namespace
  -
    namespace: external_v1
    id: EXT-AUDITABILITY
    reason: denied_namespace
  -
    namespace: external_v1
    id: EXT-BACKEND_FOR_FRONTEND_BFF
    reason: denied_namespace
```

## Seeds
- CAF-AI-01
- CAF-AID-01
- CAF-COMP-01
- CAF-IAM-01
- CAF-IAM-02
- CAF-MTEN-01
- CAF-PLANE-01
- CAF-POL-01
- CAF-POL-02
- CAF-TCTX-01
- CAF-XPLANE-01
- CTX-01
- PST-01

## Selected candidates (open list: top 16 of 108 reachable; desired_new_grounded=4)

- core_v1:OBS-01 (hop=1, via=depends_on, from_seed=CAF-AI-01)
  - CAF-AI-01 -[depends_on]-> OBS-01
- core_v1:CFG-01 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CFG-01
- core_v1:CMP-01 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CMP-01
- core_v1:INT-01 (hop=1, via=complements, from_seed=PST-01)
  - PST-01 -[complements]-> INT-01
- core_v1:POL-01 (hop=1, via=complements, from_seed=CAF-COMP-01)
  - CAF-COMP-01 -[complements]-> POL-01
- core_v1:SVC-01 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> SVC-01
- caf_v1:CAF-COH-01 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CAF-COH-01
- caf_v1:CAF-COH-02 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CAF-COH-02
- caf_v1:CAF-COMP-02 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CAF-COMP-02
- caf_v1:CAF-EDGE-01 (hop=1, via=complements, from_seed=CAF-POL-01)
  - CAF-POL-01 -[complements]-> CAF-EDGE-01
- caf_v1:CAF-IAM-GOV-04 (hop=1, via=complements, from_seed=CAF-POL-02)
  - CAF-POL-02 -[complements]-> CAF-IAM-GOV-04
- caf_v1:CAF-MRAD-06 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CAF-MRAD-06
- caf_v1:CAF-MTEN-AGOBS-01 (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> CAF-MTEN-AGOBS-01
- caf_v1:CAF-MTEN-ANTI-01 (hop=1, via=complements, from_seed=PST-01)
  - PST-01 -[complements]-> CAF-MTEN-ANTI-01
- caf_v1:CAF-MTEN-ANTI-02 (hop=1, via=complements, from_seed=PST-01)
  - PST-01 -[complements]-> CAF-MTEN-ANTI-02
- caf_v1:CAF-MTEN-ANTI-03 (hop=1, via=complements, from_seed=PST-01)
  - PST-01 -[complements]-> CAF-MTEN-ANTI-03

## Not selected (reachable but beyond reserve_slots)
- caf_v1:CAF-MTEN-ANTI-04 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ANTI-05 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ANTI-06 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ANTI-07 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ANTI-08 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-AUD-01 (hop=1, via=complements, from_seed=CTX-01)
- caf_v1:CAF-MTEN-COST-01 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-COST-02 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-COST-03 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-COST-04 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-COST-05 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-CTX-01 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-CTX-02 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-CTX-03 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-CTX-04 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-01 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-02 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-03 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-04 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-05 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-06 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-07 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-08 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-09 (hop=1, via=complements, from_seed=PST-01)
- caf_v1:CAF-MTEN-ENT-10 (hop=1, via=complements, from_seed=PST-01)
- ... (67 more)