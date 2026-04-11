# Target system invariant catalog v1

CAF is the architecture control layer for AI-assisted software delivery.

This catalog gathers the full target-system invariant set: the truths the generated system is supposed to keep true once architecture has been carried forward honestly.

This catalog currently covers **17 family summaries**, **59 atomic invariants**, and **51 option-branch invariants** (**110 flat invariant rows**).

Important counting note: **pins are preserved inside invariant rows as references and tags**. They do not disappear, but they are not counted as a separate top-level row type in this catalog.

These are **target system invariants**: truths about what the system itself is supposed to keep true. They are separate from the CAF operational invariants that describe how the framework carries those truths through derivation, planning, gates, and build.

## Canonical machine-readable sources

- [`../../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml`](../../../architecture_library/16_contura_target_system_invariant_catalog_v1.yaml) — clean machine-readable target-system catalog.
- [`../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml`](../../../architecture_library/18_contura_invariant_taxonomy_v1.yaml) — machine-readable taxonomy for row types, activation kinds, references, tags, lineage, and audit reporting fields.

The human-readable catalog below intentionally avoids raw source statement IDs. Detailed provenance remains preserved in the development sources, while the linked architecture-library catalog and taxonomy provide stable reference surfaces instead.

## How to read this catalog

- **Family summary** tells you the broader architectural truth.
- **Atomic invariants** are the main normalized rows.
- **Option-branch invariants** are branch-specific rows that become binding once a specific option is adopted.
- **Classification tags** are lightweight grouping labels such as `pin`, `option`, `tenancy`, `policy`, or `runtime`.
- **Pin references** tell you which architect-selectable pins shape the row.
- **Option references** tell you which option sets or selected branches shape the row.
- **Activation** tells you whether the invariant is always on or only becomes active after a declaration or selection.

## Full catalog by family

## <a id="shape-fam-01"></a>SHAPE-FAM-01 — Canonical shape surfaces and profile binding discipline

**Invariant type**  `family_summary`

**Family statement**  
CAF defines intended system shape through explicit canonical machine-consumed surfaces. Architecture shape parameters, Phase 8 profile parameters, and their allowed bindings must be complete, closed, and carried through without reinterpretation.

**Why architects care**  
This is the root authoring surface for intended architecture. If canonical bindings are incomplete, ambiguous, or allowed to drift, every downstream derivation can silently diverge from the intended system.

**Activation summary**  
The surfaces themselves are always-on. Specific runtime, packaging, UI, and metadata consequences activate when architects pin profile fields or optional UI/platform fields.

**Classification tags**  `canonical_shape`, `profile_binding`, `ui_binding`, `platform`, `pin`, `option`

**Pin references**  `template_instances.*`, `architecture.architecture_style`, `platform.*`, `ui.*`, `planes.cp.runtime_shape`, `planes.ap.runtime_shape`, `meta.*`

**Option references**  `architecture.architecture_style`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`, `ui.deployment_preference`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/06_contura_architecture_shape_parameters_schema_v1.yaml`
- `architecture_library/phase_8/84_phase_8_profile_parameters_schema_v1.yaml`
- `architecture_library/phase_8/84_phase_8_profile_parameters_naming_and_placement_v1.md`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-01-a1"></a>SHAPE-FAM-01-A1

**Invariant type**  `atomic_invariant`

**Statement**  Architecture shape parameters and template instances must be structurally complete, with first-class pins, valid pin keys, complete pin coverage, allowed values, and template-prefix consistency.

**Activation**  `always_on_plus_pin_declared`

**Classification tags**  `canonical_shape`, `profile_binding`, `ui_binding`, `platform`, `pin`

**Pin references**  `template_instances.*`, `architecture.architecture_style`, `platform.*`, `ui.*`, `planes.cp.runtime_shape`, `planes.ap.runtime_shape`, `meta.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-01-a2"></a>SHAPE-FAM-01-A2

**Invariant type**  `atomic_invariant`

**Statement**  Phase 8 profile parameters are the canonical architect-authored binding surface and must contain the required lifecycle, architecture, and platform posture for the instance.

**Activation**  `always_on_plus_pin_declared`

**Classification tags**  `canonical_shape`, `profile_binding`, `ui_binding`, `platform`, `pin`

**Pin references**  `template_instances.*`, `architecture.architecture_style`, `platform.*`, `ui.*`, `planes.cp.runtime_shape`, `planes.ap.runtime_shape`, `meta.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-01-a3"></a>SHAPE-FAM-01-A3

**Invariant type**  `atomic_invariant`

**Statement**  Derived profile and ABP/PBP views are exact, read-only carry-through artifacts; catalog resolution must be unique and UI pins remain the only machine-consumed UI truth.

**Activation**  `pin_declared_plus_pin_value_activated`

**Classification tags**  `canonical_shape`, `profile_binding`, `ui_binding`, `platform`, `pin`, `option`

**Pin references**  `template_instances.*`, `architecture.architecture_style`, `platform.*`, `ui.*`, `planes.cp.runtime_shape`, `planes.ap.runtime_shape`, `meta.*`

**Option references**  `architecture.architecture_style`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`, `ui.deployment_preference`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-01-a4"></a>SHAPE-FAM-01-A4

**Invariant type**  `atomic_invariant`

**Statement**  Optional profile metadata and additional platform/UI binding pins are deterministic: if present they are validated and copied through exactly, and if absent they are omitted without invention.

**Activation**  `pin_declared`

**Classification tags**  `canonical_shape`, `profile_binding`, `ui_binding`, `platform`, `pin`

**Pin references**  `template_instances.*`, `architecture.architecture_style`, `platform.*`, `ui.*`, `planes.cp.runtime_shape`, `planes.ap.runtime_shape`, `meta.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-02"></a>SHAPE-FAM-02 — Multi-tenant isolation and explicit tenant-context discipline

**Invariant type**  `family_summary`

**Family statement**  
Tenant ownership, explicit tenant binding, immutable context, end-to-end propagation, and fail-closed rejection of missing or unverifiable tenant scope are intended system invariants rather than implementation details.

**Why architects care**  
Tenant isolation is one of the core reasons to architect the system deliberately. If tenant context can be inferred, dropped, or softened, cross-tenant leakage becomes a structural risk.

**Activation summary**  
Isolation and explicit context are always-on. Carrier and propagation-mechanism options choose how the invariant is realized, not whether it exists.

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`

**Pin references**  `tenancy.*`, `tenant_context.*`, `request_context.*`

**Option references**  `tenancy.isolation_mode`, `tenant_context.ingress_carrier`, `tenant_context.propagation_mechanism`, `tenancy.binding_enforcement`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-02-a1"></a>SHAPE-FAM-02-A1

**Invariant type**  `atomic_invariant`

**Statement**  The tenancy model is explicit: resources belong to exactly one tenant, workspaces and cohorts are not tenants or authority boundaries, and soft isolation drift is forbidden.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`

**Pin references**  `tenancy.*`, `tenant_context.*`, `request_context.*`

**Option references**  `tenancy.isolation_mode`, `tenant_context.ingress_carrier`, `tenant_context.propagation_mechanism`, `tenancy.binding_enforcement`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-02-a2"></a>SHAPE-FAM-02-A2

**Invariant type**  `atomic_invariant`

**Statement**  Tenant context is bound once, immutable, never global or late-bound, represented explicitly in context objects, and propagated end to end for tenant-scoped work.

**Activation**  `always_on`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`

**Pin references**  `tenancy.*`, `tenant_context.*`, `request_context.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-02-a3"></a>SHAPE-FAM-02-A3

**Invariant type**  `atomic_invariant`

**Statement**  Tenant-context entry and propagation choices are explicit system-shaping options, and missing, ambiguous, dropped, or unverifiable tenant scope is rejected.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`

**Pin references**  `tenancy.*`, `tenant_context.*`, `request_context.*`

**Option references**  `tenancy.isolation_mode`, `tenant_context.ingress_carrier`, `tenant_context.propagation_mechanism`, `tenancy.binding_enforcement`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-02-a4"></a>SHAPE-FAM-02-A4

**Invariant type**  `atomic_invariant`

**Statement**  Cross-tenant exposure through shared runtime surfaces such as caches, logs, or indexes is forbidden without robust scoping and explicit justification.

**Activation**  `always_on`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`

**Pin references**  `tenancy.*`, `tenant_context.*`, `request_context.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-001"></a>SHAPE-OPT-001 — `tenant_context.ingress_carrier` = `auth_claim`

**Invariant type**  `option_branch_invariant`

**Statement**  Verified auth claims are the authoritative ingress carrier for tenant context.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.ingress_carrier`

**Option references**  `tenant_context.ingress_carrier=auth_claim`

**Representative question ids**  `Q-AP-TENANT-CARRIER-01`, `Q-CPAP-TENANT-CARRIER-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Ingress and CP↔AP boundary helpers derive tenant scope from verified auth material rather than client-controlled headers.
- Missing, malformed, or unverifiable claims reject rather than downgrade to best-effort inference.
- Downstream logs, traces, policy inputs, and data access all preserve claim-derived tenant scope.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-002"></a>SHAPE-OPT-002 — `tenant_context.ingress_carrier` = `signed_gateway_header`

**Invariant type**  `option_branch_invariant`

**Statement**  A trusted gateway-signed header is the authoritative ingress carrier for tenant context.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.ingress_carrier`

**Option references**  `tenant_context.ingress_carrier=signed_gateway_header`

**Representative question ids**  `Q-AP-TENANT-CARRIER-01`, `Q-CPAP-TENANT-CARRIER-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The gateway boundary becomes the trust-establishing surface for tenant identity.
- Application services must reject client-supplied tenant headers that bypass or conflict with the trusted header.
- Contracts and telemetry preserve the header-derived tenant value coherently across execution.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-003"></a>SHAPE-OPT-003 — `tenant_context.ingress_carrier` = `path_segment`

**Invariant type**  `option_branch_invariant`

**Statement**  The request path segment is the authoritative ingress carrier for tenant context.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.ingress_carrier`

**Option references**  `tenant_context.ingress_carrier=path_segment`

**Representative question ids**  `Q-AP-TENANT-CARRIER-01`, `Q-CPAP-TENANT-CARRIER-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Routing, link generation, and contract surfaces must preserve tenant scope in the declared path shape.
- Malformed or missing tenant path segments reject rather than fall back to ambient or UI state.
- Downstream services treat path-derived tenant identity as the canonical boundary input.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-004"></a>SHAPE-OPT-004 — `tenant_context.ingress_carrier` = `subdomain`

**Invariant type**  `option_branch_invariant`

**Statement**  The host or subdomain is the authoritative ingress carrier for tenant context.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.ingress_carrier`

**Option references**  `tenant_context.ingress_carrier=subdomain`

**Representative question ids**  `Q-AP-TENANT-CARRIER-01`, `Q-CPAP-TENANT-CARRIER-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- DNS, host validation, and routing become part of the tenant-boundary contract.
- Application services reject requests whose host-derived tenant scope is missing, malformed, or conflicts with alternate carriers.
- Operational surfaces must preserve host-derived tenant identity into policy, telemetry, and storage decisions.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-005"></a>SHAPE-OPT-005 — `tenant_context.ingress_carrier` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom ingress carrier is allowed only if its carrier fields, trust boundary, validation rules, and rejection conditions are made explicit.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.ingress_carrier`

**Option references**  `tenant_context.ingress_carrier=custom`

**Representative question ids**  `Q-AP-TENANT-CARRIER-01`, `Q-CPAP-TENANT-CARRIER-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The custom carrier must be named concretely enough for boundary, runtime, and audit surfaces to preserve it.
- CAF may not treat “custom” as permission for implicit tenant inference.
- Public promotion should wait until the custom carrier is described concretely for an instance or sanctioned branch.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-006"></a>SHAPE-OPT-006 — `tenant_context.conflict_precedence_rule` = `claim_over_header`

**Invariant type**  `option_branch_invariant`

**Statement**  Verified claims take precedence over alternate carriers, and conflicting carrier combinations are rejected.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.conflict_precedence_rule`

