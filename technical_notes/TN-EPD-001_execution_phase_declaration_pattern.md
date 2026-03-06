## P8-IDEA-002 - Execution Phase Declaration Pattern for Multi-Stage Skills

Status: Observed effective
Scope: Skill orchestration reliability
Pack Impact: Full and Portable (instruction compatible)

Problem

In multi-stage CAF pipelines that alternate between semantic reasoning and deterministic script steps, LLMs may:

- Skip intermediate integration steps
- Partially satisfy invariants
- Invoke validation gates before merge stabilization
- Compress planning into a premature final action

This is especially visible in caf arch when graph expansion, candidate integration, and gate checks are chained.

Pattern

Before transitioning between major semantic and deterministic stages, require an explicit phase declaration block that states:

1. The phase name
2. The invariant that must be satisfied
3. The concrete action about to be taken
4. The next validation or script step

Example structure:

Phase: Integrate Graph-Only Candidates
Invariant: At least N graph-derived candidates must appear in canonical candidate blocks.
Action: Write canonical candidate records into both managed spec blocks.
Next: Run scaffold merge helper.
Then: Run retrieval gate validation.

Observed Effects

- Reduced step skipping
- Improved graph-only candidate integration
- Fewer premature gate failures
- Clearer attribution of semantic vs deterministic failures

Guidance

- Use in long, invariant-heavy, multi-stage skills.
- Do not use in short single-pass skills.
- Keep declarations concise and structured.
- No additional formatting beyond plain text blocks.

Rationale

This pattern improves execution discipline without introducing new scripts or changing pipeline architecture. It works in both full and portable skillpacks because it is instruction-level only.