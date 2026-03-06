# Relevance report (v1)

## Metadata
- instance: (required)
- generated_by: caf-arch | caf-build (required)
- generated_at: ISO-8601 UTC timestamp (required)
- state_source: guardrails/derivation_cascade_contract_v1.md (required; cite an evidence item)
- generation_phase: (required; derive from state_source)
- evolution_stage: (required; derive from state_source)
- platform_id: (required; derive from state_source)

## Selected items assessed
(Assess selected patterns, adopted decisions, and binding patterns that influenced planning or code.)

### Item R-001
- item_type: pattern | decision | tbp | pbp | task_graph_assumption | other
- item_id: (required)
- assessment: supported | questionable | unsupported
- evidence: E-001
- notes: (1-3 grounded sentences)

## Likely omissions
(Items that appear relevant from pins/specs/design but are not selected or not materialized.)

### Omission O-001
- candidate_item_type: pattern | tbp | pbp | other
- candidate_item_id: (required if known; otherwise use a short label)
- why_it_looks_relevant: E-001
- why_it_may_be_omitted: (grounded if possible; otherwise state unknown)

## Weak-evidence items
- (none)

## Recommendations
- (none)

## Derived obligations applicability

If any derived obligations TSV exists, summarize:
- Applied derived obligations (by obligation_id) and why they apply (pattern selected).
- Not-applied but applicable obligations (required/recommended) and why (missing pattern selection, or missing compilation).
- Potentially relevant obligations not present in TSV (if diagnostics detects strong cues in spec/design but no selected pattern).
Each bullet MUST cite `obligation_id` and `source_anchor` when referencing TSV-derived obligations.  ## Cross-plane contract relevance

When `contract_declarations_v1.yaml` exists, summarize:

- Material cross-plane contracts present and whether they are materialized into Task Graph tasks.
- Any material contract that is declared but not materialized MUST be listed as a likely omission/blocker.  ## Task completion evidence relevance (required)

If task completion evidence is missing for any required/materialized boundary/contract outputs, report it here as a relevance risk (low confidence that outputs satisfy obligations). Include the list of missing README paths.
