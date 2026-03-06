# Samples

CAF is easiest to understand with concrete instance outputs.

## Recommended samples to include (sanitized)

- A small `reference_architectures/<sample-instance>/` snapshot after:
  - `/caf saas`
  - `/caf arch` (architecture scaffolding)
  - `/caf next <instance> apply=true`
  - `/caf arch` (design/backlog)
- A small `companion_repositories/<sample-instance>/` snapshot after `/caf build`.

Note: these folders are typically gitignored in normal CAF usage, so samples should be copied/archived under `docs/user/samples/`.

## How to add samples

1. Generate a small instance with a short name (e.g., `hello-saas`).
2. Remove any secrets, tokens, or environment-specific identifiers.
3. Add the sanitized snapshots under `docs/user/samples/` (or provide them as separate downloadable archives).

Placeholders:

- `docs/user/samples/reference_architectures_hello_saas.zip` (TBD)
- `docs/user/samples/companion_repositories_hello_saas.zip` (TBD)
