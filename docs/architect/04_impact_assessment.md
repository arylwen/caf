# Change impact: if we change X, what does it affect?

This doc targets question (3): **“If we change X, what features / architectural intent does it impact?”**

CAF’s impact story is traceability-first:

- changes affect **pins / decisions / patterns**
- which affect **obligations**
- which affect **capabilities + tasks**
- which affect **artifacts**

## Primary UX surface

- `/caf ask <question about impact / blast radius / risk>`
  - intent: `impact_assessment`
  - context pack: `reference_architectures/<instance>/design/caf_meta/ask_context_v1.md` (preferred)

## The deterministic impact toolbox

### 1) Traceability mindmap

- `spec/caf_meta/spec_traceability_mindmap_v3.md`
- `design/caf_meta/plan_traceability_mindmap_v3.md`

This is the “pins/atoms → patterns” map built from grounded evidence.

### 2) Obligation + task indexes (blast radius surface)

- `design/playbook/pattern_obligations_index_v1.tsv`
- `design/playbook/task_graph_index_v1.tsv`

These are the fastest way to answer “what work is downstream?” without re-reading YAML.

## A stable workflow for impact questions

1) Classify the change type:
   - pin / profile parameter change
   - decision option change
   - pattern adoption/defer/reject change
   - implementation-only change (code)

2) Find the nearest upstream object:
   - pins/atoms → patterns (mindmap)
   - patterns → obligations (obligations index)
   - obligations → capabilities/tasks (task index)

3) Describe impact in CAF terms:
   - “Decision delta” (what changed)
   - “Obligation delta” (what new requirements appear/disappear)
   - “Task delta” (what execution units appear/disappear)

4) Re-run the relevant phase command when the change is upstream:
   - `/caf arch` for pin/pattern/decision changes
   - `/caf plan` for obligation/task planning changes

## Checklist

- [ ] Use the mindmap for upstream mapping (pins/atoms → patterns)
- [ ] Use TSV indexes for downstream mapping (patterns → obligations → tasks)
- [ ] Summarize deltas; avoid invented dependencies
- [ ] If in doubt, re-run `/caf ask` after regeneration to get a fresh context pack
