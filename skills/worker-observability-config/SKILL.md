---
name: worker-observability-config
description: >
  Worker skill that implements observability_and_config capability for candidate scaffolding.
  Scaffolding-only: does not generate application domain code; bounded to companion repo write rails.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# worker-observability-config

## Capabilities

- observability_and_config

## Inputs

Required (copied into companion repo by `caf-build-candidate` Step 0):
- `caf/profile_parameters_resolved.yaml`
- `caf/application_spec_v1.md`

## Outputs

Task signatures supported (from the Make Skill Request payload):

- TG-00-scaffold
  - `code/` (directories)
  - `tests/` (directories)
  - `infrastructure/` (directories)
  - `docs/` (directories)
  - `validation/` (directories)

- TG-00-enforcement-bar-files
  - `docs/CANDIDATE_CODE.md` (markdown_docs)
  - `validation/CANDIDATE_EVIDENCE.md` (markdown_docs)
  - `infrastructure/README.md` (markdown_docs)

- TG-00-runtime-wiring
  - `infrastructure/compose.yaml` (config_stubs_non_executable)
  - `infrastructure/Containerfile` (config_stubs_non_executable)
  - `infrastructure/postgres.env.example` (config_stubs_non_executable)

- TG-00-python-package-markers
  - `code/<PLANE>/__init__.py` (code_runnable_candidate)
  - (and any other `__init__.py` marker files declared by the Task Graph)

- TG-00-plane-scaffolds
  - Plane scaffold stubs for non-AP planes (as declared by the Task Graph outputs), typically including:
    - `code/CP/README.md` (markdown_docs)
    - `code/CP/control_plane.py` (code_runnable_candidate)
    - `code/DP/README.md` (markdown_docs)
    - `code/AI/README.md` (markdown_docs)
    - `code/ST/README.md` (markdown_docs)


- TG-00-obl-* (manifest extensions obligations; generic)
  - Any cross-cutting obligation task compiled by the planner from TBP/PBP `extensions.obligations` where:
    - the task requires the `observability_and_config` capability, and
    - every declared output is under one of:
      - `code/`
      - `tests/`
      - `infrastructure/`
      - `docs/`
      - `validation/`

  For these tasks, materialize each declared output as a scaffolding-only stub:
  - directories: create directory
  - markdown_docs: create a short README-style document explaining it is CAF candidate scaffold
  - config_stubs_non_executable: create a minimal syntactically plausible stub (no TODO/TBD/etc)
  - code_runnable_candidate: create a minimal stub that does not claim production readiness

Special cases (still deterministic; still scaffolding-only):

- `infrastructure/compose.yaml`: when this file is a declared output for the task, create a minimal multi-service compose stub that wires plausible `cp`, `ap`, and `db` services **without claiming it runs**.
- `infrastructure/Containerfile`: when this file is a declared output for the task, create a minimal build stub starting with `FROM` and including only generic placeholders that are not TODO/TBD/UNKNOWN.
- `pyproject.toml` and `requirements.txt`: if declared outputs include these files, create minimal syntactically plausible stubs, but do not assert specific frameworks unless the Task Graph DoD + trace anchors require them.

## Definition of Done alignment (semantic)

- Treat `task.definition_of_done[]` as the authoritative acceptance criteria.
- Do not invent additional acceptance checks beyond the Task Graph.
- Treat TBP/PBP role-binding evidence hints (e.g., `evidence_contains`) as implementation cues, not as script-like checks.
- Ensure outputs contain no placeholder tokens (TBD/TODO/UNKNOWN/{{ }}).

## Fail-closed conditions

- Refuse if any intended write is outside the derived allowed write paths for the instance.
- Refuse if any output artifact class is not in the derived allowed artifact classes.
- Refuse if any forbidden action would be violated (for example claiming production readiness or generating production code).