**Option references**  `tenant_context.conflict_precedence_rule=claim_over_header`

**Representative question ids**  `Q-CPAP-TCTX-CONFLICT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Middleware and boundary helpers must encode verified-claim precedence explicitly.
- Conflicting headers, path values, or host values reject instead of silently overriding verified claims.
- Audit and feedback surfaces can explain why a conflicting request was denied.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-007"></a>SHAPE-OPT-007 — `tenant_context.conflict_precedence_rule` = `path_over_claim`

**Invariant type**  `option_branch_invariant`

**Statement**  The request path takes precedence over verified claims, and conflicting carrier combinations are rejected.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.conflict_precedence_rule`

**Option references**  `tenant_context.conflict_precedence_rule=path_over_claim`

**Representative question ids**  `Q-CPAP-TCTX-CONFLICT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Boundary logic must privilege the path carrier consistently across routing and policy evaluation.
- Conflicting verified claims, headers, or hosts reject rather than ambiguously reinterpret tenant scope.
- All downstream execution surfaces preserve the path-derived tenant choice coherently.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-008"></a>SHAPE-OPT-008 — `tenant_context.conflict_precedence_rule` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom carrier-precedence rule is valid only if precedence order and rejection behavior are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenant_context.conflict_precedence_rule`

**Option references**  `tenant_context.conflict_precedence_rule=custom`

**Representative question ids**  `Q-CPAP-TCTX-CONFLICT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Custom precedence cannot degrade into silent “first value wins” behavior.
- The custom rule must still fail closed on ambiguity.
- Public promotion should wait until the precedence order and rejection rule are fully specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-009"></a>SHAPE-OPT-009 — `tenancy.isolation_mode` = `pooled_everything`

**Invariant type**  `option_branch_invariant`

**Statement**  Logical isolation on shared infrastructure is the intended tenant-isolation model.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenancy.isolation_mode`

**Option references**  `tenancy.isolation_mode=pooled_everything`

**Representative question ids**  `Q-MTEN-ISO-MODE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Repository, policy, cache, audit, and storage boundaries must enforce tenant scope rigorously because infrastructure is shared.
- No downstream surface may blur tenant boundaries into workspace or account convenience state.
- Operational evidence must prove that shared infrastructure still preserves tenant-safe execution.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-010"></a>SHAPE-OPT-010 — `tenancy.isolation_mode` = `pooled_compute_partitioned_data`

**Invariant type**  `option_branch_invariant`

**Statement**  Pooled compute with partitioned data is the intended tenant-isolation model.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenancy.isolation_mode`

**Option references**  `tenancy.isolation_mode=pooled_compute_partitioned_data`

**Representative question ids**  `Q-MTEN-ISO-MODE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Compute remains shared, but data placement and access boundaries must preserve partitioned tenant separation.
- Migration, backup, and restore flows must respect data-partition boundaries even when application runtime is pooled.
- Design and runtime evidence should show how compute-sharing does not collapse data isolation guarantees.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-011"></a>SHAPE-OPT-011 — `tenancy.isolation_mode` = `silo_tenants_dedicated_infra`

**Invariant type**  `option_branch_invariant`

**Statement**  Dedicated infrastructure per tenant is the intended tenant-isolation model.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenancy.isolation_mode`

**Option references**  `tenancy.isolation_mode=silo_tenants_dedicated_infra`

**Representative question ids**  `Q-MTEN-ISO-MODE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Provisioning, deployment, and operations inherit a per-tenant infrastructure topology obligation.
- Cross-tenant sharing shortcuts are architectural violations unless explicitly carved out.
- Cost, restore, and lifecycle surfaces must preserve the silo boundary consistently.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-012"></a>SHAPE-OPT-012 — `tenancy.isolation_mode` = `hybrid_tiered`

**Invariant type**  `option_branch_invariant`

**Statement**  Selective or tiered tenant isolation is the intended tenant-isolation model.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenancy.isolation_mode`

**Option references**  `tenancy.isolation_mode=hybrid_tiered`

**Representative question ids**  `Q-MTEN-ISO-MODE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture must distinguish which tenants or workloads receive stronger isolation tiers and why.
- Provisioning, placement, and restore flows must preserve the tier logic without ad-hoc exceptions.
- Carry-through artifacts must keep the tiering posture explicit so future evolution does not require redesign.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

#### <a id="inv-tsys-shape-opt-013"></a>SHAPE-OPT-013 — `tenancy.isolation_mode` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom isolation mode is allowed only if its compute, data, and operational boundaries are described explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `tenancy`, `tenant_context`, `boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `tenancy.isolation_mode`

**Option references**  `tenancy.isolation_mode=custom`

**Representative question ids**  `Q-MTEN-ISO-MODE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot hide whether infrastructure is pooled, partitioned, or siloed.
- Tenant-boundary enforcement obligations must still be clear enough for design, build, and runtime review.
- Public promotion should wait until the custom mode is specified concretely.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-ANTI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MTEN-CTX-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-TCTX-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CTX-01.yaml`

## <a id="shape-fam-03"></a>SHAPE-FAM-03 — Identity, trust validation, and attributable execution

**Invariant type**  `family_summary`

**Family statement**  
CAF architectures require governed identity categories, explicit trust validation, bounded revocation, attributable action chains, and explicit identity handling for both human and agent execution.

**Why architects care**  
Without clear identity semantics, tenant context, authorization, and audit lose meaning. This family prevents identity ambiguity from becoming an architectural loophole.

**Activation summary**  
Principal taxonomy, trust validation, and attributable execution are always-on. Option families tune the scope and granularity of attribution, validation, and trace correlation.

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`

**Pin references**  `iam.*`, `agent.*`

**Option references**  `iam.principal_taxonomy_scope`, `iam.authentication_validation_mode`, `iam.revocation_propagation_strategy`, `iam.attribution_granularity`, `agent.identity_kind`, `iam.trace_correlation_mode`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-02.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-03-a1"></a>SHAPE-FAM-03-A1

**Invariant type**  `atomic_invariant`

**Statement**  Identity categories are platform-governed and explicit: downstream systems may not invent platform-significant principal types or blur platform and tenant authority.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`

**Pin references**  `iam.*`, `agent.*`

**Option references**  `iam.principal_taxonomy_scope`, `iam.authentication_validation_mode`, `iam.revocation_propagation_strategy`, `iam.attribution_granularity`, `agent.identity_kind`, `iam.trace_correlation_mode`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-03-a2"></a>SHAPE-FAM-03-A2

**Invariant type**  `atomic_invariant`

**Statement**  Trust validation is governed, performed consistently at the earliest viable boundary, and paired with bounded revocation behavior.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`

**Pin references**  `iam.*`, `agent.*`

**Option references**  `iam.principal_taxonomy_scope`, `iam.authentication_validation_mode`, `iam.revocation_propagation_strategy`, `iam.attribution_granularity`, `agent.identity_kind`, `iam.trace_correlation_mode`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-03-a3"></a>SHAPE-FAM-03-A3

**Invariant type**  `atomic_invariant`

**Statement**  Every significant action is attributable to an identity chain that includes tenant context where applicable, and attribution granularity is an explicit architecture choice.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`

**Pin references**  `iam.*`, `agent.*`

**Option references**  `iam.principal_taxonomy_scope`, `iam.authentication_validation_mode`, `iam.revocation_propagation_strategy`, `iam.attribution_granularity`, `agent.identity_kind`, `iam.trace_correlation_mode`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-03-a4"></a>SHAPE-FAM-03-A4

**Invariant type**  `atomic_invariant`

**Statement**  Agents are first-class governed principals, and platform identity authority plus end-to-end identity traceability remain centrally defined and non-ambiguous.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`

**Pin references**  `iam.*`, `agent.*`

**Option references**  `iam.principal_taxonomy_scope`, `iam.authentication_validation_mode`, `iam.revocation_propagation_strategy`, `iam.attribution_granularity`, `agent.identity_kind`, `iam.trace_correlation_mode`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-014"></a>SHAPE-OPT-014 — `iam.identity_context_propagation` = `verified_token_claims`

**Invariant type**  `option_branch_invariant`

**Statement**  Verified token claims are the authoritative propagation mechanism for identity and tenant context.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`, `adopted_shape`

**Pin references**  `iam.identity_context_propagation`

**Option references**  `iam.identity_context_propagation=verified_token_claims`

**Representative question ids**  `Q-CAF-IAM-02-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Cross-plane calls, runtime policy checks, and audit records depend on verified claim material instead of ambient process state.
- Boundary helpers reject missing or unverifiable claims rather than fabricating principal context.
- Traceability surfaces preserve principal-plus-tenant attribution coherently.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-01.yaml`

#### <a id="inv-tsys-shape-opt-015"></a>SHAPE-OPT-015 — `iam.identity_context_propagation` = `signed_gateway_header`

**Invariant type**  `option_branch_invariant`

**Statement**  A trusted gateway-signed header is the authoritative propagation mechanism for identity context.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`, `adopted_shape`

**Pin references**  `iam.identity_context_propagation`

**Option references**  `iam.identity_context_propagation=signed_gateway_header`

**Representative question ids**  `Q-CAF-IAM-02-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The gateway trust boundary becomes part of the identity architecture.
- Services must reject client-controlled identity headers that bypass the trusted gateway contract.
- Policy and audit surfaces preserve the gateway-attested principal context end to end.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-01.yaml`

#### <a id="inv-tsys-shape-opt-016"></a>SHAPE-OPT-016 — `iam.identity_context_propagation` = `mtls_client_cert_identity`

**Invariant type**  `option_branch_invariant`

**Statement**  mTLS client-certificate identity is the authoritative propagation mechanism for service identity.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`, `adopted_shape`

**Pin references**  `iam.identity_context_propagation`

**Option references**  `iam.identity_context_propagation=mtls_client_cert_identity`

**Representative question ids**  `Q-CAF-IAM-02-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Service-to-service trust anchors shift to certificate issuance, rotation, and validation posture.
- Downstream policy and audit surfaces must preserve certificate-derived service identity explicitly.
- Ambient or unsigned service identity fields cannot override certificate identity.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-01.yaml`

#### <a id="inv-tsys-shape-opt-017"></a>SHAPE-OPT-017 — `iam.identity_context_propagation` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom identity propagation mechanism is valid only if its trust anchor, validation rules, and carried identity fields are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `identity`, `trust`, `attribution`, `agents`, `pin`, `option`, `adopted_shape`

**Pin references**  `iam.identity_context_propagation`

**Option references**  `iam.identity_context_propagation=custom`

**Representative question ids**  `Q-CAF-IAM-02-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The custom branch must still bind identity and tenant context deterministically for policy and audit.
- CAF may not infer principal identity from loosely defined contextual fields.
- Public promotion should wait until the custom propagation model is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AID-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-GOV-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-OBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-01.yaml`

## <a id="shape-fam-04"></a>SHAPE-FAM-04 — Policy authority, delegated enforcement, and no-bypass discipline

**Invariant type**  `family_summary`

**Family statement**  
Policy meaning originates upstream and is enforced downstream through explicit, delegated, and versioned mechanisms. Protected operations must not bypass policy or re-invent policy semantics locally.

**Why architects care**  
A system can appear governed while actually containing multiple contradictory policy engines. This family keeps policy meaning centralized and enforcement explicit.

**Activation summary**  
Policy enforcement and no-bypass are always-on. Option surfaces tune which operations are gated and where delegated enforcement executes.

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`

**Pin references**  `policy.*`, `iam.authorization_*`, `security.*`

**Option references**  `policy_gating.default_crud`, `security.policy_as_code_enforcement_point`, `iam.authorization_enforcement_mode`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-04-a1"></a>SHAPE-FAM-04-A1

**Invariant type**  `atomic_invariant`

**Statement**  All protected operations are mediated by explicit policy enforcement points and may not expose alternate public paths or local ad hoc policy logic.

**Activation**  `always_on`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`

