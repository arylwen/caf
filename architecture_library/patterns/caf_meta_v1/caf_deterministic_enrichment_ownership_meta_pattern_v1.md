# CAF deterministic enrichment ownership meta-pattern v1

This meta-pattern captures CAF's ownership split for deterministic enrichment.

The goal is to keep planner/worker instructions small and semantic while ensuring library-owned structural pressure still lands in the final derived artifacts through deterministic, auditable framework steps.

## 1. Core rule

CAF flows must distinguish four ownership classes:

1. **Semantic producer / planner-owned structure**
   - task existence, intent, grouping, prioritization, and other meaning-bearing choices
2. **Framework-owned deterministic enrichment / application**
   - repetitive, library-authored structural pressure
   - apply / validate / dedupe / pointer hydration / blob assembly
3. **Invariant gates**
   - verify the compiled/enriched result is present and coherent
4. **Maintenance-only repair tools**
   - explicit, human-invoked repair/reset helpers

## 2. Script-authored prose rule

CAF should avoid script-authored prose when that prose is pretending to carry product, PM, UX, or planning meaning.

Preferred rule of thumb:

- if the content is primarily **meaning**, keep it instruction-owned;
- if the content is primarily **mechanics**, keep it script-owned.

Deterministic scripts are a good home for:

- apply
- validate
- dedupe
- normalize
- pointer hydration
- bounded excerpt/blob assembly
- fail-closed gates

Deterministic scripts are a bad home for:

- PM intent
- hero journey grouping
- visual tone
- semantic pressure classification
- architecture/UX meaning that depends on interpretation

## 3. Enricher posture

A valid deterministic enricher or applier:

- consumes declared library surfaces or resolved derived views;
- compiles or attaches repetitive content deterministically;
- is idempotent or normalization-safe;
- avoids worker-local lore;
- does not synthesize missing semantic outputs after the fact.

If a semantic artifact is missing, the default corrective action remains:

- strengthen producer instructions,
- strengthen the relevant gate,
- fail closed.

## 4. Where to place logic

Preferred split:
- **library-owned declarative surfaces** live with the library element itself;
- **semantic derivation** lives in the relevant semantic worker / planner step;
- **execution logic** lives under `tools/caf/`;
- **gates** verify invariants rather than inventing missing meaning.

Avoid these anti-patterns:
- hardcoding semantic decisions in regex-heavy or keyword-heavy helpers;
- pushing repeated framework rules down into worker skills when a contract or library surface should own them;
- treating auto-hydrated framework prose as accepted human design.

## 5. Why this matters

This ownership split is not only a cleanliness rule.
It is also a context-management strategy:
- semantic steps stay focused on real meaning,
- deterministic steps stay reliable and cheap,
- consumer artifacts stay compact and auditable,
- CAF avoids drift caused by script-authored pseudo-semantics.
