/**
 * Allowed values extractor (v1) - deterministic.
 *
 * Input: architecture_library/07_contura_parameterized_architecture_templates_v1.md
 * Output: { allowedValuesByParamId: { "CP-1": ["Declarative Only", ...] }, requiredParamIds: ["CP-1", ...] }
 *
 * Conventions parsed (stable):
 * - Parameter header: "#### <ID>: ..." where ID matches ^[A-Z]{2,5}-[0-9]{1,3}$
 * - Allowed values section: a line "**Allowed Values:**" (case-insensitive)
 * - Allowed value bullet item: "- **<Value>**" (first bold segment is the value label)
 *
 * Non-goals:
 * - Full Markdown parsing
 * - Recovering from arbitrary formatting
 */

function normalizeLineEndings(s) {
  return String(s ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function splitLines(md) {
  const t = normalizeLineEndings(md);
  return t.startsWith('\ufeff') ? t.slice(1).split('\n') : t.split('\n');
}

function isParamHeader(line) {
  const m = /^####\s+([A-Z]{2,5}-[0-9]{1,3})\s*:\s*(.+)$/.exec(String(line ?? '').trim());
  if (!m) return null;
  return { param_id: m[1], title: m[2].trim() };
}

function isAllowedValuesLine(line) {
  // Accept both common styles:
  // 1) **Allowed Values**:
  // 2) **Allowed Values:**  (colon inside the bold)
  const s = String(line ?? '').trim();
  return /^\*\*Allowed Values\*\*\s*:\s*$/i.test(s) || /^\*\*Allowed Values:\*\*\s*$/i.test(s);
}

function parseAllowedValueBullet(line) {
  // Expect: - **Value**  (may be followed by description)
  const m = /^[-*]\s+\*\*([^*]{1,160})\*\*\s*(.*)$/.exec(String(line ?? '').trim());
  if (!m) return null;
  const value = m[1].trim();
  if (!value) return null;
  return value;
}

export function extractAllowedValuesFromParameterizedTemplatesMd(md) {
  const lines = splitLines(md);

  const allowedValuesByParamId = {};
  const requiredParamIds = [];

  let currentParam = null;
  let inAllowedValues = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hdr = isParamHeader(line);
    if (hdr) {
      currentParam = hdr.param_id;
      inAllowedValues = false;
      if (!requiredParamIds.includes(currentParam)) requiredParamIds.push(currentParam);
      if (!allowedValuesByParamId[currentParam]) allowedValuesByParamId[currentParam] = [];
      continue;
    }

    if (!currentParam) continue;

    // End allowed values region when we reach a new bold heading like **Constraints:** or another section.
    if (inAllowedValues) {
      if (/^\*\*[^*]+\*\*\s*:\s*$/i.test(String(line ?? '').trim()) && !isAllowedValuesLine(line)) {
        inAllowedValues = false;
        continue;
      }
      const v = parseAllowedValueBullet(line);
      if (v) {
        if (!allowedValuesByParamId[currentParam].includes(v)) {
          allowedValuesByParamId[currentParam].push(v);
        }
      }
      continue;
    }

    if (isAllowedValuesLine(line)) {
      inAllowedValues = true;
      continue;
    }
  }

  // Fail-closed friendliness: remove any parameters that have no allowed values parsed.
  // (This should not happen if the source is conformant.)
  for (const pid of Object.keys(allowedValuesByParamId)) {
    if (!Array.isArray(allowedValuesByParamId[pid]) || allowedValuesByParamId[pid].length === 0) {
      delete allowedValuesByParamId[pid];
    }
  }

  const required = requiredParamIds.filter((pid) => allowedValuesByParamId[pid]);
  required.sort();

  return {
    schema_version: 'caf.allowed_values_extract_v1',
    allowedValuesByParamId,
    requiredParamIds: required,
  };
}
