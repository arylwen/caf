# CAF Combinatorial Sprawl (Anti-Pattern)

## Intent

Prevent CAF from devolving into a pile of **technology- and language-specific special cases** spread across workers, gates, and reviews.

This anti-pattern is especially dangerous near launch: it looks like “quick fixes” but creates long-lived maintenance debt.

## Symptom

You see rules like:

- “If postgres then grep for `SELECT`/`INSERT`…”
- “If Python use `psycopg`; if TypeScript use `pg`; if Java use `JDBC`…”
- “Worker skills mention TBP IDs or driver/framework names”
- Gates that do **syntactic code review** (string matches) to validate behavior

The result is a combinatorial explosion: **(language × stack × persistence style × framework × …)**.

## Why this is harmful

- **Does not scale**: every new atom/TBP multiplies required edits.
- **Creates drift**: workers/gates go stale as TBPs evolve or are replaced.
- **Encourages model thrash**: models “guess the correct special case”.
- **Breaks separation of concerns**: workers stop being capability-focused.

## Red flags (use as a smell checklist)

- A worker/gate change mentions a specific driver, ORM, framework, or TBP ID.
- A gate validates behavior via grep/string checks in source code.
- A DoD requirement is phrased as “use library X” instead of “satisfy invariant Y”.
- A fix is applied by adding another branch rather than adding an adapter seam.

## Default mitigation

Do **not** add more special cases.

Instead apply the companion meta-pattern:

- `caf_prevent_combinatorial_sprawl_meta_patterns_v1.md`
