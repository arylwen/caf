# Architect workflows

This doc provides the “operational” view for architects.

## Workflow A: new product / architecture intent

1) Seed an instance
- `/caf saas <instance>`

2) Produce architecture
- `/caf arch <instance>`

3) Promote planning outputs
- `/caf next <instance> apply=true`
- `/caf plan <instance>`

4) Size and sanity check
- `/caf ask <work sizing question>`

## Workflow B: decision change (pin/pattern/option)

1) Update pins / decisions in spec playbooks
2) Re-run `/caf arch <instance>`
3) Re-run `/caf plan <instance>` if obligations/tasks change
4) Use `/caf ask <impact question>` to get a fresh blast radius view

## Workflow C: “what changed?” after regeneration

Use:

- `*traceability_mindmap_v3*.md`
- `pattern_candidate_selection_report_*_v1.md`
- obligation/task TSV indexes

to explain deltas without re-reading the whole playbook.
