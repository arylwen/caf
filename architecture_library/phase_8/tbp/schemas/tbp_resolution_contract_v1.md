# TBP Resolution Contract (v1)

This contract defines how CAF resolves technology atoms into Technology Binding Patterns (TBPs).

## Inputs

- Approved technology atoms from the technology profile (Layer 8 derived view).
- The TBP catalog and TBP atom files.

## Output

- A deterministic ordered list of TBP IDs to apply for the current architecture instance.
- `tbp_resolution_v1.yaml` is an ID-resolution artifact only; it does **not** inline `layout.role_bindings`. Downstream workers must resolve role-binding paths from the resolved TBP manifests (for example via `tools/caf/resolve_tbp_role_binding_key_v1.mjs` or `tools/caf/resolve_tbp_role_bindings_v1.mjs`).

## Algorithm (normative)

1. **Seed selection**
   - For each approved technology atom present in the profile, select the TBP(s) mapped to that atom.
   - Mapping is configured by CAF (Phase 8 technology catalogs) and must be deterministic.

2. **Closure under requires**
   - For each selected TBP, add all TBPs listed in `REQUIRES_TBPS`.
   - Repeat until no new TBPs are added.

3. **Schema validation**
   - Every TBP ID in the set must have exactly one atom file:
     - `architecture_library/phase_8/tbp/atoms/<TBP_ID>/tbp_<...>_v1.md`
   - Each file must parse under `tbp_schema_v1.md`.

4. **Conflict validation**
   - If TBP A lists TBP B in `CONFLICTS_WITH_TBPS`, A and B must not both be present.
   - Conflicts are symmetric by policy: if either side declares the conflict, treat it as a conflict.
   - On conflict, fail closed.

5. **Deterministic ordering**
   - Sort TBP IDs lexicographically by TBP_ID.
   - The ordered list is the resolved TBP set for downstream tools.

## Failure mode (normative)

If any step fails (unknown atom, unknown TBP ID, missing file, schema violation, dependency cycle that cannot be resolved, or conflicts), resolution must fail closed and emit a feedback packet describing:
- which atom or TBP caused failure,
- missing files (exact paths),
- the minimal fix (add TBP file, adjust mapping, or remove conflicting atom).

## Notes

- A single technology atom may map to multiple TBPs (e.g., a framework may imply a runtime TBP), but this should be minimized and kept explicit.
- TBPs must not invent new core patterns; `EXTENDS_CORE_PATTERNS` must reference existing Layer 1 core pattern IDs.
