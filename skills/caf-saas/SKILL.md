---
name: caf-saas

description: >
  Front door for SaaS instance initialization. Supports both a short form and structured subcommands.
  Delegates to caf-saas-init. No routing packets are printed. Fail-closed.
---

> **Contract compliance:** governed by `architecture_library/__meta/caf_operating_contract_v1.md`.
> If this SKILL conflicts with the contract, the contract wins.


# caf-saas

## Purpose

Initialize a new SaaS reference architecture instance under `reference_architectures/<instance_name>/`
by delegating to `caf-saas-init`.

This skill must not emit any router/protocol blocks (no ROUTE_PACKET, no ACTION_REQUEST).

## Inputs

The user may invoke this command in any of these supported forms (all are equivalent):

### Short form

- `caf-saas <instance_name>`
- `caf-saas <instance_name> <profile_template_id>`

### Structured forms (supported for compatibility with runtime vocab)

- `caf-saas create new saas <instance_name>`
- `caf-saas create new saas <instance_name> <profile_template_id>`
- `caf-saas init <instance_name>`
- `caf-saas init <instance_name> <profile_template_id>`

Where:

- `instance_name` is required for any initialization.
- `profile_template_id` is optional; default is `intentionally_boring_saas_v1`.

## Validation

- `instance_name` must match:
  `^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$`

- `profile_template_id` (when provided) must match the same regex.

## Deterministic parsing rules (fail-closed)

Given the raw token list after `caf-saas`:

1) If there are **no tokens**:
   - Print a short usage hint (2–3 lines) showing the short form and one structured example.
   - Do not list other skills.

2) If the first token is `create`:
   - Require tokens `create new saas <instance_name>` (exact words `new` and `saas`).
   - Optionally allow a final `<profile_template_id>`.
   - Any other `create ...` shape is invalid (fail-closed with one-line error).

3) If the first token is `init`:
   - Require `init <instance_name>` and optionally `<profile_template_id>`.

4) Otherwise:
   - Interpret the first token as `<instance_name>` and the second token (if present) as `<profile_template_id>`.
   - If more than 2 tokens remain, fail-closed (ambiguous invocation).

After parsing, validate both fields with the regex rules above.

## Behavior

1) If parsing+validation succeeds:
   - Do NOT check whether `reference_architectures/<instance_name>/` exists; this command creates it.
   - Delegate to `caf-saas-init` with:
     - `instance_name`
     - `profile_template_id` (provided or default)
   - 

2) If parsing+validation fails:
   - Print a one-line error describing the accepted shapes and the allowed naming format.
   - Do not attempt any file operations.

## Output constraints

- Never print runtime command examples beyond the minimal usage hint when invoked with no tokens.
- 
- Never list skills by default.
- Never echo template contents.


## Next steps (required)
After initialization, include a short "Next steps" section that:
- tell the user to review defaults in the configuration files and change architectural intent as needed
- tell the user to run `/caf arch <name>`
- include the exact example using the created instance name (e.g., `/caf arch hello-saas`)

