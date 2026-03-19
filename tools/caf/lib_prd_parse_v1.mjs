/**
 * PRD parser (v1) - deterministic, minimal, markdown-by-convention.
 *
 * Purpose:
 * - Extract a structured view of a CAF PRD (prd_v1.template.md compatible)
 * - Provide stable IDs for capability blocks and posture answers
 * - Avoid LLM heuristics; do not infer architecture decisions
 *
 * Non-goals:
 * - Full Markdown compliance
 * - Recovering from arbitrary formatting
 */

function normalizeLine(s) {
  return String(s ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function trimBOM(s) {
  if (s.startsWith('\ufeff')) return s.slice(1);
  return s;
}

function normalizeStructuralLine(s) {
  return String(s ?? '')
    .replace(/^\ufeff/, '')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"');
}

function splitLines(md) {
  return normalizeLine(trimBOM(md)).split('\n');
}

function isHeading(line) {
  const m = /^(#{1,6})\s+(.*)$/.exec(normalizeStructuralLine(line));
  if (!m) return null;
  return { level: m[1].length, text: m[2].trim() };
}

function slugify(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function takeUntilHeading(lines, startIdx, stopLevelOrLess) {
  const out = [];
  for (let i = startIdx; i < lines.length; i++) {
    const h = isHeading(lines[i]);
    if (h && h.level <= stopLevelOrLess) break;
    out.push(lines[i]);
  }
  return out;
}

function parseSimpleTable(lines) {
  // Minimal GitHub-style table parser. Expects:
  // | a | b |
  // |---|---|
  // | ..| ..|
  const rows = [];
  const clean = (l) => normalizeStructuralLine(l).trim();
  const tableLines = lines.map(clean).filter((l) => l.startsWith('|') && l.endsWith('|'));
  if (tableLines.length < 2) return null;

  const header = tableLines[0]
    .slice(1, -1)
    .split('|')
    .map((c) => c.trim());

  // separator row is tableLines[1]
  for (let i = 2; i < tableLines.length; i++) {
    const cols = tableLines[i]
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j] || `col_${j}`] = cols[j] ?? '';
    }
    rows.push(obj);
  }

  return { header, rows };
}

function collectSectionByHeading(md, headingText) {
  const lines = splitLines(md);
  const target = String(headingText).trim().toLowerCase();
  for (let i = 0; i < lines.length; i++) {
    const h = isHeading(lines[i]);
    if (!h) continue;
    if (h.level < 2) continue;
    if (h.text.trim().toLowerCase() !== target) continue;
    const bodyLines = takeUntilHeading(lines, i + 1, h.level);
    return { heading: h.text.trim(), level: h.level, body: bodyLines.join('\n').trim() };
  }
  return null;
}

function collectSectionByAnyHeading(md, headingTexts) {
  const arr = Array.isArray(headingTexts) ? headingTexts : [headingTexts];
  for (const h of arr) {
    const sec = collectSectionByHeading(md, h);
    if (sec && String(sec.body ?? '').trim()) return sec;
  }
  // Return the first match even if empty (so missing-content failures are consistent).
  for (const h of arr) {
    const sec = collectSectionByHeading(md, h);
    if (sec) return sec;
  }
  return null;
}

function parseCapabilityBlocks(md) {
  const lines = splitLines(md);
  const caps = [];

  // Convention: each capability block starts with an H3 like:
  // ### CAP-001 - Name
  for (let i = 0; i < lines.length; i++) {
    const h = isHeading(lines[i]);
    if (!h || h.level !== 3) continue;
    const m = /^(CAP-[0-9]{3})\s*(?:-|--)\s*(.+)$/.exec(h.text);
    if (!m) continue;
    const capId = m[1];
    const capName = m[2].trim();
    const bodyLines = takeUntilHeading(lines, i + 1, 3);
    const body = bodyLines.join('\n');

    // Extract required fields by subheadings or bold labels.
    // Accept either:
    // #### Actor
    // or
    // **Actor:** ...
    const fields = {
      actor: null,
      trigger: null,
      main_flow: null,
      postconditions: null,
      domain_entities: null,
    };

    // Subheading-based extraction
    for (let j = i + 1; j < Math.min(lines.length, i + 1 + bodyLines.length); j++) {
      const hh = isHeading(lines[j]);
      if (!hh || hh.level !== 4) continue;
      const key = hh.text.trim().toLowerCase();
      const sectionBody = takeUntilHeading(lines, j + 1, 4).join('\n').trim();
      if (key === 'actor') fields.actor = sectionBody;
      else if (key === 'trigger') fields.trigger = sectionBody;
      else if (key === 'main flow' || key === 'mainflow') fields.main_flow = sectionBody;
      else if (key === 'postconditions') fields.postconditions = sectionBody;
      else if (key === 'domain entities' || key === 'domain entities / objects') fields.domain_entities = sectionBody;
    }

    // Bold label fallback (single-line)
    const fallback = (label) => {
      const re = new RegExp(`\\*\\*${label}\\*\\*\\s*:\\s*(.+)$`, 'i');
      for (const ln of bodyLines) {
        const mm = re.exec(normalizeStructuralLine(ln).trim());
        if (mm) return mm[1].trim();
      }
      return null;
    };

    if (!fields.actor) fields.actor = fallback('Actor');
    if (!fields.trigger) fields.trigger = fallback('Trigger');
    if (!fields.main_flow) fields.main_flow = fallback('Main Flow');
    if (!fields.postconditions) fields.postconditions = fallback('Postconditions');
    if (!fields.domain_entities) fields.domain_entities = fallback('Domain Entities');

    caps.push({
      capability_id: capId,
      capability_name: capName,
      slug: slugify(`${capId}-${capName}`),
      fields,
      raw_body: body.trim(),
    });
  }

  return caps;
}

function parsePosture(md) {
  const sec = collectSectionByAnyHeading(md, ['Product Posture', 'Platform Posture']);
  if (!sec) return null;
  const lines = splitLines(sec.body);

  // Convention: posture as a table with columns like:
  // | Question ID | Question | Answer |
  const table = parseSimpleTable(lines);
  if (table) {
    const qidKey = table.header.find((h) => h.toLowerCase().includes('id')) ?? table.header[0];
    const qKey = table.header.find((h) => h.toLowerCase().includes('question'));
    const aKey = table.header.find((h) => h.toLowerCase().includes('answer'));
    return {
      format: 'table',
      questions: table.rows.map((r) => ({
        question_id: String(r[qidKey] ?? '').trim(),
        question: qKey ? String(r[qKey] ?? '').trim() : '',
        answer: aKey ? String(r[aKey] ?? '').trim() : '',
      })),
    };
  }

  // Fallback: bullet list lines like:
  // - PP-01: ... => Answer: ...
  const questions = [];
  for (const ln of lines) {
    const m = /^[-*]\s*(PP-[0-9]{2,3})\s*(?:[:]|-+)\s*(.+)$/.exec(normalizeStructuralLine(ln).trim());
    if (!m) continue;
    questions.push({ question_id: m[1], question: m[2], answer: '' });
  }
  return { format: 'bullets', questions };
}

export function parsePrdMarkdownV1(md) {
  const productFraming = collectSectionByAnyHeading(md, ['Product Framing', 'Platform Framing']);
  const scope = collectSectionByHeading(md, 'Scope');
  const quality = collectSectionByHeading(md, 'Quality Attributes');
  const constraints = collectSectionByHeading(md, 'Constraints');
  const posture = parsePosture(md);
  const capabilities = parseCapabilityBlocks(md);

  return {
    schema_version: 'prd_extracted_v1',
    sections: {
      product_framing: productFraming?.body ?? '',
      scope: scope?.body ?? '',
      quality_attributes: quality?.body ?? '',
      constraints: constraints?.body ?? '',
    },
    posture,
    capabilities,
  };
}
