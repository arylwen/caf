#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose (MP-20 pre-gate scaffold):
 * - Ensure `design/playbook/contract_declarations_v1.yaml` exists and uses the
 *   canonical Phase-8 registry schema:
 *     - registry_version: contract_declarations_v1
 *     - contracts: [] (array)
 * - If the file exists but is in a legacy shape (e.g., `schema_version` or
 *   `contracts` as a mapping), back it up and replace with the canonical template.
 *
 * Constraints:
 * - No semantic inference.
 * - No contract decisions.
 * - Bounded writes: only within `reference_architectures/<instance>/design/playbook/`.
 * - Fail-closed on I/O errors or missing template.
 *
 * Usage:
 *   node tools/caf/scaffold_contract_declarations_v1.mjs <instance_name>
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { ensureFeedbackPacketHeaderV1 } from './lib_feedback_packets_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafFailClosed extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(msg, code = 1) {
  throw new CafFailClosed(String(msg ?? ''), code);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowStampYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

function nowDateYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).split('\\').join('/');
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, summary, minimalFix, evidence) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    `# BP-${nowStampYYYYMMDD()}-${slug}`,
    '',
    `Severity: blocker`,
    `Stage: /caf arch (design pre-gate scaffold)`,
    `Instance: ${instanceName}`,
    `Date: ${nowDateYYYYMMDD()}`,
    '',
    '## Summary',
    '',
    String(summary ?? '').trim(),
    '',
    '## Suggested Next Action',
    '',
    ...((minimalFix || []).map((l) => `- ${l}`)),
    '',
    '## Evidence',
    '',
    ...((evidence || []).map((l) => `- ${l}`)),
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, txt) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, txt, { encoding: 'utf8' });
}

async function backupFile(srcAbs, backupAbs) {
  await fs.mkdir(path.dirname(backupAbs), { recursive: true });
  await fs.copyFile(srcAbs, backupAbs);
}

function isCanonicalContractDeclarations(obj) {
  const rv = normalizeScalar(obj?.registry_version);
  if (rv !== 'contract_declarations_v1') return false;
  if (!Array.isArray(obj?.contracts)) return false;
  return true;
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) {
    die('Usage: node tools/caf/scaffold_contract_declarations_v1.mjs <instance_name>', 2);
  }
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const contractDeclPath = path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml');
  const templatePath = path.join(repoRoot, 'architecture_library', 'phase_8', 'templates', 'contract_declarations_v1.template.yaml');

  if (!existsSync(templatePath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'contract-declarations-template-missing',
      'CAF cannot scaffold contract_declarations_v1.yaml because the Phase-8 template is missing.',
      [
        'Restore architecture_library/phase_8/templates/contract_declarations_v1.template.yaml (repo integrity).',
        `Then rerun: /caf arch ${instanceName} (design).`,
      ],
      [
        `missing: ${safeRel(repoRoot, templatePath)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 19;
  }

  let templateText = null;
  try {
    templateText = await readUtf8(templatePath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'contract-declarations-template-unreadable',
      'CAF cannot scaffold contract_declarations_v1.yaml because the Phase-8 template could not be read.',
      [
        'Fix filesystem permissions for the template file.',
        `Then rerun: /caf arch ${instanceName} (design).`,
      ],
      [
        `${safeRel(repoRoot, templatePath)}: ${String(e.message ?? e)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 19;
  }

  if (!existsSync(contractDeclPath)) {
    // Missing file: seed with canonical template so the semantic producer can fill it.
    await writeUtf8(contractDeclPath, String(templateText ?? '').trimEnd() + '\n');
    return 0;
  }

  let obj = null;
  try {
    obj = parseYamlString(await readUtf8(contractDeclPath), contractDeclPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'contract-declarations-yaml-parse-failed',
      'CAF could not parse design/playbook/contract_declarations_v1.yaml as YAML. Scaffolding cannot proceed safely.',
      [
        `Fix YAML syntax in contract_declarations_v1.yaml (or delete the file to allow CAF to reseed it), then rerun: /caf arch ${instanceName} (design).`,
      ],
      [
        `file: ${safeRel(repoRoot, contractDeclPath)}`,
        `${String(e.message ?? e)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 20;
  }

  if (isCanonicalContractDeclarations(obj)) {
    // Already canonical.
    return 0;
  }

  // Legacy/unknown shape: preserve a backup and reseed with canonical template.
  const backupAbs = path.join(
    path.dirname(contractDeclPath),
    `contract_declarations_v1.legacy.${nowStampYYYYMMDD()}.yaml`
  );

  try {
    await backupFile(contractDeclPath, backupAbs);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'contract-declarations-backup-failed',
      'CAF detected a non-canonical contract_declarations_v1.yaml but could not back it up before reseeding.',
      [
        'Fix filesystem permissions under design/playbook so CAF can write backups.',
        `Then rerun: /caf arch ${instanceName} (design).`,
      ],
      [
        `file: ${safeRel(repoRoot, contractDeclPath)}`,
        `backup_target: ${safeRel(repoRoot, backupAbs)}`,
        `${String(e.message ?? e)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 21;
  }

  await writeUtf8(contractDeclPath, String(templateText ?? '').trimEnd() + '\n');
  return 0;
}

function isEntrypoint() {
  try {
    const argv1 = process.argv[1] ? path.resolve(process.argv[1]) : '';
    if (!argv1) return true;
    return import.meta.url === pathToFileURL(argv1).href;
  } catch {
    return true;
  }
}

if (isEntrypoint()) {
  internal_main(process.argv.slice(2)).then((code) => {
    process.exit(typeof code === 'number' ? code : 0);
  }).catch((e) => {
    if (e && typeof e === 'object' && 'exitCode' in e) {
      process.stderr.write(String(e.message || e) + '\n');
      process.exit(Number(e.exitCode || 1));
    }
    process.stderr.write(String(e?.stack ?? e) + '\n');
    process.exit(99);
  });
}
