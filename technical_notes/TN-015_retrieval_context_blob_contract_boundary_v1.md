# TN-015 — Retrieval context blob: contract boundary (script-owned)

## Purpose

Capture the **boundary rule** for the retrieval context blob:

- The blob format and construction rules are **owned by deterministic scripts**.
- Skills and workflows **reference** the blob as an input, but do **not** restate or redefine blob semantics.

This prevents drift, reduces token footprint, and removes “escape hatches” where cost-optimizing agents
reinterpret blob requirements as permission to skip instruction-owned semantic steps.

## Scope

Covers:

- where the authoritative blob contract lives
- how skills should treat the blob (input-only; no redefinition)
- how to evolve the blob safely (change procedure)

Does **not** cover:

- the full blob schema / headings / extraction rules (see the contract doc)
- semantic retrieval ranking / grounding / graph expansion behavior

## Design goals

- **Single source of truth:** one authoritative contract for blob structure
- **Determinism:** blob construction is mechanical and reproducible
- **Token discipline:** avoid long “blob spec” instruction walls inside skills
- **Drift resistance:** prevent contradictory blob rules across skills/workflows
- **Anti-shortcut:** remove “blob compliance” as a reason to script-hunt, preflight, or gate-jump

## Contract location (authoritative)

The retrieval context blob contract MUST live next to the owning script:

- `tools/caf/contracts/retrieval_context_blob_contract_v1.md`

The owning builder script MUST be the only implementation of that contract:

- `tools/caf/build_retrieval_context_blob_v1.mjs`

If the contract and script diverge, **the script wins** (then update the contract doc).

## Skill guidance (non-authoritative)

Skills MUST treat the blob as:

- an **input artifact** produced by the script
- a stable interface with a **named path** and **known ownership**

Skills MUST NOT:

- embed the full blob construction spec (headings/order/bullet caps/etc.)
- “rebuild” the blob via LLM summarization
- fail-closed due to blob size rules that are no longer skill-owned
- treat “blob missing” as an excuse to stop without running the builder script

Skills MAY:

- reference the blob file path
- require that the script is invoked (and fail-closed if the script cannot run)
- add short, local notes like “blob is script-owned; do not paste YAML dumps”

## Safe evolution procedure

When changing blob behavior:

1. Update `tools/caf/build_retrieval_context_blob_v1.mjs` (implementation).
2. Update `tools/caf/contracts/retrieval_context_blob_contract_v1.md` (contract).
3. Validate on one canonical instance (e.g., `cdx-saas`) and one non-trivial instance.
4. Keep skills unchanged unless a path/name changed (skills should not mirror blob semantics).

## Why this matters (model behavior)

Some cost-optimizing agents attempt to reduce work by:

- looking for scripts only
- jumping directly to validation gates
- failing closed on “missing outputs” that are missing only because they skipped producers
- treating existing spec blocks as “good enough” instead of performing a refresh

Making the blob script-owned and keeping blob rules out of skills reduces ambiguity and removes
a common “technical compliance” loophole.
