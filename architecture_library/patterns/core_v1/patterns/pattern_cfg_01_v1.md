# Configuration Boundary (CFG-01)

PATTERN_ID: CFG-01
NAME: Configuration Boundary
CATEGORY: assembly_composition
INTENT: Centralize configuration definition, loading, and validation behind a configuration boundary so runtime settings are explicit, validated, and injectable.
APPLIES_WHEN: This pattern applies whenever the system uses any environment-, file-, or secret-derived configuration, which is expected for nearly all services.
INTRODUCES_MODULE_ROLES: config_registry; config_model; config_provider
ALLOWED_DEPENDENCIES: domain_core must not depend on config_provider; application_boundary may depend on config_model; app_composition_root binds config_provider to config_model; infrastructure_adapters may implement config_provider.
ASSEMBLY_CONTRACT: config_registry is owned by app_composition_root and is the sole mechanism by which configuration is loaded and made available to the rest of the system. config_model defines the set of required keys, defaults, and validation rules in a stack-neutral way. config_provider is an adapter role that reads configuration from approved sources and produces a validated config_model instance. No module reads configuration directly from ambient process state.

REQUIRED_EVIDENCE_HOOKS:
- E-CFG-01-01: The plan lists the configuration keys and validation rules that are required by the designs (including any tenancy or identity-related configuration if implied).
- E-CFG-01-02: The module plan identifies config_model, config_provider, and config_registry roles and describes how other modules receive configuration.

STRUCTURAL_VALIDATIONS:
- V-CFG-01-01: The module plan states that only config_provider reads ambient configuration sources and all other modules obtain config via injection or registry lookup.
- V-CFG-01-02: PLAN.md includes a step that validates configuration at startup and fails closed when required keys are missing or invalid.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define configuration model and required keys
  REQUIRED_CAPABILITIES: configuration_modeling
  WRITE_SET: docs_architecture
  DELIVERABLES: module_plan_section
  EVIDENCE_REQUIRED: E-CFG-01-01
  VALIDATIONS: V-CFG-01-02
- STEP_TITLE_TEMPLATE: Define configuration provider and registry wiring
  REQUIRED_CAPABILITIES: configuration_wiring
  WRITE_SET: app_core; infra_boundary
  DELIVERABLES: config_provider_impl; config_registry_binding
  EVIDENCE_REQUIRED: E-CFG-01-02
  VALIDATIONS: V-CFG-01-01

JUSTIFICATION: A configuration boundary prevents scattered runtime assumptions, supports fail-closed startup validation, and keeps configuration sources stack-specific while the model and contract remain stack-independent.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
