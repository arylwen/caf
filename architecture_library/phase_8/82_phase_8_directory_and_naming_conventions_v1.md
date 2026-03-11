# Phase 8 Directory & Naming Convention (v1)

## Goals

- Deterministic discoverability for agents and tooling
- Clear authority boundaries between:
  - **Global Phase 8 rules** (architecture library)
  - **Instance pinned inputs** (reference architectures)
  - **Generated build artifacts** (companion repositories)

---

## A. Architecture Library (Global Phase 8 rules)

Location:

- `architecture_library/phase_8/`

Contains:
- Profile parameters schema + template
- Approved technology catalogs and standards

Invariant:
- Library artifacts are **normative** and **runner-neutral**.

---

## B. Reference Architecture Instances (Authoritative inputs)

Location:

- `reference_architectures/<name>/`

Authoritative pinned inputs:
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

Optional derived views (generated, read-only):
- `reference_architectures/<name>/layer_7/` (derived bundle; used by documentation and audit workflows)
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/guardrails/abp_pbp_resolution_v1.yaml`
- `reference_architectures/<name>/spec/guardrails/syntactic_checks.md` (optional)


Detailed plane-domain authoring inputs (implementation scaffolding onward):
- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md`
- `reference_architectures/<name>/spec/playbook/system_domain_model_v1.md`

Optional derived domain views (generated, read-only):
- `reference_architectures/<name>/design/playbook/application_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/system_domain_model_v1.yaml`
- `reference_architectures/<name>/design/playbook/domain_model_v1.yaml` (legacy compatibility view only)

Invariant:
- Instance pinned inputs are **architect-authored**.
- Derived views are **assistant-authored** and must be safely regenerable.

---

## C. Companion Repositories (Generated outputs)

Location:

- `companion_repositories/<name>/<profile_version>/`

Examples:
- `companion_repositories/hello-saas/profile_v1/`

Contains:
- Generated artifacts produced by Phase 8 skills and workers, bounded by Layer 8 derived rails

---

## C.1 Companion Repository Standard (normative)

### C.1.1 Canonical location (hard rule)

Generated build outputs MUST be written under exactly:

- `companion_repositories/<name>/<profile_version>/`

### C.1.2 Baseline skeleton (minimal target)

The approved baseline skeleton for a newly initialized companion repository target is:

- `AGENTS.md`
- `README.md`

No other files or directories are part of the baseline skeleton.

Downstream skills MAY create additional subtrees on demand (e.g., `caf/`, `architecture/`) as permitted by Layer 8 rails.

### C.1.3 Pre-generation state (cleanliness contract)

Before any generation step that targets a companion repository path, CAF MUST validate one of the following is true:

- **Absent target:** the target directory does not exist yet (CAF may create it), or
- **Clean target:** the target directory exists and contains only the approved baseline skeleton for the selected run.


If the target directory exists and contains additional, unexpected files or directories (outside the approved baseline skeleton), enforcement depends on context:

- **CAF-managed sandbox instances:** refuse (fail-closed) and emit a feedback packet.
- **Standalone repositories:** stop and require an explicit architect decision (keep vs re-scaffold vs abort), and emit a feedback packet with an inventory + drift summary.

### C.1.4 Write boundary (authoritative rails)

Authority rules:

- If a Layer 8 derived view exists (e.g., `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`), it is authoritative for `allowed_write_paths`.
- Otherwise, the pinned instance inputs are authoritative (e.g., `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`).

Any attempt to write outside `allowed_write_paths` MUST be refused (fail-closed) and produce a feedback packet.

### C.1.5 No implicit architecture or vendor selection

In particular:

- Technology bindings are driven only by the pinned `platform pins (infra_target/packaging/runtime_language/database_engine)` and its compatible TBPs.
- If a workflow requires technology bindings and no compatible bindings exist, CAF MUST refuse (fail-closed) and emit a feedback packet describing the incompatibility and the minimal fix.

### C.1.6 Sandbox-safe generation invariant

Within CAF-managed sandbox instances, the companion repository target is treated as contract-governed output:

- If the repo is not sufficiently aligned with the scaffold contract, CAF MUST refuse (fail-closed) and emit a feedback packet.
- No interactive “keep vs re-scaffold” choices are permitted inside the CAF-managed sandbox.

---

## D. One-line placement invariant (hard rule)

- Global Phase 8 rules and catalogs live in: `architecture_library/phase_8/`
- Architect-pinned instance inputs live in: `reference_architectures/<name>/spec/playbook/` and `reference_architectures/<name>/spec/guardrails/`
- Detailed plane-domain source artifacts live in: `reference_architectures/<name>/spec/playbook/`
- Derived plane-domain YAML views live in: `reference_architectures/<name>/design/playbook/`
- Generated build outputs live in: `companion_repositories/<name>/<profile_version>/`

---

## E. CAF-managed sandbox instances vs standalone repos

Phase 8 supports two operating contexts:

### CAF-managed sandbox instances

- Location: `reference_architectures/<name>/...` inside the CAF workspace.
- Contract: the structure contract is expected to remain stable.
- Policy: if drift is detected, CAF must refuse (fail-closed) to prevent unintended restructure.

### Standalone repos (companion repositories and beyond)

- Location: any independent repository where the system evolves over time.
- Contract: the repo is the source of truth; CAF must be non-destructive by default.
- Policy: CAF may proceed automatically only when the repo remains sufficiently aligned with the structure contract; otherwise it must ask for an explicit architect decision.

See: `architecture_library/phase_8/89_phase_8_instance_evolution_policy_v1.md`.
