# Feedback packets and fail-closed

CAF is fail-closed by default.

If required inputs are missing, contradictory, malformed, or ungroundable, CAF stops and writes a feedback packet rather than guessing.

## Canonical contract

The binding rule lives in:

- `architecture_library/__meta/caf_operating_contract_v1.md`
- `architecture_library/patterns/caf_meta_v1/caf_feedback_packet_protocol_meta_pattern_v1.md`
- `architecture_library/patterns/caf_meta_v1/caf_fail_closed_permission_checkpoint_meta_pattern_v1.md`

## Packet locations

- instance-scoped packets: `reference_architectures/<name>/feedback_packets/`
- CAF/library-scoped packets: `feedback_packets/caf/`

`feedback_packets/` is operational output, not documentation, and is gitignored.

## Maintainer posture

- Prefer enriching the existing packet over inventing a new side diagnostic file.
- Distinguish blocker vs advisory intentionally.
- Do not fail-closed on missing required outputs unless the responsible producer step actually ran.
- For instruction-heavy semantic stages, a single permission checkpoint is allowed when warranted, but it must not be used to dodge execution by default.
