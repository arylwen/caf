# CAF Meta-Patterns Playbook (v1)

This document captures CAF's **meta-patterns**: the framework-level rules and design intent that apply across specifications, designs, contracts, planning, and candidate builds.

The intent is to:

- minimize human architect friction,
- preserve human authority,
- avoid hardcoded decision trees,
- stay grounded in the attached archive inputs,
- fail closed when required inputs or signals are missing.

This is written to be durable, explanatory, and usable for CAF docs and long-form rationales.

---

## 1. CAF is advisory, not deterministic

### MP-01: Propose; do not decide

CAF may propose candidates, defaults, and open questions — but **humans own approvals**.

### **Canonical mechanism**

1. Build a query corpus from available authoritative inputs (pins, specs, designs, patterns).
2. Retrieve and rank relevant patterns and guidance (semantic retrieval).
3. Propose candidates and open questions with traceability anchors.
4. Human resolves by flipping statuses in `ARCHITECT_EDIT_BLOCK`.
5. Downstream consumes **only adopted/answered** signals.

### **Anti-pattern**

- A skill that “knows” a fixed list of decisions/questions for all instances.

---

## 2. Human signals are explicit and preserved

### MP-02: Use the triad blocks; do not mix concerns

Use exactly one of:

- `CAF_MANAGED_BLOCK`: CAF rewrites on rerun.
- `DESIGNER_MANAGED_BLOCK`: producing designer rewrites deterministically.
- `ARCHITECT_EDIT_BLOCK`: human-owned; preserved verbatim.

#### **Rule**

- Never place human signals in regenerable blocks.
- Never overwrite human-edited `ARCHITECT_EDIT_BLOCK`s.

(See: `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`)

### MP-03: The architect flips statuses; everything else is optional

In architect-edit YAML blocks:

- required: `status` changes (`adopt|reject|defer|n_a` or `open|answered|n_a`)
- optional: `rationale` (1 sentence)
- optional: `resolved_values` for narrow, pattern-level pins

#### **Do not require**

- copy/paste between options and answer objects
- schema authoring inside `.md`

---

## 3. Library-owned candidates (option sets) and inventories

### MP-04: Option sets live in the library, not in skills

If a decision/question needs options:

- store canonical options in the **pattern definition** (library-owned)
- a skill may **copy** options into an `ARCHITECT_EDIT_BLOCK`, but must not *define* the option set as canonical.

#### **Rationale**

- prevents “skills as cue tables”
- keeps candidates grounded and traceable
- makes option evolution a library governance task

### MP-05: Skills must not predeclare canonical decision inventories

A skill should not contain a fixed list like “always ask DD-AP-TENANT-CARRIER-01”.

Instead:

- emit decisions/questions **only when warranted**, grounded by:
  - adopted patterns, and/or
  - explicit instance evidence (resources, boundaries, contracts)
- leave blocks empty if nothing is warranted

---

## 4. Minimum-friction choice UX

### MP-06: Optionized answers (flip adopt; no copy/paste)

When a choice is warranted:

- provide 2–5 options (including `custom`)
- architect selects by setting exactly one option to `status: adopt`

This eliminates:

- separate schema blocks in `.md`
- separate “answer” objects
- copy/paste across fields

### MP-07: Always include `custom`

Every option set must include a `custom` option so the architect can proceed without being blocked by an imperfect candidate set.

### MP-08: Neutral summaries

Option summaries must be descriptive, not normative:

- Avoid “recommended”, “best”, “should”.
- Prefer: “Works when…”, “Requires…”, “Tradeoff: …”.

---

## 5. Fail-closed gating and feedback packets

### MP-09: Exactly-one-adopt invariant

For any required option set:

- fail closed unless **exactly one** option is adopted.

### MP-10: Planning must fail closed before build

The plan artifact (task graph) must not be generated from unresolved human signals.

#### **Implication**

- `task_graph_v1.yaml` is produced during planning (architecture/planning hop),
- candidate build consumes the plan; it does not decide the plan.

### MP-11: Feedback packets must be actionable

When failing closed, emit a feedback packet that includes:

- file path
- block id
- the exact unresolved decision/question id or option set key
- what the human must change (typically: flip one `status: adopt`)

(See: Phase 8 feedback packet standards where applicable.)

Additionally, all CAF-emitted packets MUST conform to the canonical protocol (header schema, status lifecycle, and severity gating semantics):
`architecture_library/patterns/caf_meta_v1/caf_feedback_packet_protocol_meta_pattern_v1.md`.

### MP-17: Prefer DoD + code review rubrics over bespoke scripted validators

CAF should **not** accrete a growing pile of one-off “little checks” scattered across gates and workers.
When something must be enforced, the default home is the **Definition of Done (DoD)** and the **code review rubric** for the relevant capability.

#### **Why**

- Keeps enforcement **intentional and explainable** (review items are human-readable).
- Avoids **combinatorial validator growth** as new atoms/planes/capabilities are introduced.
- Prevents “two sources of truth” drift (a scripted validator says one thing; the rubric says another).

#### **Preferred enforcement ladder**

