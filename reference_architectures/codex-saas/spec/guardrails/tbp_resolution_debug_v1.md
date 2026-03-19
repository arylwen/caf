# TBP resolution debug (v1)

- Derived at: 2026-03-19T11:17:22.269Z
- Instance: codex-saas

## Resolution atoms
- runtime.language: python
- runtime.framework: fastapi
- persistence.orm: sqlalchemy_orm
- auth.mode: mock
- database.engine: postgresql
- deployment.mode: docker_compose
- plane.runtime_shape: api_service_http
- ui.present: true
- ui.kind: web_spa
- ui.framework: react
- ui.deployment_preference: separate_ui_service

## Resolved conventions
- source: TBP-PY-01: layout.module_conventions
- module_conventions.absolute_import_root: code
- module_conventions.intra_package_import_style: explicit_relative_preferred
- module_conventions.plane_module_roots:
  - ap: code.ap
  - cp: code.cp

## Seed TBPs (applicable by binds_to)
- TBP-ASGI-01 (runtime.framework=fastapi, plane.runtime_shape=api_service_http)
- TBP-AUTH-MOCK-01 (auth.mode=mock, runtime.language=python, plane.runtime_shape=api_service_http)
- TBP-COMPOSE-01 (deployment.mode=docker_compose, deployment.mode=podman_compose)
- TBP-FASTAPI-01 (runtime.framework=fastapi, plane.runtime_shape=api_service_http)
- TBP-PG-01 (database.engine=postgresql, runtime.language=python)
- TBP-PY-01 (runtime.language=python)
- TBP-PY-PACKAGING-01 (runtime.language=python)
- TBP-SQLALCHEMY-01 (persistence.orm=sqlalchemy_orm, runtime.language=python)
- TBP-UI-REACT-VITE-01 (ui.present=true, ui.kind=web_spa, ui.framework=react, deployment.mode=docker_compose, deployment.mode=podman_compose)

## Resolved TBPs (closure under requires)
- TBP-ASGI-01 - requires: TBP-PY-01
- TBP-AUTH-MOCK-01 - requires: TBP-PY-01
- TBP-COMPOSE-01
- TBP-FASTAPI-01 - requires: TBP-PY-01, TBP-ASGI-01 ; conflicts: TBP-DJANGO-01, TBP-DRF-01
- TBP-PG-01 - requires: TBP-PY-01
- TBP-PY-01
- TBP-PY-PACKAGING-01 - requires: TBP-PY-01
- TBP-SQLALCHEMY-01 - requires: TBP-PY-01
- TBP-UI-REACT-VITE-01 - requires: TBP-COMPOSE-01

## Non-applicable catalog TBPs
- TBP-DJANGO-01 (requires runtime.framework=django, plane.runtime_shape=api_service_http)
- TBP-DRF-01 (requires runtime.framework=django_rest_framework, plane.runtime_shape=api_service_http)
- TBP-EXPRESS-01 (requires runtime.framework=express)
- TBP-LOCALSTACK-01 (requires deployment.target=localstack)
- TBP-PG-TS-01 (requires database.engine=postgresql, runtime.language=typescript)
- TBP-RAW-SQL-01 (requires persistence.orm=raw_sql, runtime.language=python)
- TBP-TS-01 (requires runtime.language=typescript)

