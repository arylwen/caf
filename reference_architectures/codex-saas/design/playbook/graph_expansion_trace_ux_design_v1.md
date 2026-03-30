# CAF Graph Expansion Trace (deterministic) - ux_design

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
  - ux_v1
  - caf_v1
  - core_v1
  - external_v1
deny_namespaces:
  []
exclude_candidate_ids:
  - CAF-MODEL-01
```

## Seeds
- EXT-AUDITABILITY
- EXT-GRACEFUL_DEGRADATION
- EXT-SECURITY_TRIMMING
- UX-CRUD-01
- UX-DENSITY-01
- UX-EXPLAIN-01
- UX-RECOVERY-01
- UX-REVIEW-01
- UX-SEARCH-01
- UX-SESSION-01
- UX-VISUAL-01
- UX-WORKLIST-01

## Selected candidates (open list: top 16 of 102 reachable; desired_new_grounded=4)

- external_v1:EXT-MATERIALIZED_VIEW (hop=1, via=depends_on, from_seed=UX-SEARCH-01)
  - UX-SEARCH-01 -[depends_on]-> EXT-MATERIALIZED_VIEW
- caf_v1:CAF-ZT-01 (hop=1, via=depends_on, from_seed=UX-SESSION-01)
  - UX-SESSION-01 -[depends_on]-> CAF-ZT-01
- core_v1:SVC-01 (hop=1, via=depends_on, from_seed=UX-CRUD-01)
  - UX-CRUD-01 -[depends_on]-> SVC-01
- core_v1:VAL-01 (hop=1, via=depends_on, from_seed=UX-CRUD-01)
  - UX-CRUD-01 -[depends_on]-> VAL-01
- ux_v1:UX-ASYNC-01 (hop=1, via=complements, from_seed=UX-RECOVERY-01)
  - UX-RECOVERY-01 -[complements]-> UX-ASYNC-01
- ux_v1:UX-BULK-01 (hop=1, via=complements, from_seed=UX-RECOVERY-01)
  - UX-RECOVERY-01 -[complements]-> UX-BULK-01
- ux_v1:UX-REPORT-01 (hop=1, via=complements, from_seed=UX-VISUAL-01)
  - UX-VISUAL-01 -[complements]-> UX-REPORT-01
- ux_v1:UX-WIZARD-01 (hop=1, via=complements, from_seed=UX-CRUD-01)
  - UX-CRUD-01 -[complements]-> UX-WIZARD-01
- external_v1:EXT-BACKEND_FOR_FRONTEND_BFF (hop=1, via=complements, from_seed=UX-SESSION-01)
  - UX-SESSION-01 -[complements]-> EXT-BACKEND_FOR_FRONTEND_BFF
- core_v1:CFG-01 (hop=1, via=complements, from_seed=EXT-AUDITABILITY)
  - EXT-AUDITABILITY -[complements]-> CFG-01
- external_v1:EXT-QUEUE_BASED_LOAD_LEVELING (hop=2, via=depends_on, from_seed=UX-RECOVERY-01)
  - UX-RECOVERY-01 -[complements]-> UX-ASYNC-01
  - UX-ASYNC-01 -[depends_on]-> EXT-QUEUE_BASED_LOAD_LEVELING
- external_v1:EXT-RATE_LIMITING_QUOTAS (hop=2, via=depends_on, from_seed=UX-RECOVERY-01)
  - UX-RECOVERY-01 -[complements]-> UX-BULK-01
  - UX-BULK-01 -[depends_on]-> EXT-RATE_LIMITING_QUOTAS
- caf_v1:CAF-IAM-02 (hop=2, via=depends_on, from_seed=UX-SESSION-01)
  - UX-SESSION-01 -[depends_on]-> CAF-ZT-01
  - CAF-ZT-01 -[depends_on]-> CAF-IAM-02
- external_v1:EXT-ANTI_CORRUPTION_LAYER (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
  - EXT-AUDITABILITY -[complements]-> CFG-01
  - CFG-01 -[complements]-> EXT-ANTI_CORRUPTION_LAYER
- external_v1:EXT-API_COMPOSITION_AGGREGATOR (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
  - EXT-AUDITABILITY -[complements]-> CTX-01
  - CTX-01 -[complements]-> EXT-API_COMPOSITION_AGGREGATOR
- external_v1:EXT-API_GATEWAY (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
  - EXT-AUDITABILITY -[complements]-> CFG-01
  - CFG-01 -[complements]-> EXT-API_GATEWAY

## Not selected (reachable but beyond reserve_slots)
- external_v1:EXT-BACKUP_PITR (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-BLUE_GREEN_DEPLOY (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-BULKHEAD_ISOLATION (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CACHE_ASIDE (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CANARY_RELEASE (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CHOREOGRAPHY (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CHUNKING_METADATA_ENRICHMENT (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CIRCUIT_BREAKER (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-COMPETING_CONSUMERS (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CONFIG_EXTERNALIZATION (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-COST_ALLOCATION_CHARGEBACK (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-CQRS (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-DEAD_LETTER_QUEUE_DLQ (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-DEFENSE_IN_DEPTH (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-DISTRIBUTED_TRACING (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-EDGE_GATEWAY (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-EVENT_DRIVEN_ARCHITECTURE (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-FEATURE_FLAGS (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-GOLDEN_PATH_TEMPLATES (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-GUARDRAILS_SAFETY_FILTERS (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-HYBRID_RETRIEVAL (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-IDEMPOTENCY (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-IMMUTABLE_INFRASTRUCTURE (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-KUBERNETES_PLATFORM (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- external_v1:EXT-LANDING_ZONE (hop=2, via=complements, from_seed=EXT-AUDITABILITY)
- ... (61 more)