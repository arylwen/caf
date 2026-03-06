# Validation and Error Handling Boundary (VAL-01)

PATTERN_ID: VAL-01
NAME: Validation and Error Handling Boundary
CATEGORY: boundaries
INTENT: Validate inputs at boundaries and map failures into stable error contracts so invalid data and unhandled exceptions do not leak into or out of the core.
APPLIES_WHEN: This pattern applies whenever the system accepts any external input (always) and needs consistent error responses and logging.
INTRODUCES_MODULE_ROLES: validation_boundary; error_mapper; error_contract
ALLOWED_DEPENDENCIES: application_boundary may depend on validation_boundary and error_mapper; domain_core must not depend on boundary-level error mapping; error_mapper may depend on observability_boundary.
ASSEMBLY_CONTRACT: All inbound requests are validated before invoking domain operations. All outbound responses use error_contract for failures. Unhandled exceptions are caught at the boundary and mapped through error_mapper; internal details are not exposed.

REQUIRED_EVIDENCE_HOOKS:
- E-VAL-01-01: The spec or design lists input constraints for each operation and identifies where validation occurs.
- E-VAL-01-02: The design defines an error contract (error codes, messages, correlation id) and the mapping rule from internal failures to external responses.

STRUCTURAL_VALIDATIONS:
- V-VAL-01-01: Every operation in the PLAN has an explicit validation step or references a shared validation component.
- V-VAL-01-02: The module plan includes exactly one error mapping strategy at the boundary (no ad-hoc per-module error formats).

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define validation rules for an operation
  REQUIRED_CAPABILITIES: validation_modeling
  WRITE_SET: docs_architecture
  DELIVERABLES: validation_rules
  EVIDENCE_REQUIRED: E-VAL-01-01
  VALIDATIONS: V-VAL-01-01
- STEP_TITLE_TEMPLATE: Define error contract and boundary error mapping
  REQUIRED_CAPABILITIES: error_contract_design
  WRITE_SET: docs_architecture
  DELIVERABLES: error_contract
  EVIDENCE_REQUIRED: E-VAL-01-02
  VALIDATIONS: V-VAL-01-02

JUSTIFICATION: This pattern makes boundary behavior deterministic, reduces security risk from error leakage, and creates a stable contract for tests and validators.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
