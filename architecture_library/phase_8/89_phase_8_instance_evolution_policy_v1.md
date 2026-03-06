# Phase 8 Instance Evolution Policy (v1)

## Purpose

Define when **CAF** is allowed to evolve a reference architecture instance versus when CAF must **refuse** and require an explicit architect decision.

This policy is **normative** for Phase 8 instance evolution and is designed to:
- reduce model thrash by enforcing a stable structure contract,
- keep the CAF sandbox deterministic,
- make instance evolution auditable and repeatable.

---

## Scope

This policy applies to:

1) **CAF-managed sandbox instances**
- Instances under `reference_architectures/<instance_name>/...` inside the CAF workspace.
- Intended to be created and evolved by CAF skills/workflows.

2) **Standalone instance repositories**
- Companion repositories or other repos where the architecture and code evolve outside the CAF workspace.

The policy intentionally treats these two scopes differently.

---

## Key terms

### Structure contract (scaffold contract)

A structure contract is the authoritative definition of the instance’s:
- top-level layout,
- module/service boundaries,
- entrypoints,
- public interface surfaces (at least at a high level),
- invariants (what must not be renamed/moved without an explicit restructure step).

A structure contract can be expressed as:
- a dedicated scaffold manifest, **or**
- the combination of Phase 8 pinned inputs + derived views that fully specify the intended structure.

### Alignment score bands

CAF uses a deterministic, auditable alignment rubric to classify an instance:

- **Aligned (≥80%)**: structure contract is intact; generation can proceed safely.
- **Needs decision (60–79%)**: meaningful drift exists; proceeding risks unintended restructure.
- **Misaligned (<60%)**: the repo no longer resembles the contract sufficiently for safe automation.

(These bands are used by drift evaluation. The rubric is defined in the instance drift evaluation skill.)

---

## Terminology constraints

To reduce ambiguity and prevent legacy naming drift, Phase 8 uses consistent terminology:

- Prefer: **instance derivation**, **phase progression**, **architecture scaffolding**, **implementation scaffolding**, **candidate code generation**.
- Avoid: legacy process names previously used for Layer 6→8 transformation.



## A. CAF-managed sandbox instances (strict policy)

CAF-managed sandbox instances MUST remain deterministic and low-thrash.

### A1. Preconditions

Before any generation step that writes artifacts, the runner MUST:
1) evaluate instance drift (alignment bands), and
2) confirm the instance is **Aligned (≥80%)**.

### A2. Allowed evolution behavior (Aligned only)

If the instance is **Aligned (≥80%)**, CAF MAY:
- evolve `lifecycle.evolution_stage` step-by-step (e.g., stage_0 → stage_1 → …),
- generate or update structure artifacts consistent with the contract,
- generate additional artifacts allowed by lifecycle boundaries and skills.

Recommended sequence for a new instance:
1) **Architecture scaffolding**
2) **Implementation scaffolding**
3) (Planned) **Candidate code generation** (runnable-but-not-production posture)
4) **Pre-production**
5) **Production hardening**

Note: “Candidate code generation” is a planned capability. Until it exists as a formal phase, implementations should remain within the allowed artifact classes and forbidden actions declared by the lifecycle boundaries.

### A3. Refusal rules (CAF-managed)

If the instance is not **Aligned (≥80%)**, CAF MUST REFUSE (fail-closed) and write a feedback packet.

- **Needs decision (60–79%)**: refuse and require an explicit restructure/reset decision.
- **Misaligned (<60%)**: refuse and recommend a clean slate or export to a standalone repo with a modernization plan.

CAF-managed refusal is intentionally strict to preserve determinism of the sandbox.

---

## B. Standalone instance repositories (interactive policy)

Standalone repositories are the source of truth for their running system and may drift over time.

### B1. Behavior by alignment band

- **Aligned (≥80%)**: proceed automatically using the existing structure contract; print a short notice that generation will not restructure the repo.
- **Needs decision (60–79%)**: stop and ask for an explicit choice:
  - keep existing structure contract (no restructure),
  - re-scaffold (new contract) with a clear diff summary,
  - abort.
- **Misaligned (<60%)**: stop and recommend either:
  - a clean-slate generation boundary (new service/repo), or
  - an opt-in “inventory/rebase” activity (separate from Phase 8 generation).

### B2. Non-destructive default

In standalone repos, candidate generation MUST be non-destructive by default:
- no renames/moves of existing structure,
- no interface breaking changes,
- no new architecture choices,
unless the architect explicitly opts into a re-scaffold or modernization activity.

---

## C. Feedback packet requirements

When refusing, CAF MUST write a feedback packet that includes:
- the alignment band and score summary,
- concrete evidence (paths, files, examples) of drift,
- the minimal set of architect decisions needed to proceed,
- a minimal fix proposal (e.g., re-scaffold plan or clean-slate boundary).

Feedback packets should be written to:
- CAF-managed: `reference_architectures/<name>/feedback_packets/`
- Standalone repos: `<repo_root>/feedback_packets/` (or equivalent project-standard location)
