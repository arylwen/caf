# Reference map (questions → intents → artifacts)

This page is a compact reference for architects.

## Q1: “What decisions did we make, and why?”

- `/caf ask ...` → `decision_visibility`
- Primary artifacts:
  - `spec/playbook/application_spec_v1.md`
  - `spec/playbook/system_spec_v1.md`
  - `spec|design/caf_meta/pattern_candidate_selection_report_*_v1.md`
  - `*traceability_mindmap_v3*.md`

## Q2: “How big is the work?”

- `/caf ask ...` → `work_visibility`
- Primary artifacts:
  - `design/playbook/pattern_obligations_index_v1.tsv`
  - `design/playbook/task_graph_index_v1.tsv`
  - `design/playbook/task_plan_v1.md`

## Q3: “If we change X, what does it impact?”

- `/caf ask ...` → `impact_assessment`
- Primary artifacts:
  - `*traceability_mindmap_v3*.md`
  - `design/playbook/pattern_obligations_index_v1.tsv`
  - `design/playbook/task_graph_index_v1.tsv`

## “No artifacts found” failure mode

If `/caf ask` can’t build a context pack, it will tell you what phase artifact is missing.

Typical fix:

- for a fresh instance, run `/caf prd <instance>` and then `/caf arch <instance>` to create the lifecycle-ready shape and decision artifacts
- if decision artifacts are missing after the shape is ready, run `/caf arch <instance>`
- if work or impact artifacts are missing, run `/caf plan <instance>`
