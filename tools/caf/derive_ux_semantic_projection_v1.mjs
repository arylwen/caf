#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

import { parseYamlFile } from './lib_yaml_v2.mjs';
import { replaceManagedBlock } from './lib_ux_selection_v1.mjs';

const require = createRequire(import.meta.url);
const jsyaml = require('./vendor/js-yaml.min.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

function usage() {
  console.error('Usage: node tools/caf/derive_ux_semantic_projection_v1.mjs <instance_name>');
  process.exit(2);
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}
async function readUtf8(p) { return fs.readFile(p, 'utf8'); }
async function writeUtf8(p, s) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, s, 'utf8');
}

function ensureArray(value) {
  return Array.isArray(value) ? value.map((x) => String(x ?? '').trim()).filter(Boolean) : [];
}

function ensureObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid or missing object: ${label}`);
  return value;
}

function ensureNonEmptyString(value, label) {
  const out = String(value ?? '').trim();
  if (!out) throw new Error(`Missing required string: ${label}`);
  return out;
}

function dumpYaml(obj) {
  return jsyaml.dump(obj, {
    noRefs: true,
    lineWidth: -1,
    quotingType: "'",
    forceQuotes: true,
    sortKeys: false,
  }).trim();
}

function renderScope(scope) {
  const primary = ensureArray(scope.primary_actors);
  const supporting = ensureArray(scope.supporting_actors);
  const nonGoals = ensureArray(scope.non_goals);
  const notes = ensureArray(scope.notes);
  const lines = [
    '## CAF UX scope semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    `- product_scope_summary: ${ensureNonEmptyString(scope.product_scope_summary, 'scope_and_actors.product_scope_summary')}`,
    `- primary_experience_emphasis: ${ensureNonEmptyString(scope.primary_experience_emphasis, 'scope_and_actors.primary_experience_emphasis')}`,
    '- primary_actors:',
  ];
  for (const item of primary) lines.push(`  - ${item}`);
  if (primary.length === 0) lines.push('  - (none provided)');
  lines.push('- supporting_actors:');
  if (supporting.length === 0) lines.push('  - (none provided)');
  else for (const item of supporting) lines.push(`  - ${item}`);
  lines.push('- non_goals:');
  if (nonGoals.length === 0) lines.push('  - (none provided)');
  else for (const item of nonGoals) lines.push(`  - ${item}`);
  if (notes.length > 0) {
    lines.push('- notes:');
    for (const item of notes) lines.push(`  - ${item}`);
  }
  return lines.join('\n');
}

function renderPmIntent(pmIntent) {
  const out = {
    schema_version: 'ux_pm_intent_v1',
    primary_product_intent: ensureObject(pmIntent.primary_product_intent, 'pm_intent.primary_product_intent'),
    primary_experience_intent: ensureObject(pmIntent.primary_experience_intent, 'pm_intent.primary_experience_intent'),
    trust_clarity_intent: ensureObject(pmIntent.trust_clarity_intent, 'pm_intent.trust_clarity_intent'),
    visual_tone_intent: ensureObject(pmIntent.visual_tone_intent, 'pm_intent.visual_tone_intent'),
  };
  return [
    '## CAF UX PM intent semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    '```yaml',
    dumpYaml(out),
    '```',
  ].join('\n');
}

function renderJourneys(journeys) {
  const items = Array.isArray(journeys) ? journeys : [];
  if (items.length === 0) throw new Error('ux_semantic_derivation_packet_v1 requires at least one core_journeys entry');
  const lines = [
    '## CAF UX core journeys semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
  ];
  for (const raw of items) {
    const item = ensureObject(raw, 'core_journeys[]');
    lines.push(`### Journey: ${ensureNonEmptyString(item.title, 'core_journeys[].title')}`);
    lines.push(`- journey_id: ${ensureNonEmptyString(item.journey_id, 'core_journeys[].journey_id')}`);
    const caps = ensureArray(item.source_capabilities);
    lines.push(`- source_capabilities: ${caps.length ? caps.join(', ') : 'signal-derived'}`);
    lines.push(`- actor: ${ensureNonEmptyString(item.actor, 'core_journeys[].actor')}`);
    lines.push(`- goal: ${ensureNonEmptyString(item.goal, 'core_journeys[].goal')}`);
    lines.push(`- trigger: ${ensureNonEmptyString(item.trigger, 'core_journeys[].trigger')}`);
    lines.push(`- entry_surface: ${ensureNonEmptyString(item.entry_surface, 'core_journeys[].entry_surface')}`);
    lines.push('- major_steps:');
    const steps = ensureArray(item.major_steps);
    if (steps.length === 0) lines.push('  - (none provided)');
    else for (const step of steps) lines.push(`  - ${step}`);
    lines.push(`- success_outcome: ${ensureNonEmptyString(item.success_outcome, 'core_journeys[].success_outcome')}`);
    const failure = ensureArray(item.failure_recovery_branches);
    if (failure.length > 0) {
      lines.push('- failure_recovery_branches:');
      for (const branch of failure) lines.push(`  - ${branch}`);
    }
    const variants = ensureArray(item.notable_variants);
    if (variants.length > 0) {
      lines.push('- notable_variants:');
      for (const variant of variants) lines.push(`  - ${variant}`);
    }
  }
  return lines.join('\n');
}

