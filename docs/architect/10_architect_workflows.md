# Architect workflows

This doc provides the operational view for architects.

![CAF operating loop](../images/caf_operating_loop.svg)

*These workflows sit inside the same operating loop: declare intent, derive decisions, promote work, ask questions, and re-run the loop when the architecture changes.*

After the first build, the same operating loop still applies. CAF should use **continuous re-derivation**: refresh current intent and adopted architecture first, then decide whether the safe posture is non-destructive evolution, regeneration, or an explicit modernization/rebase decision.

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

   Treat the later architecture step as a real handoff into planning: rely on the main design docs, contract declarations, normalized domain-model YAML views, and any CAF-managed planning bridge surfaces, while summaries/debug sidecars remain supporting context.

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

## Workflow B1: limited-PRD fallback using architecture pins + domain-model sources

Use this when a detailed PRD is not yet available but you still need a meaningful first scaffold.

1. Seed an instance

   - `/caf saas <instance>`

2. Curate the authoritative shape directly

   - edit `spec/playbook/architecture_shape_parameters.yaml`
   - set:

    ```yaml
    meta:
      lifecycle_shape_status: "architect_curated"
    ```

3. Provide enough domain-model source material for the scaffold to have real semantic anchors

   - review and enrich the relevant spec-side domain-model source docs after the first scaffold seeds them
   - keep this path explicit: you are substituting architect curation for missing PRD-derived prose, not creating a new default lifecycle

4. Run the lifecycle from there

   - `/caf arch <instance>`
   - review/adopt decision content
   - `/caf next <instance> apply`
   - `/caf arch <instance>`
   - `/caf plan <instance>`

## Workflow C: contract-preserving product or decision change

Use this when the product changes but the current structure contract still stands.

1. Update the highest-authority source that actually changed

   - product wording / architecture-shape-driving intent -> update `product/PRD.md` and/or `product/PLATFORM_PRD.md`
   - adopted architecture decision -> update the relevant spec/design playbook decision content

2. Re-run from the highest affected semantic stage

   - `/caf prd <instance>` when the product intent changed materially
   - the first `/caf arch <instance>` when spec-side architecture decisions or plane boundaries changed materially
   - `/caf next <instance> apply` when adopted spec decisions changed and downstream phases need a fresh checkpoint
   - the second `/caf arch <instance>` when the design bundle needs refresh from adopted state
   - `/caf plan <instance>` when obligations or task structure may change
   - `/caf build <instance>` only when a refreshed implementation candidate is actually needed

3. Keep the default posture non-destructive

   - do not assume broad restructure;
   - do not silently re-scaffold an existing standalone repo;
   - use `/caf ask <impact question>` to get a fresh blast-radius view before committing to wider downstream reruns.

## Workflow D: standalone-repo evolution with alignment still intact

Use this when the companion repo or another standalone repo is now the running product, but it still resembles the intended CAF structure closely enough for safe automation.

1. Evaluate drift / alignment first
2. If the repo is still aligned enough for safe automation, use the same rerun ladder as Workflow C
3. Treat the repo as **non-destructive by default**

   - no hidden renames/moves/restructure;
   - no quiet architecture reset;
   - no new structure contract implied by generation alone.

4. If the requested change crosses a structure boundary, stop and escalate to Workflow E or F

## Workflow E: regeneration / re-scaffold boundary

Use this when a fresh bounded derivative is the right answer.

Typical fit:

- new sandbox instance;
- low-history companion repo;
- explicit re-scaffold decision;
- architecture reset where continuity with the old structure is not the main promise.

Default posture:

1. Re-derive from the current source surfaces
2. Generate the fresh bounded derivative deliberately
3. Do not pretend the result is routine maintenance of the existing repo structure

## Workflow F: modernization / rebase decision

Use this when the running product matters, but the current repo no longer matches the intended structure closely enough for safe routine evolution.

Typical fit:

- meaningful drift in a standalone repo;
- service extraction or boundary surgery;
- cases where a full rewrite is too risky, but ordinary patching is no longer trustworthy.

Default posture:

1. Stop treating the next step as routine generation
2. Require an explicit architect decision on the target boundary to change
3. Treat the work as modernization / rebase rather than ordinary `/caf build` continuation

## Workflow G: “what changed?” after rerun or regeneration

Use:

- `*traceability_mindmap_v3*.md`
- `pattern_candidate_selection_report_*_v1.md`
- obligation/task TSV indexes

To explain deltas without re-reading the whole playbook.


## Find out more

[PRD-first lifecycle](../user/15_prd_first_lifecycle.md) — Cross-check these workflows against the default lifecycle language.

## You might also be interested in

- [Mental model](01_mental_model.md) — Re-anchor on the traceability model behind the workflows.
- [PRD → Architecture Shape](../user/12_prd_workflow.md) — Review the promotion step that now drives the first architecture scaffold.
- [Impact assessment](04_impact_assessment.md) — Use `/caf ask` to evaluate the blast radius after a workflow change.
