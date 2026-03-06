# Pattern candidate selection report (v1, CAF-managed; scripted)

- Instance: `codex-saas`
- Profile: `solution_architecture`
- View profile: max_candidates=30; reserve_slots=4

## Summary

- Selected candidates (system+app): **19** (HIGH=10, MEDIUM=9, LOW=0)
- Prefilter semantic subset size: **30**
- Graph open list size: **16** (graph-only=13)
- Integrated graph-only candidates: **2**

## Final Candidate Set (authoritative grounding from spec)

| pattern_id | grounding | source |
|---|---|---|
| CAF-AI-01 | HIGH | unknown |
| CAF-IAM-02 | HIGH | retrieval |
| CAF-MTEN-01 | HIGH | retrieval |
| CAF-PLANE-01 | HIGH | retrieval |
| CAF-TCTX-01 | HIGH | retrieval |
| CAF-XPLANE-01 | HIGH | retrieval |
| CTX-01 | HIGH | retrieval |
| OBS-01 | HIGH | retrieval |
| POL-01 | HIGH | retrieval |
| VAL-01 | HIGH | retrieval |
| CAF-EDGE-01 | MEDIUM | unknown |
| CAF-IAM-01 | MEDIUM | retrieval |
| CAF-MTEN-AGOBS-01 | MEDIUM | unknown |
| CAF-MTEN-ANTI-01 | MEDIUM | unknown |
| EXT-API_COMPOSITION_AGGREGATOR | MEDIUM | graph |
| EXT-API_GATEWAY | MEDIUM | retrieval+graph |
| EXT-AUDITABILITY | MEDIUM | graph |
| EXT-BACKEND_FOR_FRONTEND_BFF | MEDIUM | retrieval+graph |
| PST-01 | MEDIUM | retrieval |

## Graph Expansion Open List

- EXT-ANTI_CORRUPTION_LAYER - - not integrated
- EXT-API_COMPOSITION_AGGREGATOR - ✅ integrated
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

