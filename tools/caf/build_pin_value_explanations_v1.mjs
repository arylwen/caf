#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Populate `## Architectural intent - pin explanations (CAF-managed)` in `system_spec_v1.md` deterministically.
 * - Avoid LLM "grep" loops by extracting the relevant intent/value descriptions from:
 *   - `architecture_library/07_contura_parameterized_architecture_templates_v1.md`
 *
 * Writes (CAF-managed; overwrite=true):
 * - reference_architectures/<instance>/spec/playbook/system_spec_v1.md (CAF_MANAGED_BLOCK: pin_value_explanations_v1)
 *
 * Inputs:
 * - reference_architectures/<instance>/spec/playbook/architecture_shape_parameters.yaml
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

function normalize(s) {
  return String(s ?? '').trim();
}

function cap(s, n) {
  const t = normalize(s).replace(/\s+/g, ' ');
  if (t.length <= n) return t;
  return `${t.slice(0, Math.max(0, n - 1))}…`;
}

function extractManagedBlock(md, blockId) {
  const start = `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`;
  const end = `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`;
  const s = md.indexOf(start);
  if (s < 0) return null;
  const e = md.indexOf(end, s);
  if (e < 0) return null;
  return { startIdx: s, endIdx: e + end.length, start, end };
}

function replaceManagedBlock(md, blockId, newInnerLines) {
  const blk = extractManagedBlock(md, blockId);
  if (!blk) return null;
  const before = md.slice(0, md.indexOf(blk.start) + blk.start.length);
  const after = md.slice(md.indexOf(blk.end, md.indexOf(blk.start)));
  const inner = `\n## Architectural intent - pin explanations (CAF-managed)\n` + newInnerLines.join('\n') + `\n`;
  // Replace everything between START and END (inclusive) with a fresh block.
  return `${before}${inner}${after}`;
}

function parseTemplateDocSections(docText) {
  // Build: pinId -> { title, intent, values: Map(valueTitle -> descText) }
  // Markdown shape we rely on:
  // #### CP-1: ...
  // **Intent:** ...
  // **Allowed Values:**
  // - **Declarative + Evaluative**  <desc...>

  const lines = String(docText).split(/\r?\n/);
  const sections = new Map();

  const pinHeaderRe = /^####\s+([A-Z]{2,3}-\d+)\s*:\s*(.+?)\s*$/;
  const valueHeadRe = /^-\s+\*\*(.+?)\*\*\s*$/;

  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(pinHeaderRe);
    if (!m) {
      i++;
      continue;
    }

    const pinId = normalize(m[1]);
    const pinTitle = normalize(m[2]);
    i++;

    // Scan until next pin header; capture intent and allowed values.
    let intent = '';
    const values = new Map();
    let currentValue = null;
    let currentDesc = [];

    for (; i < lines.length; i++) {
      if (pinHeaderRe.test(lines[i])) break;

      const t = lines[i].trim();

      if (t === '**Intent:**') {
        // Next non-empty lines until a blank line.
        const buf = [];
        for (let j = i + 1; j < lines.length; j++) {
          const tj = lines[j].trim();
          if (!tj) break;
          if (pinHeaderRe.test(lines[j])) break;
          buf.push(tj);
        }
        intent = buf.join(' ');
        continue;
      }

      const vh = lines[i].match(valueHeadRe);
      if (vh) {
        // flush prior
        if (currentValue) {
          values.set(currentValue, currentDesc.join(' '));
        }
        currentValue = normalize(vh[1]);
        currentDesc = [];

        // Some docs put the description on subsequent indented lines.
        continue;
      }

      // Accumulate description lines for current value.
      if (currentValue) {
        if (t.startsWith('- **')) {
          // defensive: another value head not matching regex
          continue;
        }
        if (!t) continue;
        // Stop if we reached another section marker.
        if (t === '**Allowed Values:**' || t === '**Intent:**') continue;
        if (t.startsWith('---')) continue;
        if (t.startsWith('#### ')) continue;
        currentDesc.push(t);
      }
    }

    if (currentValue) {
      values.set(currentValue, currentDesc.join(' '));
    }

    sections.set(pinId, { pinId, pinTitle, intent, values });
  }

  return sections;
}

function renderPinValueExplanations(pinsYaml, templateSections) {
  const ti = Array.isArray(pinsYaml?.template_instances) ? pinsYaml.template_instances : [];
  const picked = [];
  for (const t of ti) {
    const pins = t?.pins && typeof t.pins === 'object' ? t.pins : {};
    for (const [pinId, pinValue] of Object.entries(pins)) {
      const pid = normalize(pinId);
      const val = normalize(pinValue);
      if (!pid || !val) continue;
      picked.push({ pinId: pid, value: val });
    }
  }

  picked.sort((a, b) => a.pinId.localeCompare(b.pinId));

  const lines = [];
  lines.push('(1–3 compact bullets per selected pin value, grounded in `architecture_library/07_contura_parameterized_architecture_templates_v1.md`.)');
  lines.push('');

  for (const { pinId, value } of picked) {
    const sec = templateSections.get(pinId);
    if (!sec) {
      lines.push(`- ${pinId}=${value}: (no template section found in 07_contura_parameterized_architecture_templates_v1.md)`);
      continue;
    }

    // Choose the best matching allowed value by exact match first, else case-insensitive.
    let desc = sec.values.get(value);
    if (!desc) {
      const key = [...sec.values.keys()].find((k) => k.toLowerCase() === value.toLowerCase());
      if (key) desc = sec.values.get(key);
    }

    const intent = cap(sec.intent, 160);
    const vdesc = cap(desc || '', 200);
    const header = `- ${pinId}=${value}:`;
    lines.push(header);
    if (intent) lines.push(`  - intent: ${intent}`);
    if (vdesc) lines.push(`  - value: ${vdesc}`);
    if (!intent && !vdesc) lines.push('  - (no grounded description found)');
  }

  return lines;
}

async function main() {
  const args = process.argv.slice(2);
  const instance = normalize(args[0]);
  if (!instance) die('usage: node tools/caf/build_pin_value_explanations_v1.mjs <instance_name>');

  const repoRoot = await resolveRepoRoot(import.meta.url);

  const layout = getInstanceLayout(repoRoot, instance);
  const pinsPath = path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml');
  const systemSpecPath = path.join(layout.specPlaybookDir, 'system_spec_v1.md');
  const templateDocPath = path.join(repoRoot, 'architecture_library', '07_contura_parameterized_architecture_templates_v1.md');

  if (!existsSync(pinsPath)) die(`Missing pins file: ${pinsPath}`);
  if (!existsSync(systemSpecPath)) die(`Missing system spec: ${systemSpecPath}`);
  if (!existsSync(templateDocPath)) die(`Missing template doc: ${templateDocPath}`);

  const pinsYaml = parseYamlString(await readUtf8(pinsPath), pinsPath);
  const templateSections = parseTemplateDocSections(await readUtf8(templateDocPath));

  const newLines = renderPinValueExplanations(pinsYaml, templateSections);
  const systemSpec = await readUtf8(systemSpecPath);

  const replaced = replaceManagedBlock(systemSpec, 'pin_value_explanations_v1', newLines);
  if (!replaced) {
    die(`Could not locate CAF_MANAGED_BLOCK: pin_value_explanations_v1 in ${systemSpecPath}`);
  }

  await writeUtf8(systemSpecPath, replaced);
  process.stdout.write(`OK: wrote pin_value_explanations_v1 to ${path.relative(repoRoot, systemSpecPath)}\n`);
}

main().catch((e) => {
  process.stderr.write(`${e?.stack || e}\n`);
  process.exit(1);
});
