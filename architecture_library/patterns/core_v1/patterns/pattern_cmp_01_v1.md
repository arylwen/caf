# Composition Root and Layered Boundaries (CMP-01)

PATTERN_ID: CMP-01
NAME: Composition Root and Layered Boundaries
CATEGORY: assembly_composition
INTENT: Centralize application assembly in a single composition root and enforce one-way dependency direction across named layers and boundaries.
APPLIES_WHEN: This pattern applies whenever the system has more than one module of meaningful responsibility and requires deterministic wiring of dependencies. It is required for any architecture that claims separation between application boundary, domain core, and infrastructure adapters.
INTRODUCES_MODULE_ROLES: app_composition_root; application_boundary; domain_core; infrastructure_adapters
ALLOWED_DEPENDENCIES: application_boundary may depend on domain_core and abstract ports; domain_core must not depend on infrastructure_adapters; infrastructure_adapters may depend on domain_core ports and external SDKs; no circular dependencies across roles.
ASSEMBLY_CONTRACT: All concrete wiring occurs in app_composition_root. application_boundary depends only on abstractions for infrastructure concerns. domain_core defines ports required from infrastructure_adapters. Registration is performed through explicit registries owned by app_composition_root (for example: api_registry; dependency_registry; config_registry). Modules contribute via declared extension points to avoid shared-file thrash.

REQUIRED_EVIDENCE_HOOKS:
- E-CMP-01-01: The module plan lists the chosen layers and assigns each module role to a layer or boundary.
- E-CMP-01-02: The plan declares the composition root and the registries it owns (api_registry; dependency_registry; config_registry).

STRUCTURAL_VALIDATIONS:
- V-CMP-01-01: No dependency from domain_core to infrastructure_adapters is present in the module plan dependency rules.
- V-CMP-01-02: The module plan defines exactly one app_composition_root role and it is the only role allowed to bind ports to adapters.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define module boundaries and dependency direction
  REQUIRED_CAPABILITIES: architecture_decomposition
  WRITE_SET: docs_architecture
  DELIVERABLES: module_plan_section
  EVIDENCE_REQUIRED: E-CMP-01-01
  VALIDATIONS: V-CMP-01-01
- STEP_TITLE_TEMPLATE: Define composition root registries and extension points
  REQUIRED_CAPABILITIES: architecture_decomposition
  WRITE_SET: docs_architecture
  DELIVERABLES: assembly_contract_section
  EVIDENCE_REQUIRED: E-CMP-01-02
  VALIDATIONS: V-CMP-01-02

JUSTIFICATION: This pattern creates a stable, stack-independent skeleton for modularity, prevents dependency drift, and provides deterministic extension points for multi-worker code generation.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