**Pin references**  `policy.*`, `iam.authorization_*`, `security.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-04-a2"></a>SHAPE-FAM-04-A2

**Invariant type**  `atomic_invariant`

**Statement**  Policy is a first-class machine-evaluable architecture component, not human-only prose, and its default gating scope is an explicit option.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`

**Pin references**  `policy.*`, `iam.authorization_*`, `security.*`

**Option references**  `policy_gating.default_crud`, `security.policy_as_code_enforcement_point`, `iam.authorization_enforcement_mode`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-04-a3"></a>SHAPE-FAM-04-A3

**Invariant type**  `atomic_invariant`

**Statement**  Application and Data Plane code must not bypass Control Plane policy authority, and delegated enforcement is explicit and non-transitive.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`

**Pin references**  `policy.*`, `iam.authorization_*`, `security.*`

**Option references**  `policy_gating.default_crud`, `security.policy_as_code_enforcement_point`, `iam.authorization_enforcement_mode`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-018"></a>SHAPE-OPT-018 — `policy_gating.default_crud` = `gate_all_ops`

**Invariant type**  `option_branch_invariant`

**Statement**  Policy evaluation is required for read and write operations by default.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy_gating.default_crud`

**Option references**  `policy_gating.default_crud=gate_all_ops`

**Representative question ids**  `Q-AP-POLICY-POINTS-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Get, list, create, update, and delete paths all owe explicit policy checks unless an upstream exception is justified.
- Ungated reads become an architectural smell rather than an acceptable default.
- Planning and runtime review surfaces can assume broad policy coverage as the baseline.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

#### <a id="inv-tsys-shape-opt-019"></a>SHAPE-OPT-019 — `policy_gating.default_crud` = `gate_write_only`

**Invariant type**  `option_branch_invariant`

**Statement**  Policy evaluation is mandatory for writes and targeted reads, while some list paths may remain ungated by design.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy_gating.default_crud`

**Option references**  `policy_gating.default_crud=gate_write_only`

**Representative question ids**  `Q-AP-POLICY-POINTS-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Architects must explain which reads still require checks and why some list paths are exempt.
- Runtime boundaries need a sharper distinction between mutation, point-read, and list semantics.
- Carry-through artifacts must preserve the narrower gating scope rather than drifting toward ad-hoc behavior.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

#### <a id="inv-tsys-shape-opt-020"></a>SHAPE-OPT-020 — `policy_gating.default_crud` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom CRUD gating scope is valid only if the operation classes and their policy obligations are named explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy_gating.default_crud`

**Option references**  `policy_gating.default_crud=custom`

**Representative question ids**  `Q-AP-POLICY-POINTS-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot hide whether read paths are governed or not.
- Planning and implementation surfaces must still be able to tell which entry points require policy checks.
- Public promotion should wait until the custom gating scope is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

#### <a id="inv-tsys-shape-opt-021"></a>SHAPE-OPT-021 — `policy.responsibility_distribution` = `cp_central_decision_ap_enforces`

**Invariant type**  `option_branch_invariant`

**Statement**  Control Plane centralizes policy decision while Application Plane enforces runtime outcomes.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy.responsibility_distribution`

**Option references**  `policy.responsibility_distribution=cp_central_decision_ap_enforces`

**Representative question ids**  `Q-POL-DIST-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- CP becomes the authoritative policy-decision surface and AP must not invent policy meaning locally.
- Cross-plane contracts need explicit versioning, context completeness, and decision traceability.
- Runtime enforcement remains close to execution, but authority over policy meaning stays upstream.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

#### <a id="inv-tsys-shape-opt-022"></a>SHAPE-OPT-022 — `policy.responsibility_distribution` = `ap_local_decision_and_enforcement`

**Invariant type**  `option_branch_invariant`

**Statement**  Application Plane performs local policy decisions and runtime enforcement while Control Plane provides intent.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy.responsibility_distribution`

**Option references**  `policy.responsibility_distribution=ap_local_decision_and_enforcement`

**Representative question ids**  `Q-POL-DIST-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- AP now owns more evaluation behavior and must preserve policy semantics without drifting from CP-governed intent.
- Versioning, rollout, and audit surfaces must still show how local decisions stay traceable to upstream policy.
- This branch increases runtime autonomy and therefore sharpens semantic-drift risk.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

#### <a id="inv-tsys-shape-opt-023"></a>SHAPE-OPT-023 — `policy.responsibility_distribution` = `gateway_or_edge_enforcement`

**Invariant type**  `option_branch_invariant`

**Statement**  Gateway or edge surfaces enforce policy at ingress using CP-governed intent.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy.responsibility_distribution`

**Option references**  `policy.responsibility_distribution=gateway_or_edge_enforcement`

**Representative question ids**  `Q-POL-DIST-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Ingress becomes the primary policy-enforcement boundary for covered operations.
- Service internals may still need explicit follow-on checks where gateway scope is insufficient.
- Contracts and audit surfaces must preserve which decisions were made at the edge versus inside services.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

#### <a id="inv-tsys-shape-opt-024"></a>SHAPE-OPT-024 — `policy.responsibility_distribution` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom policy-distribution branch is valid only if decision authority, enforcement point, and traceability obligations are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `policy`, `authority`, `enforcement`, `pin`, `option`, `adopted_shape`

**Pin references**  `policy.responsibility_distribution`

**Option references**  `policy.responsibility_distribution=custom`

**Representative question ids**  `Q-POL-DIST-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot blur who owns policy meaning versus runtime enforcement.
- The branch must still preserve CP/AP/DP authority boundaries clearly enough for review.
- Public promotion should wait until the custom distribution model is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-AUTH-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-IAM-PROP-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-POL-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/POL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`

## <a id="shape-fam-05"></a>SHAPE-FAM-05 — Persistence, integration, configuration, and service-boundary discipline

**Invariant type**  `family_summary`

**Family statement**  
Intended architecture requires explicit internal seams: persistence and integration are accessed through ports, runtime configuration is centralized and validated, and inbound execution enters through stable service-facade boundaries.

**Why architects care**  
This family prevents infrastructure concerns from leaking into domain logic and stops inbound/runtime wiring from becoming ad hoc or unreviewable.

**Activation summary**  
The internal seams are always-on. Config externalization model is an activation surface that changes where configuration is fetched, but not the requirement to centralize and validate it.

**Classification tags**  `persistence`, `integration`, `configuration`, `service_boundary`, `pin`, `option`

**Pin references**  `configuration.*`, `service_facade.*`, `repository_ports.*`, `integration_ports.*`

**Option references**  `ops.config_externalization_model`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/core_v1/definitions_v1/PST-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/INT-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CFG-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/CMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/SVC-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/VAL-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-config_externalization.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-05-a1"></a>SHAPE-FAM-05-A1

**Invariant type**  `atomic_invariant`

**Statement**  Persistence and integration are accessed through explicit ports, with domain code isolated from adapters, SDKs, and service-layer bypasses.

**Activation**  `always_on`

**Classification tags**  `persistence`, `integration`, `configuration`, `service_boundary`, `pin`

**Pin references**  `configuration.*`, `service_facade.*`, `repository_ports.*`, `integration_ports.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-05-a2"></a>SHAPE-FAM-05-A2

**Invariant type**  `atomic_invariant`

**Statement**  Runtime configuration is centralized behind a validated boundary, ambient reads are constrained, and startup fails closed on missing or invalid required keys.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `persistence`, `integration`, `configuration`, `service_boundary`, `pin`, `option`

**Pin references**  `configuration.*`, `service_facade.*`, `repository_ports.*`, `integration_ports.*`

**Option references**  `ops.config_externalization_model`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-05-a3"></a>SHAPE-FAM-05-A3

**Invariant type**  `atomic_invariant`

**Statement**  All resource operations enter through explicit application-service facades with stable validation and error contracts, not through ad hoc inbound adapter shortcuts.

**Activation**  `always_on`

**Classification tags**  `persistence`, `integration`, `configuration`, `service_boundary`, `pin`

**Pin references**  `configuration.*`, `service_facade.*`, `repository_ports.*`, `integration_ports.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-06"></a>SHAPE-FAM-06 — Observability, auditability, and compliance evidence by construction

**Invariant type**  `family_summary`

**Family statement**  
CAF intends evidence to be produced as a normal consequence of execution: telemetry, audit, compliance, and AI observability signals must be correlated, immutable where required, tenant-safe, and attributable.

**Why architects care**  
Architects need to know not only what should happen, but how the system can prove it happened. This family turns proof surfaces into intended architecture.

**Activation summary**  
Evidence production is always-on. Option surfaces control scope, persistence, and isolation depth.

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`

**Pin references**  `ops.audit_*`, `ai_observability.*`, `compliance_evidence.*`, `obs.*`

**Option references**  `ops.audit_event_scope`, `ai_observability.required_fields_profile`, `ai_observability.multi_tenant_isolation_mode`, `compliance_evidence.persistence_strategy`, `audit.log_scope_mode`, `obs.pillars_scope`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-06-a1"></a>SHAPE-FAM-06-A1

**Invariant type**  `atomic_invariant`

**Statement**  Baseline telemetry must carry correlation and relevant tenant/user identifiers, and direct telemetry SDK usage is confined behind the observability adapter boundary.

**Activation**  `always_on`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`

**Pin references**  `ops.audit_*`, `ai_observability.*`, `compliance_evidence.*`, `obs.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-06-a2"></a>SHAPE-FAM-06-A2

**Invariant type**  `atomic_invariant`

**Statement**  Auditability scope is explicit, and audit events must be immutable, tenant-scoped, identity-scoped, durable through async/partial-failure paths, and complete enough to capture both intent and outcome.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`

**Pin references**  `ops.audit_*`, `ai_observability.*`, `compliance_evidence.*`, `obs.*`

**Option references**  `ops.audit_event_scope`, `ai_observability.required_fields_profile`, `ai_observability.multi_tenant_isolation_mode`, `compliance_evidence.persistence_strategy`, `audit.log_scope_mode`, `obs.pillars_scope`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-06-a3"></a>SHAPE-FAM-06-A3

**Invariant type**  `atomic_invariant`

**Statement**  AI and compliance evidence are generated by normal operation, correlate across planes, and use structured telemetry, observability depth, and persistence models selected explicitly by architecture.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`

**Pin references**  `ops.audit_*`, `ai_observability.*`, `compliance_evidence.*`, `obs.*`

**Option references**  `ops.audit_event_scope`, `ai_observability.required_fields_profile`, `ai_observability.multi_tenant_isolation_mode`, `compliance_evidence.persistence_strategy`, `audit.log_scope_mode`, `obs.pillars_scope`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-06-a4"></a>SHAPE-FAM-06-A4

**Invariant type**  `atomic_invariant`

**Statement**  CAF normative requirements must materialize into ADR/checklist references, executable artifacts, CI evaluation, runtime gates, telemetry, and feedback loops, and observability scope remains an explicit platform choice.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`

**Pin references**  `ops.audit_*`, `ai_observability.*`, `compliance_evidence.*`, `obs.*`

**Option references**  `ops.audit_event_scope`, `ai_observability.required_fields_profile`, `ai_observability.multi_tenant_isolation_mode`, `compliance_evidence.persistence_strategy`, `audit.log_scope_mode`, `obs.pillars_scope`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-033"></a>SHAPE-OPT-033 — `compliance_evidence.persistence_strategy` = `append_only_event_stream`

**Invariant type**  `option_branch_invariant`

**Statement**  Compliance evidence persists in an append-only event stream as the primary evidence substrate.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `compliance_evidence.persistence_strategy`

**Option references**  `compliance_evidence.persistence_strategy=append_only_event_stream`

**Representative question ids**  `Q-CAF-COMP-01-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Ordering, durability, replay, and correlation become part of evidence architecture.
- Retention and audit surfaces must explain how stream-backed evidence stays queryable and trustworthy.
- Downstream components may not silently collapse streamed evidence into lossy summaries.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

