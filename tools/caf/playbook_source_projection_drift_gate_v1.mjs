#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/playbook_source_projection_drift_gate_v1.mjs <instance_name>');
  process.exit(2);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readUtf8(p) {
  return fs.readFile(p, 'utf8');
}

async function writeUtf8(p, s) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, 'utf8');
}

function normalize(text) {
  return String(text ?? '').replace(/\r/g, '').trim();
}

function sameish(a, b) {
  return normalize(a) === normalize(b);
}

function hasLegacyDomainStarter(text) {
  const t = String(text ?? '');
  return /Bounded context:\s*Review Workspace/i.test(t)
    || /Aggregate:\s*Workspace/i.test(t)
    || /Entity:\s*Review/i.test(t)
    || /Entity:\s*Report/i.test(t)
    || /Submit item for review/i.test(t)
    || /Publish report/i.test(t);
}

function hasLegacyProductSurfaceStarter(text) {
  const t = String(text ?? '');
  return /Dashboard, Workspaces, Submissions, Review Queue, Reports, and Settings/i.test(t)
    || /create a workspace, submit an item for review, inspect the review result, and export a report/i.test(t)
    || /tenant operators and reviewers/i.test(t);
}

function detectSpecificPrd(prd) {
  const t = normalize(prd);
  if (!t) return false;
  return /##\s+In scope/i.test(t) || /###\s+CAP-[A-Z0-9]+/.test(t) || /##\s+Capabilities/i.test(t);
}

function timestampSlug(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function main() {
  const instance = process.argv[2];
  if (!instance) usage();

  const base = path.join(repoRoot, 'reference_architectures', instance);
  const prdPath = path.join(base, 'product', 'PRD.resolved.md');
  const appDomainPath = path.join(base, 'spec', 'playbook', 'application_domain_model_v1.md');
  const appSurfacePath = path.join(base, 'spec', 'playbook', 'application_product_surface_v1.md');
  const appDomainTpl = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_domain_model_v1.template.md');
  const appSurfaceTpl = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'application_product_surface_v1.template.md');

  const missing = [];
  for (const p of [prdPath, appDomainPath, appSurfacePath, appDomainTpl, appSurfaceTpl]) {
    if (!(await exists(p))) missing.push(path.relative(repoRoot, p));
  }
  if (missing.length) {
    console.error(`Missing required playbook source projection inputs:\n${missing.join('\n')}`);
    process.exit(1);
  }

  const [prd, domainText, surfaceText, domainTpl, surfaceTpl] = await Promise.all([
    readUtf8(prdPath),
    readUtf8(appDomainPath),
    readUtf8(appSurfacePath),
    readUtf8(appDomainTpl),
    readUtf8(appSurfaceTpl),
  ]);

  if (!detectSpecificPrd(prd)) {
    console.log(`playbook source projection drift gate skipped for ${instance} (PRD not specific enough)`);
    return;
  }

  const issues = [];
  if (sameish(domainText, domainTpl) || hasLegacyDomainStarter(domainText)) {
    issues.push('application_domain_model_v1.md still appears default or legacy-starter-driven');
  }
  if (sameish(surfaceText, surfaceTpl) || hasLegacyProductSurfaceStarter(surfaceText)) {
    issues.push('application_product_surface_v1.md still appears default or legacy-starter-driven');
  }

  if (!issues.length) {
    console.log(`playbook source projection drift gate passed for ${instance}`);
    return;
  }

  const slug = timestampSlug();
  const packet = path.join(base, 'feedback_packets', `BP-${slug}-playbook-source-projection-drift.md`);
  const body = [
    '# CAF Feedback Packet',
    '',
    '- Severity: blocker',
    '- Category: source_projection_drift',
    `- Instance: ${instance}`,
    '',
    '## Observed',
    '',
    ...issues.map((x) => `- ${x}`),
    '',
    '## Why this blocks',
    '',
    '- `/caf arch` now owns automatic PRD-grounded replacement of default playbook source docs.',
    '- Design and planning must not proceed on default or legacy review-workspace source content when the resolved PRD is already specific.',
    '',
    '## Expected fix',
    '',
    '- Rerun `/caf arch <instance>` so the playbook source projector can replace default source docs from the resolved PRD.',
    '- If a human intentionally edited these files, keep the edits and remove the stale/default starter wording.',
    '',
    '## Evidence',
    '',
    `- reference_architectures/${instance}/product/PRD.resolved.md`,
    `- reference_architectures/${instance}/spec/playbook/application_domain_model_v1.md`,
    `- reference_architectures/${instance}/spec/playbook/application_product_surface_v1.md`,
  ].join('\n');

  await writeUtf8(packet, `${body}\n`);
  console.error(path.relative(repoRoot, packet));
  process.exit(1);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
