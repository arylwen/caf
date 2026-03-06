# Gates and fail-closed behavior

CAF gates are the main correctness and drift-resistance mechanism.

## Gate semantics (conceptual)

- A gate **blocks** progression when a required input/contract is missing.
- A gate emits a **feedback packet** that describes the minimal fix.
- Gates are deterministic; they do not “interpret intent.”

## Where gates live

- Instance/runtime helpers: `tools/caf/`
- Library/meta audits: `tools/caf-meta/`

Representative gates:

- `tools/caf/arch_gate_v1.mjs`
- `tools/caf/retrieval_gate_v1.mjs`
- `tools/caf/planning_invariant_gate_v1.mjs`
- `tools/caf/build_gate_v1.mjs`

## Feedback packets (architect impact)

Feedback packets are how CAF says:

- “you are missing a required decision / artifact”
- “your plan violates a contract”
- “your build output is non-runnable”

Architect workflow:

- treat a feedback packet as a **blocking contract violation** unless it is explicitly advisory
- apply the minimal fix
- rerun the phase command

See also:

- `docs/user/08_feedback_packets_and_debugging.md`
