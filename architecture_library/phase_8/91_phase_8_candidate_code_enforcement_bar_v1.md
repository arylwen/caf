# Phase 8 Candidate Code Enforcement Bar (v1)

## Purpose

Define an **enforceable minimum bar** for all Phase 8 outputs classified as **CANDIDATE code**:

- **Runnable** (local/CI runnable under a clearly documented entrypoint)
- **Not production deployable** (explicitly NOT production-ready; no production deployment artifacts or claims)
- **Contract-respecting** (must not require structural changes outside the allowed write boundary)

This bar enables CAF to generate **maximum value runnable candidate code + tests** while remaining **fail-closed** when constraints are violated.

## Definitions

- **Candidate code**: runnable code and tests intended to accelerate iteration. It may be incomplete, but must meet the minimum bar below.
- **Production deployable**: suitable for real production deployment with appropriate security, reliability, and operational posture. CAF MUST NOT claim or generate this by default.
- **Write boundary**: the derived `lifecycle.allowed_write_paths` prefixes in `profile_parameters_resolved.yaml`.

## Enforcement responsibility

- The authoritative bar parameters are derived into:
  - `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` under `candidate_enforcement_bar`.
- Candidate materialization skills (e.g., `caf-build-candidate`) MUST:
  - enforce the bar **fail-closed**
  - write exactly one feedback packet on refusal
  - never “fix up” violations by guessing


## Execution boundary (hard rule)

All candidate generation paths are instruction-only:

- CAF MUST NOT probe or execute toolchains (no python/docker/podman/apt/pip invocations).
- Validation is limited to structural/textual checks on repository content.
- Documentation MAY include developer-run commands, but CAF does not execute them.

## Candidate enforcement bar (normative)

### 1) Contract immutability gate (structure)

CANDIDATE generation MUST NOT:

- write outside `lifecycle.allowed_write_paths`
- modify pinned architect inputs under `reference_architectures/<name>/spec/playbook/` or `spec/guardrails/`
- require repository restructuring outside the generated companion repository root

If the target companion repository is not in an acceptable pre-generation state (see Phase 8 directory & naming conventions), the generator MUST refuse (fail-closed).


### 1.1) Design→Code evidence (v1)

Candidate generation is a design implementer, not a generic generator.

The companion repository MUST include:
- `validation/CANDIDATE_EVIDENCE.md`

`validation/CANDIDATE_EVIDENCE.md` MUST map authoritative design/spec decisions to implemented code using only structural references.

Minimum required sections:

1) Inputs
- list the authoritative input documents used (repo-relative paths), including:
  - `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
  - `reference_architectures/<name>/design/playbook/application_design_v1.md`
  - `reference_architectures/<name>/design/playbook/control_plane_design_v1.md`

2) Decision → Implementation map
- for each major decision cluster (tenancy/context, API surface, persistence boundary, policy enforcement, observability), provide:
  - `DECISION_REF:` file + heading in a design/spec document
  - `IMPLEMENTED_IN:` one or more code files (paths)
  - `EVIDENCE:` short description of what to look for (symbols, routes, config keys)

3) Domain/resources/ops coverage
- enumerate each resource and operation from the spec and point to:
  - endpoint or handler implementation files
  - service/facade implementation files
  - repository/persistence boundary files

4) Known gaps
- if any design item is not implemented, list it explicitly.
- missing items MUST trigger fail-closed unless the design explicitly marks them as deferred.

Validator behavior (structural):
- verify `validation/CANDIDATE_EVIDENCE.md` exists and contains the required headings
- verify every `IMPLEMENTED_IN` path exists
- verify every resource/operation in the spec is represented at least once in the map

### 2) Runnable definition (minimum)

A candidate output MUST include at least one **documented runnable entrypoint** that is valid for the selected technology profile.

At minimum, the companion repository MUST contain:

- a local runtime wiring artifact (e.g., compose file) under `infrastructure/`
- a short run instruction section (e.g., `infrastructure/README.md`)

The bar does not require production deployment artifacts.

### 3) Test minimum standard (normative)

Candidate outputs MUST include:

A) **Unit tests**:
- At least one unit test covering a **non-trivial workflow**.
- Integrations MUST be **mocked** (e.g., via `unittest.mock`, monkeypatching, or equivalent), so tests are runnable offline/locally.

B) **At least one smoke test**:
- CAF validates smoke coverage **structurally** via `CAF_TEST_KIND` markers in `tests/` (for example: `# CAF_TEST_KIND: smoke`).
- CAF MUST NOT execute tests in the agent runtime.
- Developer-run commands (e.g., `python -m pytest -q`) may be included in documentation, but are not executed by CAF.

C) **Contract test**:
- Required for `generation_phase` in:
  - `pre_production`
  - `production_hardening`
- Optional for earlier phases.

Contract test definition: a test that validates the public API/contract surface (e.g., OpenAPI schema availability, endpoint invariants, versioning, or equivalent).

#### Deterministic test classification

To make the bar enforceable without executing tests, required tests MUST be tagged with a single-line marker comment near the top of the test file:

- `# CAF_TEST_KIND: unit`
- `# CAF_TEST_KIND: smoke`
- `# CAF_TEST_KIND: contract`

### 4) Placeholder policy (minimum)

Candidate code MAY contain TODOs and stubs, but MUST NOT contain obvious placeholder tokens in critical execution paths.

At minimum:

- No occurrences of obvious placeholder markers like `<...>` in files under `code/` or `tests/`.
- If a placeholder budget is derived for the current run, the candidate generator MUST refuse when exceeded.

### 5) “Not production deployable” safety / clarity (required)

Candidate outputs MUST contain explicit, loud disclaimers:

- `docs/CANDIDATE_CODE.md` MUST exist and state:
  - output is CANDIDATE
  - NOT production deployable
  - no production readiness claims
- At least one prominent header doc (or top-of-file module docstring) in generated code SHOULD include similar wording.

CAF MUST keep `generate_runnable_production_code` and `claim_production_readiness` forbidden by default for candidate outputs.

## Derived parameters (shape)

`profile_parameters_resolved.yaml` MUST include:

```yaml
candidate_enforcement_bar:
  bar_id: candidate_bar_v1
  test_policy:
    require_unit: true
    require_smoke: true
    require_contract: false|true   # derived from generation_phase
    required_test_kinds: ["unit","smoke"]|["unit","smoke","contract"]
  required_paths:
    - "docs/CANDIDATE_CODE.md"
    - "validation/CANDIDATE_EVIDENCE.md"
    - "tests/"
    - "infrastructure/"
  placeholder_policy:
    forbidden_tokens:
      - "<...>"
  runnable_policy:
    require_infrastructure_readme: true
    require_runtime_wiring: true
```

This section is **derived, read-only**.

## Relationship to Phase 8 pack metadata

- `caf-guardrails` MUST refuse (fail-closed) if derived packs are incompatible with:
  - `allowed_generation_phases`
  - `allowed_evolution_stages`
  - technology profile compatibility
  - runnable-code approval gating (if required by the pack)
