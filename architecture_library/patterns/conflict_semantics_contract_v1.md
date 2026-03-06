# Conflict semantics contract (v1)

This document defines a **tech-agnostic**, library-level way to express **true conflicts** between patterns.

## Purpose

CAF supports **adopt-by-default** behavior in early stages (e.g., feature-forward scaffolding). To ensure this remains safe, patterns may declare:

- **Alternatives**: patterns that represent different ways to satisfy the same intent where a single choice is typically preferred per scope.
- **Incompatibilities**: patterns that should not be adopted together within the same scope because their assumptions directly conflict.

This contract is intentionally conservative:

- Declare conflicts **only when real** (explicitly true by definition, not merely “commonly chosen instead”).
- Prefer expressing “often paired with” via relationships (e.g., `related_patterns`) rather than conflict semantics.

## Location in pattern definitions

Conflict semantics are expressed inside the pattern's `caf` metadata block:

```yaml
caf:
  conflict_semantics:
    alternative_to:
      - <pattern_id>
      - <pattern_id>
    incompatible_with:
      - <pattern_id>
```

If a pattern has no real conflicts, omit `caf.conflict_semantics`.

## Interpretation

- `alternative_to`: adopting this pattern may imply **not adopting** listed alternatives at the same scope, unless the architect explicitly chooses a multi-pattern composition.
- `incompatible_with`: adopting this pattern should cause the cascade/adoption policy to **defer** conflicting patterns automatically at the same scope.

## Scope

Unless otherwise specified by a pattern, conflicts are assumed to apply at the **same scope**:
- per-system
- per-component
- per-interface
- per-resource

A later revision may add explicit scope qualifiers if needed; v1 keeps the structure minimal.

## Authoring guidance

Declare:

### Alternatives when
- The patterns are structurally different approaches to the same concern (e.g., different rollout strategies).
- Using both simultaneously for the same scope would be redundant or confusing.

Avoid declaring alternatives when
- Patterns can be composed without contradiction (e.g., observability + policy).

### Incompatibilities when
- The patterns have mutually exclusive assumptions (e.g., one requires centralized enforcement, the other forbids it).
- Adopting both would produce contradictory obligations or unimplementable constraints.

## Quality bar

Every declared conflict should be explainable using:
- pattern intent + forces/tradeoffs
- and should remain valid across technologies and vendors.

### Optional: default alternative

If a set of patterns are declared as `alternative_to` one another, CAF may need a deterministic default for feature-forward demos.
Patterns may set:

```yaml
caf:
  conflict_semantics:
    default_alternative: true
```

Only **one** pattern in an alternatives set should have `default_alternative: true`. Others should set it to `false` (or omit the field).
