# CAF Library Maintenance Playbook (v1)

This document makes the **audit** and **optionization** work repeatable without relying on “tribal memory”.

It is **maintainer-facing** and applies to the repository (not to generated instances under `reference_architectures/`).

---

## 1) What is a CAF meta-pattern vs a CAF domain pattern?

Use this rule as the single source of truth:

- `architecture_library/patterns/caf_meta_v1/meta_vs_domain_classification_rule_v1.md`

**Meta-patterns** describe CAF’s framework mechanics (how CAF plans, gates, captures signals, dispatches workers).  
**Domain patterns** describe properties of the target system you are designing (planes, tenancy, IAM, policy, observability).

**Practice:** when in doubt, treat it as a **domain pattern** until you can prove it is purely CAF-framework/process.

---

## 2) Audit process (repeatable)

### A. Trigger conditions

Run an audit when you change any of:

- a command surface (`/caf`, `/caf-meta`)
- a gate behavior (planning/build/retrieval)
- a human-signal block contract
- a pattern lifecycle / derivation rule
- pattern option sets / inventories

### B. Audit steps

1. **Identify the surface you changed** (skill, tool, schema, template).
2. **Locate the declared contract** (Phase 8 docs, standards, inventories) and confirm the contract matches behavior.
3. **Find duplicates** and delete/merge until there is one canonical definition:
   - skills must not embed canonical inventories
   - inventories/options should live in the library
   - instance docs should not become the source of truth
4. **Run the relevant gates** (or the smallest reproduction path) and verify:
   - fail-closed behavior triggers where required
   - advisory packets do not block progress
   - rerun/idempotency invariants are preserved

### C. Audit artifacts

Keep audits lightweight:

- If a doc is only useful to maintainers, keep it in `caf_meta_v1` or `docs/dev/`.
- If a doc is useful to all users of CAF, keep it in `README.md` or `docs/` (so it ships in release bundles).

---

## 3) Optionization process (repeatable)

### A. Goal

Turn “narrative guidance” into **bounded, deterministic choices** that CAF can:

- propose consistently
- require via fail-closed gates
- represent as explicit human signals

### B. Minimum viable optionization (MVO)

For any pattern that becomes a `decision_pattern`:

1. Create **one option_set_id** (2–4 variants + `custom`).
2. Add **one human question** referencing that `option_set_id`.
3. Set **default_option_id** so a safe auto-adopt can preselect exactly one choice.

See checklist:

- `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_checklist_v1.md`

### C. Classification step

Classification snapshots (like “pass 1”) are allowed, but they are **not normative** unless you keep them current.

If you create a classification snapshot:

- label it clearly as “snapshot / historical” when it becomes stale
- avoid references to missing documents
- prefer a short “current plan” section over large tables

### D. Implementing an option set

When you add an option set to a pattern:

1. Add the option set definition in the pattern YAML.
2. Add/update the associated `caf.human_questions[]`.
3. Ensure any validators that assume “exactly-one-adopt” still hold.
4. Ensure downstream producers read **resolved** values only.

---

## 4) Release bundle hygiene (user-facing vs maintainer-facing)

The release bundle is built from **git tracked files** with explicit exclusions:

- `tools/caf-meta/build_release_bundle_v1.mjs`

Guidelines:

- Avoid marketing-channel references in user-facing bundles.
- If a doc is maintainer-only and confusing for users, place it under `docs/dev/` (excluded) or another excluded prefix.
- Keep `caf_meta_v1` concise and clearly labeled as maintainer-facing.

---

## 5) Where to put “historical” artifacts

If you want to retain older snapshots without confusing users:

- Move them under `docs/dev/history/` (excluded from release bundles).

Typical examples:

- early optionization classification tables
- migration notes from previous structural eras
- one-off audit notes that are no longer current
