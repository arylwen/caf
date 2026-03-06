# Feedback packets and debugging

CAF emits feedback packets instead of guessing.

Feedback packets are written under:

```text
reference_architectures/<instance>/feedback_packets/
```

Typical workflow:

1. Read the packet and its cited evidence.
2. Apply a deterministic fix (edit inputs, adjust a contract, or update a script).
3. Re-run the step.

Tips:

- Prefer fixing the *root contract* over patching downstream artifacts.
- Treat advisory packets as signals, but keep fail-closed behavior for correctness.

## Common packet causes

- Missing required pinned inputs (unknown enum values, incomplete profile parameters)
- Contract violations in derived YAML/MD blocks
- Gate failures (required artifacts missing for the current phase)
