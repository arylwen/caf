# Persistence Boundary via Repositories (PST-01)

PATTERN_ID: PST-01
NAME: Persistence Boundary via Repositories
CATEGORY: data_persistence
INTENT: Encapsulate all persistence access behind repository ports so domain and application services remain independent of storage technology.
APPLIES_WHEN: This pattern applies whenever the system persists domain state and the design does not explicitly commit to an alternative boundary (for example, event sourcing). In CAF Layer 1, repository ports are the default persistence boundary.
INTRODUCES_MODULE_ROLES: repository_ports; persistence_adapters; persistence_models
ALLOWED_DEPENDENCIES: domain_core and service_facades may depend on repository_ports; persistence_adapters implement repository_ports and may depend on persistence_models and storage SDKs; domain_core must not depend on persistence_adapters or storage SDKs.
ASSEMBLY_CONTRACT: service_facades interact with persistence exclusively through repository_ports. app_composition_root binds each repository port to a concrete persistence_adapters implementation. Persistence adapters are the only place where storage-specific logic appears.

REQUIRED_EVIDENCE_HOOKS:
- E-PST-01-01: The module plan lists repository ports for each persisted resource or aggregate referenced by the spec.
- E-PST-01-02: The plan states that storage SDK usage is confined to persistence_adapters.

STRUCTURAL_VALIDATIONS:
- V-PST-01-01: For each persisted resource in the spec, the module plan includes a repository port role and a corresponding adapter role.
- V-PST-01-02: The module plan dependency rules forbid direct storage SDK usage outside persistence_adapters.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define repository ports for persisted resources
  REQUIRED_CAPABILITIES: persistence_boundary_design
  WRITE_SET: docs_architecture
  DELIVERABLES: module_plan_section
  EVIDENCE_REQUIRED: E-PST-01-01
  VALIDATIONS: V-PST-01-01
- STEP_TITLE_TEMPLATE: Bind repository ports to persistence adapters in the composition root
  REQUIRED_CAPABILITIES: assembly_contract_design
  WRITE_SET: docs_architecture
  DELIVERABLES: assembly_contract_section
  EVIDENCE_REQUIRED: E-PST-01-02
  VALIDATIONS: V-PST-01-02

JUSTIFICATION: This pattern provides a stack-independent persistence boundary that is easy to staff with specialized workers and easy to validate structurally.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
