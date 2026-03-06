> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

````markdown
---
name: caf-extend-tbp
description: >
  Update an existing Technology Binding Pattern (TBP) manifest by adding or modifying deterministic layout bindings
  (scaffold_directories and role_bindings) in a fail-closed way. This is a CAF library maintenance command.
  Instruction-only: no scripts.
status: active
---

# caf-extend-tbp

## Purpose

Provide a **library-safe** way to extend a TBP manifest so that planners (e.g., `caf-application-architect`) can derive
Task Graph outputs **without inventing conventions**.

This command is intentionally generic:

- It does not decide what bindings are “correct”.
- The operator supplies the exact YAML entries to add/modify.
- CAF validates schema, vocabulary, and non-destructive update rules.

---

## Copy/paste (single message; recommended)

Most operator errors happen when the YAML is pasted “as an argument”.
CAF requires a deterministic indicator that the payload is inline.

**Send the following as ONE message (command line + YAML payload in the same message):**

```text
/caf-extend-tbp TBP-PY-01 INLINE_YAML overwrite=false

layout:
  role_bindings:
    unit_test:
      path_template: "tests/unit/test_{resource_snake}.py"
      artifact_class: "tests_runnable_candidate"
    smoke_test:
      path_template: "tests/smoke/test_smoke.py"
      artifact_class: "tests_runnable_candidate"
```

Notes:
- If you omit the literal token `INLINE_YAML`, CAF will refuse because patch source becomes ambiguous.
- The YAML payload is the content **after the command line** in the same message (no separate send required).
- Placeholders like `<...>` are not allowed in patches.


### Common mistake (don’t do this)

* Do **not** omit the literal token `INLINE_YAML` when providing an inline YAML payload.
* Do **not** try to pass the YAML block as a single shell-style argument to the command.

---

## Command signature

```text
/caf-extend-tbp <TBP_ID> <PATCH_SOURCE> overwrite=false
```

Where:

* `<TBP_ID>` is the TBP directory name under:

  * `architecture_library/phase_8/tbp/atoms/<TBP_ID>/`
* `<PATCH_SOURCE>` is one of:

  * `INLINE_YAML` (meaning: the **next YAML block in the same message** is the patch payload), or
  * a repo-local YAML file path

---

## Patch source options

### Option A — Inline YAML payload (recommended)

Use `INLINE_YAML` as `<PATCH_SOURCE>`, followed by **exactly one** YAML block in the same message:

```text
/caf-extend-tbp TBP-PY-01 INLINE_YAML overwrite=false
```

```yaml
layout:
  role_bindings:
    unit_test:
      path_template: "tests/unit/test_{resource_snake}.py"
      artifact_class: "tests_runnable_candidate"
      evidence_contains:
        - "def test_"
    smoke_test:
      path_template: "tests/smoke/test_smoke.py"
      artifact_class: "tests_runnable_candidate"
      evidence_contains:
        - "def test_smoke"
```

Notes:

* Examples are **domain-neutral**; do not infer folder conventions from them.
* `artifact_class` values must be permitted by the **instance rails**; otherwise, fail-closed.

### Option B — Patch from file path (repo-local)

Provide a repo path to a YAML file that exists in the CAF repo:

```text
/caf-extend-tbp TBP-PY-01 architecture_library/phase_8/tbp/patches/py_test_bindings_patch.yaml overwrite=false
```

---

## Inputs

* `tbp_id` (required) — e.g., `TBP-COMPOSE-01`
* `patch_source` (required) — either:

  * `INLINE_YAML`, or
  * a repo-local path to a YAML file
* `overwrite` (optional, default: `false`)

  * If `false`, refuse on any collision with existing keys.
  * If `true`, allow replacing only the keys explicitly present in the patch.

---

## Authoritative inputs (fail-closed)

* TBP manifest target:

  * `architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_manifest_v1.yaml`
* TBP standard:

  * `architecture_library/phase_8/100_phase_8_technology_binding_patterns_standard_v1.md`
* TBP manifest schema (normative):

  * `architecture_library/phase_8/tbp/schemas/tbp_manifest_schema_v1.yaml`

---

## Procedure (deterministic)

### Step 1 — Validate TBP manifest exists

* Refuse if the TBP directory or manifest file does not exist.

### Step 2 — Resolve patch payload source (deterministic)

Patch payload source resolution:

1. If `patch_source == INLINE_YAML`, read the **immediately-following YAML block in the same message** as the patch payload.
2. Else if `patch_source` is a path that exists in the repo, read that YAML file.
3. Else: refuse (do not guess).

If the chosen source does not yield a parsable YAML mapping: refuse.

### Step 3 — Validate patch surface (fail-closed)

Allowed patch surface (only):

* `layout.scaffold_directories`
* `layout.role_bindings`

Refuse if patch contains keys outside the allowed surface.

Refuse if any string value in the patch contains placeholder markers like `<` or `>` (to prevent accidentally applying instructional placeholders as real paths).

For each role binding:

* MUST include:

  * `path_template` (string)
  * `artifact_class` (string)
* MAY include:

  * `evidence_contains` (list of strings)
  * `evidence_not_contains` (list of strings)

### Step 4 — Apply patch (non-destructive by default)

* If `overwrite: false`:

  * Refuse if a role name already exists in the manifest.
  * Refuse if a scaffold directory entry already exists with a different meaning (paths should be unique).
* If `overwrite: true`:

  * Replace only the conflicting keys explicitly present in the patch.

### Step 5 — Write updated manifest

* Write back to:

  * `architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_manifest_v1.yaml`
* Do not modify any other files.

---

## Output

* Updated TBP manifest at:

  * `architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_manifest_v1.yaml`

---

## Refusal / feedback packet

On refusal, write:

* `technical_notes/feedback_packets/BP-YYYYMMDD-caf-extend-tbp-<slug>.md`

Include:

* Stuck At
* Observed Constraint
* Evidence (exact file paths)
* Minimal Fix Proposal

When refusing due to patch source ambiguity, the Minimal Fix Proposal MUST include a **copy/paste-ready** snippet
using the `INLINE_YAML` form (command line + YAML block in the same message).

```
```
