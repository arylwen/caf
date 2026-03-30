# Application Product Surface (v1)

## How to use this file

This is the **human-edit source of truth** for the product-facing application surface.
CAF uses this source for product-surface wording, UX derivation, and UI-facing planning/build grounding.

Use this file when you want to describe:

- primary user-facing journeys
- main workspaces / pages / screens
- important list/detail / editor / admin / reporting surfaces
- navigation and shell expectations
- product-facing UX constraints

Rules:

- Keep the language product-facing rather than implementation-facing.
- Do not put framework/runtime choices here.
- Do not try to encode the full normalized domain model here; that belongs in `application_domain_model_v1.md`.
- Do not assume the seeded text is authoritative forever; `/caf arch` may project this file from the resolved PRD when it still contains default starter content.

## Product surface summary

Use this section to describe what a user should be able to do and what the main surfaces are.

Suggested prompts:

- Who is the primary operator or user?
- What is the first thing they need to see or accomplish?
- What are the main workspaces, pages, or screens?
- What are the key flows that should remain visible and easy to follow?

## Primary journeys

List the main user-facing journeys in product language.

Example format:

- manage the primary business object catalog
- open a detail/editor surface and make a meaningful change
- organize or publish work for other tenant users
- inspect history, results, or status when needed
- administer tenant-scoped settings or permissions when applicable

## Main surfaces

List the main product-facing surfaces or pages.

Example format:

- catalog / worklist
- detail / editor
- organization / publish surface
- admin / settings
- history / reporting

## Navigation and shell expectations

Describe the product-facing shell or navigation posture.

Suggested prompts:

- Is there a left navigation, tabs, or a simple header-only shell?
- Which surfaces need to feel always available?
- Which actions should remain one click away?

## Product-facing constraints

Capture UX constraints that matter at product-surface level.

Suggested prompts:

- keep flows understandable for first-time operators
- make status and completion visible
- keep destructive actions intentional
- optimize for clarity before advanced collaboration
