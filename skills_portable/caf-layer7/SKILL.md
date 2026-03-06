> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.

--- skills/caf-layer7/SKILL.md ---
---
name: caf-layer7
description: >
  Generate the CAF Layer 7 derived bundle (ADRs + validation mapping) from pinned Layer 6 inputs.
  Instruction-only: no scripts. Fail-closed; write feedback packets to disk.
---

# caf-layer7

## Purpose

Generate the **Layer 7 derived bundle** for an existing reference architecture instance by performing a deterministic, template-driven document transformation.

This is instruction-only: all work is executed under the agent’s guardrails.

## Inputs

- instance_name (required): folder name under `reference_architectures/` (kebab-case or snake_case)
- overwrite (optional, default: true)
- force_regenerate (optional, default: false)

## Authoritative sources (must exist)

- Pinned decisions:
  - `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- Template catalog (parameter exposure + allowed values):
  - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`
- ADR structure standard:
  - `architecture_library/40_contura_adr_standard_v1.md`
- Derivation contract:
  - `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md`

## Output paths (generated)

Write under:

- `reference_architectures/<name>/layer_7/`

Minimum artifact set:

- `layer_7/README.md`
- `layer_7/adrs/adr_index.md`
- `layer_7/adrs/ADR-<TEMPLATE_ID>-<NN>.md` (one per instantiated template; NN is 2 digits, starting at 01)
- `layer_7/validation_mapping/validation_mapping.md`

Cache manifest (CAF-owned, generated/read-only):
- `layer_7/source_manifest_v1.yaml`

## Templates (static, auditable)

Use only these template files:

- `skills/caf-layer7/templates/README.md`
- `skills/caf-layer7/templates/adr_index.md`
- `skills/caf-layer7/templates/ADR-TEMPLATE.md`
- `skills/caf-layer7/templates/validation_mapping.md`

## Allowed substitutions (token-based only)

You may only replace the following tokens, exactly as written:

- `{{INSTANCE_NAME}}`
- `{{TEMPLATE_ID}}`
- `{{TEMPLATE_VERSION}}`
- `{{ORDINAL_2D}}` (e.g., `01`)
- `{{DATE_YYYY_MM_DD}}`
- `{{PINS_BULLETS}}`
- `{{MAPPING_REFS_BULLETS}}`
- `{{ADR_LIST}}`
- `{{VALIDATION_MAPPING_ROWS}}`

No other replacements are permitted.

## Fail-closed preconditions

Before writing any artifacts:

1) **Validate instance_name format** matches:
   `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

2) **Validate required inputs exist**:
   - `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
   - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

3) **Parse Layer 6 YAML** and require:
   - `instance_name` (string) equals the folder name `<name>`
   - `template_instances` is a non-empty list
   - each template instance has:
     - `template_id` (string)
     - `template_version` (string)
     - `pins` (mapping string→string)

4) **Reject placeholder pins**. For each pinned value, fail-closed if:
   - empty
   - contains `TBD`, `TODO`, or `UNKNOWN` (case-insensitive)
   - equals a placeholder-looking token such as `<...>` or `{{...}}`

5) **Pin closure check (minimal, catalog-grounded)**:
   - For each instantiated template_id (e.g., `CP`, `AP`, `DP`, `AI`, `ST`), read the template catalog and collect all parameter headings of the form:
     - `#### <TEMPLATE_ID>-<N>:`
   - Require that the pins mapping contains **every** collected parameter ID for that template.
   - If the catalog does not contain any parameter headings for a template_id declared in pins, fail-closed as a spec inconsistency.

6) **Overwrite policy**:
   - If overwrite=false, fail-closed if any Layer 7 output file already exists.
   - If overwrite=true, overwrite (replace) the Layer 7 derived bundle files.

7) **Cache policy** (token-saving; required):
   - If `force_regenerate=false` and all Layer 7 outputs already exist, the agent MUST attempt a cache hit:
     - compute a `source_manifest` fingerprint set (sha256 of file bytes) for the allowed sources:
       - `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
       - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`
       - `architecture_library/40_contura_adr_standard_v1.md`
       - `skills/caf-layer7/templates/README.md`
       - `skills/caf-layer7/templates/adr_index.md`
       - `skills/caf-layer7/templates/ADR-TEMPLATE.md`
       - `skills/caf-layer7/templates/validation_mapping.md`
     - require `reference_architectures/<name>/layer_7/source_manifest_v1.yaml` exists and matches the computed values.
     - If it matches, DO NOT rewrite any Layer 7 outputs (skip generation) and succeed.
   - If the manifest is missing or mismatched, proceed with generation and write an updated manifest.

If any precondition fails: write a feedback packet and stop.

## Feedback packet (on failure)

Write a feedback packet to:

- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-<slug>.md`

Minimum fields:

- Stuck At
- Required Capability
- Observed Constraint
- Gap Type (Missing option | Missing mapping | Spec inconsistency | Missing input)
- Minimal Fix Proposal
- Evidence (repo paths)

Do not print the feedback packet contents in chat.

## Deterministic generation procedure

If preconditions pass:

0) Cache check (required; token-saving)

   If `force_regenerate=false` AND `reference_architectures/<name>/layer_7/source_manifest_v1.yaml` exists AND the full Layer 7 output set exists:
   - Compute the expected `source_manifest` (sha256 of bytes for every allowed source listed above).
   - Parse `source_manifest_v1.yaml` as YAML and require:
     - `schema_version: layer_7_source_manifest_v1`
     - `instance_name: <name>`
     - a non-empty `sources` list, each with:
       - `path`
       - `fingerprint_sha256`
   - If every fingerprint matches:
     - Do not modify any Layer 7 output files.
     - Print success output (see below) and stop.

1) Create directories (idempotent):
   - `reference_architectures/<name>/layer_7/`
   - `reference_architectures/<name>/layer_7/adrs/`
   - `reference_architectures/<name>/layer_7/validation_mapping/`

2) **README**
   - Copy `skills/caf-layer7/templates/README.md` → `reference_architectures/<name>/layer_7/README.md`
   - Substitute `{{INSTANCE_NAME}}`.

3) **Generate ADR files** (one per template instance, stable order as in YAML)

   For each entry in `template_instances` (in list order):

   - Let `TEMPLATE_ID` = `template_id`
   - Let `TEMPLATE_VERSION` = `template_version`
   - Let `ORDINAL_2D` = `01`, `02`, ... for repeated template_id occurrences (count within that template_id)

   - Build `PINS_BULLETS` as markdown bullets, one per parameter id in ascending numeric order:
     - `- <PARAM_ID>: <PINNED_VALUE>`

   - Build `MAPPING_REFS_BULLETS` by extracting the bullet list under the catalog section:
     - Heading must match exactly one of:
       - `### 6. CP Validation and Enforcement Mapping (Template-Level)`
       - `### 6. AP Validation and Enforcement Mapping (Template-Level)`
       - `### 6. DP Validation and Enforcement Mapping (Template-Level)`
       - `### 6. AI / Agent Validation and Enforcement Mapping (Template-Level)` (for template_id `AI`)
       - `### 6. MT Validation and Enforcement Mapping (Template-Level)` (for template_id `ST`)

     Extract only lines starting with `- ` until the next `##` or `###` heading. Preserve text verbatim.

     If the required mapping section is missing or ambiguous: fail-closed as a spec inconsistency.

   - Copy `skills/caf-layer7/templates/ADR-TEMPLATE.md` →
     `reference_architectures/<name>/layer_7/adrs/ADR-<TEMPLATE_ID>-<ORDINAL_2D>.md`

   - Apply only the allowed substitutions.

4) **ADR Index**
   - Copy `skills/caf-layer7/templates/adr_index.md` → `reference_architectures/<name>/layer_7/adrs/adr_index.md`
   - Build `ADR_LIST` as markdown bullets listing each ADR filename in the order generated:
     - `- ADR-CP-01.md`

5) **Validation Mapping**
   - Copy `skills/caf-layer7/templates/validation_mapping.md` → `reference_architectures/<name>/layer_7/validation_mapping/validation_mapping.md`
   - Build `VALIDATION_MAPPING_ROWS` as one markdown table row per pinned parameter (in YAML order by template, then ascending param id):
     - `| <template_id> | <param_id> | <pinned_value> | <mapping_refs_joined> |`
   - `mapping_refs_joined` is the template’s mapping bullets joined by `; ` (single line). Escape any `|` characters in values with `\|`.

6) Write cache manifest (CAF-owned, generated/read-only)

   Write:
   - `reference_architectures/<name>/layer_7/source_manifest_v1.yaml`

   With schema:
   - `schema_version: layer_7_source_manifest_v1`
   - `instance_name: <name>`
   - `generated_at: <DATE_YYYY_MM_DD>`
   - `sources:` list in stable order, one per allowed source, containing:
     - `path: <repo-relative path>`
     - `fingerprint_sha256: <sha256>`

## Success output constraints

On success, print only:

- One line:
  - If generation occurred: `Generated Layer 7 bundle for reference_architectures/<name>`
  - If cache hit occurred: `Layer 7 bundle unchanged for reference_architectures/<name> (cache hit)`
- Then the list of file paths written (paths only). For cache hit, print only:
  - `reference_architectures/<name>/layer_7/source_manifest_v1.yaml`

Never print “Next steps”.
Never echo file contents.
