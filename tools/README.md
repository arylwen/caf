# Tools (optional; not used by marketing flows)

This folder is reserved for **optional, producer-side helper scripts** that can perform **mechanical extraction / lint / formatting** tasks.

Non-negotiables:

- Scripts MUST NOT introduce architecture decisions, pattern inclusion rules, or vendor/product choices.
- Scripts MUST be **mechanical only**: copy/transform/validate/derive.

Two-track rule:

- The default CAF workflow remains portable and may be executed as instruction-only.
- A parallel, opt-in **scripted helper track** may be used when the environment supports it (e.g., Node.js).

Write rules for scripts:

- Scripts MAY write under `reference_architectures/**` or `companion_repositories/**` **only** when performing a
  deterministic mechanical operation that a no-script SKILL would otherwise do (e.g., seeding an instance).
- Scripts MUST follow the same fail-closed + feedback packet rules as SKILLs.

See `tools/caf/README.md` for the intended dual-track design.

See also `tools/caf-meta/README.md` for maintainer-only library audit helpers.
