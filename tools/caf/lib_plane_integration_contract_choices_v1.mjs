#!/usr/bin/env node
/**
 * CAF scripted helper (mechanical only)
 *
 * Shared parser/validator for the canonical architect-edit plane integration
 * contract choices block inside control_plane_design_v1.md.
 */

import { parseYamlString } from './lib_yaml_v2.mjs';

function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function extractBlock(text, startMarker, endMarker) {
  const s = String(text ?? '').indexOf(startMarker);
  if (s < 0) return null;
  const e = String(text ?? '').indexOf(endMarker, s);
  if (e < 0) return null;
  return String(text ?? '').slice(s, e + endMarker.length);
}

function extractYamlFence(blockText) {
  const lines = String(blockText ?? '').split(/\r?\n/);
  let startLine = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (t === '```yaml' || t.startsWith('```yaml ')) {
      startLine = i + 1;
      break;
    }
  }
  if (startLine < 0) return null;
  let endLine = -1;
  for (let i = startLine; i < lines.length; i += 1) {
    if (lines[i].trim() === '```') {
      endLine = i;
      break;
    }
  }
  if (endLine < 0) return null;
  return lines.slice(startLine, endLine).join('\n');
}

export function extractArchitectEditYaml(mdText, blockId) {
  const block = extractBlock(
    mdText,
    `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} START -->`,
    `<!-- ARCHITECT_EDIT_BLOCK: ${blockId} END -->`,
  );
  if (!block) return null;
  return extractYamlFence(block);
}

export function parsePlaneIntegrationContractChoicesMarkdown(mdText, sourcePath = 'plane_integration_contract_choices_v1') {
  const yamlText = extractArchitectEditYaml(mdText, 'plane_integration_contract_choices_v1');
  if (!yamlText) {
    return {
      ok: false,
      kind: 'missing_block',
      yamlText: null,
      obj: null,
      issues: ['missing ARCHITECT_EDIT_BLOCK: plane_integration_contract_choices_v1'],
    };
  }
  let obj = null;
  try {
    obj = parseYamlString(yamlText, sourcePath) || {};
  } catch (e) {
    return {
      ok: false,
      kind: 'yaml_parse',
      yamlText,
      obj: null,
      issues: [String(e?.message ?? e)],
    };
  }
  const issues = validatePlaneIntegrationContractChoicesObject(obj);
  return {
    ok: issues.length === 0,
    kind: issues.length === 0 ? 'ok' : 'schema_or_invariant',
    yamlText,
    obj,
    issues,
  };
}

function validateChoiceBlock(block, config) {
  const issues = [];
  if (!block || typeof block !== 'object' || Array.isArray(block)) {
    issues.push(`choices.${config.key} must be an object`);
    return issues;
  }
  const questionId = normalizeScalar(block.question_id);
  const question = normalizeScalar(block.question);
  if (!questionId) issues.push(`choices.${config.key}.question_id must be non-empty`);
  if (!question) issues.push(`choices.${config.key}.question must be non-empty`);
  const options = Array.isArray(block.options) ? block.options : null;
  if (!options) {
    issues.push(`choices.${config.key}.options must be an array`);
    return issues;
  }
  if (options.length < 2) issues.push(`choices.${config.key}.options must contain at least 2 options`);
  let adoptedCount = 0;
  const seenOptionIds = new Set();
  for (let i = 0; i < options.length; i += 1) {
    const item = options[i];
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      issues.push(`choices.${config.key}.options[${i}] must be an object`);
      continue;
    }
    const optionId = normalizeScalar(item.option_id);
    const status = normalizeScalar(item.status);
    if (!optionId) {
      issues.push(`choices.${config.key}.options[${i}].option_id must be non-empty`);
    } else {
      if (!config.allowedOptionIds.has(optionId)) {
        issues.push(`choices.${config.key}.options[${i}].option_id is not canonical: ${optionId}`);
      }
      if (seenOptionIds.has(optionId)) issues.push(`choices.${config.key}.options contains duplicate option_id: ${optionId}`);
      seenOptionIds.add(optionId);
    }
    if (!['adopt', 'defer', 'reject'].includes(status)) {
      issues.push(`choices.${config.key}.options[${i}].status must be adopt|defer|reject`);
    }
    if (status === 'adopt') adoptedCount += 1;
  }
  if (adoptedCount !== 1) {
    issues.push(`choices.${config.key} must adopt exactly one option (observed ${adoptedCount})`);
  }
  return issues;
}

export function validatePlaneIntegrationContractChoicesObject(obj) {
  const issues = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return ['top-level document must be an object'];
  }
  const schemaVersion = normalizeScalar(obj.schema_version);
  if (schemaVersion !== 'plane_integration_contract_choices_v1') {
    issues.push(`schema_version must be plane_integration_contract_choices_v1 (observed ${schemaVersion || '(missing)'})`);
  }
  const choices = obj.choices;
  if (!choices || typeof choices !== 'object' || Array.isArray(choices)) {
    issues.push('choices must be an object');
    return issues;
  }
  const configs = [
    {
      key: 'cp_runtime_shape',
      allowedOptionIds: new Set(['api_service_http', 'worker_service_events', 'library_embedded', 'custom']),
    },
    {
      key: 'ap_runtime_shape',
      allowedOptionIds: new Set(['api_service_http', 'worker_service_events', 'library_embedded', 'custom']),
    },
    {
      key: 'cp_ap_contract_surface',
      allowedOptionIds: new Set(['synchronous_http', 'synchronous_api', 'async_events', 'mixed', 'custom']),
    },
  ];
  for (const config of configs) {
    if (!(config.key in choices)) {
      issues.push(`choices.${config.key} is required`);
      continue;
    }
    issues.push(...validateChoiceBlock(choices[config.key], config));
  }
  return issues;
}

export function resolveAdoptedPlaneIntegrationChoice(obj, key) {
  const block = obj?.choices && typeof obj.choices === 'object' ? obj.choices[key] : null;
  const options = Array.isArray(block?.options) ? block.options : [];
  const adopted = options.filter((item) => normalizeScalar(item?.status) === 'adopt');
  if (adopted.length !== 1) return null;
  return normalizeScalar(adopted[0]?.option_id) || null;
}

export function deriveContractSurfaceFromPlaneIntegrationChoices(obj) {
  const optionId = resolveAdoptedPlaneIntegrationChoice(obj, 'cp_ap_contract_surface');
  if (optionId === 'mixed') return 'mixed';
  if (optionId === 'async_events') return 'async_events';
  if (optionId === 'synchronous_api' || optionId === 'synchronous_http') return 'synchronous_http';
  return 'custom';
}
