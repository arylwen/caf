# CAF Prevent Combinatorial Sprawl (Meta-Pattern)

## Intent

Keep CAF scalable by ensuring:

- **Workers remain generic** (capability-focused).
- **Technology specifics live in TBPs** (manifests + adapter surfaces).
- Validation relies on **semantic invariants**, not brittle syntactic checks.

This meta-pattern complements:

- “No TBP ID leakage in worker skills”
- MP-20 phase ordering (pre-gate → semantic step → post-gate)

## Core strategy

1) **Abstract external dependencies behind adapter seams**
- TBPs provide technology-specific adapter modules and declare them via **role bindings**.
- Producers/Workers only depend on the adapter seam (not on driver/framework names).

2) **Express DoD as invariants, not implementations**
- “Operation is fully implemented and produces expected state transitions”
  instead of
  “must call `psycopg` / must contain `SELECT`”.

3) **Use evidence anchors that are technology-agnostic**
- Presence of adopted option sets / resolved pins / role bindings
- Task report evidence mapping DoD → files changed → behavior validated

## Rules (normative)

### R1. Worker skills MUST remain technology-agnostic
- No TBP IDs.
- Avoid naming concrete drivers/frameworks as requirements.
- If a language-specific example is helpful, phrase it as **illustrative**, not binding.

### R2. Technology-specific details MUST be carried by TBPs
- TBPs MAY document recommended libraries, file layouts, and conventions.
- TBPs SHOULD provide adapter seams so workers can write code/tests without hardcoding libraries.

### R3. Gates SHOULD validate invariants at the contract level
- Prefer “missing/empty/invalid contract or adoption surface” checks.
- Avoid “grep for SQL keywords” or other syntactic code reviews that don’t generalize.

### R4. Unit tests MUST mock boundaries via seams, not drivers
- Tests should replace boundary functions/objects (adapter seam, client wrapper, DI binding).
- Tests should assert observable behavior (calls, state changes, validation), without requiring a live external system.

## Application: unit-test mocks

When adding guidance for mocks:
- Emphasize **test doubles** (mocks/fakes/stubs) and **seam patching** (DI/monkeypatch).
- Do not name a specific DB driver/framework as a requirement.
- Prefer mocking the **adapter seam** already used by production code.
