---
name: caf-arch-doc
description: >
  Generate and maintain the companion-repo architecture documents as a progressive-disclosure story.
  Runs the deterministic pipeline A1 (facts inventory) -> B1 (story plan) -> C (renderer merge) and
  writes outputs to the companion repository. Instruction-only: no scripts. Fail-closed; write
  feedback packets to disk.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-arch-doc

## Purpose

Maintain a **progressive-disclosure architecture document set** in the **companion repository** for a CAF instance.

The document set is intentionally small:

- `architecture/architecture_summary_v1.md` (master story hub)
- `architecture/constraints_assumptions_v1.md` (ledger deep dive)
- `architecture/intent_traceability_v1.md` (trace maps deep dive)

The narrative MUST walk **WHAT -> HOW**:

- **WHAT (intent):** pinned architecture shape + pinned profile knobs + explicit constraints/assumptions.


Everything is **RAG-grounded** in existing CAF artifacts. No inventions.

This skill is instruction-only (no scripts). It MUST be deterministic and fail-closed.

## Inputs

- instance_name (required): folder name under `reference_architectures/` (kebab-case or snake_case)

## Authoritative inputs (must exist)

Pinned intent:
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`

Derived views:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

Derived bundle (Layer 7):
- This skill ensures Layer 7 exists by running `caf-layer7` (cache-aware) before writing companion repo outputs.

Reference-only standards:
- `architecture_library/09_contura_instance_derivation_process_6_to_8_v1b2.md`
- `architecture_library/40_contura_adr_standard_v1.md`
- `architecture_library/07_contura_parameterized_architecture_templates_v1.md`
- `architecture_library/phase_8/82_phase_8_directory_and_naming_conventions_v1.md`
- `architecture_library/phase_8/90_phase_8_profile_derivation_policy_matrix_v1.yaml`

Architecture-doc pipeline standards (added by this change set):
- `architecture_library/phase_8/92_phase_8_architecture_doc_pipeline_feedback_packets_v1.md`
- `architecture_library/phase_8/93_phase_8_architecture_doc_facts_inventory_a1_v1.md`
- `architecture_library/phase_8/94_phase_8_architecture_doc_story_plan_b1_v1.md`
- `architecture_library/phase_8/95_phase_8_architecture_doc_renderer_contract_c_v1.md`

- `architecture_library/phase_8/pattern_anchor_registry_v1.yaml`
## Artifacts (companion repository)

Determine the companion repo root using:
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml` -> `companion_repo_target`

Within `companion_repo_target/`, write:

CAF extracts (CAF-owned, generated/read-only):
- `caf/` (grounding copies)
  - `caf/profile_parameters_resolved.yaml` (verbatim copy)
  - `caf/architecture_shape_parameters.yaml` (verbatim copy)
  - `caf/inputs/` (verbatim copies; names are stable)
    - `guardrails_profile_parameters.yaml`
    - `layer_7_adr_index.md`
    - `layer_7_validation_mapping.md`
  - `caf/derived/`
    - `arch_doc_facts_inventory_generated_v1.yaml`   (A1)
    - `arch_doc_story_plan_generated_v1.yaml`        (B1)

Architecture docs (human-editable; CAF-managed blocks inside):
- `architecture/architecture_summary_v1.md`
- `architecture/constraints_assumptions_v1.md`
- `architecture/intent_traceability_v1.md`

## Fail-closed preconditions (Gate P)

Before writing ANY artifacts:

