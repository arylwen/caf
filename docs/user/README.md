# CAF user docs

CAF is used via a single command surface (`/caf ...`) inside a supported agent runner.

## Choose your path (by role)

- Product managers: [Product manager view](11_product_manager_view.md)
- Architects / platform engineers: [Architect docs (advanced)](../architect/README.md)

## Ask CAF questions (assistant-friendly)

CAF is designed so you can answer stakeholder questions with a single UX surface: `/caf ask <question...>`.

Start here:

- [Answering questions with CAF](14_answering_questions_with_caf.md)

## Quickstart - create a CAF SaaS reference implementation

```text
/caf saas hello-saas
/caf prd hello-saas           # optional
/caf arch hello-saas
/caf next hello-saas apply=true
/caf arch hello-saas
/caf plan hello-saas
/caf build hello-saas
```

## Recommended reading order

1. [What is CAF?](01_what_is_caf.md)
2. [Installation](02_installation.md)
3. [Quickstart](03_quickstart.md)
4. [PRD → Architecture Shape](12_prd_workflow.md)
5. [Core concepts](04_core_concepts.md)
6. [Instances, phases, and state](05_instances_phases_and_state.md)
7. [Answering questions with CAF](14_answering_questions_with_caf.md)
8. [Architecture library](06_architecture_library.md)
9. [Pattern browser](10_pattern_browser.md)
10. [Skills, runners, and command surface](07_skills_runners_and_command_surface.md)
11. [Feedback packets and debugging](08_feedback_packets_and_debugging.md)
12. [Customization and extension](09_customization_and_extension.md)
13. [Profile parameters configuration](13_profile_parameters_configuration.md)
14. [Samples](90_samples.md)

## Pattern browser (direct links)

- Taxonomy + graphs: [`docs/patterns/pattern_taxonomy_v1.md`](../patterns/pattern_taxonomy_v1.md)
