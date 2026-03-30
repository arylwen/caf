#!/usr/bin/env node
/**
 * CAF: post-plan deterministic gate (v1)
 * Runs the scripted post-plan derivation + gate chain as a thin wrapper.
 *
 * Mechanical only:
 * - Delegates to existing helpers, including the framework-owned semantic acceptance enrichment and required-input enrichment steps.
 *
 * Contract:
 * - Writes no feedback packets directly.
 * - Derived artifact writes are performed only by the delegated first-class helpers (for example semantic acceptance enrichment, interface binding contract generation, and task-plan generation).
 * - On failure, the underlying helper writes a feedback packet; this wrapper must not add extra output.
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

const compilePatternObligations = path.join(cafToolsDir, "compile_pattern_obligations_v1.mjs");
const playbookGate = path.join(cafToolsDir, "playbook_gate_v1.mjs");
const obligationGate = path.join(cafToolsDir, "pattern_obligation_gate_v1.mjs");

const tbpObligationGate = path.join(cafToolsDir, "tbp_obligation_gate_v1.mjs");

const tbpGateAttachmentOptionsGate = path.join(cafToolsDir, "tbp_gate_attachment_options_task_gate_v1.mjs");

const taskIdContractGate = path.join(cafToolsDir, "task_id_contract_gate_v1.mjs");

const taskGraphShapeGate = path.join(cafToolsDir, "task_graph_shape_gate_v1.mjs");
const planningTechChoiceGate = path.join(cafToolsDir, "planning_technology_choice_realization_gate_v1.mjs");

const semanticAcceptanceEnrichment = path.join(cafToolsDir, "task_graph_semantic_acceptance_enrichment_v1.mjs");
const requiredInputEnrichment = path.join(cafToolsDir, "task_graph_required_input_enrichment_v1.mjs");
const resolvedRailsVisibilityEnrichment = path.join(cafToolsDir, "task_graph_resolved_rails_visibility_enrichment_v1.mjs");
const uiSeedEnrichment = path.join(cafToolsDir, "task_graph_ui_seed_semantic_enrichment_v1.mjs");
const obligationTraceEnrichment = path.join(cafToolsDir, "task_graph_obligation_trace_enrichment_v1.mjs");
const genInterfaceBindingContracts = path.join(cafToolsDir, "gen_interface_binding_contracts_v1.mjs");
const interfaceBindingContractGate = path.join(cafToolsDir, "interface_binding_contract_gate_v1.mjs");

const genTaskPlan = path.join(cafToolsDir, "gen_task_plan_v1.mjs");

if (!fs.existsSync(compilePatternObligations)) die("Missing helper: tools/caf/compile_pattern_obligations_v1.mjs");
if (!fs.existsSync(playbookGate)) die("Missing helper: tools/caf/playbook_gate_v1.mjs");
if (!fs.existsSync(obligationGate)) die("Missing helper: tools/caf/pattern_obligation_gate_v1.mjs");
if (!fs.existsSync(tbpObligationGate)) die("Missing helper: tools/caf/tbp_obligation_gate_v1.mjs");
if (!fs.existsSync(tbpGateAttachmentOptionsGate)) die("Missing helper: tools/caf/tbp_gate_attachment_options_task_gate_v1.mjs");
if (!fs.existsSync(taskIdContractGate)) die("Missing helper: tools/caf/task_id_contract_gate_v1.mjs");
if (!fs.existsSync(taskGraphShapeGate)) die("Missing helper: tools/caf/task_graph_shape_gate_v1.mjs");
if (!fs.existsSync(planningTechChoiceGate)) die("Missing helper: tools/caf/planning_technology_choice_realization_gate_v1.mjs");
if (!fs.existsSync(semanticAcceptanceEnrichment)) die("Missing helper: tools/caf/task_graph_semantic_acceptance_enrichment_v1.mjs");
if (!fs.existsSync(requiredInputEnrichment)) die("Missing helper: tools/caf/task_graph_required_input_enrichment_v1.mjs");
if (!fs.existsSync(resolvedRailsVisibilityEnrichment)) die("Missing helper: tools/caf/task_graph_resolved_rails_visibility_enrichment_v1.mjs");
if (!fs.existsSync(uiSeedEnrichment)) die("Missing helper: tools/caf/task_graph_ui_seed_semantic_enrichment_v1.mjs");
if (!fs.existsSync(obligationTraceEnrichment)) die("Missing helper: tools/caf/task_graph_obligation_trace_enrichment_v1.mjs");
if (!fs.existsSync(genInterfaceBindingContracts)) die("Missing helper: tools/caf/gen_interface_binding_contracts_v1.mjs");
if (!fs.existsSync(interfaceBindingContractGate)) die("Missing helper: tools/caf/interface_binding_contract_gate_v1.mjs");
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

// Step 5c.1 (Compiler-owned pattern obligations)
let code = runGate(compilePatternObligations);
if (code !== 0) process.exit(code);

// Step 5d.1 (Library-owned semantic acceptance enrichment)
code = runGate(semanticAcceptanceEnrichment);
if (code !== 0) process.exit(code);

// Step 5d.2 (Framework-owned required input enrichment)
code = runGate(requiredInputEnrichment);
if (code !== 0) process.exit(code);

// Step 5d.3 (Framework-owned resolved rails visibility preservation)
code = runGate(resolvedRailsVisibilityEnrichment);
if (code !== 0) process.exit(code);

// Step 5d.4 (Library-owned UI seed semantic pressure preservation)
code = runGate(uiSeedEnrichment);
if (code !== 0) process.exit(code);

// Step 5d.5 (Compiler-owned obligation trace attachment)
code = runGate(obligationTraceEnrichment);
if (code !== 0) process.exit(code);

// Step 5e
code = runGate(playbookGate);
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

// Step 5i.1 (Selected technology choices must remain visible in the task graph)
code = runGate(planningTechChoiceGate);
if (code !== 0) process.exit(code);

// Step 5j (Mechanical interface binding contract emission)
code = runGate(genInterfaceBindingContracts);
if (code !== 0) process.exit(code);

// Step 5k (Interface binding closure sequencing)
code = runGate(interfaceBindingContractGate);
if (code !== 0) process.exit(code);

// Step 5l (Derived task plan view)
code = runGate(genTaskPlan);
process.exit(code);
