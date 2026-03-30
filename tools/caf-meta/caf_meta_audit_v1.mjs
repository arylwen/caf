#!/usr/bin/env node
/**
 * CAF meta audit wrapper (mini-rag, deterministic)
 *
 * Usage:
 *   node tools/caf-meta/caf_meta_audit_v1.mjs all
 *   node tools/caf-meta/caf_meta_audit_v1.mjs decision-hydration
 *   node tools/caf-meta/caf_meta_audit_v1.mjs library
 *
 * Writes:
 *   architecture_library/__meta/caf_library__evals/audits/<stamp>/caf_meta_audit_report_v1.md
 *   architecture_library/__meta/caf_library__evals/audits/<stamp>/runs/<script>.stdout.txt
 *   architecture_library/__meta/caf_library__evals/audits/<stamp>/runs/<script>.stderr.txt
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRepoRoot } from "../caf/lib_repo_root_v1.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NOTE: Audits are intentionally heavy. This wrapper is intentionally *not* auto-run.
// Default behavior is to print help so the operator can run audits intentionally.

const scripts = {
  "decision-hydration": { file: "audit_decision_option_hydration_v1.mjs", args: [] },
  "relations-sweep": { file: "pattern_relations_sweep_v1.mjs", args: [] },
  "relations-reclassify": { file: "pattern_relations_reclassify_v1.mjs", args: [] },
  "atoms": { file: "../caf/atom_normalization_validator_v1.mjs", args: [] },
  "library": { file: "audit_architecture_library_v1.mjs", args: [] },
  "no-tbp-leakage": { file: "audit_no_tbp_leakage_in_worker_skills_v1.mjs", args: [] },
  "patch-notes": { file: "audit_patch_notes_required_v1.mjs", args: [] },
  "score-playbook": { file: "score_playbook_v1.mjs", args: [] },
};

function printHelp() {
  const keys = Object.keys(scripts).sort();
  const lines = [];
  lines.push('CAF meta audit wrapper (v1)');
  lines.push('');
  lines.push('Usage:');
  lines.push('  node tools/caf-meta/caf_meta_audit_v1.mjs help');
  lines.push('  node tools/caf-meta/caf_meta_audit_v1.mjs audit <command|csv|all>');
  lines.push('');
  lines.push('Commands:');
  for (const k of keys) lines.push(`  - ${k}`);
  lines.push('');
  lines.push('Examples:');
  lines.push('  node tools/caf-meta/caf_meta_audit_v1.mjs audit all');
  lines.push('  node tools/caf-meta/caf_meta_audit_v1.mjs audit library');
  lines.push('  node tools/caf-meta/caf_meta_audit_v1.mjs audit library,decision-hydration');
  console.log(lines.join('\n'));
}

const verb = process.argv[2] || 'help';
const cmd = process.argv[3] || '';

if (verb === 'help' || verb === '--help' || verb === '-h' || verb === '') {
  printHelp();
  process.exit(0);
}

if (verb !== 'audit') {
  console.error(`Unknown verb: ${verb}`);
  printHelp();
  process.exit(2);
}

if (!cmd) {
  console.error('Missing audit command.');
  printHelp();
  process.exit(2);
}

// Write audits under architecture_library/__meta so results live with the library.
const repoRoot = resolveRepoRoot();
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const OUT_DIR = path.join(
  repoRoot,
  'architecture_library',
  '__meta',
  'caf_library__evals',
  'audits',
  `caf_meta_audit_v1_${stamp}`,
);
const RUNS_DIR = path.join(OUT_DIR, 'runs');
fs.mkdirSync(RUNS_DIR, { recursive: true });

function runOne(key) {
  const spec = scripts[key];
  if (!spec) throw new Error(`Unknown command: ${key}`);

  const scriptPath = path.join(__dirname, spec.file);
  const logStem = spec.file
    .replace(/^(\.\.\/)+/, '')
    .replace(/[\/]/g, '__');
  // Pass-through extra args after `audit <cmd>`
  const extraArgs = process.argv.slice(4);
  const res = spawnSync(process.execPath, [scriptPath, ...spec.args, ...extraArgs], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });

  const stdoutPath = path.join(RUNS_DIR, `${logStem}.stdout.txt`);
  const stderrPath = path.join(RUNS_DIR, `${logStem}.stderr.txt`);
  fs.writeFileSync(stdoutPath, res.stdout || "", "utf8");
  fs.writeFileSync(stderrPath, res.stderr || "", "utf8");

  return {
    key,
    file: spec.file,
    status: res.status ?? 0,
    stdoutPath,
    stderrPath,
    stdoutPreview: (res.stdout || "").split("\n").slice(0, 80).join("\n"),
    stderrPreview: (res.stderr || "").split("\n").slice(0, 40).join("\n"),
  };
}

const plan = (() => {
  if (cmd === 'all') {
    return ['library', 'decision-hydration', 'atoms', 'relations-sweep', 'no-tbp-leakage', 'patch-notes'];
  }
  if (cmd.includes(',')) return cmd.split(',').map(s => s.trim()).filter(Boolean);
  return [cmd];
})();

const results = [];
for (const k of plan) {
  results.push(runOne(k));
}

const reportPath = path.join(OUT_DIR, "caf_meta_audit_report_v1.md");
const lines = [];
lines.push(`# CAF meta audit report (v1)\n`);
lines.push(`Generated: ${new Date().toISOString()}\n`);
lines.push(`Commands: ${plan.join(", ")}\n\n`);

for (const r of results) {
  lines.push(`## ${r.key}\n`);
  lines.push(`- Script: \`${r.file}\`\n`);
  lines.push(`- Exit: \`${r.status}\`\n`);
  lines.push(`- Stdout log: \`${path.relative(__dirname, r.stdoutPath)}\`\n`);
  lines.push(`- Stderr log: \`${path.relative(__dirname, r.stderrPath)}\`\n\n`);
  if (r.stderrPreview.trim()) {
    lines.push(`### stderr (preview)\n\n\`\`\`\n${r.stderrPreview}\n\`\`\`\n\n`);
  }
  if (r.stdoutPreview.trim()) {
    lines.push(`### stdout (preview)\n\n\`\`\`\n${r.stdoutPreview}\n\`\`\`\n\n`);
  }
}

fs.writeFileSync(reportPath, lines.join(""), "utf8");
console.log(`Wrote: ${path.relative(process.cwd(), reportPath)}`);
