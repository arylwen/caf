# Architect workflows

This doc provides the operational view for architects.

![CAF operating loop](../images/caf_operating_loop.svg)

*These workflows sit inside the same operating loop: declare intent, derive decisions, promote work, ask questions, and re-run the loop when the architecture changes.*

## Workflow A: new product / architecture intent

1. Seed an instance

   - `/caf saas <instance>`

2. Shape the lifecycle-ready architecture input

   - edit `product/PRD.md` and `product/PLATFORM_PRD.md` as needed
   - run `/caf prd <instance>`

3. Produce architecture scaffolding

   - `/caf arch <instance>`

4. Adopt and checkpoint the architectural state

   - review/adopt decision content in the playbooks
   - `/caf next <instance> apply`

5. Elaborate the next architecture phase, then plan

   - `/caf arch <instance>`
   - `/caf plan <instance>`

6. Size and sanity check

   - `/caf ask <work sizing question>`

## Workflow B: architect-curated first scaffold

Use this when you do not want the first scaffold to consume the PRD-promoted shape directly.

1. Seed an instance

   - `/caf saas <instance>`

2. Manually curate:

   - `spec/playbook/architecture_shape_parameters.yaml`

3. Mark the authoritative shape as lifecycle-ready:

    ```yaml
    meta:
      lifecycle_shape_status: "architect_curated"
    ```

4. Run the normal lifecycle from there:

   - `/caf arch <instance>`
   - adopt/checkpoint with `/caf next <instance> apply`
   - `/caf arch <instance>`
   - `/caf plan <instance>`

## Workflow C: decision change (pin/pattern/option)

1) Update pins / decisions in spec playbooks
2) Re-run `/caf arch <instance>`
3) Re-run `/caf plan <instance>` if obligations/tasks change
4) Use `/caf ask <impact question>` to get a fresh blast-radius view

## Workflow D: “what changed?” after regeneration

Use:

- `*traceability_mindmap_v3*.md`
- `pattern_candidate_selection_report_*_v1.md`
- obligation/task TSV indexes

To explain deltas without re-reading the whole playbook.
