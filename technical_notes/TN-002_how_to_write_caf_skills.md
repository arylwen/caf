# technical_notes/TN-002_how_to_write_caf_skills.md

## Purpose

Provide a repeatable, assistant-friendly standard for creating CAF skills that:

- are portable across agent systems
- are executable (not explanatory)
- are grounded in the CAF library
- fail closed and escalate correctly
- avoid unnecessary scripting

This document is the definitive guide for:
“Create a new CAF skill that …”

## Required reading

Before creating or modifying a skill:

- `technical_notes/TN-001_skills_architecture_portable_callbacks.md`

## Where skills live

All skills live in:

- `skills/<skill-name>/SKILL.md`

Optional subfolders:

- `resources/` (static templates/examples)
- `tests/` (prompt + expected ROUTE_PACKET fixtures)

Avoid:

- `scripts/` for local file operations

## Skill naming

Use kebab-case:

- caf-help
- caf-saas
- caf-validate
- caf-arch

Folder and command names must match.

## Skill types

### Reader / explainer

- Answers questions grounded in `architecture_library/`
- No side effects
- Example: caf-help

### Router / classifier

- Classifies free-form input into canonical intents
- Extracts entities
- Emits ROUTE_PACKET (+ optional ACTION_REQUEST)
- Example: caf-saas

### Executor

- Performs constrained actions (init folders, validate, derive)
- Uses **agent-native file operations**
- Fails closed on uncertainty
- Examples: caf-saas-init, caf-validate, caf-arch

Start new functionality as reader or router before adding executors.

## Non-negotiable rules

Skills must:

- Assume steps are executable by the agent
- Use file operations directly (mkdir, copy, write)
- Cite exact CAF file paths for allowed values
- Fail closed and escalate via feedback packets

Skills must not:

- Invent files, schemas, or allowed values
- Embed runner-specific commands
- Require Python or shell scripts for local scaffolding
- List skills unless explicitly asked

## Required SKILL.md structure

```markdown
---
name: <skill-name>
description: >
  <what the skill does and does not do>
---

# <Skill Name>

## Goal
1–2 sentences.

## Inputs
Describe accepted inputs.

## Outputs
Human-facing output and required protocol blocks.

## Authoritative sources
Exact file paths this skill may rely on.

## Procedure
Numbered, executable steps.
Assume file operations are performed directly by the agent.

## Fail-closed rules
Conditions that require stopping and emitting a feedback packet.

## Examples
3–6 examples with expected behavior.

## Feedback packets
When to write them, where, and what they must contain.

## Canonical intents (router skills only)
List supported intents.

## Agent-independent protocol

If router:
- Emit exactly one ROUTE_PACKET.

If proposing a follow-on action:
- Emit ACTION_REQUEST.
- Also provide runner-neutral “Next steps”.

```

## Checklist for “create new skill that …”

1) Identify skill type (reader / router / executor)
2) Declare authoritative sources (paths must exist)
3) Define intent taxonomy (if router)
4) Define entity normalization rules
5) Write executable procedure steps
6) Define fail-closed conditions
7) Define feedback packet behavior
8) Add 3–6 examples
9) Ensure no scripts are used for local file ops
10) Ensure no runner-specific syntax appears in the skill

## Adapter workflow guidance (for completeness)

Adapter workflows:

- Load the skill
- Execute its steps
- Inject runner-specific command syntax
- Must not add theory or reinterpret logic

## Summary

CAF skills are executable specifications.
They describe **what to do**, not how a specific tool does it.
Portability, safety, and clarity come before convenience.
