#!/usr/bin/env node
/**
 * CAF: post-plan deterministic gate (v1)
 * Consolidates caf-arch Step 5e + Step 5f as a thin wrapper.
 *
 * Mechanical only:
 * - Delegates to existing helpers:
 *   - playbook_gate_v1.mjs
 *   - pattern_obligation_gate_v1.mjs
 *
 * Contract:
 * - Writes no derived artifacts directly.
 * - On failure, underlying helper writes a feedback packet; this wrapper must not add extra output.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';

function die(msg, code = 2) {
  // Keep output minimal and deterministic.
  // Underlying gates write feedback packets; wrapper failures should be rare.
  process.stderr.write(msg + "\n");
  process.exit(code);
}

const instanceName = process.argv[2];
if (!instanceName) {
  die("Usage: node tools/caf/post_plan_gate_v1.mjs <instance_name>");
}

const repoRoot = resolveRepoRoot();
const cafToolsDir = path.join(repoRoot, "tools", "caf");

const playbookGate = path.join(cafToolsDir, "playbook_gate_v1.mjs");
const obligationGate = path.join(cafToolsDir, "pattern_obligation_gate_v1.mjs");

const tbpObligationGate = path.join(cafToolsDir, "tbp_obligation_gate_v1.mjs");

const tbpGateAttachmentOptionsGate = path.join(cafToolsDir, "tbp_gate_attachment_options_task_gate_v1.mjs");

const taskIdContractGate = path.join(cafToolsDir, "task_id_contract_gate_v1.mjs");

const taskGraphShapeGate = path.join(cafToolsDir, "task_graph_shape_gate_v1.mjs");

const genTaskPlan = path.join(cafToolsDir, "gen_task_plan_v1.mjs");

if (!fs.existsSync(playbookGate)) die("Missing helper: tools/caf/playbook_gate_v1.mjs");
if (!fs.existsSync(obligationGate)) die("Missing helper: tools/caf/pattern_obligation_gate_v1.mjs");
if (!fs.existsSync(tbpObligationGate)) die("Missing helper: tools/caf/tbp_obligation_gate_v1.mjs");
if (!fs.existsSync(tbpGateAttachmentOptionsGate)) die("Missing helper: tools/caf/tbp_gate_attachment_options_task_gate_v1.mjs");
if (!fs.existsSync(taskIdContractGate)) die("Missing helper: tools/caf/task_id_contract_gate_v1.mjs");
if (!fs.existsSync(taskGraphShapeGate)) die("Missing helper: tools/caf/task_graph_shape_gate_v1.mjs");
if (!fs.existsSync(genTaskPlan)) die("Missing helper: tools/caf/gen_task_plan_v1.mjs");

function runGate(scriptPath) {
  const r = spawnSync(process.execPath, [scriptPath, instanceName], {
    stdio: "inherit",
    cwd: repoRoot,
    env: process.env,
  });
  // If the child was terminated by a signal, treat as failure.
  if (r.signal) return 3;
  return typeof r.status === "number" ? r.status : 3;
}

// Step 5e
let code = runGate(playbookGate);
if (code !== 0) process.exit(code);

// Step 5f
code = runGate(obligationGate);
if (code !== 0) process.exit(code);

// Step 5g (TBP extensions)
code = runGate(tbpObligationGate);
if (code !== 0) process.exit(code);

// Step 5g.1 (TBP gate attachment hygiene)
code = runGate(tbpGateAttachmentOptionsGate);
if (code !== 0) process.exit(code);

// Step 5h (Task id contract drift)
code = runGate(taskIdContractGate);
if (code !== 0) process.exit(code);

// Step 5i (Task graph structural completeness)
code = runGate(taskGraphShapeGate);
if (code !== 0) process.exit(code);

// Step 5j (Derived task plan view)
code = runGate(genTaskPlan);
process.exit(code);
