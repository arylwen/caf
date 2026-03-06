# CAF Anti-Repair-Scripts Posture (Meta-Pattern)

CAF is **fail-closed**. When invariants fail, the default mitigation is to **strengthen gates** at the correct phase boundary—not to teach agents that they can skip steps and “fix later” with ad-hoc scripts.

## Normative rules

1) **No repair scripts as first-line mitigation**

- Do not introduce “repair scripts” to patch instance artifacts after a producer failed.
- Do not rely on “cleanup then rerun” as a substitute for correct phase ordering.

2) **Prefer invariant gates at the right boundary**

- If a semantic producer can drift, add:
  - a deterministic **pre-gate** for prerequisites, and
  - a deterministic **post-gate** that checks invariants on the produced artifacts.
- Place the gate where the invariant first becomes meaningful:
  - Example: design→planning coherence is enforced at the end of design (`/caf arch`), not first discovered during planning (`/caf plan`).

3) **Repairs are allowed only as explicit human-invoked maintenance commands**

- If a deterministic repair exists, it must be:
  - explicit (a named command),
  - documented as operator/maintainer tooling,
  - and never hidden in a postprocess step.

## Checklist (quick)

- [ ] Did we add a gate instead of a repair script?
- [ ] Is the gate placed at the correct phase boundary?
- [ ] Does the feedback packet recommend rerun `/caf arch` / `/caf plan` (phase-correct), not “run a script”?
- [ ] If a repair exists, is it explicit, human-invoked, and documented?
