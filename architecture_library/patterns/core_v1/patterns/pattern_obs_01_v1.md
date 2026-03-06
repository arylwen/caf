# Observability Boundary (OBS-01)

PATTERN_ID: OBS-01
NAME: Observability Boundary
CATEGORY: ops_observability
INTENT: Ensure consistent telemetry (logs, metrics, traces identifiers) is emitted for requests, key operations, and failures using a stable observability boundary and correlation from request context.
APPLIES_WHEN: This pattern applies whenever the system is expected to be operated, debugged, or audited, including local prototypes and beyond.
INTRODUCES_MODULE_ROLES: observability_port; observability_adapter; telemetry_context_enricher
ALLOWED_DEPENDENCIES: application_boundary and domain_core may depend on observability_port; observability_adapter may depend on external telemetry sinks; no module may depend directly on external telemetry SDKs except observability_adapter.
ASSEMBLY_CONTRACT: app_composition_root binds observability_port to observability_adapter. telemetry_context_enricher derives correlation fields from request_context and ensures all emitted telemetry includes correlation fields (request_id, tenant_id where applicable, user_id where applicable). Telemetry requirements are specified as a minimal contract, not as stack-specific instrumentation.

REQUIRED_EVIDENCE_HOOKS:
- E-OBS-01-01: The design or module plan identifies the minimal telemetry contract (required fields and required events for request start, request end, and errors).
- E-OBS-01-02: The plan ties telemetry correlation to CTX-01 by stating which context fields are included in telemetry.

STRUCTURAL_VALIDATIONS:
- V-OBS-01-01: The module plan includes observability_port and forbids direct usage of telemetry SDKs outside observability_adapter.
- V-OBS-01-02: The evidence file records correlation fields and references the request_context structure.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define observability contract and correlation fields
  REQUIRED_CAPABILITIES: observability_contract
  WRITE_SET: docs_architecture
  DELIVERABLES: observability_contract_section
  EVIDENCE_REQUIRED: E-OBS-01-01; E-OBS-01-02
  VALIDATIONS: V-OBS-01-02
- STEP_TITLE_TEMPLATE: Implement observability port and bind to adapter
  REQUIRED_CAPABILITIES: observability_implementation
  WRITE_SET: app_core; infra_boundary
  DELIVERABLES: observability_port; observability_adapter; composition_binding
  EVIDENCE_REQUIRED: E-OBS-01-01
  VALIDATIONS: V-OBS-01-01

JUSTIFICATION: This pattern ensures the system can be operated and debugged without embedding stack-specific telemetry decisions into core logic or scattering instrumentation across modules.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
