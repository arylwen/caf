ID: TBP-AUTH-MOCK-01
TITLE: Mock Auth Claim Contract for Python HTTP Surfaces
INTENT: Bind mock auth mode to an explicit claim-bearing Authorization/Bearer runtime contract for Python HTTP services without pushing auth-mode realization into planner prose or bespoke scanners.

ROLE BINDINGS:
- mock_auth_claims_module: shared helper that parses the mock Authorization/Bearer claim contract using the canonical claim keys `tenant_id`, `principal_id`, and `policy_version`. Deterministic proof may be satisfied either by explicit `Authorization`/`Bearer` contract wording in the helper surface or by an explicit authorization-header + bearer-parser seam in that helper. The current canonical bearer token shape is `mock.<base64-json>.token`.
- mock_auth_ap_boundary_adapter: AP HTTP boundary helper that resolves Authorization/Bearer inputs using case-insensitive HTTP header access; alternate tenant/principal headers are read only to reject conflicting carriers when claim-over-header is adopted. The request-object handoff may be split with the framework-owned dependency provider boundary, so deterministic proof must not require every request-surface marker to live in `auth_context.py` itself.
- mock_auth_ui_claim_builder: UI claim builder that encodes the selected mock Authorization/Bearer payload and owns the canonical mock claim shape.
- mock_auth_ui_api_helper: UI API helper that emits the selected Authorization/Bearer header and preserves claim-over-header conflict behavior at the browser/client edge.
- UI API-helper evidence may be satisfied through explicit delegation to the owning claim/header helper (for example `buildAuthHeaders(...)`) as long as the API helper keeps claim-over-header conflict behavior explicit; deterministic proof may be satisfied either locally in the API helper or in the declared owner surface when the split is explicit.
- Deterministic realization checks for delegated proxy/owner pairs MUST be declared from the TBP role binding (for example via `validator_kind` + `validator_config`) and executed by generic gates; do not hardcode proxy-file string rules into workers or generic build/UX gates.

EVIDENCE EXPECTATIONS:
- E-TBP-AUTH-MOCK-01-01: Mock auth mode is realized through an explicit Authorization/Bearer contract in the shared auth helper, AP boundary adapter, and UI helper surfaces.
- E-TBP-AUTH-MOCK-01-02: Claim-bearing mock auth semantics use the canonical claim keys `tenant_id`, `principal_id`, and `policy_version` in the UI claim builder and shared auth helper when `auth_claim` is adopted.
- E-TBP-AUTH-MOCK-01-03: Header/claim precedence behavior remains coherent with CAF-TCTX-01 in the AP boundary adapter and UI API helper rather than silently degrading to header-only semantics.

VALIDATION QUESTIONS:
- V-TBP-AUTH-MOCK-01-01: Do AP/runtime entrypoints and policy seams name the selected mock auth contract explicitly rather than relying on generic tenant headers?
- V-TBP-AUTH-MOCK-01-02: If `auth_claim` is adopted, do the UI claim-builder and UI API helper surfaces jointly issue the same Bearer claim payload that policy or boundary code resolves?
- V-TBP-AUTH-MOCK-01-03: Are alternate tenant/principal headers treated as conflict-detection inputs only, not as the happy-path carrier for mock auth?
- V-TBP-AUTH-MOCK-01-04: Do boundary/helper implementations preserve HTTP header case-insensitivity when resolving Authorization/Bearer and alternate conflict-detection headers?

FORBIDDEN:
- Silently realizing `platform.auth_mode = mock` as generic header-only semantics when the selected tenant carrier expects claim-bearing behavior.
- Encoding unrelated request metadata such as correlation ids inside the canonical mock Authorization/Bearer claim payload.
- Treating a single UI file as the owner of both claim construction and browser-side API emission when those responsibilities are split across distinct framework-emitted surfaces.

RUNTIME PROOF:
- RP-TBP-AUTH-MOCK-01-01: The AP mock-auth boundary role binding declares an authenticated callable smoke that proves the emitted boundary accepts the selected Authorization/Bearer claim contract at runtime, including lowercase HTTP header names typical of ASGI request objects.
