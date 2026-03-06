# Phase 8 caf-make-skill Specification (v1)

Version: v1
Status: Draft
Last Updated: 2026-01-13

## 1. Purpose

Define a deterministic, fail-closed command that scaffolds new worker skills (agents) from a structured request payload.

`caf-make-skill` is a factory operation. It does not change architect-owned intent and it must not introduce architecture decisions.

## 2. Inputs (normative)

The command consumes a single payload that validates against:

- `architecture_library/phase_8/80_phase_8_make_skill_request_schema_v1.yaml`

The payload is normally embedded in a feedback packet block as defined by:

- `architecture_library/phase_8/80_phase_8_make_skill_feedback_packet_block_v1.md`

## 3. Outputs (normative)

On success, the command creates or updates worker skills under:

- `skills/<worker_id>/SKILL.md`

For each requested worker, `SKILL.md` MUST include the following sections:

- `## Capabilities`
- `## Inputs`
- `## Outputs`
- `## Acceptance Checks`
- `## Fail-closed conditions`

Each created skill MUST declare the exact capability IDs it implements.

## 4. Scaffolding rules (normative)

### 4.1 No invention

The scaffolder MUST NOT invent:

- new tasks
- new output paths
- new artifact classes
- new architecture boundaries
- new technologies

The scaffolder may only copy and structure information present in the request payload.

### 4.2 Write boundaries

The scaffolder MUST constrain the skill outputs to the request `constraints.allowed_write_paths`.

If any requested task output falls outside allowed write paths, the scaffolder MUST refuse.

### 4.3 Capability coverage

Each generated skill MUST cover at least one capability listed in `missing_capabilities`.

If the request asks to create a skill that does not cover missing capabilities, the scaffolder MUST refuse.

### 4.4 Minimal code generation scope

`caf-make-skill` scaffolds worker skills that are capable of generating code in the bounded write scope required by the missing task signatures.

The skill description MUST state:

- which task signatures it supports
- what evidence it must produce for acceptance checks

The scaffolder MUST not generate application code as part of scaffolding.

## 5. Fail-closed conditions (normative)

`caf-make-skill` MUST fail-closed (feedback packet, no writes) if any of the following are true:

- payload is missing or schema-invalid
- `missing_capabilities` is empty
- `requested_workers` is empty
- any requested output path violates allowed write paths
- any requested artifact class is not in allowed artifact classes
- task signatures do not reference the missing capabilities

## 6. Optional runner shims (non-normative)

Runner-specific shims (for example `.agent/workflows/...` or `.codex/...`) are optional.

Default policy:

- `create_runner_shims: false`

If enabled, shims MUST be thin aliases that delegate to the skill.

## 7. Version history

v1 — Initial specification for a deterministic scaffolder command that creates worker skills from a structured Agent Request payload.
