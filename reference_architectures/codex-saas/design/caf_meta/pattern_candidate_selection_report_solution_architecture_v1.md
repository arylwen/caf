# Pattern candidate selection report (v1, CAF-managed; scripted)

- Instance: `codex-saas`
- Profile: `solution_architecture`
- View profile: max_candidates=30; reserve_slots=4

## Summary

- Selected candidates (system+app): **19** (HIGH=6, MEDIUM=13, LOW=0)
- Prefilter semantic subset size: **30**
- Graph open list size: **16** (graph-only=13)
- Integrated graph-only candidates: **1**

## Final Candidate Set (authoritative grounding from spec)

| pattern_id | grounding | source |
|---|---|---|
| CAF-AI-01 | HIGH | unknown |
| CAF-COMP-01 | HIGH | unknown |
| CAF-MTEN-01 | HIGH | retrieval |
| CAF-PLANE-01 | HIGH | retrieval |
| CAF-TCTX-01 | HIGH | retrieval |
| CTX-01 | HIGH | retrieval |
| CAF-AIOBS-01 | MEDIUM | unknown |
| CAF-COMP-02 | MEDIUM | unknown |
| CAF-IAM-02 | MEDIUM | retrieval |
| CAF-POL-01 | MEDIUM | retrieval |
| CAF-POL-02 | MEDIUM | retrieval |
| EXT-API_GATEWAY | MEDIUM | retrieval+graph |
| EXT-AUDITABILITY | MEDIUM | graph |
| EXT-BACKEND_FOR_FRONTEND_BFF | MEDIUM | retrieval+graph |
| EXT-CIRCUIT_BREAKER | MEDIUM | retrieval+graph |
| POL-01 | MEDIUM | retrieval |
| PST-01 | MEDIUM | retrieval |
| SVC-01 | MEDIUM | retrieval |
| VAL-01 | MEDIUM | retrieval |

## Graph Expansion Open List

- EXT-ANTI_CORRUPTION_LAYER - - not integrated
- EXT-API_COMPOSITION_AGGREGATOR - - not integrated
- EXT-AUDITABILITY - ✅ integrated
- EXT-BACKUP_PITR - - not integrated
- EXT-BLUE_GREEN_DEPLOY - - not integrated
- EXT-BULKHEAD_ISOLATION - - not integrated
- EXT-CACHE_ASIDE - - not integrated
- EXT-CANARY_RELEASE - - not integrated
- EXT-CHOREOGRAPHY - - not integrated
- EXT-CHUNKING_METADATA_ENRICHMENT - - not integrated
- EXT-COMPETING_CONSUMERS - - not integrated
- EXT-CONFIG_EXTERNALIZATION - - not integrated
- EXT-COST_ALLOCATION_CHARGEBACK - - not integrated

