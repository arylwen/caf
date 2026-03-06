# TBP-EXPRESS-01 — Express framework binding

## Binds to

- `runtime.framework: express`

## Requires

- `TBP-TS-01` (TypeScript language conventions)

## Intent

Bind an HTTP API service to Express with deterministic entrypoint and routes module paths.

This TBP does not select vendor products (API gateways, auth providers, etc.). It only establishes the
framework-level layout so planners/workers can materialize runnable candidates without hardcoding.

## Deterministic layout

The manifest declares role bindings for:

- AP HTTP entrypoint (`ap/runtime/server.ts`)
- AP routes module (`ap/api/routes.ts`)
