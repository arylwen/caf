# CAF lifecycle state machine

This diagram captures the default CAF command-flow lifecycle as states and transitions.

Use it when you need to reason about:

- what `/caf saas` actually seeds
- where `/caf prd` fits before the first scaffold
- what `/caf next <instance> apply` checkpoints
- how `/caf plan` and `/caf build` relate to earlier lifecycle states

```mermaid
stateDiagram-v2
    [*] --> Seeded : /caf saas <instance>

    state "Seeded instance\nPRD, architectural, and technology intent templates" as Seeded
    state "PRD-promoted shape\nvalidated lifecycle-ready shape + checkpoint" as PrdPromoted
    state "Architecture scaffolding\narchitecture outputs + decision candidates" as ArchScaffolded
    state "Applied checkpoint\nadopted architecture state" as Applied
    state "Design-elaborated architecture\nplanning/build inputs for later phases" as DesignElaborated
    state "Planned instance\ncompiler-owned obligations + planner-owned task graph" as Planned
    state "Built candidate\ncandidate code + runtime proofs + packets if needed" as Built

    Seeded --> Seeded : human review / edit seeded sources
    Seeded --> PrdPromoted : /caf prd <instance>
    PrdPromoted --> ArchScaffolded : /caf arch <instance>
    ArchScaffolded --> Applied : architect adoption + /caf next <instance> apply
    Applied --> DesignElaborated : /caf arch <instance>
    DesignElaborated --> Planned : /caf plan <instance>
    Planned --> Built : /caf build <instance>
```

## Notes

- The seeded shape is a bootstrap editable surface, not the normal lifecycle-ready input for the first architecture scaffold.
- The first `/caf arch` run after `/caf prd` is the default architecture-scaffolding transition.
- `/caf next <instance> apply` is a checkpoint transition, not a replacement for architect review.
- `/caf plan` and `/caf build` are later lifecycle transitions that depend on earlier states being valid.
