# CAF Graph Expansion Trace (deterministic) - solution_architecture

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
  - external_v1
deny_namespaces:
  []
exclude_candidate_ids:
  - CAF-MODEL-01
```

## Seeds
- CAF-AI-01
- CAF-AIOBS-01
- CAF-COMP-01
- CAF-COMP-02
- CAF-IAM-02
- CAF-MTEN-01
- CAF-PLANE-01
- CAF-POL-01
- CAF-POL-02
- CAF-TCTX-01
- CTX-01
- POL-01
- PST-01
- SVC-01
- VAL-01

## Selected candidates (open list: top 16 of 174 reachable; desired_new_grounded=4)

- external_v1:EXT-ANTI_CORRUPTION_LAYER (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-ANTI_CORRUPTION_LAYER
- external_v1:EXT-API_COMPOSITION_AGGREGATOR (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-API_COMPOSITION_AGGREGATOR
- external_v1:EXT-API_GATEWAY (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-API_GATEWAY
- external_v1:EXT-AUDITABILITY (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-AUDITABILITY
- external_v1:EXT-BACKEND_FOR_FRONTEND_BFF (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-BACKEND_FOR_FRONTEND_BFF
- external_v1:EXT-BACKUP_PITR (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-BACKUP_PITR
- external_v1:EXT-BLUE_GREEN_DEPLOY (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-BLUE_GREEN_DEPLOY
- external_v1:EXT-BULKHEAD_ISOLATION (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-BULKHEAD_ISOLATION
- external_v1:EXT-CACHE_ASIDE (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-CACHE_ASIDE
- external_v1:EXT-CANARY_RELEASE (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-CANARY_RELEASE
- external_v1:EXT-CHOREOGRAPHY (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-CHOREOGRAPHY
- external_v1:EXT-CHUNKING_METADATA_ENRICHMENT (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-CHUNKING_METADATA_ENRICHMENT
- external_v1:EXT-CIRCUIT_BREAKER (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-CIRCUIT_BREAKER
- external_v1:EXT-COMPETING_CONSUMERS (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-COMPETING_CONSUMERS
- external_v1:EXT-CONFIG_EXTERNALIZATION (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-CONFIG_EXTERNALIZATION
- external_v1:EXT-COST_ALLOCATION_CHARGEBACK (hop=1, via=complements, from_seed=CTX-01)
  - CTX-01 -[complements]-> EXT-COST_ALLOCATION_CHARGEBACK

## Not selected (reachable but beyond reserve_slots)
- external_v1:EXT-CQRS (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-DEAD_LETTER_QUEUE_DLQ (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-DEFENSE_IN_DEPTH (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-DISTRIBUTED_TRACING (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-EDGE_GATEWAY (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-EVENT_DRIVEN_ARCHITECTURE (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-FEATURE_FLAGS (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-GOLDEN_PATH_TEMPLATES (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-GRACEFUL_DEGRADATION (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-GUARDRAILS_SAFETY_FILTERS (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-HYBRID_RETRIEVAL (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-IDEMPOTENCY (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-IMMUTABLE_INFRASTRUCTURE (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-KUBERNETES_PLATFORM (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-LANDING_ZONE (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-LEAST_PRIVILEGE_RBAC_IAM (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-MANAGED_CONTAINERS (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-MATERIALIZED_VIEW (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-MULTI_ENV_PROMOTION (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-MULTI_REGION_ACTIVE_ACTIVE (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-MULTI_REGION_ACTIVE_PASSIVE (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-OBSERVABILITY_3_PILLARS (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-ORCHESTRATION (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-OUTBOX_PATTERN (hop=1, via=complements, from_seed=CTX-01)
- external_v1:EXT-POLICY_AS_CODE_GUARDRAILS (hop=1, via=complements, from_seed=CTX-01)
- ... (133 more)