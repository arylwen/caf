#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose (MP-20 design post-gate):
 * - Fail-closed if the design bundle contains a material contract section (currently: Plane Integration Contract CP↔AP)
 *   but `design/playbook/contract_declarations_v1.yaml` is empty or missing the corresponding declaration.
 *
 * Constraints:
 * - No semantic inference.
 * - No auto-fixing.
 * - On invariant failure: write a blocker feedback packet and exit non-zero, printing only the packet path.
 *
 * Usage:
 *   node tools/caf/design_postgate_contract_declarations_coherence_v1.mjs <instance_name>
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

function nowDateYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function normalizeRepoRelPath(v) {
  let s = normalizeScalar(v);
  s = s.split('\\').join('/');
  s = s.replace(/^\.\/+/, '');
  s = s.trim();
  if (!s) return '';
  // Normalize POSIX-style without introducing '.'.
  s = path.posix.normalize(s);
  if (s === '.' || s === './') return '';
  return s;
}

function isSafeRepoRelativePath(p) {
  const s = normalizeRepoRelPath(p);
  if (!s) return false;
  // Disallow absolute and traversal.
  if (s.startsWith('/') || s.startsWith('..') || s.includes('/../') || s.endsWith('/..')) return false;
  // Disallow Windows drive paths like C:/...
  if (/^[A-Za-z]:\//.test(s) || /^[A-Za-z]:/.test(s)) return false;
  return true;
}

function resolveFromRepoRoot(repoRoot, rel) {
  const s = normalizeRepoRelPath(rel);
  return path.join(repoRoot, s);
}

function safeRel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).split('\\').join('/');
}