1. **DoD + Review Rubric (primary)**  
   Encode the requirement as a rubric check (e.g., `RR-COMPOSE-01` for compose wiring). The reviewer fails closed on high-severity issues and emits an actionable feedback packet.

2. **Planning invariants (when it’s a plan-shape requirement)**  
   If the issue is “the plan is missing required structure” (empty task graph, missing obligations, missing trace anchors), enforce it as a planning invariant so build never starts from a broken plan.

3. **Deterministic lint only when it compiles from contracts/rubrics (belt-and-suspenders)**  
   If you need a fast, deterministic early tripwire, implement it as a **generic engine** that reads declarative assertions from the same rubric/contract surface—never as a new bespoke script per capability.

#### **Bespoke scripted validators are anti-patterns**

- Adding a new ad-hoc validator script because one instance failed once.
  Instead: **fix the producer** (planner/worker) and encode the invariant in the **rubric/DoD** so it never regresses.

### MP-18: Architectural tasks are parameterized by rails and TBPs, not hardcoded to technologies

Architectural tasks (e.g., `TG-20-*`, `TG-30-*`, `TG-40-*`, `TG-90-*`) must be written so they can realize different stacks **by consuming inputs** (pins/rails and resolved TBPs), rather than embedding “if postgres then …” or “if docker then …” logic.

#### Why

- Prevents combinatorial explosion as new technologies are introduced (mysql/oracle/sqlserver/aurora/etc.).
- Keeps the plan reusable across instances and reduces per-instance bespoke churn.
- Improves traceability: the “why” lives in the rails/TBP manifests; tasks follow the resolved view.

#### Rules of thumb

- Architectural tasks MUST include `profile_parameters_resolved.yaml` as a required input when they are subject to rails.
- Architectural tasks SHOULD include `tbp_resolution_v1.yaml` when TBPs may affect implementation details.
- Technology-specific realization is confined to:
  - TBP extension tasks (`TG-TBP-*`), and/or
  - manifest-driven role bindings that workers must follow.
- Review questions should be phrased generically (“aligned to resolved persistence rails?”) rather than naming a specific vendor/engine.


### MP-19: Composable deterministic scripts (CLI + importable internal_main)

Deterministic tools (gates, mergers, indexers, evaluators) MUST be safe to:

- run from the CLI (a normal `node ...` invocation), and
- import and call from other tools **without executing on import**.

#### Rules

- Export an explicit entrypoint: `export async function internal_main(argv, deps?)`.
- Do not perform work at module top-level (no filesystem reads/writes, no mutation, no `await main()`).
- Preserve CLI behavior with a main-guard that only runs when the file is the entry module.

#### Composition rule (avoid Node process fan-out)

When one deterministic step immediately follows another and **no semantic step intervenes**, bundle them into a single `*_postprocess_v1.mjs` helper that imports the stage `internal_main` functions and calls them in order.

Example: `tools/caf/retrieval_postprocess_v1.mjs` chains:

1) `apply_grounded_candidates_v1`
2) `pattern_retrieval_scaffold_merge_v1`
3) `retrieval_gate_v1`

#### Why this matters

- Prevents agent “ordering quirks” where a later gate runs before a required mechanical merge/hydration step.
- Reduces token burn by keeping mechanical edits out of the LLM loop.
- Improves determinism and speed by reusing in-process functions instead of spawning multiple Node processes.


### MP-20: Deterministic sandwich around semantic steps (pre-gate + semantic + post-gate)

Many CAF workflows have an inherent semantic barrier:

1) deterministic prerequisites (copy/normalize/seed/hydrate)
2) a semantic step (LLM reasoning, summaries, decisions, planning)
3) deterministic compilation/validation/indexing

Agents often assume deterministic tools are idempotent and reorderable. CAF must not rely on that assumption.

#### Rules

- If a semantic step depends on deterministic prerequisites, provide a **pre-gate** (preflight) that runs those prerequisites and fails closed when incomplete.
- If downstream gates/workers depend on semantic outputs, the deterministic builder MUST **fail closed** when semantic blocks are missing or placeholder-like.
- Provide a **post-gate** (postprocess) that runs deterministic **invariant checks** and fails closed when violated.
  - Default posture: **check invariants first; do not auto-fix**.
  - If a deterministic repair exists, it should be an explicit, human-invoked maintenance step (reset/repair command), not a hidden "postprocess" that encourages agent laziness.
- Avoid skill text that says “run scripts 1..N in order”. Prefer one of:
  - a single `*_preflight_v1.mjs` helper,
  - a single `*_postprocess_v1.mjs` helper, and/or
  - split commands (`/caf arch` vs `/caf plan`) so the semantic barrier is explicit.

#### Examples

- `/caf build` uses `build_preflight_v1.mjs` to collapse mechanical steps before build gates.
- Planning runs deterministic invariants (`validate_instance_v1.mjs --mode=plan` + post-plan gates) before build dispatch.
- Retrieval blob build fails closed when required semantic summary blocks are still empty/placeholders.

#### Why this matters

- Prevents “run the eval before doing the work” failures.
- Makes deterministic steps truly rerun-safe and reduces agent thrash.
- Keeps the semantic barrier explicit so context compaction does not erase planning steps.

