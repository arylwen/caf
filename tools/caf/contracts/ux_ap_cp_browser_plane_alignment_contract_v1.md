# UX AP/CP browser plane alignment contract v1

**Owner:** `/caf ux build` richer UX realization posture and framework post-build validation  
**Status:** adopted 0.4.1 release-close hardening note

## Intent

Keep the richer UX lane operationally usable by separating:

- **AP/browser data flows** for product data reads and mutations, and
- **CP/policy flows** for preview, explainability, or explicit governed confirmation when present.

## Contract

- The richer UX lane may call both AP and CP surfaces, but they do not own the same job.
- Product data worklists, detail reads, and data mutations must use the browser-facing AP/runtime surface.
- A CP contract or policy boundary may be used for preview or consequence-explanation, but it must not be the only runtime path for the product data surface.
- A shared UX API helper may expose both AP and CP helpers, but domain list/detail/create/update/delete helpers must not all collapse into a single CP `contractRequest(...)` path.
- Pages may keep user-facing copy about policy/governance, but the underlying data path must still realize the AP-owned product interaction.

## Why

A richer UX lane that routes all domain behavior through a CP gateway can appear "wired" while still failing to materialize the usable product surface:

- worklists return acceptance envelopes instead of domain rows,
- detail/edit flows cannot round-trip real product state,
- publish/admin/activity surfaces become descriptive wrappers around governance rather than product operations.

## Examples

Allowed:
- AP helper exports such as list/create/update helpers for product resources
- optional CP preview helpers that are called before a governed commit or to explain a permission outcome

Not allowed:
- every domain helper in `code/ux/src/api.js` posting to `'/cp/contracts/.../enforce'`
- treating a CP acceptance envelope as if it were the product data model for list/detail/admin/activity surfaces
