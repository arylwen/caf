#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically initialize the minimal companion repository target for a
 *   reference architecture instance, as specified by:
 *     reference_architectures/<name>/spec/guardrails/profile_parameters_resolved.yaml
 *
 * Creates (deterministic scaffold only):
 * - <companion_repo_target>/ (directory)
 * - <companion_repo_target>/AGENTS.md
 * - <companion_repo_target>/README.md
 * - <companion_repo_target>/caf/ (CAF-copied planning inputs + evidence roots)
 *   - caf/profile_parameters_resolved.yaml
 *   - caf/architecture_shape_parameters.yaml
 *   - caf/task_graph_v1.yaml
 *   - caf/application_spec_v1.md
 *   - caf/application_design_v1.md
 *   - caf/control_plane_design_v1.md
 *   - caf/contract_declarations_v1.yaml
 *   - caf/tbp_resolution_v1.yaml
 *   - caf/task_reports/ (evidence)
 *   - caf/binding_reports/ (evidence)
 *   - caf/reviews/ (evidence)
 *
 * Constraints:
 * - No architecture decisions.
 * - No pattern selection.
 * - Deterministic filesystem + bounded token substitutions only.
 * - Fail-closed: on validation failure, write a feedback packet under the instance.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine, cafMarkdownStampLine, readCafVersionSync } from './lib_caf_version_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafExit extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

function die(msg, code = 1) {
  throw new CafExit(code, msg);
}

function nowDateYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

function nowStampYYYYMMDD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  return `${yyyy}${mm}${dd}`;
}

async function readUtf8(p) {
  return await fs.readFile(p, { encoding: 'utf8' });
}

async function writeUtf8(p, content) {
  await fs.writeFile(p, content, { encoding: 'utf8' });
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function copyIfMissingOrOverwrite(srcAbs, dstAbs, overwrite) {
  const dstExists = existsSync(dstAbs);
  if (dstExists && !overwrite) return;
  await ensureDir(path.dirname(dstAbs));
  await fs.copyFile(srcAbs, dstAbs);
}

function containsPlaceholderLike(value) {
  const s = String(value ?? '');
  return (
    s.includes('TBD') ||
    s.includes('TODO') ||
    s.includes('UNKNOWN') ||
    s.includes('{{') ||
    s.includes('<')
  );
}

function normalizePrefix(p) {
  const s = p.replace(/\\/g, '/');
  return s.endsWith('/') ? s : `${s}/`;
}

function isWithinAllowedWritePaths(target, allowedWritePaths) {
  const t = normalizePrefix(target);
  for (const awp of allowedWritePaths) {
    const prefix = normalizePrefix(String(awp));
    if (t.startsWith(prefix)) return true;
  }
  return false;
}

function parseQuotedScalar(line) {
  const idx = line.indexOf(':');
  if (idx < 0) return null;
  let v = line.slice(idx + 1).trim();
  if (!v) return '';
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

function parseResolvedYamlMinimal(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  let instanceName = null;
  let profileVersion = null;
  let companionRepoTarget = null;
  const allowedWritePaths = [];

  let inLifecycle = false;
  let inAllowedWritePaths = false;

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '  ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (!line.startsWith('  ')) {
      inLifecycle = false;
      inAllowedWritePaths = false;
    }

    if (trimmed.startsWith('instance_name:')) {
      instanceName = parseQuotedScalar(trimmed);
      continue;
    }
    if (trimmed.startsWith('profile_version:')) {
      profileVersion = parseQuotedScalar(trimmed);
      continue;
    }
    if (trimmed.startsWith('companion_repo_target:')) {
      companionRepoTarget = parseQuotedScalar(trimmed);
      continue;
    }

    if (trimmed === 'lifecycle:' && line.startsWith('lifecycle:')) {
      inLifecycle = true;
      continue;
    }

    if (inLifecycle && trimmed === 'allowed_write_paths:' && line.startsWith('  allowed_write_paths:')) {
      inAllowedWritePaths = true;
      continue;
    }

    if (inAllowedWritePaths) {
      if (line.startsWith('    - ')) {
        const v = line.slice('    - '.length).trim();
        allowedWritePaths.push(v.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));
        continue;
      }
      if (line.startsWith('  ') && !line.startsWith('    ')) {
        inAllowedWritePaths = false;
      }
    }
  }

  return { instanceName, profileVersion, companionRepoTarget, allowedWritePaths };
}