P1) Validate `instance_name` format:
    `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

P2) Validate all authoritative inputs exist (paths above).

P2a) Ensure Layer 7 derived bundle exists (cache-aware):
    - Follow: `skills/caf-layer7/SKILL.md`
    - Then require these files exist:
      - `reference_architectures/<name>/layer_7/adrs/adr_index.md`
      - `reference_architectures/<name>/layer_7/validation_mapping/validation_mapping.md`
    - If `caf-layer7` fails or these files are missing: write feedback packet `...-preconditions_failed.md` and stop.

P3) Parse `profile_parameters_resolved.yaml` as YAML and require:
    - `instance_name` equals `<name>`
    - `profile_version` is a non-empty string
    - `companion_repo_target` is a non-empty string
    - `lifecycle.allowed_write_paths` is a non-empty list

P4) Require `companion_repo_target` is within the derived write boundary:
    - prefix-match one of `lifecycle.allowed_write_paths`

P5) Safety path constraint (hard rule):
    - `companion_repo_target` MUST start with `companion_repositories/`
    - it MUST NOT contain `..` path segments

P6) Require `companion_repo_target` exists.

If any precondition fails: write a feedback packet and stop.

## Feedback packet (on failure)

Write to:
- `reference_architectures/<name>/feedback_packets/BP-YYYYMMDD-arch-doc-<slug>.md`

Slug must be one of:
- `preconditions_failed`
- `a1_facts_inventory`
- `b1_story_plan`
- `c_renderer`
- `merge_error`

Packet structure MUST follow:
- `architecture_library/phase_8/92_phase_8_architecture_doc_pipeline_feedback_packets_v1.md`

Do not print the feedback packet contents in chat.

## Non-destructive merge rule (summary)

CAF-managed blocks are delimited exactly:

<!-- CAF:BEGIN <block_id> -->
... generated content ...
<!-- CAF:END <block_id> -->

Rules:
- Preserve all content outside CAF-managed blocks verbatim.
- Replace CAF-managed blocks by block_id.
- Fail-closed if block markers are malformed, unbalanced, or duplicated.

Full contract lives in:
- `architecture_library/phase_8/95_phase_8_architecture_doc_renderer_contract_c_v1.md`

## Deterministic procedure (A1 -> B1 -> C)

### Step -1 — Ensure Layer 7 derived bundle (cache-aware)

Before writing any companion-repo outputs, ensure the instance Layer 7 derived bundle exists by running:

- `skills/caf-layer7/SKILL.md`

Rules:
- Use cache-aware behavior; do not rewrite ADRs unless sources changed.
- If Layer 7 generation fails-closed (feedback packet written by caf-layer7), write an arch-doc feedback packet with slug `preconditions_failed` that points to the Layer 7 failure and stop.


### Step 0 — Write CAF extracts into companion repo (verbatim copies)

Create directories (idempotent):
- `<companion_repo_target>/architecture/`
- `<companion_repo_target>/caf/inputs/`
- `<companion_repo_target>/caf/derived/`

Copy these files verbatim:

- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
  -> `<companion_repo_target>/caf/profile_parameters_resolved.yaml`

- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
  -> `<companion_repo_target>/caf/architecture_shape_parameters.yaml`

- `reference_architectures/<name>/spec/guardrails/profile_parameters.yaml`
  -> `<companion_repo_target>/caf/inputs/guardrails_profile_parameters.yaml`

- `reference_architectures/<name>/layer_7/adrs/adr_index.md`
  -> `<companion_repo_target>/caf/inputs/layer_7_adr_index.md`

- `reference_architectures/<name>/layer_7/validation_mapping/validation_mapping.md`
  -> `<companion_repo_target>/caf/inputs/layer_7_validation_mapping.md`

No transformations.

### Step A1 — Update facts inventory (A1) (cache-aware)

Target (CAF-owned, generated/read-only):
- `<companion_repo_target>/caf/derived/arch_doc_facts_inventory_generated_v1.yaml`

Cache rule (required):
- If the target file already exists, **do not regenerate** it unless the allowed A1 sources have changed.
- A1 MUST be treated as an idempotent cache keyed by the `source_manifest` fingerprints.

Deterministic procedure:
1) Compute the expected `source_manifest` by hashing every required A1 source (sha256 of file bytes) as defined by:
   `architecture_library/phase_8/93_phase_8_architecture_doc_facts_inventory_a1_v1.md`.
2) If the target file exists:
   - Parse it as YAML and require `schema_version: arch_doc_facts_inventory_v1` and a non-empty `source_manifest`.
   - If every `source_manifest[*].fingerprint_sha256` matches the newly computed values AND `instance_name` matches, then:
     - **Do not rewrite the file** (do not touch `generated_at`).
     - Proceed to Step B1 using the existing facts inventory.
3) Otherwise (file missing OR sources changed):
   - Generate an updated inventory following the A1 schema and Gate A checks.
   - Write/replace the target file (full file).

Note: “sources changed” includes any change to:
- CAF grounding copies under `<companion_repo_target>/caf/`
- any referenced ADR body under `reference_architectures/<name>/layer_7/adrs/ADR-*.md`
- any referenced catalog/standard allowed by A1.

The A1 schema and Gate A checks are defined by:
- `architecture_library/phase_8/93_phase_8_architecture_doc_facts_inventory_a1_v1.md`

This step MUST be grounded only in:
- the files under `<companion_repo_target>/caf/` (copies created above)
- the instance Layer 7 ADR files in `reference_architectures/<name>/layer_7/adrs/`
- the reference-only standards listed above

If Gate A fails: write feedback packet `...-a1_facts_inventory.md` and stop.

### Step B1 — Generate story plan (B1)

Generate:
- `<companion_repo_target>/caf/derived/arch_doc_story_plan_generated_v1.yaml`

The B1 schema and Gate B checks are defined by:
- `architecture_library/phase_8/94_phase_8_architecture_doc_story_plan_b1_v1.md`

The plan MUST enforce:
- WHAT -> HOW narrative via edge walks
- No “used” claims without ADR-declared references

If Gate B fails: write feedback packet `...-b1_story_plan.md` and stop.

### Step C — Render and merge docs (non-destructive)

Render and merge (C contract):
- `<companion_repo_target>/architecture/architecture_summary_v1.md`
- `<companion_repo_target>/architecture/constraints_assumptions_v1.md`
- `<companion_repo_target>/architecture/intent_traceability_v1.md`

The renderer contract and Gate C checks are defined by:
- `architecture_library/phase_8/95_phase_8_architecture_doc_renderer_contract_c_v1.md`

If Gate C fails: write feedback packet `...-c_renderer.md` and stop.

## Success output constraints

On success, print only:

- One line: `Updated companion architecture docs at <companion_repo_target>`
- Then list of files written/updated (paths only)

Never print “Next steps”.
Never echo file contents.