---

### MP-21: Feedback packets include human + autonomous agent remediation

Feedback packets are both a human troubleshooting artifact and an autonomous-agent action plan.

#### Rules

- Minimal Fix Proposal should include:
  - a **human operator path** (commands like `/caf plan`, `/caf build`, or scripted reset helpers)
  - an **agent remediation path** (the concrete file edits required, then which command to rerun)
- When deletion is required, include a **PM-friendly manual delete list** (paths) in addition to the scripted reset helper.
- Use the arch/plan split correctly:
  - design issues => `/caf arch`
  - planning issues => `/caf plan`
  - build issues => `/caf build`

---

### MP-22: Incremental semantic work for constrained models

Some models (or constrained environments) time out or degrade when asked to update large candidate sets (e.g., 10–20 patterns) in a single semantic step.

#### Rules

- Prefer **incremental updates**: update evidence/decisions **one pattern at a time** (or small batches), then rerun gates.
- Keep each semantic edit small and auditable; avoid "one swoop" rewrites.
- If a gate demands coverage across all pins, iterate: fill missing evidence per pattern, rerun, repeat.
- In skills, explicitly recommend incremental loops for low-resource runtimes.

---

### MP-23: Deterministic enrichment ownership must be explicit

CAF may use deterministic post-plan or post-build enrichment when the content being attached is already framework-owned and repetitive.

#### Rules

- Keep the planner focused on the minimal structural skeleton:
  - task ids
  - dependencies
  - capability routing
  - baseline task contract
  - semantic/trace anchors
  - task-local hints required for deterministic targeting
- Use deterministic enrichers only for framework-owned or library-authored repetitive pressure such as:
  - semantic acceptance attachments
  - required inputs implied by resolved rails
  - derived binding-contract artifacts
- Do not use enrichers to compensate for missing planner-owned semantic artifacts. If the planner omitted a semantic artifact, strengthen instructions and fail closed.
- Every new library terminal or realization option must have an explicit ownership path:
  - planner-owned carrier
  - deterministic enricher/deriver (if any)
  - verifying gate
- Prefer declarative matcher kinds and artifact classes over hardcoded TBP- or technology-specific conditionals in generic gates.

#### Why this matters

- Keeps planner prompts smaller and more stable.
- Prevents worker-local lore from becoming the only place where framework rules live.
- Makes template-default decisions safer: a terminal should not become the default until its ownership path is first-class.

## 6. Avoid duplication: a single home for a choice

### MP-12: If a dedicated contract section exists, do not duplicate decisions elsewhere

Example:

- CP↔AP contract choices belong in the Plane Integration Contract section
- do not also create a separate “decision inventory” block that repeats the same choice

This prevents drift and reduces architect friction.

---

## 7. Resolved view and orchestration authority

### MP-13: Layer 8 resolved view is authoritative

When branching behavior depends on pins and derived rails, treat Layer 8 resolved output as the single source of truth.

### MP-14: Rerun-safe by default

A normal workflow should be:

- architect flips statuses
- rerun `caf-arch` (low friction)
- CAF regenerates designer/CAF managed blocks and compiles plan based on adopted signals

---

## 8. Migration rules for evolving scaffolds

### MP-15: Upgrade scaffolds only when untouched

If a producer improves a default scaffold:

- it may upgrade legacy blocks only when they appear untouched defaults
- if a human has edited a block, preserve it verbatim and instead emit a feedback packet suggesting how to migrate if needed

---

## 9. Non-edit rule for generated archives

### MP-16: Do not hand-edit generated instance outputs in CAF archives

Do not manually edit:

- `reference_architectures/`
- `companion_repositories/`

Fix producers, templates, validators instead.

---

## 10. Worked examples

### Example A: Pattern applicability (decision_resolutions_v1)

Human action:

- change `status`
- optionally `rationale` (1–2 sentences; why adopt/reject)
- optionally add `anchors` (point to the specific spec/design/contract section that justifies the choice)
- optionally narrow `resolved_values` **only if** the pattern defines pins you intend to lock now (otherwise leave `{}`)

Sensible example (showing the optional fields filled in):

```yaml
version: 1
resolutions:
  - evidence_hook_id: H-CAF-TCTX-01-01
    pattern_id: CAF-TCTX-01
    status: adopt
    anchors:
      - spec_ref: reference_architectures/hello-saas/layer_6/system_spec_v1.md#Tenancy
      - spec_ref: reference_architectures/hello-saas/layer_6/application_spec_v1.md#Resources
      - decision_checklist: DC-API-IDENT-01
    rationale: "Multi-tenant SaaS; tenant context must be explicit at AP ingress to prevent cross-tenant leakage."
    resolved_values: {}
```

### Example B: Optionized answers

An option set in an `ARCHITECT_EDIT_BLOCK`:

- options are prepopulated from library-owned pattern option_sets
- architect flips exactly one to adopt

---

## 11. Checklist pointer

See: `architecture_library/patterns/caf_meta_v1/caf_meta_patterns_checklist_v1.md`
