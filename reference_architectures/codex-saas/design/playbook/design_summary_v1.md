# Design summary (v1, CAF-managed; scripted)

- Instance: `codex-saas`
- Adopted patterns source: `system_spec_v1.md` → `decision_resolutions_v1` (status: adopt)
- Retrieval surface: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`

- Enrichment/promotions are deferred to planning (`/caf plan`). Planning artifacts:
  - `reference_architectures/codex-saas/design/playbook/pattern_obligations_v1.yaml`
  - `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`

## Adopted patterns (status: adopt)

- Total: **20**

### Application plane

| pattern_id | plane | definition_path |
|---|---|---|
| EXT-BACKEND_FOR_FRONTEND_BFF | application | architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml |
| PST-01 | application | architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml |

### Control plane

| pattern_id | plane | definition_path |
|---|---|---|
| CAF-IAM-01 | control | architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml |
| CAF-IAM-GOV-04 | control | architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-04.yaml |
| CAF-POL-01 | control | architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml |
| EXT-API_GATEWAY | control | architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml |
| EXT-AUDITABILITY | control | architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml |

### Both planes

| pattern_id | plane | definition_path |
|---|---|---|
| CAF-AI-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml |
| CAF-AIOBS-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml |
| CAF-COH-02 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-COH-02.yaml |
| CAF-COMP-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml |
| CAF-COMP-02 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-02.yaml |
| CAF-MTEN-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml |
| CAF-MTEN-AGOBS-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-AGOBS-01.yaml |
| CAF-PLANE-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml |
| CAF-TCTX-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml |
| CAF-XPLANE-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml |
| CTX-01 | both | architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml |
| EXT-API_COMPOSITION_AGGREGATOR | both | architecture_library/patterns/external_v1/definitions_v1/ext-api_composition_aggregator.yaml |
| EXT-BULKHEAD_ISOLATION | both | architecture_library/patterns/external_v1/definitions_v1/ext-bulkhead_isolation.yaml |

---

_This file is script-owned. Do not edit by hand._

