# Contura Document Output Standards  

**CAF meta vs domain:** Framework/process conventions belong in `architecture_library/patterns/caf_meta_v1/` (see `architecture_library/patterns/caf_meta_v1/meta_vs_domain_classification_rule_v1.md`), not in `patterns/caf_v1/`.


> Reference: CAF meta-patterns (low-friction human signals, library-owned options, fail-closed gating) are documented in `architecture_library/patterns/caf_meta_v1/`.


Version: v2  
Status: Active  
Last Updated: 2026-01-24

These standards define the formatting rules for all Contura project documents.  
They ensure compatibility with Contura’s linters, regex-based tooling, semantic parsers, and downstream automation.

---

## 1. Heading Rules

• Only **one** level-one heading (`# Heading`) is permitted per document.  
• All additional sections must begin at level-two (`##`) or deeper.  
• Leave **one blank line** after every heading before any content.  
• Leave **one blank line** before the start of any list.  
• Do not nest headings of different scopes improperly (e.g., skipping levels).

---

## 2. Fencing Rules

### 2.1 Chat delivery (outer fence rule)

• When delivering a Contura document **in chat**, use **one and only one** outer code fence.  
• **No internal code fences** are permitted inside that outer fence.  
• Diagrams must be represented in plain text without fenced blocks.

### 2.2 Repository artifacts (structured sections are allowed)

Inside the repository (e.g., CAF archives, reference architectures, companion repositories):

• Internal fenced blocks MAY be used **only** when required to carry **machine-readable structured content** (e.g., YAML) inside a managed block.  
• Prefer `ARCHITECT_EDIT_BLOCK`s for human-authored YAML, and keep the YAML small and “flip-a-line” friendly.

---

## 3. Managed block rules (Phase 8 / CAF)

When a document is rerun-safe and participates in CAF derivations, it MUST separate:

### 3.1 CAF_MANAGED_BLOCK (regenerable)

Delimited by:

- `<!-- CAF_MANAGED_BLOCK: <id> START -->` … `END`

CAF may rewrite these blocks on reruns. Humans MUST NOT rely on manual edits inside them.

### 3.2 DESIGNER_MANAGED_BLOCK (regenerable, designer-owned)

Delimited by:

- `<!-- DESIGNER_MANAGED_BLOCK: <id> START -->` … `END`

The producing designer (agent/skill) owns these blocks and may regenerate them deterministically.  
Humans SHOULD NOT hand-edit these blocks unless a workflow explicitly requests it.

### 3.3 ARCHITECT_EDIT_BLOCK (human signal; authoritative)

Delimited by:

- `<!-- ARCHITECT_EDIT_BLOCK: <id> START -->` … `END`

This is the only approved location for **human decisions/answers** that drive downstream derivations.  
Producing steps MUST preserve these blocks verbatim (merge-safe). Downstream consumers MUST consume only the architect’s adopted/answered items.

Normative contract:
- `architecture_library/phase_8/82_phase_8_human_signal_blocks_contract_v2.md`

---



### 3.5 Library-owned option sets (low-friction architect UX)

When an `ARCHITECT_EDIT_BLOCK` includes `options` (e.g., decisions, choice sets, or open questions), the canonical option list MUST be **library-owned**, not hardcoded in skills.

Preferred source:
- `architecture_library/patterns/caf_v1/definitions_v1/<PATTERN>.yaml` → `caf.option_sets`

Rules:
- Skills copy options verbatim from the referenced option set(s) and emit them into the block.
- Option summaries MUST be neutral (avoid “recommended”) unless the recommendation is explicitly grounded and cited.
- Always include an escape hatch (`custom`) option when the pattern provides one; otherwise the producer MAY add a `custom` option with empty fields.


#### Library-owned option sets and inventories

- Canonical **option sets** (and any decision/question templates) MUST live in the CAF pattern library (`architecture_library/patterns/caf_v1/definitions_v1/*.yaml`).
- Skills MUST NOT embed canonical decision inventories (IDs/topics) as static lists.
- Producers should emit architect-facing options only when warranted by grounded applicability (adopted patterns + instance scope evidence), and must include anchors back to the originating pattern and option_set_id.

## 4. List Formatting Rules

• Lists must have one blank line **before** they begin.  
• Lists must be aligned consistently and indented only when representing hierarchy.  
• Do not mix ordered and unordered lists at the same indentation level.

---

## 5. Spacing Rules

• Always leave exactly **one blank line** between logical sections.  
• Do not leave trailing spaces at line ends.  
• Do not use tab characters.

---

## 6. Diagram Rules

• Diagrams must be plain text only.  
• No ASCII art requiring fenced formatting.  
• No inline code fences around diagrams.

---

## 7. File Naming Rules

• **Library documents** (the Contura Architecture Library) must use **lowercase with underscores**.  
• Library versions must appear at the end: `_v1.md`, `_v2.md`, etc.  
• Only semantic versions are allowed for library documents (v1, v1.1, v2, v3b2, etc.).

• **Downstream repositories** (including Phase 7 reference implementations and Phase 8 companion repos) may follow their **domain-native conventions** as long as they remain machine-discoverable and contract-compliant:

- Phase 7 reference implementations must conform to `70_contura_reference_implementation_structure_and_derivation_contract_v1.md`
- ADR files in downstream repos may use ADR naming conventions (e.g., `ADR-XX-01.md`) where defined.

• If a downstream repo includes Contura library artifacts verbatim, those copied artifacts must retain their original library filenames (lowercase + underscores + version suffix).

---

## 8. Versioning and Change Control

• Any structural or semantic update requires a new version.  
• Minor formatting fixes may remain within the same version unless otherwise required.  
• Major conceptual changes require incrementing the version number.  
• All version updates must be logged in the file’s Version History section.

---

## 9. Stability and Compliance

• All documents must comply with Contura Hemisphere Standards v1.  
• Narrative documents must comply with Safe Wording Guidelines v3.  
• Brand-oriented documents must follow Brand Identity v3.  
• Visual descriptions must follow the Visual Tolerance Specification v3.

---

## 10. Version History

v2 — Added Phase 8 managed block separation (CAF/DESIGNER/ARCHITECT), clarified fencing rules for repo artifacts vs chat delivery, and pointed to the normative human signal blocks contract.

v1 — Initial release establishing heading limits, spacing rules, fencing rules, diagram norms, list spacing norms, and compatibility with Contura processing tools.


### Markdown ordered lists
- Use `1.` / `2.` / `3.` list markers (dot syntax), **not** `1)` / `2)`.
  - Rationale: some Markdown linters treat the `1)` style as an error.
