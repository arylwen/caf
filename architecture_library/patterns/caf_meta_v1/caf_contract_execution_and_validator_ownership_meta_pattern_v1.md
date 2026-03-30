# CAF contract execution and validator ownership meta-pattern (v1)

## Intent

Keep enforcement generic while keeping stack/provider semantics owned by the right library seam.

CAF should not solve repeated mechanical issues by teaching workers more stack lore or by hardcoding one-off checks into top-level gates. Instead, enforcement should be compiled from framework-owned contracts, TBPs, role bindings, and deterministic helpers that already own the relevant semantics.

## The enforcement ladder

Use the narrowest enforcement surface that can fail closed honestly:

1. **Review and Definition of Done**
   - Default home for semantic quality expectations.
   - Preferred when human judgment is still needed.

2. **Script-owned structural repair**
   - Use when the issue is purely representational/mechanical and the framework already owns the artifact block.
   - Example: planning payload materialization and YAML scalar safety.

3. **Shared helper enrichment / canonicalization**
   - Use when multiple deterministic helpers must normalize the same machine key, naming rule, or task-target shape.
   - Examples: UI-seed target canonicalization, obligation-trace target canonicalization.

4. **Generic gate executing declared contracts**
   - Use when the rule is deterministic, fail-closed, and already owned in TBPs/contracts/role bindings.
   - The gate stays generic; it executes declarations rather than inventing technology-specific rules.

5. **TBP-declared validator_kind**
   - Use when plain local string evidence is too weak because the proof spans multiple owned surfaces.
   - The validator remains library-owned, reusable, and invoked by a generic gate.

## Ownership rules

### What belongs in workers
- semantic realization of the selected task and contract
- use of TBP role bindings and generated paths
- no stack-specific validation lore beyond what the owning contract/TBP already declares

### What belongs in generic gates
- orchestration of deterministic checks
- execution of declared validator kinds
- packet lifecycle and fail-closed control flow

### What belongs in TBPs / role bindings
- stack/provider-specific realization surfaces
- validator declarations (`validator_kind`, `validator_config`)
- proxy/owner delegation semantics when proof spans multiple files

### What belongs in shared validator libraries
- reusable deterministic validation logic
- mechanical parsing/inspection needed by declared validator kinds
- no instance-specific branching

## Proxy/owner delegated proof

A common CAF failure mode is asking a proxy/helper file to carry literal evidence for behavior intentionally delegated to an owning helper.

Examples:
- UI/UX API helper delegates auth header construction to a claim-builder/helper surface
- runtime wiring delegates dependency/provider logic to a framework-owned boundary module

In these cases:
- do **not** force the proxy file to duplicate owner-local markers
- do **not** patch a generic gate with file-specific stack lore
- do declare a TBP-owned validator that proves the proxy/owner pair together

## Anti-patterns

Avoid:
- bespoke top-level gate branches that know individual file names for one stack/framework
- worker prompts that restate validator semantics already declared in TBPs
- one-off repair scripts when an existing script-owned materializer already owns the format
- local marker checks that contradict the documented ownership split

## Examples from current CAF practice

### Script-owned structural repair
- planning payload materialization fixes unreadable YAML/block formatting without relying on worker prompt discipline alone

### Shared canonicalization
- UI-seed enrichment and obligation-trace enrichment now share canonical resource-key rules instead of each inventing a separator policy

### Generic contract execution with declared validators
- SQLAlchemy and runtime-manifest checks use TBP-declared validator kinds consumed by generic `tools/caf` gates
- delegated mock-auth proxy/owner proof belongs in `TBP-AUTH-MOCK-01` via a declared validator, not in a bespoke auth branch inside a generic build gate

## Consequence

When a new recurring failure appears, first ask:

1. Is the issue semantic or mechanical?
2. Which seam already owns the truth?
3. Can the existing generic gate execute a declared contract?
4. Does the proof span multiple owned surfaces, requiring a validator_kind?

Only after those questions should CAF add or change enforcement.
