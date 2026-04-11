/**
 * CAF mechanical text-ingress normalization helpers.
 *
 * Scope:
 * - strip a single leading UTF-8 BOM (U+FEFF) when text enters deterministic parsers
 * - keep normalization mechanical only; do not rewrite substantive content
 */

export function stripLeadingUtf8BomWithFlag(text) {
  const s = String(text ?? '');
  if (!s) return { bom: false, text: s };
  if (s.charCodeAt(0) === 0xfeff) return { bom: true, text: s.slice(1) };
  return { bom: false, text: s };
}

export function stripLeadingUtf8Bom(text) {
  return stripLeadingUtf8BomWithFlag(text).text;
}

export function normalizeTextIngress(text) {
  return stripLeadingUtf8Bom(String(text ?? ''));
}

export function normalizeJsonlLineIngress(line) {
  return stripLeadingUtf8Bom(String(line ?? '')).trim();
}
