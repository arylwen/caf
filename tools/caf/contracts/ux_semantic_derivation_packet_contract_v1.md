# UX semantic derivation packet contract v1

**Owner:** `skills/worker-ux-semantic-deriver/SKILL.md`  
**Status:** adopted 0.4.0 ownership contract for the `/caf ux` semantic seam

## Purpose

Define the instruction-owned semantic packet that carries UX meaning for `/caf ux`.

This packet exists so that:
- semantic intent is derived by instruction-owned reasoning,
- deterministic scripts remain responsible only for apply / validate / dedupe / pointer hydration / blob assembly,
- `ux_design_v1.md` can still be produced directly from derivation without requiring a manual architect promotion step.

## Canonical output

- `reference_architectures/<instance>/design/playbook/ux_semantic_derivation_packet_v1.yaml`

## Canonical inputs

Required:
- `reference_architectures/<instance>/product/PRD.resolved.md`
- `reference_architectures/<instance>/product/UX_VISION.md` when present
- `reference_architectures/<instance>/spec/playbook/application_product_surface_v1.md`
- `reference_architectures/<instance>/spec/guardrails/profile_parameters_resolved.yaml`
- `reference_architectures/<instance>/design/playbook/ux_design_v1.md`
- `architecture_library/phase_8/templates/application_product_surface_v1.template.md`

Legacy fallback only:
- `reference_architectures/<instance>/spec/playbook/application_spec_v1.md`
- `architecture_library/phase_8/templates/application_spec_v1.template.md`

Optional/contextual:
- `reference_architectures/<instance>/product/PLATFORM_PRD.resolved.md`
- `reference_architectures/<instance>/design/playbook/application_design_v1.md`
- `reference_architectures/<instance>/design/playbook/control_plane_design_v1.md`
- `reference_architectures/<instance>/design/playbook/contract_declarations_v1.yaml`

## Semantic ownership rule

The packet is the canonical owner of:
- primary product intent
- primary experience intent
- trust / clarity intent
- visual tone intent
- bounded core journeys
- coherent interaction surfaces
- pattern pressures
- state / recovery posture
- touchpoints / constraints
- interface contract pressures

Scripts must not infer those meanings through keyword, regex, or tie-break heuristics.

## Required schema

The packet must use:

```yaml
schema_version: ux_semantic_derivation_packet_v1
instance_name: <instance>
scope_and_actors:
  product_scope_summary: <string>
  primary_experience_emphasis: <string>
  primary_actors: [<string>]
  supporting_actors: [<string>]
  non_goals: [<string>]
  notes: [<string>]
pm_intent:
  primary_product_intent:
    summary: <string>
    cues: [<string>]
  primary_experience_intent:
    summary: <string>
    cues: [<string>]
  trust_clarity_intent:
    summary: <string>
    cues: [<string>]
  visual_tone_intent:
    summary: <string>
    cues: [<string>]
core_journeys:
  - journey_id: <string>
    title: <string>
    source_capabilities: [<capability_id or signal-derived>]
    actor: <string>
    goal: <string>
    trigger: <string>
    entry_surface: <surface_id>
    major_steps: [<string>]
    success_outcome: <string>
    failure_recovery_branches: [<string>]
    notable_variants: [<string>]
interaction_surfaces:
  - surface_id: <string>
    title: <string>
    purpose: <string>
    related_journeys: [<journey_id>]
    dominant_interaction_mode: <string>
    key_states: [<string>]
    notable_transitions: [<string>]
visual_direction:
  visual_tone: <string>
  navigation_shell: <string>
  density_posture: <string>
  surface_treatment: [<string>]
  typography_and_readability: [<string>]
  motion_posture: [<string>]
  ux_realization_posture: [<string>]
pattern_pressures:
  pressures:
    - pressure_id: <string>
      journey_ref: <journey_id>
      surface_ref: <surface_id>
      category: <string>
      priority: <high|medium|low>
      cues: [<string>]
      rationale: <string>
state_and_recovery:
  key_states: [<string>]
  recovery_principles: [<string>]
touchpoints_and_constraints:
  touchpoints: [<string>]
  constraints: [<string>]
interface_contract_pressures:
  contract_style_assumption: <string>
  pressures:
    - pressure_id: <string>
      category: <string>
      priority: <high|medium|low>
      cues: [<string>]
      rationale: <string>
```

## Compactness rule

The packet should stay bounded and directly useful downstream.

Default posture:
- 2 to 5 journeys
- 2 to 5 surfaces
- only the pressures that materially shape retrieval, planning, or later build realization

Do not emit a capability-per-journey inventory unless the product truly requires it.

## Consumption order

Downstream UX consumers should prefer:
1. manual architect override in `ux_design_v1.md`
2. semantic packet applied into CAF-managed semantic blocks
3. deterministic seed fallback

## Non-goals

This packet is not:
- a final frontend implementation plan,
- a CSS/tool/library decision file,
- a replacement for architect overrides,
- a retrieval candidate list.