#### <a id="inv-tsys-shape-opt-034"></a>SHAPE-OPT-034 — `compliance_evidence.persistence_strategy` = `immutable_evidence_store`

**Invariant type**  `option_branch_invariant`

**Statement**  Compliance evidence persists in an immutable evidence store as the primary evidence substrate.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `compliance_evidence.persistence_strategy`

**Option references**  `compliance_evidence.persistence_strategy=immutable_evidence_store`

**Representative question ids**  `Q-CAF-COMP-01-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Immutability, retention control, and retrieval posture become first-class design obligations.
- Runtime and operational flows must preserve attributable, tenant-scoped evidence into the store.
- Review surfaces should show how the store remains authoritative for audit reconstruction.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

#### <a id="inv-tsys-shape-opt-035"></a>SHAPE-OPT-035 — `compliance_evidence.persistence_strategy` = `stream_plus_immutable_store`

**Invariant type**  `option_branch_invariant`

**Statement**  Compliance evidence persists through both an event stream and an immutable evidence store.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `compliance_evidence.persistence_strategy`

**Option references**  `compliance_evidence.persistence_strategy=stream_plus_immutable_store`

**Representative question ids**  `Q-CAF-COMP-01-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture now owes a dual-evidence path: ordered operational emission plus immutable audit retention.
- Correlation, replay, and retention semantics must stay coherent across both stores.
- Carry-through artifacts should prevent implementations from dropping either leg of the evidence posture silently.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

#### <a id="inv-tsys-shape-opt-048"></a>SHAPE-OPT-048 — `ops.audit_event_scope` = `security_events_only`

**Invariant type**  `option_branch_invariant`

**Statement**  Audit emission is limited to security-sensitive events as the intended evidence scope.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `ops.audit_event_scope`

**Option references**  `ops.audit_event_scope=security_events_only`

**Representative question ids**  `Q-EXT-AUDIT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture promises strong traceability for authn/authz and privilege-sensitive actions, but not full admin or business replay.
- Reviewers should not assume admin or business events are captured unless another invariant says so.
- Operational evidence posture stays narrower and should be documented honestly.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

#### <a id="inv-tsys-shape-opt-049"></a>SHAPE-OPT-049 — `ops.audit_event_scope` = `security_plus_admin_actions`

**Invariant type**  `option_branch_invariant`

**Statement**  Audit emission covers security-sensitive events plus privileged admin or operator actions.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `ops.audit_event_scope`

**Option references**  `ops.audit_event_scope=security_plus_admin_actions`

**Representative question ids**  `Q-EXT-AUDIT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The evidence boundary now includes governance and operator accountability, not only security failures.
- Admin tooling and privileged workflows owe structured, attributable audit records.
- Review surfaces should show how operator actions remain tenant-aware and correlatable.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

#### <a id="inv-tsys-shape-opt-050"></a>SHAPE-OPT-050 — `ops.audit_event_scope` = `security_plus_business_events`

**Invariant type**  `option_branch_invariant`

**Statement**  Audit emission covers security-sensitive events plus key business actions that require traceability.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `ops.audit_event_scope`

**Option references**  `ops.audit_event_scope=security_plus_business_events`

**Representative question ids**  `Q-EXT-AUDIT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Business-critical domain events become part of the evidence contract.
- The architecture must identify which business actions rise to audit significance and why.
- Retention and retrieval posture must support both security and business-event reconstruction.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

#### <a id="inv-tsys-shape-opt-051"></a>SHAPE-OPT-051 — `ops.audit_event_scope` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom audit-event scope is valid only if the included event classes and their traceability rationale are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `observability`, `audit`, `compliance`, `evidence`, `pin`, `option`, `adopted_shape`

**Pin references**  `ops.audit_event_scope`

**Option references**  `ops.audit_event_scope=custom`

**Representative question ids**  `Q-EXT-AUDIT-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot hide what the system will or will not be able to reconstruct later.
- The branch must still make audit obligations reviewable at design and runtime levels.
- Public promotion should wait until the custom audit scope is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AIOBS-05.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-COMP-01.yaml`
- `architecture_library/patterns/core_v1/definitions_v1/OBS-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-auditability.yaml`

## <a id="shape-fam-07"></a>SHAPE-FAM-07 — Edge and UI-facing boundary contract discipline

**Invariant type**  `family_summary`

**Family statement**  
The user-facing edge is a deliberate architectural boundary. Internal plane semantics must not leak through it, and context propagation plus edge-shape choices must be explicit.

**Why architects care**  
UI and edge surfaces are where ambiguity often becomes accidental coupling. This family keeps the external contract stable while preserving internal governance and context semantics.

**Activation summary**  
No internal contract leakage and stable UI contract shape are always-on. Edge/BFF/gateway choices determine the concrete boundary pattern.

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`

**Pin references**  `ui.*`, `ingress.*`, `resilience.*`

**Option references**  `ingress.api_gateway_policy_placement`, `ui.bff_shape`, `resilience.circuit_breaker_placement`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-07-a1"></a>SHAPE-FAM-07-A1

**Invariant type**  `atomic_invariant`

**Statement**  UI-facing contracts may not expose internal plane-to-plane semantics directly and must provide explicit, stable request/response models.

**Activation**  `always_on`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`

**Pin references**  `ui.*`, `ingress.*`, `resilience.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-07-a2"></a>SHAPE-FAM-07-A2

**Invariant type**  `atomic_invariant`

**Statement**  Tenant, principal, and correlation context must propagate across the UI-facing boundary, and unauthorized content/actions are trimmed out of responses and UI surfaces.

**Activation**  `always_on`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`

**Pin references**  `ui.*`, `ingress.*`, `resilience.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-07-a3"></a>SHAPE-FAM-07-A3

**Invariant type**  `atomic_invariant`

**Statement**  The edge boundary shape is explicit: async bridge, gateway-policy placement, BFF form, and circuit-breaker placement are adopted option activators rather than emergent implementation details.

**Activation**  `option_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`

**Pin references**  `ui.*`, `ingress.*`, `resilience.*`

**Option references**  `ingress.api_gateway_policy_placement`, `ui.bff_shape`, `resilience.circuit_breaker_placement`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-036"></a>SHAPE-OPT-036 — `ingress.api_gateway_policy_placement` = `gateway_enforces_most_policies`

**Invariant type**  `option_branch_invariant`

**Statement**  The gateway enforces most cross-cutting policies, while services focus on business logic and service-level authorization.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ingress.api_gateway_policy_placement`

**Option references**  `ingress.api_gateway_policy_placement=gateway_enforces_most_policies`

**Representative question ids**  `Q-EXT-API-GW-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Ingress architecture becomes the main cross-cutting control boundary.
- Services still owe explicit business authorization and cannot assume gateway coverage is semantically complete.
- Operational review should show which policies are centralized at the gateway and which remain service-local.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-037"></a>SHAPE-OPT-037 — `ingress.api_gateway_policy_placement` = `shared_gateway_and_services`

**Invariant type**  `option_branch_invariant`

**Statement**  Gateway and services share policy enforcement responsibilities with explicit boundaries.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ingress.api_gateway_policy_placement`

**Option references**  `ingress.api_gateway_policy_placement=shared_gateway_and_services`

**Representative question ids**  `Q-EXT-API-GW-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture must name which policies are baseline ingress controls and which stay inside service boundaries.
- Shared enforcement can be sound, but only if the split is explicit and carried through consistently.
- Design and runtime evidence should prevent duplicated or missing policy layers across gateway and service surfaces.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-038"></a>SHAPE-OPT-038 — `ingress.api_gateway_policy_placement` = `services_enforce_gateway_routes_only`

**Invariant type**  `option_branch_invariant`

**Statement**  The gateway mainly provides routing and versioning, while services enforce most policies.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ingress.api_gateway_policy_placement`

**Option references**  `ingress.api_gateway_policy_placement=services_enforce_gateway_routes_only`

**Representative question ids**  `Q-EXT-API-GW-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Service boundaries become the primary enforcement surfaces for most cross-cutting controls.
- Ingress remains important, but services must not assume gateway-provided safety or authorization by default.
- Operational review should highlight the stronger service-local policy burden this branch creates.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-039"></a>SHAPE-OPT-039 — `ingress.api_gateway_policy_placement` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom gateway-policy placement branch is valid only if gateway responsibilities, service responsibilities, and enforcement boundaries are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ingress.api_gateway_policy_placement`

**Option references**  `ingress.api_gateway_policy_placement=custom`

**Representative question ids**  `Q-EXT-API-GW-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot blur who owns which policy layer.
- The branch must still make it obvious where baseline controls, business authorization, and fail-closed behavior live.
- Public promotion should wait until the custom placement model is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-040"></a>SHAPE-OPT-040 — `ui.bff_shape` = `single_bff_for_all_ui`

**Invariant type**  `option_branch_invariant`

**Statement**  A single BFF façade serves all UI clients as the intended UI boundary shape.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ui.bff_shape`

**Option references**  `ui.bff_shape=single_bff_for_all_ui`

**Representative question ids**  `Q-EXT-BFF-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture centralizes UI composition and context handling in one façade surface.
- Client differences must be managed without letting the shared BFF become a shapeless catch-all.
- Operational ownership and change cadence concentrate around the shared façade.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-041"></a>SHAPE-OPT-041 — `ui.bff_shape` = `per_client_bff`

**Invariant type**  `option_branch_invariant`

**Statement**  Separate BFF façades per client type are the intended UI boundary shape.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ui.bff_shape`

**Option references**  `ui.bff_shape=per_client_bff`

**Representative question ids**  `Q-EXT-BFF-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Client-specific adaptation becomes an explicit architectural responsibility rather than a hidden branching pattern.
- Ownership, release cadence, and aggregation logic can diverge by client without pretending to be one API.
- Review surfaces should show how each BFF preserves shared policy and context rules without unnecessary coupling.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-042"></a>SHAPE-OPT-042 — `ui.bff_shape` = `thin_facade_only`

**Invariant type**  `option_branch_invariant`

**Statement**  A thin BFF focused on auth, session, context, and minor shaping is the intended UI boundary shape.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ui.bff_shape`

**Option references**  `ui.bff_shape=thin_facade_only`