function stripUtf8Bom(text) {
  const s = String(text ?? '');
  if (!s) return { bom: false, text: s };
  if (s.charCodeAt(0) === 0xfeff) return { bom: true, text: s.slice(1) };
  return { bom: false, text: s };
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const dir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(dir);
  const fp = path.join(dir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - caf design post-gate (contract declarations coherence)',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    `- Stuck At: tools/caf/design_postgate_contract_declarations_coherence_v1.mjs`,
    `- Severity: blocker`,
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Contract registry drift | Placeholder registry not materialized',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
    '## Autonomous agent guidance',
    '- Do NOT write repair scripts as first-line mitigation.',
    '- Strengthen/fix the producing semantic step (caf-solution-architect) and rerun /caf arch.',
    '- This post-gate is deterministic; it only validates coherence between design contract blocks and the contract registry.',
    '',
  ].join('\n');
  await fs.writeFile(fp, ensureFeedbackPacketHeaderV1(body), { encoding: 'utf8' });
  return fp;
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

function hasPlaneIntegrationContractChoices(mdText) {
  return String(mdText ?? '').includes('<!-- ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1 START -->');
}

function isCanonicalRegistry(obj) {
  const rv = normalizeScalar(obj?.registry_version);
  if (rv !== 'contract_declarations_v1') return false;
  if (!Array.isArray(obj?.contracts)) return false;
  return true;
}

function contractHasRequiredKeys(c) {
  if (!c || typeof c !== 'object') return false;
  const required = ['boundary_id', 'boundary_type', 'materiality', 'contract_form', 'contract_ref', 'anchors', 'justification'];
  for (const k of required) {
    if (!(k in c)) return false;
  }
  if (!c.contract_ref || typeof c.contract_ref !== 'object') return false;
  if (!('path' in c.contract_ref)) return false;
  return true;
}

function looksLikeCpApDeclaration(c) {
  if (!contractHasRequiredKeys(c)) return false;
  if (normalizeScalar(c.boundary_type) !== 'cross_plane') return false;
  const isMat = Boolean(c?.materiality?.is_material);
  if (!isMat) return false;

  // If the contract is embedded in CP design, FORM_B is expected.
  const form = normalizeScalar(c.contract_form);
  if (form !== 'FORM_B_EMBEDDED_SECTION') return false;

  const p = normalizeScalar(c?.contract_ref?.path);
  if (!p) return false;
  if (!p.endsWith('control_plane_design_v1.md')) return false;

  const heading = normalizeScalar(c?.contract_ref?.section_heading);
  if (!heading) return false;
  if (!heading.toLowerCase().includes('plane integration contract')) return false;

  // Anchors and justification must be present per schema.
  if (!Array.isArray(c.anchors) || c.anchors.length < 1) return false;
  if (!c.justification || typeof c.justification !== 'object') return false;
  if (!normalizeScalar(c.justification.why_this_form)) return false;
  const alts = Array.isArray(c.justification.why_not_alternatives) ? c.justification.why_not_alternatives : [];
  if (alts.length < 1) return false;

  return true;
}

export async function internal_main(argv = process.argv.slice(2)) {
  argv = Array.isArray(argv) ? argv : [];
  if (argv.length < 1) {
    die('Usage: node tools/caf/design_postgate_contract_declarations_coherence_v1.mjs <instance_name>', 2);
  }
  const instanceName = String(argv[0] ?? '').trim();
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);

  const cpDesignPath = path.join(layout.designPlaybookDir, 'control_plane_design_v1.md');
  const registryPath = path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml');

  if (!existsSync(cpDesignPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-missing-cp-design',
      'Expected design/playbook/control_plane_design_v1.md to exist after caf-solution-architect, but it is missing.',
      [
        `Rerun: /caf arch ${instanceName} (implementation_scaffolding) and ensure caf-solution-architect writes the CP design doc.`,
      ],
      [
        `missing: ${safeRel(repoRoot, cpDesignPath)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 20;
  }

  const cpText = await readUtf8(cpDesignPath);
  const requiresRegistry = hasPlaneIntegrationContractChoices(cpText);

  // If the design bundle does not declare a Plane Integration Contract choices block,
  // we do not require a CP↔AP contract declaration entry.
  if (!requiresRegistry) return 0;

  if (!existsSync(registryPath)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-missing-registry',
      'Plane Integration Contract choices are present in the CP design doc, but contract_declarations_v1.yaml is missing.',
      [
        `Run: /caf arch ${instanceName} (implementation_scaffolding).`,
        'Ensure caf-solution-architect writes the contract declarations registry and includes the CP↔AP boundary entry.',
      ],
      [
        `found: ${safeRel(repoRoot, cpDesignPath)} (ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1)`,
        `missing: ${safeRel(repoRoot, registryPath)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 21;
  }

  const raw = await readUtf8(registryPath);
  const { bom, text } = stripUtf8Bom(raw);

  if (bom) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-bom',
      'contract_declarations_v1.yaml begins with a UTF-8 BOM. This breaks canonical schema expectations and has caused recurring drift.',
      [
        'Remove the BOM and rewrite the file as plain UTF-8.',
        `Then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
      ],
      [
        `file: ${safeRel(repoRoot, registryPath)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 22;
  }

  let obj = null;
  try {
    obj = parseYamlString(text, registryPath);
  } catch (e) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-yaml-parse-failed',
      'CAF could not parse design/playbook/contract_declarations_v1.yaml as YAML. Post-gate cannot validate coherence safely.',
      [
        `Fix YAML syntax in contract_declarations_v1.yaml, then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
      ],
      [
        `file: ${safeRel(repoRoot, registryPath)}`,
        `${String(e.message ?? e)}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 23;
  }

  if (!isCanonicalRegistry(obj)) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-noncanonical',
      'contract_declarations_v1.yaml is not in the canonical registry schema (registry_version + contracts list).',
      [
        `Rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
        'Ensure caf-solution-architect overwrites the registry to the canonical shape and populates the required CP↔AP entry.',
      ],
      [
        `file: ${safeRel(repoRoot, registryPath)}`,
        `observed_registry_version: ${normalizeScalar(obj?.registry_version) || '(missing)'}`,
        `observed_contracts_type: ${Array.isArray(obj?.contracts) ? 'array' : typeof obj?.contracts}`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 24;
  }

  const contracts = Array.isArray(obj.contracts) ? obj.contracts : [];
  if (contracts.length === 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-empty',
      'Plane Integration Contract choices exist in control_plane_design_v1.md, but contract_declarations_v1.yaml declares no contracts (contracts: []).',
      [
        'In caf-solution-architect, materialize the CP↔AP boundary contract entry in contract_declarations_v1.yaml.',
        `Then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
      ],
      [
        `found: ${safeRel(repoRoot, cpDesignPath)} (ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1)`,
        `registry: ${safeRel(repoRoot, registryPath)} (contracts: 0)`,
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 25;
  }

  const hasCpAp = contracts.some((c) => looksLikeCpApDeclaration(c));
  if (!hasCpAp) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'design-postgate-contract-declarations-missing-cp-ap',
      'Plane Integration Contract choices exist in control_plane_design_v1.md, but contract_declarations_v1.yaml does not declare a valid CP↔AP cross-plane contract entry (FORM_B embedded section).',
      [
        'In caf-solution-architect, add/update a contract entry with:',
        '  - boundary_type: cross_plane',
        '  - materiality.is_material: true',
        '  - contract_form: FORM_B_EMBEDDED_SECTION',
        '  - contract_ref.path ending with control_plane_design_v1.md',
        '  - contract_ref.section_heading including "Plane Integration Contract"',
        '  - anchors (>=1) and justification fields per schema',
        `Then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
      ],
      [
        `found: ${safeRel(repoRoot, cpDesignPath)} (ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1)`,
        `registry: ${safeRel(repoRoot, registryPath)} (contracts: ${contracts.length})`,
        'note: The registry schema is defined in architecture_library/phase_8/85_phase_8_contract_declarations_schema_v1.yaml',
      ]
    );
    process.stdout.write(safeRel(repoRoot, fp) + '\n');
    return 26;
  }

  // Validate that the embedded CP↔AP contract_ref.path is repo-root-relative and resolves to an existing file.
  // Planning must be able to ground deterministically from repo root.
  const cpAp = contracts.find((c) => looksLikeCpApDeclaration(c));
  if (cpAp && cpAp.contract_ref && ('path' in cpAp.contract_ref)) {
    const observedRel = normalizeRepoRelPath(cpAp.contract_ref.path);
    const expectedRel = safeRel(repoRoot, cpDesignPath);

    if (!isSafeRepoRelativePath(observedRel)) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-contract-declarations-unsafe-contract-ref-path',
        'A contract entry declares an unsafe or non-repo-root-relative contract_ref.path. Paths must be relative to repo root (no absolute paths, no traversal).',
        [
          'Rewrite contract_ref.path to a repo-root-relative path that resolves to an existing file.',
          `For the CP↔AP embedded contract, the canonical path is: ${expectedRel}`,
          `Then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
        ],
        [
          `boundary_id: ${normalizeScalar(cpAp.boundary_id) || '(missing)'}`,
          `observed_contract_ref.path: ${normalizeScalar(cpAp.contract_ref.path)}`,
          `expected_contract_ref.path: ${expectedRel}`,
        ]
      );
      process.stdout.write(safeRel(repoRoot, fp) + '\n');
      return 27;
    }

    const resolvedAbs = resolveFromRepoRoot(repoRoot, observedRel);
    if (!existsSync(resolvedAbs)) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-contract-declarations-invalid-contract-ref-path',
        'A contract entry declares contract_ref.path that does not resolve from repo root. This prevents deterministic contract grounding in planning.',
        [
          'Rewrite contract_ref.path to a repo-root-relative path that resolves to an existing file.',
          `For the CP↔AP embedded contract, use: ${expectedRel}`,
          `Then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
        ],
        [
          `boundary_id: ${normalizeScalar(cpAp.boundary_id) || '(missing)'}`,
          `observed_contract_ref.path: ${normalizeScalar(cpAp.contract_ref.path)}`,
          `missing_target_at_repo_root: ${observedRel}`,
          `canonical_file_exists: ${expectedRel}`,
        ]
      );
      process.stdout.write(safeRel(repoRoot, fp) + '\n');
      return 28;
    }

    // Enforce canonical path for embedded CP design contract to avoid drift.
    if (observedRel !== expectedRel) {
      const fp = await writeFeedbackPacket(
        repoRoot,
        instanceName,
        'design-postgate-contract-declarations-noncanonical-contract-ref-path',
        'A CP↔AP embedded contract entry uses a non-canonical contract_ref.path. Use the repo-root-relative canonical CP design path to keep grounding deterministic.',
        [
          `Set contract_ref.path to: ${expectedRel}`,
          `Then rerun: /caf arch ${instanceName} (implementation_scaffolding).`,
        ],
        [
          `boundary_id: ${normalizeScalar(cpAp.boundary_id) || '(missing)'}`,
          `observed_contract_ref.path: ${observedRel}`,
          `expected_contract_ref.path: ${expectedRel}`,
        ]
      );
      process.stdout.write(safeRel(repoRoot, fp) + '\n');
      return 29;
    }
  }


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
