#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Purpose:
 * - Deterministically emit architecture-scaffolding derived views that were
 *   previously delegated to semantic postprocess routing.
 * - Avoid duplicate or non-standard feedback packets for missing diagnostic
 *   views when the scripted producers already exist.
 *
 * Current scope:
 * - architecture_scaffolding only
 *   - spec traceability mindmap
 *   - pattern candidate selection report (arch_scaffolding)
 *   - retrieval debug report (arch_scaffolding)
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { parseYamlFile } from './lib_yaml_v2.mjs';
import {
  renderFeedbackPacketV1,
  nowStampYYYYMMDD,
  markPendingFeedbackPacketsStaleSync,
} from './lib_feedback_packets_v1.mjs';
import { internal_main as traceability_internal_main } from './worker_traceability_mindmap_v3.mjs';
import { internal_main as candidate_report_internal_main } from './build_candidate_selection_report_v1.mjs';
import { internal_main as retrieval_debug_internal_main } from './build_retrieval_debug_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

class CafToolError extends Error {
  constructor(message, exitCode = 1) {
    super(message);
    this.exitCode = exitCode;
  }
}

function die(message, exitCode = 1) {
  throw new CafToolError(String(message ?? ''), exitCode);
}

function norm(v) {
  return String(v ?? '').trim();
}

async function readPhase(layout) {
  const resolvedPath = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
  const pinsPath = path.join(layout.specGuardrailsDir, 'profile_parameters.yaml');
  let obj = null;
  if (existsSync(resolvedPath)) {
    try { obj = await parseYamlFile(resolvedPath); } catch {}
  }
  if (!obj && existsSync(pinsPath)) {
    try { obj = await parseYamlFile(pinsPath); } catch {}
  }
  return norm(obj?.lifecycle?.generation_phase) || 'architecture_scaffolding';
}

async function writePacket(repoRoot, layout, instanceName, observedConstraint, evidenceLines = [], minimalFixLines = []) {
  await fs.mkdir(layout.feedbackPacketsDir, { recursive: true });
  try { markPendingFeedbackPacketsStaleSync(layout.feedbackPacketsDir); } catch {}
  const fp = path.join(layout.feedbackPacketsDir, `BP-${nowStampYYYYMMDD()}-arch-postprocess-derived-views.md`);
  const body = renderFeedbackPacketV1({
    title: 'caf arch postprocess derived views',
    instanceName,
    stuckAt: 'tools/caf/arch_postprocess_v1.mjs',
    severity: 'blocker',
    status: 'pending',
    observedConstraint,
    gapType: 'required_derived_view_missing',
    minimalFixLines: minimalFixLines.length > 0 ? minimalFixLines : [
      `Run: node tools/caf/arch_postprocess_v1.mjs ${instanceName}`,
      `Run: node tools/caf/worker_traceability_mindmap_v3.mjs ${instanceName}`,
      `Run: node tools/caf/build_candidate_selection_report_v1.mjs ${instanceName} --profile=arch_scaffolding`,
      `Run: node tools/caf/build_retrieval_debug_v1.mjs ${instanceName} --profile=arch_scaffolding`,
    ],
    evidenceLines,
    humanGuidanceLines: [
      'This helper is deterministic and phase-aware; prefer rerunning it over crafting a manual packet.',
      `If you want to rerun the whole phase instead, reset first: node tools/caf/architecture_scaffolding_reset_v1.mjs ${instanceName} overwrite`,
      `Then rerun: /caf arch ${instanceName}`,
    ],
  });
  await fs.writeFile(fp, body, 'utf8');
  return fp;
}

function ensureProduced(repoRoot, expectedAbs, result, label) {
  const outPath = result && typeof result === 'object' ? result.outPath : '';
  const candidate = outPath ? path.resolve(outPath) : path.resolve(expectedAbs);
  if (!existsSync(candidate)) {
    const relExpected = path.relative(repoRoot, expectedAbs).replace(/\\/g, '/');
    const relReported = outPath ? path.relative(repoRoot, candidate).replace(/\\/g, '/') : '(none)';
    die(`${label} completed but did not produce expected output: expected=${relExpected}; reported=${relReported}`, 12);
  }
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  const instanceName = norm(args[0]);
  if (!instanceName) die('Usage: node tools/caf/arch_postprocess_v1.mjs <instance_name>', 2);
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);

  const repoRoot = resolveRepoRoot();
  const layout = getInstanceLayout(repoRoot, instanceName);
  const phase = await readPhase(layout);
  if (phase !== 'architecture_scaffolding') {
    return { skipped: true, phase };
  }

  const expectedMindmap = path.join(layout.specMetaDir, 'spec_traceability_mindmap_v3.md');
  const expectedSelection = path.join(layout.specMetaDir, 'pattern_candidate_selection_report_arch_scaffolding_v1.md');
  const expectedDebug = path.join(layout.specMetaDir, 'retrieval_debug_computed_arch_scaffolding_v1.md');

  const mindmapResult = await traceability_internal_main([instanceName]);
  ensureProduced(repoRoot, expectedMindmap, mindmapResult, 'traceability mindmap');

  const selectionResult = await candidate_report_internal_main([instanceName, '--profile=arch_scaffolding']);
  ensureProduced(repoRoot, expectedSelection, selectionResult, 'candidate selection report');

  const debugResult = await retrieval_debug_internal_main([instanceName, '--profile=arch_scaffolding']);
  ensureProduced(repoRoot, expectedDebug, debugResult, 'retrieval debug report');

  return {
    phase,
    mindmap: expectedMindmap,
    selection: expectedSelection,
    debug: expectedDebug,
  };
}

async function main() {
  try {
    const result = await internal_main(process.argv.slice(2));
    if (result?.skipped) {
      process.stdout.write(`OK: skipped arch postprocess for phase=${result.phase}\n`);
      process.exit(0);
    }
    process.stdout.write(`OK: wrote ${path.relative(resolveRepoRoot(), result.mindmap)}\n`);
    process.stdout.write(`OK: wrote ${path.relative(resolveRepoRoot(), result.selection)}\n`);
    process.stdout.write(`OK: wrote ${path.relative(resolveRepoRoot(), result.debug)}\n`);
    process.exit(0);
  } catch (e) {
    const repoRoot = resolveRepoRoot();
    const instanceName = norm(process.argv[2]);
    if (NAME_RE.test(instanceName)) {
      try {
        const layout = getInstanceLayout(repoRoot, instanceName);
        const fp = await writePacket(
          repoRoot,
          layout,
          instanceName,
          'Architecture-scaffolding derived view postprocess failed.',
          [
            `error: ${String(e?.stack ?? e?.message ?? e)}`,
            `instance_root: reference_architectures/${instanceName}`,
            'expected_outputs: spec/caf_meta/spec_traceability_mindmap_v3.md, spec/caf_meta/pattern_candidate_selection_report_arch_scaffolding_v1.md, spec/caf_meta/retrieval_debug_computed_arch_scaffolding_v1.md',
          ]
        );
        process.stdout.write(`${fp}\n`);
        process.exit(e instanceof CafToolError ? (e.exitCode || 1) : 1);
      } catch {
        // fall through to stderr path below
      }
    }

    if (e instanceof CafToolError) {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.exitCode || 1);
    }
    process.stderr.write(`${String(e?.stack ?? e?.message ?? e)}\n`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
