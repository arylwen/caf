# Request Context and Propagation (CTX-01)

PATTERN_ID: CTX-01
NAME: Request Context and Propagation
CATEGORY: boundaries
INTENT: Establish a request-scoped context that carries identity, tenancy, and correlation metadata and ensure it is available to all layers handling the request.
APPLIES_WHEN: This pattern applies when the spec or design implies multi-user behavior, multi-tenancy, auditing, or correlation. CAF's identity core requires tenant_id, user_id, and user_name, and the design must ensure these values are established at the application boundary and propagated through internal calls.
INTRODUCES_MODULE_ROLES: context_boundary; context_object; context_access_api
ALLOWED_DEPENDENCIES: application_boundary may create or populate context_object; domain_core may read context via context_access_api; infrastructure_adapters may read context for tagging logs, queries, or outbound calls; no module may infer tenant or user identity from ad hoc globals.
ASSEMBLY_CONTRACT: The application boundary establishes a context instance per request. Downstream modules access context via a stable access API (explicit parameter passing or an equivalent scoped access mechanism declared in the module plan). Context propagation is mandatory for all operations that touch tenant-scoped data or user-scoped policy decisions.

REQUIRED_EVIDENCE_HOOKS:
- E-CTX-01-01: The module plan defines the context object fields (tenant_id; user_id; user_name; correlation_id) and identifies where the context is created.
- E-CTX-01-02: The plan lists which internal interfaces require context and how propagation is enforced.

STRUCTURAL_VALIDATIONS:
- V-CTX-01-01: The module plan includes a context_object role with the required identity core fields.
- V-CTX-01-02: The plan declares a propagation rule for all application_boundary to domain_core calls for tenant-scoped operations.

PLAN_STEP_ARCHETYPES:
- STEP_TITLE_TEMPLATE: Define request context object and creation boundary
  REQUIRED_CAPABILITIES: identity_context; tenancy_context
  WRITE_SET: docs_architecture
  DELIVERABLES: module_plan_section
  EVIDENCE_REQUIRED: E-CTX-01-01
  VALIDATIONS: V-CTX-01-01
- STEP_TITLE_TEMPLATE: Define context propagation contract across internal interfaces
  REQUIRED_CAPABILITIES: identity_context; tenancy_context
  WRITE_SET: docs_architecture
  DELIVERABLES: assembly_contract_section
  EVIDENCE_REQUIRED: E-CTX-01-02
  VALIDATIONS: V-CTX-01-02

JUSTIFICATION: Context propagation is the minimal, stack-independent mechanism to preserve tenant isolation, policy enforcement inputs, and correlation across layers without relying on framework-specific behavior.
VERSION: v1
VERSION_HISTORY:
- v1: Initial release.
