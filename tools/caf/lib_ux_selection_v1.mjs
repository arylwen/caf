function escapeRegex(s) {
  return String(s ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeComparable(text) {
  return String(text ?? '').replace(/\r/g, '').trim();
}

export function extractBlock(mdText, kind, blockId) {
  const start = `<!-- ${kind}: ${blockId} START -->`;
  const end = `<!-- ${kind}: ${blockId} END -->`;
  const pattern = new RegExp(`${escapeRegex(start)}\n?([\\s\\S]*?)\n?${escapeRegex(end)}`, 'm');
  const m = String(mdText ?? '').match(pattern);
  return m ? m[1].trim() : '';
}

export function replaceBlock(mdText, kind, blockId, inner) {
  const start = `<!-- ${kind}: ${blockId} START -->`;
  const end = `<!-- ${kind}: ${blockId} END -->`;
  const pattern = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`, 'm');
  if (!pattern.test(mdText)) throw new Error(`Missing ${kind} markers for ${blockId}`);
  return mdText.replace(pattern, `${start}\n${String(inner).trimEnd()}\n${end}`);
}

export function replaceManagedBlock(mdText, blockId, inner) {
  return replaceBlock(mdText, 'CAF_MANAGED_BLOCK', blockId, inner);
}

export function splitLines(text) {
  return String(text ?? '').split(/\r?\n/);
}

export function extractListItems(sectionText) {
  return splitLines(sectionText)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

export function extractOrderedItems(sectionText) {
  return splitLines(sectionText)
    .map((line) => line.trim())
    .filter((line) => /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^\d+\.\s+/, '').trim())
    .filter(Boolean);
}

export function extractSection(mdText, headingText) {
  const lines = splitLines(mdText);
  const headingPattern = new RegExp(`^(#{2,6})\\s+${escapeRegex(headingText)}\\s*$`, 'i');
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(headingPattern);
    if (m) {
      start = i + 1;
      level = m[1].length;
      break;
    }
  }
  if (start < 0) return '';
  const out = [];
  for (let i = start; i < lines.length; i += 1) {
    const m = lines[i].match(/^(#{2,6})\s+/);
    if (m && m[1].length <= level) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

export function containsAutoManagedArchitectMarker(text, blockId) {
  const marker = String(text ?? '');
  return marker.includes(`<!-- CAF_AUTOHYDRATED_BLOCK: ${blockId} source=`)
    || marker.includes(`<!-- CAF_DERIVATION_POINTER_BLOCK: ${blockId} source=`);
}

export function isTemplateLikeArchitectBlock(current, template, blockId) {
  const cur = normalizeComparable(current);
  const tmpl = normalizeComparable(template);
  return !cur || cur === tmpl || containsAutoManagedArchitectMarker(current, blockId);
}

export function selectPreferredUxBlock({ currentUxDesign, templateUxDesign, architectBlockId, semanticBlockId, seedBlockId }) {
  const architect = extractBlock(currentUxDesign, 'ARCHITECT_EDIT_BLOCK', architectBlockId);
  const architectTemplate = extractBlock(templateUxDesign, 'ARCHITECT_EDIT_BLOCK', architectBlockId);
  const semantic = semanticBlockId ? extractBlock(currentUxDesign, 'CAF_MANAGED_BLOCK', semanticBlockId) : '';
  const semanticTemplate = semanticBlockId ? extractBlock(templateUxDesign, 'CAF_MANAGED_BLOCK', semanticBlockId) : '';
  const seed = seedBlockId ? extractBlock(currentUxDesign, 'CAF_MANAGED_BLOCK', seedBlockId) : '';
  const seedTemplate = seedBlockId ? extractBlock(templateUxDesign, 'CAF_MANAGED_BLOCK', seedBlockId) : '';

  const architectManual = !isTemplateLikeArchitectBlock(architect, architectTemplate, architectBlockId);
  const semanticAvailable = normalizeComparable(semantic) && normalizeComparable(semantic) !== normalizeComparable(semanticTemplate);
  const seedAvailable = normalizeComparable(seed) && normalizeComparable(seed) !== normalizeComparable(seedTemplate);

  return {
    architectBlockId,
    selectedText: architectManual ? architect : (semanticAvailable ? semantic : seed),
    selectedSource: architectManual ? 'architect_edit' : (semanticAvailable ? 'semantic_projection' : (seedAvailable ? 'caf_seed' : 'none')),
    architectManual,
    semanticAvailable,
    seedAvailable,
    architectText: architect,
    semanticText: semantic,
    seedText: seed,
  };
}

export function extractAcceptedUiProductSurface({ appSpecText, appSpecTemplateText }) {
  const current = extractBlock(appSpecText, 'ARCHITECT_EDIT_BLOCK', 'ui_product_surface_v1');
  const template = extractBlock(appSpecTemplateText, 'ARCHITECT_EDIT_BLOCK', 'ui_product_surface_v1');
  const accepted = Boolean(normalizeComparable(current) && normalizeComparable(current) !== normalizeComparable(template));
  return {
    accepted,
    current,
    template,
    lines: accepted ? extractListItems(current) : [],
  };
}


export function extractAcceptedProductSurface({ productSurfaceText = '', productSurfaceTemplateText = '', appSpecText = '', appSpecTemplateText = '' }) {
  const current = String(productSurfaceText ?? '').trim();
  const template = String(productSurfaceTemplateText ?? '').trim();
  const externalizedAccepted = Boolean(normalizeComparable(current) && normalizeComparable(current) !== normalizeComparable(template));
  if (externalizedAccepted) {
    return {
      accepted: true,
      current,
      template,
      lines: extractListItems(current),
      source: 'application_product_surface_v1.md',
    };
  }

  const legacy = extractAcceptedUiProductSurface({ appSpecText, appSpecTemplateText });
  return {
    accepted: legacy.accepted,
    current: legacy.current,
    template: legacy.template,
    lines: legacy.lines,
    source: legacy.accepted ? 'application_spec_v1.md#ui_product_surface_v1' : 'template/default',
  };
}
