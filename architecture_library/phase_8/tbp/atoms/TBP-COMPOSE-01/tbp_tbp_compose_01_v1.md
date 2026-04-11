TBP_ID: TBP-COMPOSE-01
NAME: Docker Compose environment binding
INTENT: Bind CFG-01/INT-01 roles to a compose-based local/dev environment description (static structure only), with Dockerfile-based builds.
SCOPE: Deployment
APPLIES_WHEN: deployment.mode in {docker_compose, podman_compose}
EXTENDS_CORE_PATTERNS: CFG-01; INT-01
BINDS_MODULE_ROLES: config_registry; config_provider; integration_contracts; integration_adapters

ROLE_BINDINGS:
- config_registry: `docker/compose.candidate.yaml` plus `.env`; treated as the environment configuration registry for local/dev.
- config_provider: Environment variables are provided via `env_file: ../.env` and/or `environment:` blocks; compose uses `${VAR}` interpolation rather than hard-coded secrets.
- integration_contracts: Service-to-service connectivity is described via compose service names, exposed ports, and declared networks.
- integration_adapters: Local integration adapters are represented as compose services for dependencies (e.g., `postgres`).

Best-practice (normative for this TBP):
- CP/AP services MUST use `build:` with `docker/Dockerfile.cp` and `docker/Dockerfile.ap` so developers do not need host-local language/runtime tooling for the selected stack.
- `.env` MUST be a real file with non-secret local defaults (no placeholders), and `.gitignore` MUST ignore `.env` and `*.local`.
- When an adopted database engine/runtime contract requires a canonical connection URL shape (for example PostgreSQL + SQLAlchemy), `.env` should carry that same canonical URL form rather than a drifting alternate example.
- When compose materializes a stateful support service that AP/CP startup depends on (for example `postgres`), the support service MUST expose a compose `healthcheck:` and dependent AP/CP services MUST express `depends_on` with `condition: service_healthy`.

ADDS_EVIDENCE_HOOKS:
- E-TBP-COMPOSE-01-01: `docker/compose.candidate.yaml` exists.
- E-TBP-COMPOSE-01-02: Compose file declares `services:` with CP/AP services (and support services when adopted by profile atoms).
- E-TBP-COMPOSE-01-03: CP/AP services use `build:` referencing `docker/Dockerfile.*`.
- E-TBP-COMPOSE-01-04: Compose uses `env_file: ../.env` OR `${VAR}` interpolation.
- E-TBP-COMPOSE-01-05: `.gitignore` ignores `.env` and `*.local`.

ADDS_STRUCTURAL_VALIDATIONS:
- V-TBP-COMPOSE-01-01: Compose file is present and parses as YAML (static check).
- V-TBP-COMPOSE-01-02: No plaintext credentials are embedded in compose; secrets must be injected via env or a secret mechanism.
- V-TBP-COMPOSE-01-03: If a support service is declared (e.g., postgres), the primary service references it by service name in configuration (static string match in env vars).
- V-TBP-COMPOSE-01-04: CP/AP services use Dockerfile-based builds (no local pip prerequisite).
- V-TBP-COMPOSE-01-05: When a stateful support service such as `postgres` is materialized for AP/CP startup, the support service defines a compose `healthcheck:` and dependent AP/CP services use `depends_on.<service>.condition: service_healthy`.

REQUIRES_TBPS: None
CONFLICTS_WITH_TBPS: None
FORBIDDEN: Hard-coded secrets in compose are forbidden.

SOURCES_USED:
- pattern_cfg_01_v1.md — CFG-01 roles
- pattern_int_01_v1.md — INT-01 roles
- tbp_sources_docker_compose_v1.md — external references
