---
name: drift-eval-instance
description: >
  Evaluate semantic drift of an architecture instance or standalone repo against the CAF scaffold contract.
  Applies different enforcement postures for CAF-managed sandbox instances vs standalone repos.
  Fail-closed inside CAF sandbox. Instruction-only: no scripts.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# drift-eval-instance

## Purpose

Detect and report **instance drift** for:

A) **CAF-managed sandbox instances**
- `reference_architectures/<name>/...` (inside the CAF workspace)

B) **Standalone repositories**
- Any independent repo (companion repo or evolved repo outside CAF)

This evaluator is **portable**: it must not depend on CAF-only paths unless they exist.
It must prefer **non-destructive** evaluation and emit actionable feedback packets.

## Inputs

User may invoke:
- `drift-eval-instance <path>`
  - `<path>` may be:
    - `reference_architectures/<name>/`
    - `reference_architectures/<name>/spec/guardrails/`
    - a companion repo path
    - `.` (current directory)

If no path is provided, default to `.`.

## Output

Always produce:
- one feedback packet written to disk (even on PASS), OR
- PASS message + optional “record” file, depending on repo policy.

CAF preference:
- On PASS: print a single line and do not write a packet unless requested.
- On FAIL / Needs decision: write a packet and stop.

## Context detection (required)

Determine operating context:

1) **CAF-managed sandbox**
If the evaluated path contains (or is within):
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
then treat as CAF-managed sandbox instance.

2) **Standalone**
Otherwise treat as standalone repo.

## Alignment bands (semantic)

Compute an `alignment_score` in [0,100] using the rubric below.
Assign a band:

- **Aligned (>= 80)**: safe to proceed automatically
- **Needs decision (60–79)**: risks unintended restructure
- **Misaligned (< 60)**: stop; recommend clean-slate boundary or opt-in inventory/rebase

### Sandbox strictness (non-negotiable)
- In **CAF-managed sandbox**: if band is not Aligned, refuse (fail-closed) and write a packet.
- No interactive keep vs re-scaffold decisions inside sandbox.

### Standalone posture
- **Aligned**: proceed with a non-destructive notice (no packet required unless requested).
- **Needs decision**: stop; ask for explicit choice (keep vs re-scaffold vs abort); write a packet.
- **Misaligned**: stop; recommend clean slate or opt-in inventory/rebase; write a packet.

## Evidence sources (required inputs)

Prefer these files when present:

- Pinned UX inputs:
  - `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
- Derived enforcement view (authoritative when present):
  - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- Companion repo standard:
  - `architecture_library/phase_8/82_phase_8_directory_and_naming_conventions_v1.md`

If the derived view is missing in sandbox:
- do not attempt to infer derived rails; emit a packet instructing to run `caf-guardrails`.

## Scoring rubric (deterministic, minimal)

Score components (sum to 100):

1) **Pinned inputs present and minimal (20)**
- profile_parameters.yaml exists (in sandbox) and contains only the allowed keys.
- 0 points if missing (sandbox) or contains derived fields.

2) **Derived view present and consistent (30)**
- profile_parameters_resolved.yaml exists (sandbox) and can be recomputed from the 3 knobs (if recomputation capability exists).
- If missing in sandbox: 0 points.

3) **Write-boundary coherence (30)**
- derived `allowed_write_paths` exists (sandbox) and includes the companion repo target prefix.
- any observed writes outside allowed paths is a hard failure for this component.

4) **Companion repo structure coherence (20)**
- companion repo target exists (if expected) and appears scaffold-aligned:
  - outputs are under the expected root
  - no “obvious” foreign roots at the same level as expected scaffold outputs

For standalone repos where CAF files are absent:
- score based on available evidence (do not guess missing CAF pins).
- treat unknowns as partial credit rather than hallucinated certainty.

## Feedback packet format (required when writing)

Write to:

A) **CAF sandbox instance**
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-drift-eval-instance.md`

B) **Standalone repo**
- `<repo_root>/feedback_packets/BP-YYYYMMDD-drift-eval-instance.md`
  - If `feedback_packets/` does not exist, create it.

Packet structure:

# Feedback Packet: BP-YYYYMMDD-drift-eval-instance

- Scope: <path evaluated>
- Context: caf_managed_sandbox | standalone_repo
- Alignment Score: <0-100>
- Alignment Band: Aligned | Needs decision | Misaligned
- Stuck At: Instance Drift Evaluation
- Required Capability: Scaffold contract alignment + non-destructive evolution
- Observed Constraint: <one-line summary>
- Minimal Fix Proposal: <one-line>

## Findings
(one subsection per finding with Evidence)

## Inventory (standalone only, required when not Aligned)
- Top-level directories/files (brief)
- Suspected scaffold roots
- Proposed “optimal scaffold” location (non-destructive suggestion)
- Drift summary by category (paths, structure, rails)

## Non-negotiables

- Fail-closed inside CAF-managed sandbox when not Aligned.
- Do not guess missing pins; write a packet instead.
- Keep outputs minimal; do not print packet contents.
