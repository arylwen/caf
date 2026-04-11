# Core concepts

These are the CAF terms you will run into most often.

Once these feel familiar, the rest of the docs read much more naturally.

## The lifecycle in one glance

CAF’s default path is:

1. product intent
2. architecture
3. planning
4. candidate code
5. optional richer UX lane

That usually means:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
/caf ux <instance>        # optional richer UX lane
/caf ux plan <instance>   # optional richer UX lane
/caf ux build <instance>  # optional richer UX lane
```

The richer UX lane is additive. It does not replace the main build lane.

## Pins

A **pin** is an explicit human input that CAF should treat as real.

A pin is usually an architectural intent, constraint, priority, operating assumption, or policy direction.

Examples:

- "Use AWS ECS for deployment."
- "Operator-facing actions must be auditable."
- "Use a control plane and an application plane."
- "Keep the first release boring and operationally simple."

Pins matter because they tell CAF what the team is trying to keep true.

## Patterns

A **pattern** is a reusable architectural choice that CAF can retrieve, propose, and connect to downstream work.

Patterns are not just labels. They are reusable decision bundles.

Examples:

- session/auth posture
- multi-plane separation
- contract declaration posture
- bounded candidate-code generation with fail-closed gates

In practice, CAF retrieves patterns that match the current problem shape, then the architect can adopt, defer, or reject them.

## Obligations

An **obligation** is work or proof that becomes required because a pattern or decision was adopted.

Examples:

- if you adopt a control-plane plus application-plane split, you may need explicit contract declarations, API boundary design, and cross-plane auth handling
- if you adopt a richer UX lane, you now need UX design artifacts, a UX task graph, and UX realization against the already-built runtime truth
- if you adopt audit-heavy operator flows, you may need explicit audit trails or event/report surfaces

Obligations matter because CAF should plan them rather than leaving them as unwritten assumptions.

## Capabilities

A **capability** is a reusable type of work that helps satisfy obligations.

Think of capabilities as the kinds of delivery work CAF can repeatedly plan and project.

Examples:

- contract definition
- runtime wiring
- policy enforcement
- CRUD realization
- UX task realization

## Gates

A **gate** is a deterministic check that decides whether CAF can proceed honestly.

A gate is there to stop drift, mismatch, or hand-wavy progress.

Examples:

- architecture artifacts required by planning are missing
- a declared contract shape does not match the generated relationship/resource shape
- a build lane lacks the prerequisite planning outputs
- the richer UX lane is asked to build before the main `/caf build` lane has completed

## Fail-closed behavior

**Fail-closed** means CAF does not quietly guess when a required input is missing or contradictory.

Instead, it blocks progression and tells you what to fix next.

That is one of the most important ideas in CAF.

It is also why CAF can feel stricter than prompt-to-code flows.

## Feedback packets

A **feedback packet** is the structured report CAF emits when it cannot proceed safely.

The goal is to make “what to fix next” explicit and auditable.

A good way to think about feedback packets is: they are the framework’s way of refusing to pretend everything is fine.

## Richer UX lane

CAF has an optional **richer UX lane** for teams that want more than the smoke-test UI path.

That lane uses:

- `/caf ux <instance>`
- `/caf ux plan <instance>`
- `/caf ux build <instance>`

Use it after the second `/caf arch` and after the main `/caf build` lane.

The richer UX lane is useful when the team wants explicit UX design artifacts, visual-system semantics, UX planning, and a realized UX layer that sits on top of the already-built backend/runtime truth.

## Core concepts by example

A simple mental example looks like this:

1. the team seeds a SaaS instance
2. the PRD says operators manage widgets and need auditable changes
3. the architect adopts patterns for control-plane plus application-plane separation and fail-closed delivery
4. those choices create obligations around API boundaries, planning artifacts, runtime seams, and reviewable generated outputs
5. CAF plans the work and generates candidate code
6. if the team wants a richer operator experience, they run `/caf ux`, `/caf ux plan`, and `/caf ux build` after the main lifecycle is already in place
7. if a required artifact is missing at any point, CAF emits a feedback packet instead of guessing

That is the overall rhythm of the framework: explicit intent, reusable decisions, downstream obligations, planned work, candidate realization, and fail-closed correction when something is missing.

## What to run next

A common default sequence looks like this:

```text
/caf saas <instance>
/caf prd <instance>
/caf arch <instance>
/caf next <instance> apply
/caf arch <instance>
/caf plan <instance>
/caf build <instance>
```

Add the richer UX lane only after the main lifecycle is already in place:

```text
/caf ux <instance>
/caf ux plan <instance>
/caf ux build <instance>
```

## Glossary (CAF-specific terms)

- **Pin** — An explicit, human-declared input such as an architectural intent, constraint or priority.
- **Pattern** — A reusable architectural decision bundle.
- **Obligation** — A required deliverable or proof implied by adopted patterns.
- **Capability** — A reusable type of work that helps ensure obligations are planned and satisfied.
- **Gate** — A deterministic contract check that blocks progress on mismatch.
- **Feedback packet** — A structured failure report telling you what to fix next.
- **Richer UX lane** — The optional CAF follow-on lane that derives UX artifacts, UX planning outputs, and UX realization after the main lifecycle.

## Find out more

[Instances, phases, and state](05_instances_phases_and_state.md) — See where the concepts on this page show up in a real CAF instance.

## You might also be interested in

- [PRD workflow](12_prd_workflow.md) — Follow how requirement text becomes pins, decisions, and later obligations.
- [Architecture library](06_architecture_library.md) — Browse the reusable patterns and rules that CAF retrieves and applies.
- [Skills, runners, and command surface](07_skills_runners_and_command_surface.md) — Understand how CAF routes work across command and execution surfaces.
