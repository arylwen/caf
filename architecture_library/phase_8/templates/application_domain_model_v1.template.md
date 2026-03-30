# Application Domain Model (v1)

## How to use this file

This is the **human-edit source of truth** for the detailed application-plane domain model.
CAF will later derive planner-facing YAML from this document.

Use this file when you want to define:

- bounded contexts
- aggregates and entities
- fields and invariants
- persistence intent
- use cases that touch those entities

Rules:

- Keep the source names meaningful in business language.
- Do not assume the seeded text is authoritative forever; `/caf arch` may project this file from the resolved PRD when it still contains default starter content.
- Preserve the overall structure so later derivation stays predictable.

---

## Domain overview

Describe the main bounded context(s) and the product problem this model supports.

Suggested prompts:

- What is the primary business capability of the product?
- Which bounded contexts or major subdomains matter first?
- What must remain tenant-scoped or governed?

## Aggregates and entities

Repeat this structure for the most important business objects.

### Aggregate or entity: <replace with source name>

Authoring note:
- If you write `### Aggregate: <Name>` and place `Fields` directly under that section, CAF will normalize those fields into the aggregate-root entity in the derived YAML view.
- If the aggregate also has subordinate child records, add separate `### Entity:` sections for them.
- In the derived YAML, every field becomes `name` / `type` / `required`. Mark optional fields explicitly with words like `optional`, `nullable`, `may be omitted`, or a trailing `?`; otherwise CAF should treat the field as required.

**Description**
Describe what the business object represents and why it matters.

**Fields**

- <field_name>: <type / short meaning>
- <optional_field_name>: <type / short meaning>, optional

**Invariants**

- <business rule that must always remain true>

**Persistence intent**
Describe how this object should be stored or queried at a high level.

**Canonical normalization (optional)**

```yaml
canonical:
  term_id: <optional canonical term>
  status: exact
  matched_by: architect_selected
```

## Use cases

Authoring rule:
- Every name listed under `**Touches**` must match an aggregate or entity declared above in this same plane document.
- If a use case depends on concepts such as Role, User, Tenant, or Activity Event, model the plane-owned business object explicitly above (for example a role-assignment or activity aggregate) instead of leaving the touch reference implicit.
- Do not rely on another plane document to satisfy `Touches` names for this application-plane file.

### <replace with use-case name>

**Intent**
Describe the business outcome the user or system is trying to achieve.

**Touches**

- <aggregate/entity names involved>

## API candidates (optional)

These are only starter hints for the architect. Planner derivation should come from the domain content above, not from this section alone.

Authoring note:
- CAF should normalize each bullet into `api_candidates.resources[]` object entries in the derived YAML, using `name` plus optional `operations[]`.

- <resource>: list, create, get, update

## Open questions

Capture unresolved domain questions here.

## Canonical normalization notes (optional)

- preserve the source entity / aggregate name
- add optional canonical metadata only when useful
- preferred fields:
  - `canonical.term_id`
  - `canonical.status: exact | alias | suggested | none`
  - `canonical.matched_by: alias_table | semantic_suggestion | architect_selected | none`
  - `canonical.confidence` (0-1 when suggested)
- use vocabulary: `architecture_library/phase_8/87c_phase_8_canonical_domain_normalization_vocabulary_v1.yaml`
- normalization is advisory metadata only; it MUST NOT replace the source name
