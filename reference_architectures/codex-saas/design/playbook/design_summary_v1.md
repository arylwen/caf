# Design summary (v1, CAF-managed; scripted)

- Instance: `codex-saas`
- Adopted patterns source: `system_spec_v1.md` → `decision_resolutions_v1` (status: adopt)
- Retrieval surface: `architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl`

- Enrichment/promotions are deferred to planning (`/caf plan`). Planning artifacts:
  - `reference_architectures/codex-saas/design/playbook/pattern_obligations_v1.yaml`
  - `reference_architectures/codex-saas/design/playbook/task_graph_v1.yaml`

## Adopted patterns (status: adopt)

- Total: **14**

### Application plane

| pattern_id | plane | definition_path |
|---|---|---|
| PST-01 | application | architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml |

### Control plane

| pattern_id | plane | definition_path |
|---|---|---|
| CAF-AID-01 | control | architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml |
| CAF-IAM-01 | control | architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml |
| CAF-POL-01 | control | architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml |
| OBS-01 | control | architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml |
| POL-01 | control | architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml |

### Both planes

| pattern_id | plane | definition_path |
|---|---|---|
| CAF-AI-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml |
| CAF-COMP-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml |
| CAF-MTEN-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml |
| CAF-PLANE-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml |
| CAF-POL-02 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml |
| CAF-TCTX-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml |
| CAF-XPLANE-01 | both | architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml |
| CTX-01 | both | architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml |

---

_This file is script-owned. Do not edit by hand._