**Representative question ids**  `Q-EXT-BFF-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Most orchestration and aggregation remain deeper in backend services rather than concentrating in the BFF.
- The BFF still owes clean context and boundary handling, but should resist becoming a heavy orchestration layer.
- Design review should watch for gradual drift from thin façade to accidental monolithic adapter.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

#### <a id="inv-tsys-shape-opt-043"></a>SHAPE-OPT-043 — `ui.bff_shape` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom BFF shape is valid only if client scope, composition depth, and ownership boundaries are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `edge`, `ui_binding`, `contract_boundary`, `pin`, `option`, `adopted_shape`

**Pin references**  `ui.bff_shape`

**Option references**  `ui.bff_shape=custom`

**Representative question ids**  `Q-EXT-BFF-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot hide whether the BFF is shared, per-client, or intentionally thin.
- UI boundary and service-boundary responsibilities must still be reviewable as architecture rather than implementation lore.
- Public promotion should wait until the custom BFF shape is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-EDGE-01.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-api_gateway.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backend_for_frontend_bff.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-security_trimming.yaml`

## <a id="shape-fam-08"></a>SHAPE-FAM-08 — ABP/PBP/TBP resolution authority and deterministic carry-through

**Invariant type**  `family_summary`

**Family statement**  
Architecture style selection resolves deterministically into authoritative style-to-plane mappings. ABPs stay plane-neutral and technology-neutral; PBPs stay plane-local; TBP catalogs/manifests and resolution views stay complete and internally consistent.

**Why architects care**  
This is the bridge from intended architecture style to concrete implementation rails. If resolution is ambiguous or reinterpreted, planners and generators can each drift in a different direction.

**Activation summary**  
Resolution authority is always-on once style-based derivation is in scope. The selected architecture style activates a single ABP and its per-plane bindings.

**Classification tags**  `resolution`, `carry_through`, `deterministic_derivation`, `pin`, `option`

**Pin references**  `architecture.architecture_style`, `abp_pbp_resolution.*`, `tbp_resolution.*`

**Option references**  `architecture.architecture_style`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/phase_8/98_phase_8_architecture_binding_patterns_standard_v1.md`
- `architecture_library/phase_8/99b_phase_8_abp_pbp_resolution_schema_v1.yaml`
- `architecture_library/phase_8/101_phase_8_plane_binding_patterns_standard_v1.md`
- `architecture_library/phase_8/99_phase_8_abp_pbp_resolution_contract_v1.md`
- `architecture_library/phase_8/tbp/catalogs/tbp_catalog_v1.md`
- `architecture_library/phase_8/tbp/schemas/tbp_resolution_schema_v1.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-08-a1"></a>SHAPE-FAM-08-A1

**Invariant type**  `atomic_invariant`

**Statement**  ABPs define style only, PBPs define plane-local structure only, and neither layer may silently absorb the other’s authority.

**Activation**  `always_on_plus_pin_value_activated`

**Classification tags**  `resolution`, `carry_through`, `deterministic_derivation`, `pin`, `option`

**Pin references**  `architecture.architecture_style`, `abp_pbp_resolution.*`, `tbp_resolution.*`

**Option references**  `architecture.architecture_style`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-08-a2"></a>SHAPE-FAM-08-A2

**Invariant type**  `atomic_invariant`

**Statement**  Architecture-style resolution must be unique, complete, and fail closed when required plane role mappings are absent.

**Activation**  `pin_value_activated_plus_tbp_selected`

**Classification tags**  `resolution`, `carry_through`, `deterministic_derivation`, `pin`, `option`

**Pin references**  `architecture.architecture_style`, `abp_pbp_resolution.*`, `tbp_resolution.*`

**Option references**  `architecture.architecture_style`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-08-a3"></a>SHAPE-FAM-08-A3

**Invariant type**  `atomic_invariant`

**Statement**  Once ABP/PBP resolution exists, planning must use that resolved view and not reinterpret architecture style directly from prose.

**Activation**  `pin_value_activated`

**Classification tags**  `resolution`, `carry_through`, `deterministic_derivation`, `pin`, `option`

**Pin references**  `architecture.architecture_style`, `abp_pbp_resolution.*`, `tbp_resolution.*`

**Option references**  `architecture.architecture_style`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-09"></a>SHAPE-FAM-09 — Concrete runtime-stack, framework, auth, and UI realization bindings

**Invariant type**  `family_summary`

**Family statement**  
Once technology bindings are chosen, CAF expects matching concrete realization surfaces: language roots, frameworks, auth modes, persistence engines, runtime entrypoints, UI frameworks, and component systems must materialize coherently and respect declared conflicts and dependencies.

**Why architects care**  
This family turns “we chose FastAPI/Express/Postgres/React/etc.” into a concrete architectural commitment rather than a casual implementation preference.

**Activation summary**  
These invariants activate when runtime, framework, UI, auth, or persistence bindings are selected through TBPs or profile pins.

**Classification tags**  `runtime`, `framework_binding`, `auth`, `ui_binding`, `pin`, `option`

**Pin references**  `platform.framework`, `platform.persistence_orm`, `platform.auth_mode`, `platform.eventing_backend`, `ui.framework`, `ui.component_system`, `plane.runtime_shape`

**Option references**  `TBP-PY-01`, `TBP-FASTAPI-01`, `TBP-DJANGO-01`, `TBP-DRF-01`, `TBP-TS-01`, `TBP-EXPRESS-01`, `TBP-PG-01`, `TBP-PG-TS-01`, `TBP-RAW-SQL-01`, `TBP-SQLALCHEMY-01`, `TBP-AUTH-MOCK-01`, `TBP-UI-REACT-VITE-01`, `TBP-UI-REACT-VITE-SHADCN-01`, `TBP-UX-SERVICE-REACT-VITE-01`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/phase_8/tbp/atoms/TBP-PY-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-PY-PACKAGING-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-FASTAPI-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-AUTH-MOCK-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-SQLALCHEMY-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-UI-REACT-VITE-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-DJANGO-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-DRF-01/tbp_manifest_v1.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-09-a1"></a>SHAPE-FAM-09-A1

**Invariant type**  `atomic_invariant`

**Statement**  Python, FastAPI, and coherent CP↔AP transport envelopes create a concrete Python HTTP realization with canonical module roots, dependency manifests, and ASGI/FastAPI alignment.

**Activation**  `tbp_selected`

**Classification tags**  `runtime`, `framework_binding`, `auth`, `ui_binding`, `pin`

**Pin references**  `platform.framework`, `platform.persistence_orm`, `platform.auth_mode`, `platform.eventing_backend`, `ui.framework`, `ui.component_system`, `plane.runtime_shape`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-09-a2"></a>SHAPE-FAM-09-A2

**Invariant type**  `atomic_invariant`

**Statement**  React/Vite UI realization requires compiled delivery, stable proxy paths, and—when selected—separate UX-service lanes and shadcn-compatible component-system surfaces.

**Activation**  `tbp_selected_plus_pin_value_activated`

**Classification tags**  `runtime`, `framework_binding`, `auth`, `ui_binding`, `pin`, `option`

**Pin references**  `platform.framework`, `platform.persistence_orm`, `platform.auth_mode`, `platform.eventing_backend`, `ui.framework`, `ui.component_system`, `plane.runtime_shape`

**Option references**  `TBP-PY-01`, `TBP-FASTAPI-01`, `TBP-DJANGO-01`, `TBP-DRF-01`, `TBP-TS-01`, `TBP-EXPRESS-01`, `TBP-PG-01`, `TBP-PG-TS-01`, `TBP-RAW-SQL-01`, `TBP-SQLALCHEMY-01`, `TBP-AUTH-MOCK-01`, `TBP-UI-REACT-VITE-01`, `TBP-UI-REACT-VITE-SHADCN-01`, `TBP-UX-SERVICE-REACT-VITE-01`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-09-a3"></a>SHAPE-FAM-09-A3

**Invariant type**  `atomic_invariant`

**Statement**  Django/DRF, TypeScript/Express, Postgres, raw-SQL, SQLAlchemy, and mock-auth selections each impose specific role-bound runtime surfaces, conflicts, env contracts, entrypoints, and helper modules.

**Activation**  `tbp_selected`

**Classification tags**  `runtime`, `framework_binding`, `auth`, `ui_binding`, `pin`

**Pin references**  `platform.framework`, `platform.persistence_orm`, `platform.auth_mode`, `platform.eventing_backend`, `ui.framework`, `ui.component_system`, `plane.runtime_shape`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-10"></a>SHAPE-FAM-10 — Plane parameter universe and fixed invariant baseline

**Invariant type**  `family_summary`

**Family statement**  
The Control, Application, Data, Agent, and Storage template families expose mandatory explicit parameter choices and also carry fixed invariants that remain true regardless of which allowed value is selected.

**Why architects care**  
This is where architects see the sanctioned shape space directly. It distinguishes what teams may choose from what they may never weaken.

**Activation summary**  
Every plane family has always-on fixed invariants plus option-selected subpostures. Parameter selection changes realization posture, not the existence of the plane’s guardrails.

**Classification tags**  `plane_parameters`, `baseline`, `shape_universe`, `pin`, `option`

**Pin references**  `CP-1..6`, `AP-1..6`, `DP-1..5`, `AI-1..6`, `ST-1..6`

**Option references**  `all parameterized architecture template option sets under CP/AP/DP/AI/ST`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-10-a1"></a>SHAPE-FAM-10-A1

**Invariant type**  `atomic_invariant`

**Statement**  Control Plane parameters define authority, lifecycle, identity governance, policy distribution, safety-gate orchestration, and governance integration, while fixed invariants keep CP out of tenant business workflow execution.

**Activation**  `option_selected_plus_always_on`

**Classification tags**  `plane_parameters`, `baseline`, `shape_universe`, `pin`, `option`

**Pin references**  `CP-1..6`, `AP-1..6`, `DP-1..5`, `AI-1..6`, `ST-1..6`

**Option references**  `all parameterized architecture template option sets under CP/AP/DP/AI/ST`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-10-a2"></a>SHAPE-FAM-10-A2

**Invariant type**  `atomic_invariant`

**Statement**  Application Plane parameters define context binding, authorization, policy/safety invocation posture, agent-execution responsibility, and runtime evidence posture, while fixed invariants keep AP tenant-scoped, policy-respecting, and fail-closed on missing delegated context.

**Activation**  `option_selected_plus_always_on`

**Classification tags**  `plane_parameters`, `baseline`, `shape_universe`, `pin`, `option`

**Pin references**  `CP-1..6`, `AP-1..6`, `DP-1..5`, `AI-1..6`, `ST-1..6`

**Option references**  `all parameterized architecture template option sets under CP/AP/DP/AI/ST`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-10-a3"></a>SHAPE-FAM-10-A3

**Invariant type**  `atomic_invariant`

**Statement**  Data Plane parameters define isolation, enforcement point, governance coverage, inference placement, and evidence posture, while fixed invariants keep DP fail-closed, policy-driven, and non-governing.

**Activation**  `option_selected_plus_always_on`

**Classification tags**  `plane_parameters`, `baseline`, `shape_universe`, `pin`, `option`

**Pin references**  `CP-1..6`, `AP-1..6`, `DP-1..5`, `AI-1..6`, `ST-1..6`

**Option references**  `all parameterized architecture template option sets under CP/AP/DP/AI/ST`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-10-a4"></a>SHAPE-FAM-10-A4

**Invariant type**  `atomic_invariant`

**Statement**  Agent-plane parameters define identity, authority derivation, tool-boundary posture, memory/retrieval posture, safety-gate integration, and evidence posture, while fixed invariants keep agent execution tenant-scoped, bounded, attributable, and safety-gated.

**Activation**  `option_selected_plus_always_on`

**Classification tags**  `plane_parameters`, `baseline`, `shape_universe`, `pin`, `option`

**Pin references**  `CP-1..6`, `AP-1..6`, `DP-1..5`, `AI-1..6`, `ST-1..6`

**Option references**  `all parameterized architecture template option sets under CP/AP/DP/AI/ST`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-10-a5"></a>SHAPE-FAM-10-A5

**Invariant type**  `atomic_invariant`

**Statement**  Storage parameters define isolation topology, keying/addressing, placement, deletion/offboarding, backup/restore, and evidence posture, while fixed invariants keep storage tenant-scoped, deletion-enforcing, restore-safe, and evidence-emitting.

**Activation**  `option_selected_plus_always_on`

**Classification tags**  `plane_parameters`, `baseline`, `shape_universe`, `pin`, `option`

**Pin references**  `CP-1..6`, `AP-1..6`, `DP-1..5`, `AI-1..6`, `ST-1..6`

**Option references**  `all parameterized architecture template option sets under CP/AP/DP/AI/ST`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-11"></a>SHAPE-FAM-11 — Plane responsibility split and contract-first cross-plane design

**Invariant type**  `family_summary`

**Family statement**  
CAF expects explicit plane responsibilities, explicit cross-plane interaction semantics, explicit contract registries, and explicit plane-scoped domain models. Material boundaries are contract-first and fail closed when semantics are missing.

**Why architects care**  
This family prevents one plane from silently absorbing another’s job and keeps cross-plane semantics explicit enough for planning, build, and runtime verification.

**Activation summary**  
Plane separation and explicit contracts are always-on. Selected interaction modes and runtime-shape choices specify how the boundary is realized.

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`