function renderSurfaces(surfaces) {
  const items = Array.isArray(surfaces) ? surfaces : [];
  if (items.length === 0) throw new Error('ux_semantic_derivation_packet_v1 requires at least one interaction_surfaces entry');
  const lines = [
    '## CAF UX interaction surfaces semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
  ];
  for (const raw of items) {
    const item = ensureObject(raw, 'interaction_surfaces[]');
    lines.push(`### Surface: ${ensureNonEmptyString(item.title, 'interaction_surfaces[].title')}`);
    lines.push(`- surface_id: ${ensureNonEmptyString(item.surface_id, 'interaction_surfaces[].surface_id')}`);
    lines.push(`- purpose: ${ensureNonEmptyString(item.purpose, 'interaction_surfaces[].purpose')}`);
    const related = ensureArray(item.related_journeys);
    lines.push(`- related_journeys: ${related.length ? related.join(', ') : '(none provided)'}`);
    lines.push(`- dominant_interaction_mode: ${ensureNonEmptyString(item.dominant_interaction_mode, 'interaction_surfaces[].dominant_interaction_mode')}`);
    lines.push('- key_states:');
    const states = ensureArray(item.key_states);
    if (states.length === 0) lines.push('  - (none provided)');
    else for (const state of states) lines.push(`  - ${state}`);
    const transitions = ensureArray(item.notable_transitions);
    if (transitions.length > 0) {
      lines.push('- notable_transitions:');
      for (const transition of transitions) lines.push(`  - ${transition}`);
    }
  }
  return lines.join('\n');
}

function renderVisualDirection(visual) {
  const out = ensureObject(visual, 'visual_direction');
  const lines = [
    '## CAF UX visual direction semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    `- visual_tone: ${ensureNonEmptyString(out.visual_tone, 'visual_direction.visual_tone')}`,
    `- navigation_shell: ${ensureNonEmptyString(out.navigation_shell, 'visual_direction.navigation_shell')}`,
    `- density_posture: ${ensureNonEmptyString(out.density_posture, 'visual_direction.density_posture')}`,
  ];
  const surface = ensureArray(out.surface_treatment);
  if (surface.length > 0) {
    lines.push('- surface_treatment:');
    for (const item of surface) lines.push(`  - ${item}`);
  }
  const type = ensureArray(out.typography_and_readability);
  if (type.length > 0) {
    lines.push('- typography_and_readability:');
    for (const item of type) lines.push(`  - ${item}`);
  }
  const motion = ensureArray(out.motion_posture);
  if (motion.length > 0) {
    lines.push('- motion_posture:');
    for (const item of motion) lines.push(`  - ${item}`);
  }
  const demo = ensureArray(out.ux_realization_posture);
  if (demo.length > 0) {
    lines.push('- ux_realization_posture:');
    for (const item of demo) lines.push(`  - ${item}`);
  }
  return lines.join('\n');
}

function renderPatternPressures(patternPressures) {
  const obj = ensureObject(patternPressures, 'pattern_pressures');
  const out = {
    schema_version: 'ux_pattern_pressures_semantic_projection_v1',
    pressures: Array.isArray(obj.pressures) ? obj.pressures : [],
  };
  return [
    '## CAF UX pattern pressures semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    '```yaml',
    dumpYaml(out),
    '```',
  ].join('\n');
}

