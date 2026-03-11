---
name: caf-add-plane-binding-pattern
description: >
  Create or extend a Plane Binding Pattern (PBP) library artifact that describes deterministic scaffold outputs and
  role bindings for a given plane (e.g., CP, DP, AI). This enables planners to honor multi-plane architecture_shape
  without inventing conventions. Instruction-only: no scripts.
status: active
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-add-plane-binding-pattern

## Purpose

Introduce a CAF library surface for **plane-scoped scaffolding** that is independent of a specific application domain.
The operator provides the binding details; CAF only validates and writes them.

This command exists because multi-plane instances (CP/AP/DP/AI) must be derivable via the generic cascade, and the
library must provide deterministic plane-scoped bindings (no invented directory conventions).

---

## Copy/paste (single message; recommended)

Send the following as **ONE message** (command line + YAML payload in the same message).

This example creates/extends the PBP for plane `CP` with a deterministic plane-scoped root at `code/CP/`.
For other planes, replace **both** occurrences of `CP` and `code/CP/` with the target plane id and `code/<PLANE_ID>/`.

```text
/caf-add-plane-binding-pattern CP INLINE_YAML overwrite=false

layout:
  scaffold_directories:
    - "code/CP/"
  role_bindings:

    cp_plane_scaffold_readme:
      path_template: "code/CP/README.md"
      artifact_class: "markdown_docs"
```

Notes:
- If you omit the literal token `INLINE_YAML`, CAF will refuse because patch source becomes ambiguous.
- The YAML payload is the content **after the command line** in the same message (no separate send required).
- Placeholders like `<plane_scoped_root>` are not allowed in patches; use deterministic paths such as `code/<PLANE_ID>/`.

---

## Command signature

```text
/caf-add-plane-binding-pattern <PLANE_ID> <PATCH_PATH_OR_YAML> overwrite=false
```

Where `<PATCH_PATH_OR_YAML>` is one of:
- `INLINE_YAML` (meaning: the patch payload is provided inline in the **same message**; CAF reads either (a) the remainder of the message after the command line, or (b) a fenced YAML block if present), or
- a repo-local YAML file path

---

## Inputs

- plane_id (required) — e.g., `CP`, `DP`, `AI`
- patch_path_or_yaml (required) — either:
  - `INLINE_YAML`, or
  - a repo-local path to a YAML file
- overwrite (optional, default: false)

---

## Authoritative inputs (fail-closed)

- Plane binding catalog:
  - `architecture_library/phase_8/81_phase_8_plane_binding_pattern_catalog_v1.yaml` (created/updated by this command)
- Plane binding storage:
  - `architecture_library/phase_8/pbp/planes/<PLANE_ID>/pbp_manifest_v1.yaml`

---

## PBP manifest contract (v1)

```yaml
schema_version: phase8_plane_binding_pattern_v1
plane_id: CP
layout:
  scaffold_directories:
    - "code/control_plane/"
  role_bindings:
    plane_policy_boundary_dir:
      path_template: "code/control_plane/policy/"
      artifact_class: "directories"
```

Allowed patch surface (only):
- `layout.scaffold_directories`
- `layout.role_bindings`

Role binding rules (same as TBPs):
- MUST include `path_template` and `artifact_class`
- MAY include evidence lists (`evidence_contains`, `evidence_not_contains`)
- Refuse on unknown keys

---

## Procedure (deterministic)

### Step 1 — Ensure catalog + plane directory exist
- If the catalog file does not exist, create it with `catalog_version: 1` and empty `planes: []`.
- Ensure the plane directory exists:
  - `architecture_library/phase_8/pbp/planes/<PLANE_ID>/`

### Step 2 — Create or load PBP manifest
- If manifest missing, create a new manifest with required top-level fields:
  - `schema_version`, `plane_id`, and `layout` (empty ok).

### Step 3 — Resolve patch payload source (deterministic)
1) If `patch_path_or_yaml == INLINE_YAML`, read the **immediately-following YAML block in the same message** as the patch payload.
2) Else if `patch_path_or_yaml` is a path that exists in the repo, read that YAML file.
3) Else: refuse (do not guess).

If the chosen source does not yield a parsable YAML mapping: refuse.

### Step 4 — Validate patch surface
- Refuse if patch contains keys outside the allowed patch surface.
- Refuse if role bindings are missing required keys.

### Step 5 — Apply patch (non-destructive by default)
- If overwrite false, refuse on collisions.
- If overwrite true, replace only the conflicting keys explicitly present in the patch.

### Step 6 — Update catalog
- Ensure the plane_id is listed in the catalog with the manifest path.

---

## Output

- New/updated:
  - `architecture_library/phase_8/pbp/planes/<PLANE_ID>/pbp_manifest_v1.yaml`
  - `architecture_library/phase_8/81_phase_8_plane_binding_pattern_catalog_v1.yaml`

---

## Refusal / feedback packet

On refusal, write:
- `feedback_packets/caf/BP-YYYYMMDD-caf-add-plane-binding-pattern-<slug>.md`

When refusing due to patch source ambiguity, the Minimal Fix Proposal MUST include a **copy/paste-ready** snippet
using the `INLINE_YAML` form (command line + YAML block in the same message).