**Pin references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `planes.*.runtime_shape`, `contract_declarations_v1.*`, `plane_scope`

**Option references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `cp_runtime_shape`, `ap_runtime_shape`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-ZT-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/phase_8/pbp/planes/AP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/CP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/DP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/84_phase_8_plane_integration_contract_v1.md`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-11-a1"></a>SHAPE-FAM-11-A1

**Invariant type**  `atomic_invariant`

**Statement**  Planes have explicit, non-overlapping responsibilities and zero-trust semantics across their boundaries.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`

**Pin references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `planes.*.runtime_shape`, `contract_declarations_v1.*`, `plane_scope`

**Option references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `cp_runtime_shape`, `ap_runtime_shape`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-11-a2"></a>SHAPE-FAM-11-A2

**Invariant type**  `atomic_invariant`

**Statement**  Selected ABP role bindings must materialize into plane-local scaffold roots and role layouts rather than remaining abstract catalog choices.

**Activation**  `pin_value_activated`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`

**Pin references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `planes.*.runtime_shape`, `contract_declarations_v1.*`, `plane_scope`

**Option references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `cp_runtime_shape`, `ap_runtime_shape`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-11-a3"></a>SHAPE-FAM-11-A3

**Invariant type**  `atomic_invariant`

**Statement**  Material CP↔AP boundaries require explicit plane-integration contracts whose interaction semantics, context propagation rules, invariants, and runtime-shape choices are owned by the contract itself.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`

**Pin references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `planes.*.runtime_shape`, `contract_declarations_v1.*`, `plane_scope`

**Option references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `cp_runtime_shape`, `ap_runtime_shape`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-11-a4"></a>SHAPE-FAM-11-A4

**Invariant type**  `atomic_invariant`

**Statement**  Application and system/domain-model artifacts are plane-scoped, not substitutes for activation evidence, and planning must fail closed if persisted work appears in a plane without activation or style binding evidence.

**Activation**  `always_on`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`

**Pin references**  `cp_ap.contract_surface`, `cross_plane.interaction_mode`, `planes.*.runtime_shape`, `contract_declarations_v1.*`, `plane_scope`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-025"></a>SHAPE-OPT-025 — `cp_ap.contract_surface` = `synchronous_http`

**Invariant type**  `option_branch_invariant`

**Statement**  CP↔AP interactions use synchronous HTTP APIs as the primary contract surface.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`, `adopted_shape`

**Pin references**  `cp_ap.contract_surface`

**Option references**  `cp_ap.contract_surface=synchronous_http`

**Representative question ids**  `Q-CP-AP-SURFACE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Immediate request/response semantics become part of the governance boundary.
- Timeout, idempotency, and error-shape discipline become first-class contract concerns.
- Operational evidence should show which enforcement-sensitive flows depend on synchronous availability.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-ZT-01.yaml`
- `architecture_library/phase_8/84_phase_8_plane_integration_contract_v1.md`
- `architecture_library/phase_8/pbp/planes/AP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/CP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/DP/pbp_manifest_v1.yaml`

#### <a id="inv-tsys-shape-opt-026"></a>SHAPE-OPT-026 — `cp_ap.contract_surface` = `async_events`

**Invariant type**  `option_branch_invariant`

**Statement**  CP↔AP interactions use asynchronous events or messages as the primary contract surface.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`, `adopted_shape`

**Pin references**  `cp_ap.contract_surface`

**Option references**  `cp_ap.contract_surface=async_events`

**Representative question ids**  `Q-CP-AP-SURFACE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Event contracts, replay behavior, and delivery semantics become part of intended plane interaction shape.
- Eventual consistency and correlation requirements must be explicit in governance and audit flows.
- Design surfaces must show how fail-closed obligations survive asynchronous boundaries.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-ZT-01.yaml`
- `architecture_library/phase_8/84_phase_8_plane_integration_contract_v1.md`
- `architecture_library/phase_8/pbp/planes/AP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/CP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/DP/pbp_manifest_v1.yaml`

#### <a id="inv-tsys-shape-opt-027"></a>SHAPE-OPT-027 — `cp_ap.contract_surface` = `mixed`

**Invariant type**  `option_branch_invariant`

**Statement**  CP↔AP interactions intentionally mix synchronous and asynchronous contract surfaces.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`, `adopted_shape`

**Pin references**  `cp_ap.contract_surface`

**Option references**  `cp_ap.contract_surface=mixed`

**Representative question ids**  `Q-CP-AP-SURFACE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture must explain which flows require immediate sync enforcement and which flows are safe as async lifecycle or audit traffic.
- Boundary contracts need a clean split rather than accidental transport sprawl.
- Carry-through artifacts should preserve the rationale for each interaction mode so later implementations do not flatten them.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-ZT-01.yaml`
- `architecture_library/phase_8/84_phase_8_plane_integration_contract_v1.md`
- `architecture_library/phase_8/pbp/planes/AP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/CP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/DP/pbp_manifest_v1.yaml`

#### <a id="inv-tsys-shape-opt-028"></a>SHAPE-OPT-028 — `cp_ap.contract_surface` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom CP↔AP contract surface is valid only if the interaction modes, responsibilities, and fail-closed behavior are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `plane_split`, `cross_plane`, `contract_first`, `zero_trust`, `pin`, `option`, `adopted_shape`

**Pin references**  `cp_ap.contract_surface`

**Option references**  `cp_ap.contract_surface=custom`

**Representative question ids**  `Q-CP-AP-SURFACE-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot hide whether governance interactions are sync, async, or mixed.
- Reviewers must still be able to trace how policy, lifecycle, and audit flows cross the plane boundary.
- Public promotion should wait until the custom contract surface is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-PLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-ZT-01.yaml`
- `architecture_library/phase_8/84_phase_8_plane_integration_contract_v1.md`
- `architecture_library/phase_8/pbp/planes/AP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/CP/pbp_manifest_v1.yaml`
- `architecture_library/phase_8/pbp/planes/DP/pbp_manifest_v1.yaml`

## <a id="shape-fam-12"></a>SHAPE-FAM-12 — AI governance, safety gates, bounded agent authority, and HITL

**Invariant type**  `family_summary`

**Family statement**  
AI systems in CAF are governed, bounded, and reviewable. Control Plane governance, Application Plane enforcement, Data Plane storage obligations, first-class Safety Gates, bounded agent authority, and explicit HITL triggers together define the safe AI architecture.

**Why architects care**  
This family turns “AI-enabled” from an implementation convenience into a governed system architecture with explicit ownership, blocking points, and review triggers.

**Activation summary**  
Governed AI posture and first-class safety gates are always-on when AI capability exists. Governance partitioning, invocation stage, structure, autonomy, and HITL bundles tune the realized operating model.

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`

**Pin references**  `ai_safety.*`, `safety_gate.*`, `dp_safety.*`, `agent.*`, `hitl.*`

**Option references**  `ai_safety.governance_partitioning`, `safety_gate.invocation_stage`, `safety.guardrail_ownership_model`, `dp_safety.enforcement_level`, `safety_gate.structure_variant`, `agent.autonomy_level`, `hitl.trigger_bundle`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-AP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-CP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-DP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-03.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-12-a1"></a>SHAPE-FAM-12-A1

**Invariant type**  `atomic_invariant`

**Statement**  AI policy, allowed models, and tool permissions are CP-governed; AP treats outputs as untrusted and DP may not bypass CP policy.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`

**Pin references**  `ai_safety.*`, `safety_gate.*`, `dp_safety.*`, `agent.*`, `hitl.*`

**Option references**  `ai_safety.governance_partitioning`, `safety_gate.invocation_stage`, `safety.guardrail_ownership_model`, `dp_safety.enforcement_level`, `safety_gate.structure_variant`, `agent.autonomy_level`, `hitl.trigger_bundle`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-12-a2"></a>SHAPE-FAM-12-A2

**Invariant type**  `atomic_invariant`

**Statement**  Safety Gates are first-class, broad in scope, binding in outcome, and explicitly owned across CP/AP/DP responsibilities; bypassed AI flows are non-compliant.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`

**Pin references**  `ai_safety.*`, `safety_gate.*`, `dp_safety.*`, `agent.*`, `hitl.*`

**Option references**  `ai_safety.governance_partitioning`, `safety_gate.invocation_stage`, `safety.guardrail_ownership_model`, `dp_safety.enforcement_level`, `safety_gate.structure_variant`, `agent.autonomy_level`, `hitl.trigger_bundle`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-12-a3"></a>SHAPE-FAM-12-A3

**Invariant type**  `atomic_invariant`

**Statement**  Safety-gate structure, agent/tool evaluation scope, autonomy limits, and HITL escalation triggers are explicit architectural choices rather than informal team conventions.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`

**Pin references**  `ai_safety.*`, `safety_gate.*`, `dp_safety.*`, `agent.*`, `hitl.*`

**Option references**  `ai_safety.governance_partitioning`, `safety_gate.invocation_stage`, `safety.guardrail_ownership_model`, `dp_safety.enforcement_level`, `safety_gate.structure_variant`, `agent.autonomy_level`, `hitl.trigger_bundle`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-029"></a>SHAPE-OPT-029 — `ai_safety.governance_partitioning` = `cp_governs_ap_enforces`

**Invariant type**  `option_branch_invariant`

**Statement**  Control Plane governs AI safety policy while Application Plane enforces it at runtime boundaries.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`, `adopted_shape`

**Pin references**  `ai_safety.governance_partitioning`

**Option references**  `ai_safety.governance_partitioning=cp_governs_ap_enforces`

**Representative question ids**  `Q-AI-PART-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- CP becomes the source of truth for risk classes, escalation rules, and approval posture.
- AP execution paths must treat safety checks as required preconditions, not best-effort helpers.
- Design and runtime evidence must show how governed safety decisions reach concrete runtime enforcement.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-AP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-CP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-DP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`

#### <a id="inv-tsys-shape-opt-030"></a>SHAPE-OPT-030 — `ai_safety.governance_partitioning` = `cp_only`

**Invariant type**  `option_branch_invariant`

**Statement**  Control Plane both governs and enforces AI safety, with Application Plane delegating decisions upstream.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`, `adopted_shape`

**Pin references**  `ai_safety.governance_partitioning`

**Option references**  `ai_safety.governance_partitioning=cp_only`

**Representative question ids**  `Q-AI-PART-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- AP runtime flows depend on an upstream control surface for safety outcomes.
- Latency, availability, and fallback behavior at the CP boundary become part of the safety architecture.
- Traceability surfaces must show how AP delegates rather than silently re-implements safety logic.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-AP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-CP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-DP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`

#### <a id="inv-tsys-shape-opt-031"></a>SHAPE-OPT-031 — `ai_safety.governance_partitioning` = `shared_governance_shared_enforcement`

**Invariant type**  `option_branch_invariant`