function renderStateAndRecovery(stateAndRecovery) {
  const obj = ensureObject(stateAndRecovery, 'state_and_recovery');
  const lines = [
    '## CAF UX state and recovery semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    '- key_states:',
  ];
  const states = ensureArray(obj.key_states);
  if (states.length === 0) lines.push('  - (none provided)');
  else for (const item of states) lines.push(`  - ${item}`);
  const recovery = ensureArray(obj.recovery_principles);
  if (recovery.length > 0) {
    lines.push('- recovery_principles:');
    for (const item of recovery) lines.push(`  - ${item}`);
  }
  return lines.join('\n');
}

function renderTouchpointsAndConstraints(touchpointsAndConstraints) {
  const obj = ensureObject(touchpointsAndConstraints, 'touchpoints_and_constraints');
  const lines = [
    '## CAF UX touchpoints and constraints semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    '- touchpoints:',
  ];
  const touchpoints = ensureArray(obj.touchpoints);
  if (touchpoints.length === 0) lines.push('  - (none provided)');
  else for (const item of touchpoints) lines.push(`  - ${item}`);
  const constraints = ensureArray(obj.constraints);
  if (constraints.length > 0) {
    lines.push('- constraints:');
    for (const item of constraints) lines.push(`  - ${item}`);
  }
  return lines.join('\n');
}

function renderInterfaceContractPressures(interfacePressures) {
  const obj = ensureObject(interfacePressures, 'interface_contract_pressures');
  const out = {
    schema_version: 'ux_interface_contract_pressures_semantic_projection_v1',
    contract_style_assumption: ensureNonEmptyString(obj.contract_style_assumption, 'interface_contract_pressures.contract_style_assumption'),
    pressures: Array.isArray(obj.pressures) ? obj.pressures : [],
  };
  return [
    '## CAF UX interface contract pressures semantic projection (CAF-managed)',
    '- semantic_source: design/playbook/ux_semantic_derivation_packet_v1.yaml',
    '```yaml',
    dumpYaml(out),
    '```',
  ].join('\n');
}

async function main() {
  const instanceName = process.argv[2];
  if (!instanceName) usage();

  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const uxDesignPath = path.join(instanceRoot, 'design', 'playbook', 'ux_design_v1.md');
  const packetPath = path.join(instanceRoot, 'design', 'playbook', 'ux_semantic_derivation_packet_v1.yaml');

  for (const p of [uxDesignPath, packetPath]) {
    if (!(await exists(p))) throw new Error(`Missing required UX semantic input: ${path.relative(repoRoot, p)}`);
  }

  let uxDesign = await readUtf8(uxDesignPath);
  const packet = ensureObject(await parseYamlFile(packetPath), 'ux_semantic_derivation_packet_v1');
  if (String(packet.schema_version || '').trim() !== 'ux_semantic_derivation_packet_v1') {
    throw new Error(`Unexpected schema_version in ${path.relative(repoRoot, packetPath)}: ${String(packet.schema_version || '(missing)')}`);
  }
  if (packet.instance_name && String(packet.instance_name).trim() !== instanceName) {
    throw new Error(`ux_semantic_derivation_packet_v1 instance_name mismatch: expected ${instanceName}, found ${String(packet.instance_name).trim()}`);
  }

  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_scope_semantic_projection_v1', renderScope(ensureObject(packet.scope_and_actors, 'scope_and_actors')));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_pm_intent_semantic_projection_v1', renderPmIntent(ensureObject(packet.pm_intent, 'pm_intent')));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_core_journeys_semantic_projection_v1', renderJourneys(packet.core_journeys));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_interaction_surfaces_semantic_projection_v1', renderSurfaces(packet.interaction_surfaces));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_visual_direction_semantic_projection_v1', renderVisualDirection(packet.visual_direction));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_pattern_pressures_semantic_projection_v1', renderPatternPressures(packet.pattern_pressures));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_state_recovery_semantic_projection_v1', renderStateAndRecovery(packet.state_and_recovery));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_touchpoints_constraints_semantic_projection_v1', renderTouchpointsAndConstraints(packet.touchpoints_and_constraints));
  uxDesign = replaceManagedBlock(uxDesign, 'caf_ux_interface_contract_pressures_semantic_projection_v1', renderInterfaceContractPressures(packet.interface_contract_pressures));

  if (!uxDesign.endsWith('\n')) uxDesign += '\n';
  await writeUtf8(uxDesignPath, uxDesign);
  console.log(path.relative(repoRoot, uxDesignPath));
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
