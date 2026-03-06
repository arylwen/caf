# Runner adapters are shims only (v1)

## Rule

Runner adapters must be **shims only**:

- `.agent/workflows/**`
- `.codex/skills/**/SKILL.md`

They must not duplicate CAF semantics, procedures, policies, or constraints.

## Source of truth

The canonical skill content lives only in:

- `skills/<skill_name>/SKILL.md`

Adapters may only:

- include the *minimum runner-required metadata* (for discovery)
- reference `skills/<skill_name>/SKILL.md`
- instruct the runner to execute it exactly as written

## Required adapter metadata (allowed)

Some runners require YAML front matter for discovery.

Adapters MAY include YAML front matter (`--- ... ---`) **only** for:

- `name`
- `description`
- optional runner-facing fields like `status`

No other content belongs in front matter.

## Why

- Prevents “split-brain” drift across runners (Antigravity vs Codex).
- Keeps skills portable and single-sourced.
- Reduces maintenance cost and token waste.
- Makes drift evaluation deterministic.

## Enforcement

`skills/drift-eval-caf/SKILL.md` includes a ship-blocker check that fails if any adapter:

- contains CAF semantics (purpose/inputs/procedure/checklists/validators)
- references `architecture_library/**`
- includes CAF block markers
- includes feedback packet formats
- includes additional headings beyond the shim body

Fix violations by rewriting the adapter to a minimal shim that points to the canonical skill.