**Statement**  AI safety governance and enforcement responsibilities are shared with explicit boundaries.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`, `adopted_shape`

**Pin references**  `ai_safety.governance_partitioning`

**Option references**  `ai_safety.governance_partitioning=shared_governance_shared_enforcement`

**Representative question ids**  `Q-AI-PART-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- The architecture must name which safety responsibilities stay in CP and which stay in AP.
- Shared ownership increases drift risk unless the responsibility split is carried through precisely.
- Review surfaces should show how shared governance remains explicit instead of becoming fuzzy joint ownership.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-AP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-CP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-DP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`

#### <a id="inv-tsys-shape-opt-032"></a>SHAPE-OPT-032 — `ai_safety.governance_partitioning` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom AI safety partitioning branch is valid only if governance authority, enforcement boundaries, and escalation behavior are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `ai`, `governance`, `safety`, `agents`, `human_in_the_loop`, `pin`, `option`, `adopted_shape`

**Pin references**  `ai_safety.governance_partitioning`

**Option references**  `ai_safety.governance_partitioning=custom`

**Representative question ids**  `Q-AI-PART-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot be shorthand for undefined safety ownership.
- The branch must still preserve fail-closed safety expectations and human-decision boundaries.
- Public promotion should wait until the custom partitioning model is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AI-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-02.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-AISG-03.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-AP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-CP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-SAFE-DP-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-XPLANE-02.yaml`

## <a id="shape-fam-13"></a>SHAPE-FAM-13 — Data governance and AI data-use boundaries

**Invariant type**  `family_summary`

**Family statement**  
Data governance intent originates upstream, is enforced at runtime and storage boundaries, and constrains all AI and agent data usage through explicit classification, quality, lineage, and allowed-class decisions.

**Why architects care**  
This family keeps governed data use from becoming an informal promise. It tells architects where governance meaning lives and how downstream systems must honor it.

**Activation summary**  
Governance as an architectural baseline is always-on. Adoption-level and allowed-class choices determine how strict and how broad the runtime obligations become.

**Classification tags**  `data_governance`, `ai_data_use`, `compliance`, `pin`, `option`

**Pin references**  `dg.*`, `ai_data_usage.*`

**Option references**  `dg.adoption_level`, `ai_data_usage.allowed_classes`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-DG-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-DG-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-DG-10.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-13-a1"></a>SHAPE-FAM-13-A1

**Invariant type**  `atomic_invariant`

**Statement**  Data governance is an upstream architectural source of truth, and Control Plane remains the source of governance intent rather than a bulk-data processor.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `data_governance`, `ai_data_use`, `compliance`, `pin`, `option`

**Pin references**  `dg.*`, `ai_data_usage.*`

**Option references**  `dg.adoption_level`, `ai_data_usage.allowed_classes`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-13-a2"></a>SHAPE-FAM-13-A2

**Invariant type**  `atomic_invariant`

**Statement**  Application Plane enforces governance in workflows and Data Plane is the final enforcement boundary; neither may invent governance semantics or operate without validated governance context.

**Activation**  `always_on`

**Classification tags**  `data_governance`, `ai_data_use`, `compliance`, `pin`

**Pin references**  `dg.*`, `ai_data_usage.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-13-a3"></a>SHAPE-FAM-13-A3

**Invariant type**  `atomic_invariant`

**Statement**  AI and agent data use requires explicit tenant/identity context plus governance metadata, and allowed data classes are an explicit architecture choice.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `data_governance`, `ai_data_use`, `compliance`, `pin`, `option`

**Pin references**  `dg.*`, `ai_data_usage.*`

**Option references**  `dg.adoption_level`, `ai_data_usage.allowed_classes`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-14"></a>SHAPE-FAM-14 — Interaction style, eventing, resilience, and runtime behavior options

**Invariant type**  `family_summary`

**Family statement**  
When teams adopt interaction and resilience patterns, CAF treats the resulting behavior as intended shape. Idempotency, deadlines, retries, degradation, feature flags, state posture, CQRS, pub/sub, queues, and bulkheads are not mere implementation tactics once selected.

**Why architects care**  
These choices change how the system behaves under load, failure, mobile constraints, and async coordination. They belong in architecture because they affect user trust and operational correctness.

**Activation summary**  
Many rows here are option activators: once chosen, they become intended runtime behavior. A smaller subset are baseline behavioral obligations such as idempotency and bounded retries/timeouts.

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`

**Pin references**  `api.*`, `async.*`, `resilience.*`, `ops.feature_flag_*`, `service.state_management_strategy`, `data.cqrs_scope`

**Option references**  `idempotency.key_carrier`, `resilience.offline_mode_support_level`, `security.zero_trust_enforcement_scope`, `async.eventing_style`, `async.orchestration_engine_scope`, `async.saga_coordinator_model`, `async.outbox_publishing_mode`, `api.idempotency_key_strategy`, `resilience.timeout_deadline_model`, `resilience.retry_scope`, `async.dlq_handling_strategy`, `resilience.degradation_strategy`, `ops.feature_flag_scope`, `service.state_management_strategy`, `data.cqrs_scope`, `async.pubsub_delivery_semantics`, `async.queue_load_leveling_strategy`, `async.competing_consumers_scaling_model`, `resilience.bulkhead_strategy`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-05.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-zero_trust.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-secrets_management.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-distributed_tracing.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-structured_logging.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-14-a1"></a>SHAPE-FAM-14-A1

**Invariant type**  `atomic_invariant`

**Statement**  Client- and workflow-facing interaction posture is explicit: idempotency, coarse-grained mobile interactions, offline support, eventing style, and API composition/translation boundaries are architecture choices.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`

**Pin references**  `api.*`, `async.*`, `resilience.*`, `ops.feature_flag_*`, `service.state_management_strategy`, `data.cqrs_scope`

**Option references**  `idempotency.key_carrier`, `resilience.offline_mode_support_level`, `security.zero_trust_enforcement_scope`, `async.eventing_style`, `async.orchestration_engine_scope`, `async.saga_coordinator_model`, `async.outbox_publishing_mode`, `api.idempotency_key_strategy`, `resilience.timeout_deadline_model`, `resilience.retry_scope`, `async.dlq_handling_strategy`, `resilience.degradation_strategy`, `ops.feature_flag_scope`, `service.state_management_strategy`, `data.cqrs_scope`, `async.pubsub_delivery_semantics`, `async.queue_load_leveling_strategy`, `async.competing_consumers_scaling_model`, `resilience.bulkhead_strategy`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-14-a2"></a>SHAPE-FAM-14-A2

**Invariant type**  `atomic_invariant`

**Statement**  Async orchestration posture is explicit through orchestration-engine, saga-coordinator, and outbox-publishing choices.

**Activation**  `option_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`

**Pin references**  `api.*`, `async.*`, `resilience.*`, `ops.feature_flag_*`, `service.state_management_strategy`, `data.cqrs_scope`

**Option references**  `idempotency.key_carrier`, `resilience.offline_mode_support_level`, `security.zero_trust_enforcement_scope`, `async.eventing_style`, `async.orchestration_engine_scope`, `async.saga_coordinator_model`, `async.outbox_publishing_mode`, `api.idempotency_key_strategy`, `resilience.timeout_deadline_model`, `resilience.retry_scope`, `async.dlq_handling_strategy`, `resilience.degradation_strategy`, `ops.feature_flag_scope`, `service.state_management_strategy`, `data.cqrs_scope`, `async.pubsub_delivery_semantics`, `async.queue_load_leveling_strategy`, `async.competing_consumers_scaling_model`, `resilience.bulkhead_strategy`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-14-a3"></a>SHAPE-FAM-14-A3

**Invariant type**  `atomic_invariant`

**Statement**  Runtime resilience must include retry-safe side effects, deadlines, bounded retries, DLQ/quarantine handling, graceful degradation, governed feature flags, and explicit service-state posture.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`

**Pin references**  `api.*`, `async.*`, `resilience.*`, `ops.feature_flag_*`, `service.state_management_strategy`, `data.cqrs_scope`

**Option references**  `idempotency.key_carrier`, `resilience.offline_mode_support_level`, `security.zero_trust_enforcement_scope`, `async.eventing_style`, `async.orchestration_engine_scope`, `async.saga_coordinator_model`, `async.outbox_publishing_mode`, `api.idempotency_key_strategy`, `resilience.timeout_deadline_model`, `resilience.retry_scope`, `async.dlq_handling_strategy`, `resilience.degradation_strategy`, `ops.feature_flag_scope`, `service.state_management_strategy`, `data.cqrs_scope`, `async.pubsub_delivery_semantics`, `async.queue_load_leveling_strategy`, `async.competing_consumers_scaling_model`, `resilience.bulkhead_strategy`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-14-a4"></a>SHAPE-FAM-14-A4

**Invariant type**  `atomic_invariant`

**Statement**  Adopted coordination/scaling patterns such as CQRS, pub/sub, queues, competing consumers, and bulkheads each introduce explicit consistency, delivery, locking, and capacity-isolation obligations.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`

**Pin references**  `api.*`, `async.*`, `resilience.*`, `ops.feature_flag_*`, `service.state_management_strategy`, `data.cqrs_scope`

**Option references**  `idempotency.key_carrier`, `resilience.offline_mode_support_level`, `security.zero_trust_enforcement_scope`, `async.eventing_style`, `async.orchestration_engine_scope`, `async.saga_coordinator_model`, `async.outbox_publishing_mode`, `api.idempotency_key_strategy`, `resilience.timeout_deadline_model`, `resilience.retry_scope`, `async.dlq_handling_strategy`, `resilience.degradation_strategy`, `ops.feature_flag_scope`, `service.state_management_strategy`, `data.cqrs_scope`, `async.pubsub_delivery_semantics`, `async.queue_load_leveling_strategy`, `async.competing_consumers_scaling_model`, `resilience.bulkhead_strategy`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

### Option-branch invariants

#### <a id="inv-tsys-shape-opt-044"></a>SHAPE-OPT-044 — `resilience.circuit_breaker_placement` = `client_side_library`

**Invariant type**  `option_branch_invariant`

**Statement**  Circuit breakers are enforced at client or SDK call sites as the intended resilience boundary.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`, `adopted_shape`

**Pin references**  `resilience.circuit_breaker_placement`

**Option references**  `resilience.circuit_breaker_placement=client_side_library`

**Representative question ids**  `Q-EXT-CB-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Calling services own failure-detection and trip behavior close to the invocation point.
- Client libraries, retry logic, and fallback semantics become part of the resilience contract.
- Review surfaces should show how call-site breakers stay consistent across consumers.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-05.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-distributed_tracing.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-secrets_management.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-structured_logging.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-zero_trust.yaml`

#### <a id="inv-tsys-shape-opt-045"></a>SHAPE-OPT-045 — `resilience.circuit_breaker_placement` = `sidecar_or_proxy_enforced`

**Invariant type**  `option_branch_invariant`

**Statement**  Circuit breakers are enforced by a sidecar or local proxy layer as the intended resilience boundary.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`, `adopted_shape`

**Pin references**  `resilience.circuit_breaker_placement`

**Option references**  `resilience.circuit_breaker_placement=sidecar_or_proxy_enforced`

**Representative question ids**  `Q-EXT-CB-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Runtime topology now includes an adjacent resilience control surface near services.
- Proxy configuration, observability, and fail-open versus fail-closed posture become architectural concerns.
- Service code may simplify, but operators inherit stronger responsibility for proxy correctness.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-05.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-distributed_tracing.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-secrets_management.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-structured_logging.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-zero_trust.yaml`

#### <a id="inv-tsys-shape-opt-046"></a>SHAPE-OPT-046 — `resilience.circuit_breaker_placement` = `gateway_enforced`

**Invariant type**  `option_branch_invariant`

**Statement**  Circuit breakers are enforced at the gateway or edge as the intended resilience boundary.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`, `adopted_shape`

**Pin references**  `resilience.circuit_breaker_placement`

**Option references**  `resilience.circuit_breaker_placement=gateway_enforced`

**Representative question ids**  `Q-EXT-CB-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- Edge surfaces become the main point of downstream failure containment for covered paths.
- Internal service-to-service calls may still need separate resilience posture if gateway coverage stops at ingress.
- Operational review should distinguish gateway-protected flows from internal flows clearly.

