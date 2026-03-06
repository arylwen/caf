# Application Service Facade Boundary (SVC-01)

PATTERN_ID: SVC-01
NAME: Application Service Facade Boundary
CATEGORY: boundaries
INTENT: Provide a stable application boundary that exposes resource and use-case operations and orchestrates domain logic, persistence, and policies behind a consistent interface.
APPLIES_WHEN: This pattern applies when the application_spec defines resources and operations, or when the design requires a clear entry boundary between inbound interfaces and domain logic.
INTRODUCES_MODULE_ROLES: application_service_facade; inbound_adapter; domain_core; persistence_port
ALLOWED_DEPENDENCIES: inbound_adapter may depend on application_service_facade; application_service_facade may depend on domain_core and ports; domain_core must not depend on inbound_adapter or persistence implementations; persistence implementations must not be called directly from inbound_adapter.
ASSEMBLY_CONTRACT: All resource operations are invoked through application_service_facade. Inbound adapters translate external requests into facade calls and do not contain business rules. The facade is the primary coordination point for validation, policy checks, persistence interactions through ports, and transactional boundaries when applicable.

REQUIRED_EVIDENCE_HOOKS:
- E-SVC-01-01: The module plan lists a service facade boundary and maps each declared resource operation to a facade operation.
- E-SVC-01-02: The plan declares that inbound adapters call facades and must not bypass them to reach persistence.

STRUCTURAL_VALIDATIONS:
- V-SVC-01-01: For each resource operation in application_spec, module_plan provides a corresponding facade operation identifier.
- V-SVC-01-02: The dependency rules prohibit inbound adapters from depending on persistence implementations.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define service facade operations from application_spec resources and ops
  REQUIRED_CAPABILITIES: architecture_decomposition
  WRITE_SET: docs_architecture
  DELIVERABLES: facade_operation_map
  EVIDENCE_REQUIRED: E-SVC-01-01
  VALIDATIONS: V-SVC-01-01
- STEP_TITLE_TEMPLATE: Define inbound-to-facade calling contract
  REQUIRED_CAPABILITIES: architecture_decomposition
  WRITE_SET: docs_architecture
  DELIVERABLES: boundary_contract
  EVIDENCE_REQUIRED: E-SVC-01-02
  VALIDATIONS: V-SVC-01-02

JUSTIFICATION: This pattern creates a deterministic place to implement resource operations, prevents business logic drift into adapters, and enables clean validation and policy enforcement.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
