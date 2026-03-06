# What is CAF?

CAF (Contura Architecture Framework) is a **fail-closed**, state-machine-driven workflow for turning architectural intent into **execution**:

- **Architecture decisions** (explicit adopted/deferred/rejected patterns)
- **Required deliverables** (design obligations) and the **work needed** to satisfy them (capabilities)
- **A task graph + backlog** that engineers can execute
- **Candidate code** in a companion workspace (optional)

CAF is designed for **guardrailed autonomy**: the model can propose and generate, but CAF validates outputs deterministically and stops on ambiguity.

## The “so what” (product manager framing)

CAF makes architecture work visible and reviewable. Instead of “we’ll figure it out as we go,” you get:

- a concrete set of decisions the team is making
- a backlog that is **derived** from those decisions (not invented ad-hoc)
- an audit trail for why work exists (intent → decision → work item)
- early surfacing of missing inputs (fail-closed feedback packets)

**PM-friendly one-liner:** CAF turns architectural intent into **explicit decisions and an executable backlog** — with a traceable “why.”

## What CAF is for

CAF helps you go from “here’s what we want to build” to a **traceable** solution plan:

1. You pin a small set of explicit inputs ("pins").
2. CAF retrieves candidate patterns and asks you to adopt/defer/reject.
3. Adopted patterns emit obligations (required deliverables).
4. Obligations compile into a task graph + backlog.
5. The build step generates **candidate** code aligned to the backlog.

## What CAF is not

- Not an autopilot to production.
- Not a replacement for architectural review.
- Not a “best practice generator” that guesses when inputs are missing.

## Core design properties

- **Fail-closed:** when inputs are missing or ambiguous, CAF emits a feedback packet instead of guessing.
- **Deterministic gates:** mechanical checks enforce contracts and stop drift.
- **Traceability:** outputs are intended to answer “why is this here?” (pins → patterns → obligations → tasks → code).
