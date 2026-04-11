#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { parseYamlFile } from './lib_yaml_v2.mjs';

function titleCase(text) {
  return String(text || '')
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function listLine(items) {
  if (!Array.isArray(items) || items.length === 0) return '_None listed._';
  return items.map((item) => `- ${item}`).join('\n');
}

function refLine(ref) {
  const primary = ref.path ? `\`${ref.path}\`` : (ref.invariant_id ? `invariant: \`${ref.invariant_id}\`` : '`unknown`');
  const parts = [primary];
  if (ref.anchor) parts.push(`anchor: ${ref.anchor}`);
  if (ref.role) parts.push(`role: ${ref.role}`);
  if (ref.note) parts.push(ref.note);
  if (ref.relation) parts.push(`relation: ${ref.relation}`);
  return `- ${parts.join(' — ')}`;
}

function block(title, refs) {
  if (!Array.isArray(refs) || refs.length === 0) return `**${title}:** _None listed._\n`;
  return `**${title}:**\n${refs.map(refLine).join('\n')}\n`;
}

function countBy(rows, selector) {
  const map = new Map();
  for (const row of rows) {
    const key = selector(row) || 'unknown';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function topList(entries, limit = 6) {
  return entries.slice(0, limit).map(([key, value]) => `- **${key}** — ${value}`).join('\n');
}

function byFamily(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = row.family || 'unclassified';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

async function main() {
  const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname);
  const catalogPath = path.join(repoRoot, 'tools', 'caf', 'contracts', 'caf_invariant_catalog_v1.yaml');
  const catalog = await parseYamlFile(catalogPath);
  const rows = Array.isArray(catalog.invariants) ? catalog.invariants : [];
  const humanPath = path.join(repoRoot, catalog.public_docs?.human_catalog_path || 'docs/architect/13_architecture_invariants_and_catalog.md');
  const exampleIds = new Set(catalog.public_docs?.public_examples || []);
  const exampleRows = rows.filter((row) => exampleIds.has(row.invariant_id));
  const statusCounts = countBy(rows, (row) => row.current_status);
  const sourceCounts = countBy(rows.flatMap((row) => (row.source_classes || []).map((cls) => ({ cls }))), (row) => row.cls);
  const familyCounts = countBy(rows, (row) => row.family);
  const activationCounts = countBy(rows, (row) => row.activation?.kind);

  const familySections = byFamily(rows).map(([family, familyRows]) => {
    const heading = `## ${titleCase(family)}\n\n`;
    const intro = `This family currently contains ${familyRows.length} catalog row${familyRows.length === 1 ? '' : 's'}.\n`;
    const body = familyRows.map((row) => {
      return [
        `### ${row.invariant_id} — ${row.title}`,
        '',
        row.statement,
        '',
        `- **Status:** ${row.current_status}`,
        `- **Severity / enforcement:** ${row.posture?.severity || 'unknown'} / ${row.posture?.enforcement_mode || 'unknown'}`,
        `- **Activation:** ${row.activation?.kind || 'unknown'} — ${row.activation?.condition || 'No condition recorded.'}`,
        `- **Subject area:** ${row.subject_area || 'unknown'}`,
        `- **Scope:** lifecycle=${row.scope?.lifecycle_phase || 'unknown'}; plane=${row.scope?.plane_scope || 'unknown'}; artifact=${row.scope?.artifact_scope || 'unknown'}`,
        `- **Source classes:** ${(row.source_classes || []).join(', ') || 'None listed'}`,
        `- **Canonical owner:** ${row.canonical_owner?.kind || 'unknown'} — \`${row.canonical_owner?.path || 'unknown'}\``,
        '',
        block('Defined in', row.defined_in),
        block('Enforced by', row.enforced_by),
        block('Checked by', row.checked_by),
        block('Evidence surfaces', row.evidence_surfaces),
        row.downstream_consumers?.length ? block('Downstream consumers', row.downstream_consumers) : '',
        row.lineage ? `**Derivation lineage:**\n- origin stage: ${row.lineage.origin_stage || 'unknown'}\n${(row.lineage.derived_from || []).length ? (row.lineage.derived_from || []).map(refLine).join('\n') : '- no explicit upstream relation recorded'}\n` : '',
        row.failure_mode ? `**Failure mode:** ${row.failure_mode.symptom || 'No symptom recorded.'}  \n**Typical blocker or packet surface:** ${row.failure_mode.packet_or_gate || 'Not recorded.'}` : '',
        '',
      ].filter(Boolean).join('\n');
    }).join('\n');
    return `${heading}${intro}\n${body}`;
  }).join('\n');

  const examplesSection = exampleRows.map((row) => `- **${row.title}** (\`${row.invariant_id}\`) — ${row.statement}`).join('\n');

  const md = `# Architecture invariants and catalog\n\nCAF is the architecture control layer for AI-assisted software delivery.\n\nThis page is the human-readable companion to CAF’s machine-readable invariant catalog. It explains the properties CAF is trying to keep true, where those properties are defined, how they are enforced or checked, and which evidence surfaces prove them.\n\nThe canonical machine-readable source remains:\n\n- \`tools/caf/contracts/caf_invariant_catalog_v1.yaml\`\n\nThis public page is a generated, reader-friendly derivative. It helps architects and maintainers understand the invariant surface without replacing the YAML as canon.\n\n**You are here:** Architect docs → Drift resistance and audits → Architecture invariants and catalog\n\n## Why this page matters\n\nArchitects rarely manage only components and diagrams. They also manage invariants: properties that must remain true if architecture is still being carried forward honestly. In CAF, those invariants span product and architecture decisions, planning payloads, resolved guardrails, worker contracts, and fail-closed gates.\n\n## How to read a catalog row\n\n- **Defined in** — where the invariant is stated normatively\n- **Enforced by** — where CAF tries to make it true\n- **Checked by** — where CAF verifies it\n- **Evidence surfaces** — where proof is expected to live\n- **Activation** — whether the invariant is always on or only becomes active when a pin, option, capability, artifact, or stage is present\n- **Derivation lineage** — where the invariant originates in the cascade and what upstream invariant it refines or realizes\n\n## At a glance\n\n- **Catalog rows:** ${rows.length}\n- **Top statuses:**\n${topList(statusCounts)}\n- **Top source classes:**\n${topList(sourceCounts)}\n- **Top families:**\n${topList(familyCounts)}\n- **Activation kinds:**\n${topList(activationCounts)}\n\n## High-value examples from the current sweep\n\n${examplesSection || '_No public examples configured._'}\n\n## Why the derivation-cascade view matters\n\nCAF invariants do not all live at the same layer. Some begin as framework intent. Some become active when a pin is chosen. Some are realized in resolved views such as Layer 8 guardrails or ABP/PBP projection. Others appear only when planning payloads, tasks, workers, or runtime evidence surfaces are present.\n\nThat is why the catalog now tracks both semantic family and derivation lineage.\n\n${familySections}\n\n## Find out more\n\n[Drift resistance and audits](09_drift_resistance_and_audits.md) — See how CAF uses audits, gates, and public proof boundaries to resist architectural drift.\n\n## You might also be interested in\n\n- [Patterns → obligations → tasks](07_patterns_to_obligations_to_tasks.md) — See how accepted architecture choices become downstream work.\n- [Gates and fail-closed](08_gates_and_fail_closed.md) — Understand the blocker posture that checks many of these invariants.\n- [Profile parameters configuration](../user/13_profile_parameters_configuration.md) — See the machine-consumed binding surface behind many activated invariants.\n- [Reference map](12_reference_map.md) — Jump into the broader architect documentation set.\n`;

  await fs.writeFile(humanPath, md, 'utf8');
  console.log(`Wrote ${path.relative(repoRoot, humanPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