async function writeFeedbackPacket(repoRoot, instanceName, summary, details) {
  try {
    const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
    await ensureDir(packetsDir);
    const yyyyMMdd = nowStampYYYYMMDD();
    const fp = path.join(packetsDir, `BP-${yyyyMMdd}-caf-companion-init-failed.md`);
    const content = `# Feedback Packet - caf-companion-init (scripted)\n\n- Date: ${nowDateYYYYMMDD()}\n- Instance: ${instanceName}\n- Stuck At: tools/caf/companion_init_v1.mjs\n- Observed Constraint: ${summary}\n- Gap Type: Missing input | Spec inconsistency\n\n## Minimal Fix Proposal\n${details}\n\n## Evidence\n- (See stderr output from the scripted helper, and the resolved rails file under guardrails.)\n\n## Autonomous agent guidance\n- Autonomous agents with reasoning capabilities MUST apply the edits described in this packet before continuing.\n- After applying the fix, resume the current CAF workflow step; rerun the relevant command (/caf arch, /caf plan, or /caf build) only if required by your runner.\n`;
    await writeUtf8(fp, content);
  } catch {
    // Best-effort only.
  }
}

function applyTokenSubstitutions(templateText, tokens) {
  let out = templateText;
  for (const [k, v] of Object.entries(tokens)) {
    const re = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
    out = out.replace(re, String(v));
  }
  return out;
}

function ensureYamlStampTop(content, stampLine) {
  const lines = String(content ?? '').split(/\r?\n/);
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && lines[i].startsWith('# Generated by CAF v')) {
    lines[i] = stampLine;
    return lines.join('\n');
  }
  return [stampLine, ...lines].join('\n');
}

function ensureMarkdownStampTop(content, stampLine) {
  const lines = String(content ?? '').split(/\r?\n/);
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && lines[i].startsWith('<!-- Generated by CAF v')) {
    lines[i] = stampLine;
    return lines.join('\n');
  }
  return [stampLine, ...lines].join('\n');
}

async function stampFileBestEffort(dstAbs, stamps) {
  try {
    const ext = path.extname(dstAbs).toLowerCase();
    const raw = await fs.readFile(dstAbs, { encoding: 'utf8' });
    if (ext === '.yaml' || ext === '.yml') {
      const stamped = ensureYamlStampTop(raw, stamps.yamlStamp);
      if (stamped !== raw) await writeUtf8(dstAbs, stamped);
      return;
    }
    if (ext === '.md') {
      const stamped = ensureMarkdownStampTop(raw, stamps.mdStamp);
      if (stamped !== raw) await writeUtf8(dstAbs, stamped);
      return;
    }
  } catch {
    // Best-effort only.
  }
}


