---
name: worker-playbook-source-projector
description: >
  Project PRD-grounded playbook source docs under /caf arch. Use when CAF needs to
  replace default starter application-domain or product-surface source docs with
  real product intent, while preserving meaningful human edits.
---

# worker-playbook-source-projector

## Purpose

Own the **instruction-based source projection** seam for:

- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md`
- `reference_architectures/<name>/spec/playbook/application_product_surface_v1.md`

This worker exists so CAF does not carry stale starter review/workspace content into later design/planning phases.

## Inputs (required when present)

Primary semantic inputs:
- `reference_architectures/<name>/product/PRD.resolved.md`
- `reference_architectures/<name>/product/PLATFORM_PRD.resolved.md` when present
- `reference_architectures/<name>/product/UX_VISION.md` for architecture-shape-relevant and product-surface-relevant cues only

Current source docs:
- `reference_architectures/<name>/spec/playbook/application_domain_model_v1.md`
- `reference_architectures/<name>/spec/playbook/application_product_surface_v1.md`

Canonical templates:
- `architecture_library/phase_8/templates/application_domain_model_v1.template.md`
- `architecture_library/phase_8/templates/application_product_surface_v1.template.md`

Supporting context when useful:
- `reference_architectures/<name>/spec/playbook/application_spec_v1.md`
- `reference_architectures/<name>/spec/playbook/architecture_shape_parameters.yaml`
- `reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml`

## Output rules

This worker may update only:
- `spec/playbook/application_domain_model_v1.md`
- `spec/playbook/application_product_surface_v1.md`

It must not rewrite other source docs in this seam.

## Ownership rules

- Keep `/caf prd` as the owner of PRD resolution and architecture-shape promotion.
- Keep this worker under `/caf arch` as the owner of PRD-grounded source projection for still-default playbook source docs.
- Treat the detailed domain model and the product surface as **externalized source docs**, not as content that should live inside `*_spec`.
- Do not project framework/runtime choices into the product surface.
- Do not push detailed design-system realization into the domain model.

## When to replace versus preserve

You may replace a source doc when **any** of these are true:

1. It still matches the canonical template closely.
2. It still contains the legacy review-workspace starter vocabulary, such as `Review Workspace`, `Workspace`, `Submission`, `Review`, `Report`, `Workspaces`, or `Review Queue`, and that vocabulary is clearly not aligned with the resolved PRD.
3. It contains a prior CAF projection marker and there is no sign of meaningful human edits.

You must preserve a source doc when it has been meaningfully human-edited beyond the template/projection baseline.

## Projection requirements

### Application domain model

Project a compact but real source model from the resolved PRD:

- use the PRD's actual business objects, capabilities, and use-case flows
- prefer the PRD's domain language over generic review/workspace language
- include bounded contexts / aggregates / entities / invariants / persistence intent only as far as the PRD actually supports
- include use cases that reflect the resolved product flows
- keep the output source-like and editable by humans

### Application product surface

Project a compact but real product-surface source from the resolved PRD and bounded UX/design signals:

- primary user-facing journeys
- main workspaces/pages/surfaces
- navigation/shell expectations at product level
- important UX constraints that matter to later UX derivation and UI realization

Use `UX_VISION.md` only for product-surface-relevant cues such as:
- branding/logo preferences
- color/tone direction
- clarity/trust posture
- accessibility/readability posture
- component-system preference when explicitly stated

Do not let `UX_VISION.md` override product meaning stated in the PRD.

## Marker discipline

When you replace a source doc automatically, include a short top-of-file marker comment:

- `<!-- CAF_PROJECTED_SOURCE: application_domain_model_v1 from PRD.resolved.md -->`
- `<!-- CAF_PROJECTED_SOURCE: application_product_surface_v1 from PRD.resolved.md -->`

If you detect meaningful human edits later, preserve the file and do not keep refreshing it blindly.

## Failure posture

- If `PRD.resolved.md` is missing or too incomplete to support projection, preserve the existing source docs and do not invent content.
- If the PRD is present and specific, do not leave clearly stale legacy review/workspace starter content in place.
