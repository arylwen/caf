# Pattern taxonomy (v1)

This doc is a GitHub-friendly entry point for browsing CAF patterns by **family**.
Family codes are derived from pattern IDs (e.g., `CAF-POL-*` → `POL`, `CAF-IAM-*` → `IAM`, `EXT-*` → `EXT`).

Start here:

- [Families graph](pattern_graph_families_v1.md)
- [Offline pattern browser](pattern_browser_v1.html)
- Machine index: `docs/pattern_index_v1.json`

## How to ask your assistant

- "List the key patterns in the POL family and explain what they enforce."
- "For IAM:AUTH patterns, summarize the decision prompts and common dependencies."
- "For MTEN, show the subfamilies and the hub patterns that tie them together."
- "Given a spec about <topic>, which family should I look at first (POL/IAM/MTEN/OBS/CTX/CFG/AI)?"

## Primary families (current)

- **MTEN** (77) — see [pattern graph](pattern_graph_MTEN_v1.md)
- **EXT** (62) — see [pattern graph](pattern_graph_EXT_v1.md)
- **IAM** (31) — see [pattern graph](pattern_graph_IAM_v1.md)
- **DG** (16) — see [pattern graph](pattern_graph_DG_v1.md)
- **POL** (15) — see [pattern graph](pattern_graph_POL_v1.md)
- **AISG** (6) — see [pattern graph](pattern_graph_AISG_v1.md)
- **MRAD** (6) — see [pattern graph](pattern_graph_MRAD_v1.md)
- **AIOBS** (5) — see [pattern graph](pattern_graph_AIOBS_v1.md)
- **EXE** (5) — see [pattern graph](pattern_graph_EXE_v1.md)
- **RIC** (5) — see [pattern graph](pattern_graph_RIC_v1.md)
- **COST** (4) — see [pattern graph](pattern_graph_COST_v1.md)
- **INC** (4) — see [pattern graph](pattern_graph_INC_v1.md)
- **SAFE** (3) — see [pattern graph](pattern_graph_SAFE_v1.md)
- **TEL** (3) — see [pattern graph](pattern_graph_TEL_v1.md)
- **WF** (3) — see [pattern graph](pattern_graph_WF_v1.md)
- **COH** (2) — see [pattern graph](pattern_graph_COH_v1.md)
- **COMP** (2) — see [pattern graph](pattern_graph_COMP_v1.md)
- **PLANE** (2) — see [pattern graph](pattern_graph_PLANE_v1.md)
- **XPLANE** (2) — see [pattern graph](pattern_graph_XPLANE_v1.md)
- **AI** (1) — see [pattern graph](pattern_graph_AI_v1.md)

## Notes

- Mermaid `click` links are intentionally not relied on (GitHub iframe CSP often blocks navigation).
- Per-family graphs collapse edges to outside families into family nodes for readability.
- This taxonomy is **user-facing**; `architecture_library/patterns/caf_meta_v1/**` is **maintainer-facing** meta-pattern guidance.
