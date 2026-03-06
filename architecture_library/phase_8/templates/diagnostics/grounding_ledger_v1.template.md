# Grounding ledger (v1)

## Metadata
- instance: (required)
- generated_by: caf-arch | caf-build (required)
- generated_at: ISO-8601 UTC timestamp (required)
- state_source: guardrails/derivation_cascade_contract_v1.md (required; cite E-001)
- generation_phase: (required; derive from state_source)
- evolution_stage: (required; derive from state_source)
- platform_id: (required; derive from state_source)
- primary_sources: (required; semicolon-separated paths)

## Derivation cascade contract
- contract_path: guardrails/derivation_cascade_contract_v1.md (required)
- state_summary: (1-3 bullets; include phase/stage/profile and whether resolved view is stale)

## Source artifacts scanned
- (path)

## Contract declarations inputs
- contract_declarations: (path or "(none)")
- material_contracts: (one line per boundary_id; include contract_ref.path#section)
- emitted_contract_tasks: (one line per boundary_id; include task ids and key selections if extracted)

## Source artifacts scanned
- (path)

## Evidence items
### E-001
- type: pinned_input | derived_view | spec_text | design_text | task_graph | tbp | pbp | enforcement_bar | filesystem_check
- claim: (required; short paraphrase)
- cite: (required; path plus stable anchor)
- excerpt: (required; short quote or key path)

## Grounded claims
### C-001
- subject_type: pattern | decision | task | gate | other
- subject_id: (required)
- statement: (required; single sentence)
- evidence: E-001
- strength: strong | medium | weak
- notes: (optional; use "(none)" if empty)

## Weak or unresolved claims
- (none)

## Integrity checks
- placeholder_hygiene: pass | fail
- unreadable_sources: (none)
- ungrounded_references_detected: (none)

### Derived obligations inputs
List any derived obligations TSV files considered:  ### Applied derived obligations
- implementing_task_ids  ## Task completion evidence summary (required)

List any boundary/contract README files that contain `## Task completion evidence`, and cite at least one evidence item that demonstrates the evidence-anchor format is being used.

Minimum content:
- Count of compliant READMEs
- Up to 5 example evidence anchors copied verbatim (each from a different README)
