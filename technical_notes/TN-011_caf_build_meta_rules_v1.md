# CAF Meta-rulea

## CAF Operating Rules (normative)

### 1. Authority and grounding

* **The attached CAF archive is authoritative.** Do not invent files or paths.
* **Grounding is required**: any selection/decision must be evidenced by anchors/snippets from the repo (spec/design/pattern prose/TBP/PBP manifests/task graph/contract declarations).
* **Fail-closed is non-negotiable**: if inputs are missing/ambiguous or constraints are violated, stop and write a feedback packet. Do not guess.

### 2. Producer-side only

* **Never manually edit shipped instance outputs** under:

  * `reference_architectures/**`
  * `companion_repositories/**`
* Fix **producers** only:

  * skills
  * templates
  * validators
  * pattern/TBP/PBP catalogs and declarations
* Instance outputs are disposable and should be regenerated.

### 3. Minimal public command surface

User-facing commands only:

* `caf help`
* `caf saas <name>`
* `caf arch <name>`
* `caf next <name> [apply=true]`
* `caf build <name>`

No proliferation of visible skills/shims. Router is the entrypoint.

### 4, Environment assumptions and shell behavior

* **No git commands** (read or write).
* Avoid destructive shell behavior (no resets).
* **Lowest common denominator only**: file access + grep/rg (and simple PS equivalents).
* **No inline scripts** (no loops, script blocks, object pipelines). If a step “needs scripting,” that’s a CAF design bug; fix by adding derived artifacts / declarations instead.
* Placeholder hygiene is strict: never emit `TBD/TODO/<...>/REPLACE_ME/FIXME/??` anywhere.

### 5, Determinism vs “options within guardrails”

* Determinism is required only for:

  * guardrails/rails
  * validation rules
  * how obligations compile into tasks + acceptance checks
* **Solution content is allowed to vary** across runs, as long as it stays within rails and satisfies obligations.
* CAF must support “options within guardrails”: patterns/cues can recommend, but architect decisions determine adoption where needed.

### 6. No bespoke instructions in skills

This is the one you’re calling out, and it’s key:

* **Skills must not encode tech-stack-specific or app-specific recipes** (“if FastAPI then do X”, “write policy bundle store”, etc.).
* Skills are generic compilers:

  * read declarations (patterns + TBP/PBP + derived views)
  * compile into task graph + acceptance checks
  * dispatch to workers
* **All “what must exist” rules live in declarations**:

  * pattern definitions (prose + cues + invariants)
  * TBP/PBP manifests via `extensions.*`
  * derived obligations views (compiled from pattern prose, offline)

If the application architect contains bespoke checks, that’s a violation: those checks belong in TBP/PBP/pattern obligations and the planner should just *compile them*.

### 7. Patterns and obligations (where semantics live)

* Pattern prose must be strong enough to infer:

  * required boundaries/archetypes
  * invariants
  * default multi-plane interpretations (AP/CP/DP/ST/AI)
* We can **precompile derived obligations** from pattern prose to save tokens at runtime.

  * Derived views are “compiled,” not authoritative; prose remains the source of truth.
* Multi-plane semantics should come from **pattern plane interpretations**, not from TBPs or skill logic.

### 8. Cross-plane contracts are first-class

* Declared cross-plane contracts must compile into:

  * explicit integration-surface tasks on both sides
  * (eventually) gates for required envelope fields and adopted fields
* Contract scaffolding must stay generic (no domain solving), but must be sufficient to wire AP↔CP.

### 9. Diagnostics are a compiler product, not an afterthought

* `/caf arch` produces strict Markdown diagnostics:

  * grounding ledger
  * relevance report
  * completeness report

* Diagnostics must cite:

  * pattern IDs / obligation IDs
  * source anchors (paths/sections)
  * task IDs
  * required artifacts/gates
* Diagnostics are allowed to evolve, but should not become bespoke per-tech recipes.

### 10. The derivation cascade is the backbone

* `caf-next` and `caf-arch` must agree on a single “what state am I in?” view.
* If resolved view is stale:

  * recover deterministically once (delete/regenerate CAF-managed derived view)
  * otherwise fail-closed with an actionable feedback packet
