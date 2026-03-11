# ABP-LAYERED-01 — Layered Architecture (v1)

## Purpose

Define a plane-neutral Layered Architecture style as a clear counter-example to Clean Architecture.
This gives CAF users a recognizable alternative style without forcing tactical framework choices.

## Role vocabulary

- `composition_root`
- `presentation_layer`
- `application_services`
- `domain_model`
- `data_access_layer`
- `integration_adapters`

## Strategic intent

Choose this style when the system favors:

- simpler layer-oriented communication,
- a more conventional service/application/data separation,
- reduced emphasis on port/adapter indirection.

## Caution

This style can be entirely valid, but it offers weaker protection against infrastructure coupling than a stricter Clean Architecture approach.
That trade-off should be intentional and architect-owned.
