# CAF deterministic enrichment ownership meta-pattern v1

This meta-pattern captures CAF's ownership split for deterministic enrichment.

The goal is to keep planner instructions small and structural while ensuring library-owned semantic and contract pressure still lands in the final derived artifacts through deterministic, auditable framework steps.

This ownership split is driven not only by architectural cleanliness, but also by LLM execution realities and CAF complexity control:

- weak and medium models often fail to reproduce long Definition of Done / review text verbatim and consistently
- even stronger models pay real token costs when repeated library-owned prose is restated task by task
- deterministic enrichment lets CAF carry rich library pressure once, then compile it mechanically where needed
- ownership splits are one of CAF's primary tools for reducing context load and shrinking failure surfaces before reaching for stronger models or sub-agents

---

## 1. Core rule

CAF planning and build flows must distinguish four ownership classes:

1. **Planner-owned skeleton**
   - task existence
   - dependencies
   - capability routing
   - baseline steps
   - baseline Definition of Done / review skeleton
   - semantic anchors and trace anchors needed for downstream targeting

2. **Framework-owned deterministic enrichment**
   - repetitive, library-authored semantic pressure
   - repetitive required inputs implied by resolved rails or selected terminals
   - deterministic post-plan derivations that depend on planner-emitted hints but do not require new semantic reasoning

3. **Invariant gates**
   - verify that the compiled/enriched result is present and coherent
   - fail closed when a required enriched contract surface is missing or inconsistent
   - do not silently compensate for missing semantic planning output

4. **Maintenance-only repair tools**
   - explicit, human-invoked repair/reset helpers
   - never the default mechanism for compensating for missing planner or enricher behavior

---

## 2. Planner posture

The CAF planning command is a pipeline. Within that pipeline, the planner-owned semantic step is the structural carrier of semantic pressure, not the place where every repeated library rule is restated.

Planner output should be minimal but sufficient for deterministic enrichment to target the correct tasks later.

The planner must therefore emit enough structure to support downstream compilation, including:

- stable task ids
- dependencies
- capability ids
- resource or plane scope where relevant
- semantic and trace anchors
- task-local hints that a deterministic compiler can consume

The planner must **not** become the home for repeated library prose that is already authored elsewhere and can be attached mechanically.

---

## 3. Enricher posture

Deterministic enrichers are allowed only for surfaces that are already framework-owned or mechanical by design.

A valid enricher:

- consumes declared library surfaces or resolved derived views
- compiles or attaches repetitive content deterministically
- is idempotent or explicitly normalization-safe
- remains generic over declared surfaces whenever possible
- avoids worker-local lore and avoids encoding semantic design choices that belong in the planner or the library

A deterministic enricher is **not** a substitute for missing semantic task generation.

If a planner-owned semantic artifact is missing, the default corrective action remains:

- strengthen producer instructions
- strengthen the relevant gate
- fail closed

---

## 4. New terminal rule

Whenever CAF introduces a new library terminal or contract surface (for example a pattern family surface, TBP, ABP, PBP, task seed family, or a new realization option), maintainers must answer these questions before making it a default or relying on it in templates:

1. What is planner-owned task structure?
2. What is compiler-owned or deterministic-enrichment-owned?
3. Which gate verifies the compiled result?
4. Does an existing enricher already cover the new surface?
5. If not, what new enricher or validator path is required?

A new terminal is incomplete until that ownership path is explicit.

This prevents drift where a library surface exists in manifests or templates but has no first-class post-plan/build ownership path.

---

## 5. Where to place logic

Preferred split:

- **Library-owned declarative surfaces** live with the library element itself.
  - examples: semantic acceptance attachments, role bindings, realization expectations, matcher kinds, artifact classes
- **Execution logic** lives under `tools/caf/`.
  - generic execution engines remain generic
  - pattern-family or terminal-family validators may live under `tools/caf/` in clearly named library-validator areas

Avoid these anti-patterns:

- hardcoding stack- or TBP-specific lore directly in generic gates when a declarative matcher contract would work
- scattering ad hoc executable helpers inside many pattern folders
- pushing repeated framework rules down into worker skills

---

## 6. Current examples in CAF

Examples of the pattern already in use:

- semantic acceptance attachment expansion via `tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs`
- required-input attachment via `tools/caf/task_graph_required_input_enrichment_v1.mjs`
- interface-binding contract derivation and attachment sequencing via `tools/caf/gen_interface_binding_contracts_v1.mjs` and `tools/caf/interface_binding_contract_gate_v1.mjs`
- compiler-owned pattern-obligation generation and obligation-trace attachment via `tools/caf/compile_pattern_obligations_v1.mjs` and `tools/caf/task_graph_obligation_trace_enrichment_v1.mjs`

These are all examples of the same ownership model:

- planner emits the structural carrier
- deterministic framework helpers attach or derive the repetitive framework-owned contract surfaces
- gates verify the compiled result

---

## 7. Template-default rule

A realization style should not become the default starter/template posture unless CAF has a first-class ownership path for it:

- declarative contract surface
- deterministic enrichment/derivation support where needed
- invariant gates that validate the expected realization evidence

This matters for technology posture changes such as moving a baseline from ORM-oriented persistence to `raw_sql`.

CAF may support a realization option before it is ready to be the default. Default status should follow first-class ownership, not only approval in a schema.

## 8. Ownership as context management

Ownership is not only a cleanliness rule or a cost-saving tactic. In CAF it is also a context-management strategy.

When a semantic step is asked to reason about graph structure, restate repeated library-authored prose, compile large mechanical registries, and serialize large artifacts safely, weaker runners fail first and stronger runners still pay reliability and token costs.

The preferred response is to shrink planner-visible inputs, compile deterministic artifacts around the semantic step when ownership is mechanical, preserve checkpoints between PRD / arch / plan phases, keep JSONL / TSV only as non-canonical debug mirrors, and consider sub-agents only after the ownership split is already reduced.