export async function internal_main(argv = process.argv.slice(2), deps = {}) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) {
    die('Usage: node tools/caf/companion_init_v1.mjs <instance_name> [--overwrite]', 2);
  }

  const instanceNameArg = args[0];
  const overwrite = args.includes('--overwrite');

  if (!NAME_RE.test(instanceNameArg)) {
    die(`Invalid instance_name: ${instanceNameArg}`, 2);
  }

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceNameArg);

  // Best-effort provenance stamps (safe only for text formats).
  const cafVersion = readCafVersionSync(repoRoot);
  const stamps = {
    yamlStamp: `# Generated by CAF v${cafVersion}`,
    mdStamp: cafMarkdownStampLine(),
  };
  const resolvedPath = path.join(
    repoRoot,
    'reference_architectures',
    instanceNameArg,
    'spec',
    'guardrails',
    'profile_parameters_resolved.yaml'
  );

  if (!existsSync(resolvedPath)) {
    await writeFeedbackPacket(
      repoRoot,
      instanceNameArg,
      'Missing required input profile_parameters_resolved.yaml',
      `Create or regenerate: reference_architectures/${instanceNameArg}/spec/guardrails/profile_parameters_resolved.yaml (rerun caf arch ${instanceNameArg}).`
    );
    die(`Missing required input: ${path.relative(repoRoot, resolvedPath)}`, 3);
  }

  const resolvedText = await readUtf8(resolvedPath);
  const parsed = parseResolvedYamlMinimal(resolvedText);
  const instanceName = parsed.instanceName;
  const profileVersion = parsed.profileVersion;
  const companionRepoTarget = parsed.companionRepoTarget;
  const allowedWritePaths = parsed.allowedWritePaths;

  const errs = [];
  if (!instanceName || instanceName !== instanceNameArg) {
    errs.push(`instance_name mismatch: expected '${instanceNameArg}', got '${instanceName ?? ''}'`);
  }
  if (!profileVersion) errs.push('profile_version missing/empty');
  if (!companionRepoTarget) errs.push('companion_repo_target missing/empty');
  if (!Array.isArray(allowedWritePaths) || allowedWritePaths.length === 0) {
    errs.push('lifecycle.allowed_write_paths missing/empty');
  }

  if (containsPlaceholderLike(instanceName) || containsPlaceholderLike(profileVersion) || containsPlaceholderLike(companionRepoTarget)) {
    errs.push('placeholder-like token found in required fields (TBD/TODO/UNKNOWN/{{}}/<>)');
  }

  if (companionRepoTarget) {
    const crt = String(companionRepoTarget);
    if (!crt.startsWith('companion_repositories/')) errs.push("companion_repo_target must start with 'companion_repositories/'");
    if (crt.includes('..')) errs.push('companion_repo_target must not contain .. path segments');
    if (allowedWritePaths.length > 0 && !isWithinAllowedWritePaths(crt, allowedWritePaths)) {
      errs.push('companion_repo_target is not within lifecycle.allowed_write_paths');
    }
  }

  if (errs.length > 0) {
    await writeFeedbackPacket(
      repoRoot,
      instanceNameArg,
      errs[0],
      `Fix resolved rails under reference_architectures/${instanceNameArg}/spec/guardrails/profile_parameters_resolved.yaml.\n\n- Errors:\n${errs.map((e) => `  - ${e}`).join('\n')}`
    );
    die(`Validation failed: ${errs.join('; ')}`, 4);
  }

  const targetAbs = path.join(repoRoot, companionRepoTarget);
  await ensureDir(targetAbs);

  // Ensure CAF input + evidence roots exist inside the companion target.
  const cafAbs = path.join(targetAbs, 'caf');
  await ensureDir(cafAbs);
  await ensureDir(path.join(cafAbs, 'task_reports'));
  await ensureDir(path.join(cafAbs, 'binding_reports'));
  await ensureDir(path.join(cafAbs, 'reviews'));

  // Deterministically mirror CAF-managed planning inputs into the companion.
  // These files are treated as read-only inputs by workers; only evidence is written under caf/.
  const requiredMirrors = [
    // Rails + pinned shape
    {
      srcAbs: path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml'),
      dstRel: 'caf/profile_parameters_resolved.yaml',
      required: true,
    },
    {
      srcAbs: path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml'),
      dstRel: 'caf/architecture_shape_parameters.yaml',
      required: true,
    },
    // Task graph (authoritative build plan)
    {
      srcAbs: path.join(layout.designPlaybookDir, 'task_graph_v1.yaml'),
      dstRel: 'caf/task_graph_v1.yaml',
      required: true,
    },
    {
      srcAbs: path.join(layout.designPlaybookDir, 'interface_binding_contracts_v1.yaml'),
      dstRel: 'caf/interface_binding_contracts_v1.yaml',
      required: existsSync(path.join(layout.designPlaybookDir, 'interface_binding_contracts_v1.yaml')),
    },
    // Core playbook docs used as worker inputs
    {
      srcAbs: path.join(layout.specPlaybookDir, 'application_spec_v1.md'),
      dstRel: 'caf/application_spec_v1.md',
      required: true,
    },
    {
      srcAbs: path.join(layout.specPlaybookDir, 'application_product_surface_v1.md'),
      dstRel: 'caf/application_product_surface_v1.md',
      required: existsSync(path.join(layout.specPlaybookDir, 'application_product_surface_v1.md')),
    },
    {
      srcAbs: path.join(layout.designPlaybookDir, 'application_design_v1.md'),
      dstRel: 'caf/application_design_v1.md',
      required: true,
    },
    {
      srcAbs: path.join(layout.designPlaybookDir, 'control_plane_design_v1.md'),
      dstRel: 'caf/control_plane_design_v1.md',
      required: true,
    },
    {
      srcAbs: path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml'),
      dstRel: 'caf/contract_declarations_v1.yaml',
      required: true,
    },
    {
      srcAbs: path.join(layout.designPlaybookDir, 'application_domain_model_v1.yaml'),
      dstRel: 'caf/application_domain_model_v1.yaml',
      required: true,
    },
    {
      srcAbs: path.join(layout.designPlaybookDir, 'system_domain_model_v1.yaml'),
      dstRel: 'caf/system_domain_model_v1.yaml',
      required: true,
    },
    {
      srcAbs: path.join(layout.specGuardrailsDir, 'abp_pbp_resolution_v1.yaml'),
      dstRel: 'caf/abp_pbp_resolution_v1.yaml',
      required: true,
    },
    {
      srcAbs: path.join(layout.specGuardrailsDir, 'tbp_resolution_v1.yaml'),
      dstRel: 'caf/tbp_resolution_v1.yaml',
      required: true,
    },
  ];

  const optionalUxMirrors = [
    { srcAbs: path.join(layout.designPlaybookDir, 'ux_design_v1.md'), dstRel: 'caf/ux_design_v1.md' },
    { srcAbs: path.join(layout.designPlaybookDir, 'ux_visual_system_v1.md'), dstRel: 'caf/ux_visual_system_v1.md' },
    { srcAbs: path.join(layout.designPlaybookDir, 'retrieval_context_blob_ux_design_v1.md'), dstRel: 'caf/retrieval_context_blob_ux_design_v1.md' },
    { srcAbs: path.join(layout.designPlaybookDir, 'ux_task_graph_v1.yaml'), dstRel: 'caf/ux_task_graph_v1.yaml' },
    { srcAbs: path.join(layout.designPlaybookDir, 'ux_task_plan_v1.md'), dstRel: 'caf/ux_task_plan_v1.md' },
    { srcAbs: path.join(layout.designPlaybookDir, 'ux_task_backlog_v1.md'), dstRel: 'caf/ux_task_backlog_v1.md' },
  ];

  const missing = requiredMirrors.filter((m) => m.required && !existsSync(m.srcAbs));
  if (missing.length > 0) {
    await writeFeedbackPacket(
      repoRoot,
      instanceNameArg,
      'Missing required CAF planning inputs to mirror into the companion repo',
      `Run /caf arch ${instanceNameArg} (or /caf next ${instanceNameArg} apply) until these files exist, then rerun: node tools/caf/companion_init_v1.mjs ${instanceNameArg} --overwrite\n\nMissing sources:\n${missing
        .map((m) => `- ${path.relative(repoRoot, m.srcAbs)}`)
        .join('\n')}`
    );
    die('Missing required planning inputs (see feedback packet).', 6);
  }

  for (const m of requiredMirrors) {
    const dstAbs = path.join(targetAbs, m.dstRel);
    await copyIfMissingOrOverwrite(m.srcAbs, dstAbs, overwrite);
    await stampFileBestEffort(dstAbs, stamps);
  }
  for (const m of optionalUxMirrors) {
    if (!existsSync(m.srcAbs)) continue;
    const dstAbs = path.join(targetAbs, m.dstRel);
    await copyIfMissingOrOverwrite(m.srcAbs, dstAbs, overwrite);
    await stampFileBestEffort(dstAbs, stamps);
  }

  const templatesDir = path.join(repoRoot, 'skills', 'caf-companion-init', 'templates');
  const tmplAgents = path.join(templatesDir, 'AGENTS.md');
  const tmplReadme = path.join(templatesDir, 'README.md');
  if (!existsSync(tmplAgents) || !existsSync(tmplReadme)) {
    await writeFeedbackPacket(
      repoRoot,
      instanceNameArg,
      'Missing caf-companion-init seed templates',
      `Expected templates:\n- skills/caf-companion-init/templates/AGENTS.md\n- skills/caf-companion-init/templates/README.md`
    );
    die('Missing caf-companion-init templates', 5);
  }

  const tokens = {
    CAF_VERSION: cafVersion,
    INSTANCE_NAME: instanceName,
    PROFILE_VERSION: profileVersion,
    COMPANION_REPO_TARGET: companionRepoTarget,
    DATE_YYYY_MM_DD: nowDateYYYYMMDD(),
  };

  const agentsOut = path.join(targetAbs, 'AGENTS.md');
  const readmeOut = path.join(targetAbs, 'README.md');
  const agentsExists = existsSync(agentsOut);
  const readmeExists = existsSync(readmeOut);

  if (!agentsExists || overwrite) {
    const t = await readUtf8(tmplAgents);
    let out = applyTokenSubstitutions(t, tokens);
    out = ensureMarkdownStampTop(out, stamps.mdStamp);
    await writeUtf8(agentsOut, out);
  }
  if (!readmeExists || overwrite) {
    const t = await readUtf8(tmplReadme);
    let out = applyTokenSubstitutions(t, tokens);
    out = ensureMarkdownStampTop(out, stamps.mdStamp);
    await writeUtf8(readmeOut, out);
  }
}


function isEntrypoint() {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    return false;
  }
}

export async function main() {
  try {
    await internal_main(process.argv.slice(2));
    return 0;
  } catch (e) {
    const code = typeof e?.code === 'number' ? e.code : 99;
    const msg = String(e?.message || e?.stack || e);
    if (msg) process.stderr.write(`${msg}\n`);
    return code;
  }
}

if (isEntrypoint()) {
  main().then((code) => process.exit(code));
}
