# Retrieval context blob contract (script-owned)

**Owner:** `tools/caf/build_retrieval_context_blob_v1.mjs`

This document is the **authoritative contract** for the retrieval context blob.

- The blob is **script-owned** (mechanical, deterministic).
- Routed workers MUST **invoke** the script and MUST NOT re-implement blob construction in skill text.
- This contract is intentionally separate from runtime skill flows to keep skills portable and reduce token pressure.

## Purpose

Produce a **single, compact, embedding-friendly** context blob that stabilizes semantic retrieval inputs across models.

The blob is designed to:
- preserve **highest-signal pins** verbatim;
- avoid unstable truncation from raw YAML/MD dumps;
- keep retrieval inputs **normalized** and **diffable** across runs.

## Invocation

```bash
node tools/caf/build_retrieval_context_blob_v1.mjs <instance_name> \
  --profile=arch_scaffolding|solution_architecture \
  [--write-sources]
```

### Inputs (authoritative)

The script reads only from the instance root:

- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<name>/spec/playbook/system_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md` (solution_architecture only)

No external knowledge. No cross-instance templating.

## Outputs

The script writes the following instance-local artifacts:

- Retrieval context blob:
  - `reference_architectures/<name>/spec/playbook/retrieval_context_blob_<profile>_v1.md`

Optionally, when `--write-sources` is enabled:
- a compact provenance list used for audits/diffs.

## Blob format (fixed headings)

The blob MUST be emitted with the following **exact** heading order:

1. `# Retrieval context blob (profile=<profile>)`
2. `## INSTANCE_SUMMARY`
3. `## PIN_VALUE_EXPLANATIONS`
4. `## PINS_SUMMARY`
5. `## GUARDRAILS_SUMMARY`
6. `## ARCHITECT_DECISIONS`
7. `## SPEC_SIGNAL`
8. `## DOMAIN_RESOURCES` (solution_architecture only)
9. `## UI_SIGNAL` (only if present)
10. `### BRIDGE_ECHO (canonical phrases)`

Notes:
- Pins are allowed to dominate length; they are the highest-signal retrieval input.
- The script is responsible for normalization and truncation behavior.

## Size caps (profile-specific)

Caps are **enforced by the script** to prevent unstable truncation.

Targets (not exact):
- `arch_scaffolding`: ≤ 60k chars, ≤ 400 bullets
- `solution_architecture`: ≤ 80k chars, ≤ 520 bullets

Hard rules:
- No raw YAML/file dumps (except tiny enum lists).
- If caps cannot be met without losing required signal, the script must **fail closed** with a feedback packet that points to the specific upstream section that must be trimmed/normalized.

## Pin rules (non-negotiable)

`## PINS_SUMMARY` MUST:
- include **all templates** under `template_instances[]`;
- include **all pins** under each template’s `pins:` mapping;
- preserve exact `PIN_ID=PIN_VALUE` pairs (no paraphrase).

`## PIN_VALUE_EXPLANATIONS` MUST:
- be copied from `CAF_MANAGED_BLOCK: pin_value_explanations_v1` in `system_spec_v1.md`;
- preserve bullets verbatim (no invention).

## Debug and diffs

This contract does **not** require any LLM-authored retrieval debug report.

Recommended maintainer workflow for investigating drift:

- Build blobs for two instances/profiles.
- Diff section-by-section via:
  - `tools/caf-meta/diff_retrieval_blobs_v1.mjs`

## Failure semantics

- Blob build failures are **mechanical** failures (I/O, parse errors, caps breach) and are valid fail-closed conditions.
- Missing downstream design outputs are **not** a blob failure.

## Non-goals

The blob MUST NOT:
- decide which patterns are relevant;
- encode bespoke inclusion logic ("if pin X then pattern Y");
- introduce architecture choices.