**Publication readiness**  `staged_public_row_candidate`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-05.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-distributed_tracing.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-secrets_management.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-structured_logging.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-zero_trust.yaml`

#### <a id="inv-tsys-shape-opt-047"></a>SHAPE-OPT-047 — `resilience.circuit_breaker_placement` = `custom`

**Invariant type**  `option_branch_invariant`

**Statement**  A custom circuit-breaker placement branch is valid only if the enforcement surface, trip behavior, and fallback ownership are declared explicitly.

**Activation**  `becomes_active_when_selected`

**Classification tags**  `interaction_style`, `eventing`, `resilience`, `runtime`, `pin`, `option`, `adopted_shape`

**Pin references**  `resilience.circuit_breaker_placement`

**Option references**  `resilience.circuit_breaker_placement=custom`

**Representative question ids**  `Q-EXT-CB-01`

**Normalization basis**  Adopted-shape invariant row. This option branch becomes binding when the branch is selected.

**Intended shape consequences**

- “Custom” cannot hide where resilience decisions actually occur.
- The branch must still make failure containment and degradation reviewable.
- Public promotion should wait until the custom placement is concretely specified.

**Publication readiness**  `needs_custom_branch_concretization`

**Representative sources**

- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-01.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-04.yaml`
- `architecture_library/patterns/caf_v1/definitions_v1/CAF-MRAD-05.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-circuit_breaker.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-distributed_tracing.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-policy_as_code_guardrails.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-secrets_management.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-structured_logging.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-zero_trust.yaml`

## <a id="shape-fam-15"></a>SHAPE-FAM-15 — Infrastructure topology, secrets, packaging, and platform-operation consequences

**Invariant type**  `family_summary`

**Family statement**  
Infrastructure and packaging choices become intended architecture once selected. Secrets handling, compose/localstack wiring, private connectivity, backup posture, serverless/Kubernetes/managed-container topology, and packaging consequences all shape the candidate system.

**Why architects care**  
These are the choices that often get mislabeled as “just ops.” In practice they change runtime boundaries, ownership, and failure modes, so they belong in the invariant model.

**Activation summary**  
Secret externalization is a baseline rule; most other rows here are activated topology or packaging consequences.

**Classification tags**  `infrastructure`, `secrets`, `packaging`, `platform_ops`, `pin`, `option`

**Pin references**  `ops.*`, `network.*`, `data.*`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`

**Option references**  `ops.secrets_delivery_model`, `deployment.mode`, `deployment.target`, `network.private_connectivity_model`, `data.pitr_mode`, `ops.serverless_execution_model`, `ops.kubernetes_ownership_model`, `ops.managed_containers_deployment_model`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`, `ui.deployment_preference`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/patterns/external_v1/definitions_v1/ext-secrets_management.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-COMPOSE-01/tbp_manifest_v1.yaml`
- `architecture_library/phase_8/tbp/atoms/TBP-LOCALSTACK-01/tbp_manifest_v1.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-private_connectivity.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-backup_pitr.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-serverless.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-kubernetes_platform.yaml`
- `architecture_library/patterns/external_v1/definitions_v1/ext-managed_containers.yaml`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-15-a1"></a>SHAPE-FAM-15-A1

**Invariant type**  `atomic_invariant`

**Statement**  Secrets remain externalized and their delivery model is explicit rather than embedded in code or images.

**Activation**  `always_on_plus_option_selected`

**Classification tags**  `infrastructure`, `secrets`, `packaging`, `platform_ops`, `pin`, `option`

**Pin references**  `ops.*`, `network.*`, `data.*`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`

**Option references**  `ops.secrets_delivery_model`, `deployment.mode`, `deployment.target`, `network.private_connectivity_model`, `data.pitr_mode`, `ops.serverless_execution_model`, `ops.kubernetes_ownership_model`, `ops.managed_containers_deployment_model`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`, `ui.deployment_preference`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-15-a2"></a>SHAPE-FAM-15-A2

**Invariant type**  `atomic_invariant`

**Statement**  Compose and LocalStack selections require explicit runtime-wiring artifacts, service DNS usage, health gating, env contracts, and multi-service topology surfaces.

**Activation**  `tbp_selected`

**Classification tags**  `infrastructure`, `secrets`, `packaging`, `platform_ops`, `pin`

**Pin references**  `ops.*`, `network.*`, `data.*`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-15-a3"></a>SHAPE-FAM-15-A3

**Invariant type**  `atomic_invariant`

**Statement**  Private connectivity, recovery posture, and platform topologies such as serverless, Kubernetes, and managed containers are explicit architecture choices with corresponding ownership implications.

**Activation**  `option_selected`

**Classification tags**  `infrastructure`, `secrets`, `packaging`, `platform_ops`, `pin`, `option`

**Pin references**  `ops.*`, `network.*`, `data.*`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`

**Option references**  `ops.secrets_delivery_model`, `deployment.mode`, `deployment.target`, `network.private_connectivity_model`, `data.pitr_mode`, `ops.serverless_execution_model`, `ops.kubernetes_ownership_model`, `ops.managed_containers_deployment_model`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`, `ui.deployment_preference`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-15-a4"></a>SHAPE-FAM-15-A4

**Invariant type**  `atomic_invariant`

**Statement**  Packaging and related profile choices activate concrete deployment, composition-root, schema-management, and UX-service-separation consequences rather than remaining generic intent.

**Activation**  `pin_value_activated`

**Classification tags**  `infrastructure`, `secrets`, `packaging`, `platform_ops`, `pin`, `option`

**Pin references**  `ops.*`, `network.*`, `data.*`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`

**Option references**  `ops.secrets_delivery_model`, `deployment.mode`, `deployment.target`, `network.private_connectivity_model`, `data.pitr_mode`, `ops.serverless_execution_model`, `ops.kubernetes_ownership_model`, `ops.managed_containers_deployment_model`, `platform.packaging`, `platform.dependency_wiring_mode`, `platform.schema_management_strategy`, `ui.deployment_preference`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-16"></a>SHAPE-FAM-16 — Template derivation discipline and sanctioned architecture space

**Invariant type**  `family_summary`

**Family statement**  
Parameterized templates define the sanctioned architecture derivation surface. Instantiation must be explicit, finite, provenance-backed, ADR-backed, validation-mapped, evidenceable, and fail closed on missing or conflicting values.

**Why architects care**  
This family says what architects are actually allowed to shape. It keeps human and agent derivation inside a declared, reviewable architecture space.

**Activation summary**  
This family is mostly always-on derivation discipline. The only “activation” is instantiating a template at all, at which point these obligations become mandatory.

**Classification tags**  `templates`, `derivation`, `sanctioned_architecture_space`, `pin`, `option`

**Pin references**  `template_instances.*`, `ADR.*`, `validation_mapping.*`

**Option references**  `template instantiation itself`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-16-a1"></a>SHAPE-FAM-16-A1

**Invariant type**  `atomic_invariant`

**Statement**  Every compatible downstream artifact and reference implementation must declare the template(s), version(s), parameter pins, ADRs, and validation artifacts it instantiates.

**Activation**  `always_on_plus_pin_declared`

**Classification tags**  `templates`, `derivation`, `sanctioned_architecture_space`, `pin`

**Pin references**  `template_instances.*`, `ADR.*`, `validation_mapping.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-16-a2"></a>SHAPE-FAM-16-A2

**Invariant type**  `atomic_invariant`

**Statement**  Templates and parameters are only valid when they stay within cited upstream concepts, finite value sets, and non-weakening capability bounds.

**Activation**  `always_on`

**Classification tags**  `templates`, `derivation`, `sanctioned_architecture_space`, `pin`

**Pin references**  `template_instances.*`, `ADR.*`, `validation_mapping.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-16-a3"></a>SHAPE-FAM-16-A3

**Invariant type**  `atomic_invariant`

**Statement**  Conflicting or missing values require refusal/failure, and compliant template instantiation must emit the full required output bundle.

**Activation**  `always_on`

**Classification tags**  `templates`, `derivation`, `sanctioned_architecture_space`, `pin`

**Pin references**  `template_instances.*`, `ADR.*`, `validation_mapping.*`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

## <a id="shape-fam-17"></a>SHAPE-FAM-17 — Activated plane-consequence bundles for AP, DP, and Storage

**Invariant type**  `family_summary`

**Family statement**  
Certain AP, DP, and Storage option choices activate additional invariant bundles that architects must treat as intended shape: delegated-context bundles, explicit step boundaries, policy/safety coverage, storage deletion semantics, restore compatibility, and minimum evidence bundles.

**Why architects care**  
This family is where option selection becomes undeniably concrete. Once these values are chosen, the architecture owes specific runtime surfaces and refusal behavior.

**Activation summary**  
This family is almost entirely activated consequences. The invariants become live only when the relevant AP/DP/ST option value is selected.

**Classification tags**  `plane_consequences`, `runtime`, `storage`, `deployment_shape`, `pin`, `option`

**Pin references**  `AP-1..6`, `DP-1`, `ST-2`, `ST-4`, `ST-5`, `ST-6`

**Option references**  `AP-1 Ingress + Explicit Delegation`, `AP-2 Inline + Step-Level Enforcement`, `AP-3 Pre- and Mid-Execution Evaluation`, `AP-4 Pre- and Mid-Invocation Safety Gates`, `AP-5 Agent Orchestration Execution`, `AP-6 evidence bundle posture`, `DP-1 Hybrid Isolation`, `ST-2 internal IDs`, `ST-4 deletion semantics`, `ST-5 restore posture`, `ST-6 storage evidence posture`

**Normalization basis**  
Grouped related target-system truths into one family summary. The family remains explanatory; the main normalized rows are the atomic invariants and option-branch invariants beneath it.

**Representative sources**

- `architecture_library/07_contura_parameterized_architecture_templates_v1.md`

### Atomic invariants

#### <a id="inv-tsys-shape-fam-17-a1"></a>SHAPE-FAM-17-A1

**Invariant type**  `atomic_invariant`

**Statement**  Selected AP execution postures require verifiable context-delegation bundles, explicit step boundaries, versioned runtime policy references, safety-gate coverage, and minimal evidence bundles.

**Activation**  `option_selected`

**Classification tags**  `plane_consequences`, `runtime`, `storage`, `deployment_shape`, `pin`, `option`

**Pin references**  `AP-1..6`, `DP-1`, `ST-2`, `ST-4`, `ST-5`, `ST-6`

**Option references**  `AP-1 Ingress + Explicit Delegation`, `AP-2 Inline + Step-Level Enforcement`, `AP-3 Pre- and Mid-Execution Evaluation`, `AP-4 Pre- and Mid-Invocation Safety Gates`, `AP-5 Agent Orchestration Execution`, `AP-6 evidence bundle posture`, `DP-1 Hybrid Isolation`, `ST-2 internal IDs`, `ST-4 deletion semantics`, `ST-5 restore posture`, `ST-6 storage evidence posture`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.

#### <a id="inv-tsys-shape-fam-17-a2"></a>SHAPE-FAM-17-A2

**Invariant type**  `atomic_invariant`

**Statement**  Selected DP and Storage postures require policy-driven cohorting, tenant-scoped addressing, deletion coverage across derived artifacts, restore compatibility with deletion/offboarding semantics, and storage evidence bundles.

**Activation**  `option_selected`

**Classification tags**  `plane_consequences`, `runtime`, `storage`, `deployment_shape`, `pin`, `option`

**Pin references**  `AP-1..6`, `DP-1`, `ST-2`, `ST-4`, `ST-5`, `ST-6`

**Option references**  `AP-1 Ingress + Explicit Delegation`, `AP-2 Inline + Step-Level Enforcement`, `AP-3 Pre- and Mid-Execution Evaluation`, `AP-4 Pre- and Mid-Invocation Safety Gates`, `AP-5 Agent Orchestration Execution`, `AP-6 evidence bundle posture`, `DP-1 Hybrid Isolation`, `ST-2 internal IDs`, `ST-4 deletion semantics`, `ST-5 restore posture`, `ST-6 storage evidence posture`

**Normalization basis**  Main normalized invariant row. Architect-selectable pins and option sets remain visible as references and tags rather than becoming separate primary row types.
