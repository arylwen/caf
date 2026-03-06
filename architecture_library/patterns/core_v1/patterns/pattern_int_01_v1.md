# External Integration Adapter Boundary (INT-01)

PATTERN_ID: INT-01
NAME: External Integration Adapter Boundary
CATEGORY: integration
INTENT: Isolate external dependencies behind internal ports and dedicated adapters so the core remains stable and testable.
APPLIES_WHEN: This pattern applies whenever the system interacts with external services, third-party SDKs, infrastructure APIs, or inbound callbacks that require translation.
INTRODUCES_MODULE_ROLES: integration_ports; integration_adapters; core_callers
ALLOWED_DEPENDENCIES: core_callers may depend on integration_ports; integration_adapters may depend on integration_ports and external SDKs; core_callers must not depend on integration_adapters or external SDKs.
ASSEMBLY_CONTRACT: integration_ports define the required capabilities in stack-neutral terms. integration_adapters implement those ports and translate external data structures to internal types. app_composition_root binds each port to exactly one adapter implementation per environment.

REQUIRED_EVIDENCE_HOOKS:
- E-INT-01-01: The design or spec enumerates external integrations and names the corresponding internal ports.
- E-INT-01-02: The module plan identifies integration_adapters as the only location where external SDK or protocol details are permitted.

STRUCTURAL_VALIDATIONS:
- V-INT-01-01: The module plan includes integration_ports and integration_adapters roles and forbids core_callers from depending on external SDKs.
- V-INT-01-02: For each declared integration port, the plan includes an adapter role instance bound in the composition root.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define integration ports for declared external interactions
  REQUIRED_CAPABILITIES: integration_boundary_design
  WRITE_SET: docs_architecture
  DELIVERABLES: port_contracts
  EVIDENCE_REQUIRED: E-INT-01-01
  VALIDATIONS: V-INT-01-01
- STEP_TITLE_TEMPLATE: Implement adapters and bind ports in the composition root
  REQUIRED_CAPABILITIES: integration_adapter_implementation
  WRITE_SET: infra_boundary
  DELIVERABLES: adapter_implementations; binding_entries
  EVIDENCE_REQUIRED: E-INT-01-02
  VALIDATIONS: V-INT-01-02

JUSTIFICATION: This pattern keeps the core independent of volatile external APIs and creates deterministic tasks for integration work: define a port, implement an adapter, bind it.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
