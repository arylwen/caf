#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { parseYamlString } from './lib_yaml_v2.mjs';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { renderFeedbackPacketV1, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';

const require = createRequire(import.meta.url);
const jsyaml = require('./vendor/js-yaml.min.js');

function die(msg, code = 1) {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function ensureDir(dirAbs) {
  fs.mkdirSync(dirAbs, { recursive: true });
}

function rel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).replace(/\\/g, '/');
}

function slugify(x) {
  return String(x ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function upperToken(x) {
  return String(x ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-');
}

function humanTitleFromSlug(x) {
  return String(x ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function writePacket(repoRoot, instanceName, slug, params) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = renderFeedbackPacketV1({
    title: params.title || 'pattern obligation compiler',
    instanceName,
    stuckAt: 'tools/caf/compile_pattern_obligations_v1.mjs',
    severity: params.severity || 'blocker',
    observedConstraint: params.observedConstraint || 'Unable to compile pattern obligations deterministically',
    gapType: params.gapType || 'Deterministic compilation failure | Missing structured input',
    minimalFixLines: params.minimalFixLines || [],
    evidenceLines: params.evidenceLines || [],
    agentGuidanceLines: params.agentGuidanceLines || [
      'Do not hand-author pattern_obligations_v1.yaml to work around compiler/input drift.',
      'Repair the named structured inputs or compiler contract, then rerun /caf plan <name>.',
    ],
    humanGuidanceLines: params.humanGuidanceLines || [
      'Repair the structured source named by this packet, then rerun /caf plan <name>.',
      'If you need to rerun planning from a clean slate, use node tools/caf/planning_reset_v1.mjs <name> overwrite first.',
    ],
  });
  fs.writeFileSync(fp, body, 'utf8');
  return fp;
}

function readTextOrPacket(repoRoot, instanceName, absPath, purpose) {
  if (!fs.existsSync(absPath)) {
    const fp = writePacket(repoRoot, instanceName, 'pattern-obligation-compiler-missing-input', {
      observedConstraint: `Missing required structured input for obligation compilation: ${rel(repoRoot, absPath)}`,
      minimalFixLines: [
        'Run /caf arch <name> so the design-stage structured inputs are regenerated.',
        'Rerun /caf plan <name> after the named input exists.',
      ],
      evidenceLines: [`missing: ${rel(repoRoot, absPath)}`, `purpose: ${purpose}`],
    });
    die(fp, 10);
  }
  return fs.readFileSync(absPath, 'utf8');
}

function parseYamlOrPacket(repoRoot, instanceName, absPath, purpose) {
  try {
    return parseYamlString(readTextOrPacket(repoRoot, instanceName, absPath, purpose), absPath) || {};
  } catch (e) {
    const fp = writePacket(repoRoot, instanceName, 'pattern-obligation-compiler-yaml-parse-failed', {
      observedConstraint: `Failed to parse structured input for obligation compilation: ${rel(repoRoot, absPath)}`,
      minimalFixLines: [
        'Fix the YAML syntax or CAF-managed structure in the named file.',
        'Rerun /caf arch <name> or /caf plan <name> after the structured input is valid.',
      ],
      evidenceLines: [`file: ${rel(repoRoot, absPath)}`, `purpose: ${purpose}`, `error: ${String(e?.message || e)}`],
    });
    die(fp, 11);
  }
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

function extractCafManagedYaml(mdText, blockId) {
  const block = extractBlock(mdText, `<!-- CAF_MANAGED_BLOCK: ${blockId} START -->`, `<!-- CAF_MANAGED_BLOCK: ${blockId} END -->`);
  if (!block) return null;
  return extractYamlFence(block);
}

function readPlanningPayloadOrPacket(repoRoot, instanceName, absPath) {
  const md = readTextOrPacket(repoRoot, instanceName, absPath, 'planning payload extraction');
  const yamlText = extractCafManagedYaml(md, 'planning_pattern_payload_v1');
  if (!yamlText) {
    const fp = writePacket(repoRoot, instanceName, 'pattern-obligation-compiler-missing-planning-payload', {
      observedConstraint: `Missing CAF_MANAGED_BLOCK: planning_pattern_payload_v1 in ${rel(repoRoot, absPath)}`,
      minimalFixLines: [
        'Rerun /caf arch <name> so the design-stage planning payload is regenerated.',
        'Do not hand-author pattern_obligations_v1.yaml to compensate for missing design payload state.',
      ],
      evidenceLines: [`file: ${rel(repoRoot, absPath)}`],
    });
    die(fp, 12);
  }
  try {
    return parseYamlString(yamlText, absPath) || {};
  } catch (e) {
    const fp = writePacket(repoRoot, instanceName, 'pattern-obligation-compiler-planning-payload-parse-failed', {
      observedConstraint: `Unable to parse planning_pattern_payload_v1 in ${rel(repoRoot, absPath)}`,
      minimalFixLines: [
        'Repair the CAF-managed planning payload block by rerunning /caf arch <name>.',
        'Rerun /caf plan <name> after the payload parses cleanly.',
      ],
      evidenceLines: [`file: ${rel(repoRoot, absPath)}`, `error: ${String(e?.message || e)}`],
    });
    die(fp, 13);
  }
}

function collectPayloadUnion(payloads) {
  const selected = new Set();
  const optionChoices = [];
  const seenChoices = new Set();
  for (const payload of payloads) {
    const selectedPatterns = payload?.selected_patterns || {};
    for (const arr of Object.values(selectedPatterns)) {
      if (!Array.isArray(arr)) continue;
      for (const id of arr) {
        const v = String(id || '').trim();
        if (v) selected.add(v);
      }
    }
    const arr = Array.isArray(payload?.adopted_option_choices) ? payload.adopted_option_choices : [];
    for (const choice of arr) {
      if (!choice || typeof choice !== 'object') continue;
      const normalized = {
        source: String(choice.source || '').trim(),
        evidence_hook_id: String(choice.evidence_hook_id || '').trim(),
        pattern_id: String(choice.pattern_id || '').trim(),
        question_id: String(choice.question_id || '').trim(),
        option_set_id: String(choice.option_set_id || '').trim(),
        option_id: String(choice.option_id || '').trim(),
        summary: String(choice.summary || '').trim(),
      };
      if (!normalized.pattern_id || !normalized.question_id || !normalized.option_id) continue;
      const key = [normalized.source, normalized.evidence_hook_id, normalized.pattern_id, normalized.question_id, normalized.option_set_id, normalized.option_id].join('|');
      if (seenChoices.has(key)) continue;
      seenChoices.add(key);
      optionChoices.push(normalized);
    }
  }
  return { selectedPatterns: selected, adoptedOptionChoices: optionChoices };
}

function loadRetrievalSurfaceMap(repoRoot, instanceName, payload) {
  const relPath = String(payload?.generated_from?.retrieval_surface_path || 'architecture_library/patterns/retrieval_surface_v1/pattern_retrieval_surface_v1.jsonl').trim();
  const absPath = path.join(repoRoot, relPath);
  const text = readTextOrPacket(repoRoot, instanceName, absPath, 'retrieval surface map');
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed);
      const id = String(obj?.id || '').trim();
      if (!id) continue;
      map.set(id, obj);
    } catch {
      // ignore malformed lines to preserve older registries
    }
  }
  return { map, relPath };
}

function inferPlaneScopeFromPlane(plane) {
  const p = String(plane || '').trim().toLowerCase();
  if (p === 'control') return 'CP';
  if (p === 'application') return 'AP';
  if (p === 'data') return 'DP';
  if (p === 'ai') return 'AI';
  if (p === 'state' || p === 'storage') return 'ST';
  return 'cross_plane';
}


function inferPlaneScopeFromPath(relPath) {
  const norm = String(relPath || '').trim().replace(/\\/g, '/').toLowerCase();
  if (!norm) return 'cross_plane';
  if (norm.startsWith('code/ap/')) return 'AP';
  if (norm.startsWith('code/cp/')) return 'CP';
  if (norm.startsWith('code/dp/')) return 'DP';
  if (norm.startsWith('code/st/')) return 'ST';
  if (norm.startsWith('code/ai/')) return 'AI';
  if (norm.startsWith('ui/') || norm.startsWith('ux/') || norm.startsWith('frontend/')) return 'AP';
  return 'cross_plane';
}

function collectRoleBindingPaths(roleBinding) {
  const out = [];
  const push = (value) => {
    const s = String(value || '').trim();
    if (s) out.push(s);
  };
  push(roleBinding?.path_template);
  for (const value of Array.isArray(roleBinding?.path_templates_any_of) ? roleBinding.path_templates_any_of : []) push(value);
  return Array.from(new Set(out));
}

function inferPlaneScopeFromRoleBinding(manifest, roleBindingKey, obligationId, capabilityId) {
  if (String(capabilityId || '').trim() === 'ui_frontend_scaffolding') return 'AP';

  const bindings = manifest?.layout?.role_bindings && typeof manifest.layout.role_bindings === 'object'
    ? manifest.layout.role_bindings
    : {};
  const binding = bindings && typeof bindings === 'object' ? bindings[String(roleBindingKey || '').trim()] : null;
  const scopes = Array.from(new Set(
    collectRoleBindingPaths(binding)
      .map((value) => inferPlaneScopeFromPath(value))
      .filter((value) => value !== 'cross_plane')
  ));
  if (scopes.length === 1) return scopes[0];
  if (scopes.length > 1) return 'cross_plane';

  const roleKey = String(roleBindingKey || '').trim().toLowerCase();
  if (/^ap(?:_|$)|_ap(?:_|$)/.test(roleKey)) return 'AP';
  if (/^cp(?:_|$)|_cp(?:_|$)/.test(roleKey)) return 'CP';
  if (/^dp(?:_|$)|_dp(?:_|$)/.test(roleKey)) return 'DP';
  if (/^st(?:_|$)|_st(?:_|$)/.test(roleKey)) return 'ST';
  if (/^ai(?:_|$)|_ai(?:_|$)/.test(roleKey)) return 'AI';

  const obligation = String(obligationId || '').trim().toLowerCase();
  if (obligation.includes('-ap-')) return 'AP';
  if (obligation.includes('-cp-')) return 'CP';
  if (obligation.includes('-dp-')) return 'DP';
  if (obligation.includes('-st-')) return 'ST';
  if (obligation.includes('-ai-')) return 'AI';

  return 'cross_plane';
}

function readYamlFromDefinition(repoRoot, relPath) {
  const abs = path.join(repoRoot, relPath);
  if (!fs.existsSync(abs)) return null;
  try {
    return parseYamlString(fs.readFileSync(abs, 'utf8'), abs) || null;
  } catch {
    return null;
  }
}

function resolveOptionCapability(repoRoot, retrievalMap, choice) {
  const rec = retrievalMap.get(choice.pattern_id) || null;
  const definitionPath = String(rec?.definition_path || '').trim();
  const defObj = definitionPath ? readYamlFromDefinition(repoRoot, definitionPath) : null;
  const caf = defObj?.caf && typeof defObj.caf === 'object' ? defObj.caf : null;
  const questions = Array.isArray(caf?.human_questions) ? caf.human_questions : [];
  const q = questions.find((item) => String(item?.question_id || '').trim() === choice.question_id) || null;
  const attachments = Array.isArray(q?.semantic_acceptance?.attachments) ? q.semantic_acceptance.attachments : [];
  const caps = [];
  for (const att of attachments) {
    const rc = Array.isArray(att?.required_capabilities) ? att.required_capabilities : [];
    for (const cap of rc) {
      const v = String(cap || '').trim();
      if (v) caps.push(v);
    }
  }
  const uniq = Array.from(new Set(caps));
  if (uniq.includes('contract_scaffolding') && uniq.includes('runtime_wiring')) return 'runtime_wiring';
  if (uniq.length === 1) return uniq[0];
  if (uniq.includes('observability_and_config')) return 'observability_and_config';
  if (uniq.includes('ui_frontend_scaffolding')) return 'ui_frontend_scaffolding';
  if (uniq.includes('policy_enforcement')) return 'policy_enforcement';
  if (uniq.includes('runtime_wiring')) return 'runtime_wiring';
  if (uniq.includes('api_boundary_implementation')) return 'api_boundary_implementation';
  return 'policy_enforcement';
}

function dedupeSources(sources) {
  const out = [];
  const seen = new Set();
  for (const src of sources) {
    const p = String(src?.path || '').trim();
    const a = String(src?.anchor || '').trim();
    if (!p || !a) continue;
    const key = `${p}|${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ path: p, anchor: a });
  }
  return out;
}

function pushObligation(arr, seen, payload) {
  const id = String(payload?.obligation_id || '').trim();
  if (!id || seen.has(id)) return;
  seen.add(id);
  arr.push({
    obligation_id: id,
    obligation_kind: payload.obligation_kind,
    plane_scope: payload.plane_scope,
    capability_id: payload.capability_id,
    description: payload.description,
    sources: dedupeSources(payload.sources || []),
    selected_pattern_ids: Array.from(new Set((payload.selected_pattern_ids || []).map((x) => String(x || '').trim()).filter(Boolean))),
  });
}

function selectedIntersection(selectedSet, ids) {
  const out = [];
  for (const id of ids) {
    if (selectedSet.has(id)) out.push(id);
  }
  return out;
}

function buildObligations(repoRoot, instanceName, layout, inputs) {
  const obligations = [];
  const seen = new Set();
  const selectedSet = inputs.selectedPatterns;
  const profile = inputs.profile;
  const appModel = inputs.appModel;
  const systemModel = inputs.systemModel;
  const contracts = Array.isArray(inputs.contracts?.contracts) ? inputs.contracts.contracts : [];
  const retrievalMap = inputs.retrievalMap;

  const phase = String(profile?.lifecycle?.generation_phase || '').trim();
  const cpRuntime = String(profile?.planes?.cp?.runtime_shape || '').trim();
  const apRuntime = String(profile?.planes?.ap?.runtime_shape || '').trim();

  if (cpRuntime) {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-PLANE-CP-RUNTIME-SCAFFOLD',
      obligation_kind: 'other',
      plane_scope: 'CP',
      capability_id: 'plane_runtime_scaffolding',
      description: `Scaffold the control plane runtime for the adopted ${cpRuntime} shape.`,
      sources: [{ path: rel(inputs.repoRoot, inputs.profilePathAbs), anchor: `planes.cp.runtime_shape=${cpRuntime}` }],
      selected_pattern_ids: [],
    });
  }
  if (apRuntime) {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-PLANE-AP-RUNTIME-SCAFFOLD',
      obligation_kind: 'other',
      plane_scope: 'AP',
      capability_id: 'plane_runtime_scaffolding',
      description: `Scaffold the application plane runtime for the adopted ${apRuntime} shape.`,
      sources: [{ path: rel(inputs.repoRoot, inputs.profilePathAbs), anchor: `planes.ap.runtime_shape=${apRuntime}` }],
      selected_pattern_ids: [],
    });
  }

  const materialContracts = contracts.filter((c) => c?.materiality?.is_material === true && String(c?.boundary_id || '').trim());
  for (const contract of materialContracts) {
    const boundaryId = String(contract.boundary_id).trim();
    const boundaryPatterns = selectedIntersection(selectedSet, ['CAF-PLANE-01', 'CAF-XPLANE-01']);
    const source = {
      path: rel(inputs.repoRoot, inputs.contractsPathAbs),
      anchor: `contracts boundary_id=${boundaryId}`,
    };
    pushObligation(obligations, seen, {
      obligation_id: `OBL-CONTRACT-${boundaryId}-AP`,
      obligation_kind: 'contract_scaffolding',
      plane_scope: 'cross_plane',
      capability_id: 'contract_scaffolding',
      description: `Scaffold the AP side of the material ${boundaryId} contract boundary.`,
      sources: [source],
      selected_pattern_ids: boundaryPatterns,
    });
    pushObligation(obligations, seen, {
      obligation_id: `OBL-CONTRACT-${boundaryId}-CP`,
      obligation_kind: 'contract_scaffolding',
      plane_scope: 'cross_plane',
      capability_id: 'contract_scaffolding',
      description: `Scaffold the CP side of the material ${boundaryId} contract boundary.`,
      sources: [source],
      selected_pattern_ids: boundaryPatterns,
    });
  }

  if (materialContracts.length > 0) {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-CP-POLICY-SURFACE',
      obligation_kind: 'auth',
      plane_scope: 'cross_plane',
      capability_id: 'policy_enforcement',
      description: 'Expose the CP policy and safety evaluation surface for AP requests.',
      sources: [{ path: rel(inputs.repoRoot, inputs.cpDesignPathAbs), anchor: 'Plane Integration Contract (CP ↔ AP)' }],
      selected_pattern_ids: selectedIntersection(selectedSet, ['CAF-POL-01']),
    });
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-AP-POLICY-ENFORCEMENT',
      obligation_kind: 'auth',
      plane_scope: 'cross_plane',
      capability_id: 'policy_enforcement',
      description: 'Enforce CP-governed policy decisions on AP runtime surfaces.',
      sources: [{ path: rel(inputs.repoRoot, inputs.systemSpecPathAbs), anchor: 'pattern_id=CAF-POL-01' }],
      selected_pattern_ids: selectedIntersection(selectedSet, ['CAF-POL-01']),
    });
  }

  const hasTenantContext = selectedSet.has('CAF-TCTX-01') || inputs.adoptedOptionChoices.some((choice) => choice.pattern_id === 'CAF-TCTX-01');
  if (hasTenantContext) {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-TENANT-CONTEXT-PROPAGATION',
      obligation_kind: 'tenant_context',
      plane_scope: 'cross_plane',
      capability_id: 'policy_enforcement',
      description: 'Propagate tenant context through the adopted carrier and reject conflicting carriers.',
      sources: [{ path: rel(inputs.repoRoot, inputs.systemSpecPathAbs), anchor: 'pattern_id=CAF-TCTX-01' }],
      selected_pattern_ids: selectedIntersection(selectedSet, ['CAF-TCTX-01']),
    });
  }

  if (apRuntime) {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-AP-AUTH-MODE',
      obligation_kind: 'auth',
      plane_scope: 'cross_plane',
      capability_id: 'policy_enforcement',
      description: `Realize the selected ${String(profile?.platform?.auth_mode || 'auth').trim()} auth runtime contract for AP ingress and CP to AP decisions.`,
      sources: [{ path: rel(inputs.repoRoot, inputs.profilePathAbs), anchor: `platform.auth_mode=${String(profile?.platform?.auth_mode || '').trim()}` }],
      selected_pattern_ids: selectedIntersection(selectedSet, ['CAF-IAM-02', 'CAF-TCTX-01']),
    });
  }

  const resources = Array.isArray(appModel?.api_candidates?.resources) ? appModel.api_candidates.resources : [];
  for (const resource of resources) {
    const name = String(resource?.name || '').trim();
    if (!name) continue;
    const token = upperToken(name);
    const source = { path: rel(inputs.repoRoot, inputs.appModelPathAbs), anchor: `api_candidates.resources name=${name}` };
    pushObligation(obligations, seen, {
      obligation_id: `OBL-AP-RESOURCE-${token}-API`,
      obligation_kind: 'api_boundary',
      plane_scope: 'AP',
      capability_id: 'api_boundary_implementation',
      description: `Expose the ${name} API boundary with tenant-scoped handlers and composition endpoints.`,
      sources: [source],
      selected_pattern_ids: selectedIntersection(selectedSet, ['EXT-API_COMPOSITION_AGGREGATOR']),
    });
    pushObligation(obligations, seen, {
      obligation_id: `OBL-AP-RESOURCE-${token}-SERVICE`,
      obligation_kind: 'other',
      plane_scope: 'AP',
      capability_id: 'service_facade_implementation',
      description: `Provide the ${name} application service facade between boundary handling and persistence.`,
      sources: [source],
      selected_pattern_ids: selectedIntersection(selectedSet, ['SVC-01']),
    });
    pushObligation(obligations, seen, {
      obligation_id: `OBL-AP-RESOURCE-${token}-PERSISTENCE`,
      obligation_kind: 'persistence_boundary',
      plane_scope: 'AP',
      capability_id: 'persistence_implementation',
      description: `Provide a tenant-scoped persistence boundary for the ${name} resource aligned to the resolved persistence rails.`,
      sources: [source],
      selected_pattern_ids: selectedIntersection(selectedSet, ['PST-01']),
    });
  }

  const contexts = Array.isArray(systemModel?.domain?.bounded_contexts) ? systemModel.domain.bounded_contexts : [];
  for (const ctx of contexts) {
    for (const aggregate of Array.isArray(ctx?.aggregates) ? ctx.aggregates : []) {
      if (aggregate?.persistence?.required !== true) continue;
      const name = String(aggregate?.name || aggregate?.aggregate_id || '').trim();
      if (!name) continue;
      const token = upperToken(name);
      pushObligation(obligations, seen, {
        obligation_id: `OBL-CP-ENTITY-${token}-PERSISTENCE`,
        obligation_kind: 'other',
        plane_scope: 'CP',
        capability_id: 'persistence_implementation',
        description: `Provide control-plane persistence surfaces for the ${name} aggregate.`,
        sources: [{ path: rel(inputs.repoRoot, inputs.systemModelPathAbs), anchor: `aggregates name=${name}` }],
        selected_pattern_ids: [],
      });
    }
  }

  const requireRuntimeWiring = profile?.candidate_enforcement_bar?.runnable_policy?.require_runtime_wiring === true;
  if (requireRuntimeWiring || phase === 'implementation_scaffolding') {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-RUNTIME-WIRING',
      obligation_kind: 'other',
      plane_scope: 'cross_plane',
      capability_id: 'runtime_wiring',
      description: 'Wire the generated candidate runtime surfaces into one coherent local run flow.',
      sources: [{ path: rel(inputs.repoRoot, inputs.profilePathAbs), anchor: 'candidate_enforcement_bar.runnable_policy.require_runtime_wiring=true' }],
      selected_pattern_ids: [],
    });
  }

  const requireUnit = profile?.candidate_enforcement_bar?.test_policy?.require_unit === true;
  if (requireUnit) {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-UNIT-TESTS',
      obligation_kind: 'other',
      plane_scope: 'cross_plane',
      capability_id: 'unit_test_scaffolding',
      description: 'Provide unit-test coverage for the candidate runtime surfaces.',
      sources: [{ path: rel(inputs.repoRoot, inputs.profilePathAbs), anchor: 'candidate_enforcement_bar.test_policy.require_unit=true' }],
      selected_pattern_ids: [],
    });
  }

  if (phase === 'implementation_scaffolding') {
    pushObligation(obligations, seen, {
      obligation_id: 'OBL-REPO-README',
      obligation_kind: 'other',
      plane_scope: 'cross_plane',
      capability_id: 'repo_documentation',
      description: 'Document how to run the candidate stack and diagnose the generated output locally.',
      sources: [{ path: rel(inputs.repoRoot, inputs.profilePathAbs), anchor: 'lifecycle.generation_phase=implementation_scaffolding' }],
      selected_pattern_ids: [],
    });
  }

  for (const choice of inputs.adoptedOptionChoices) {
    const capability = resolveOptionCapability(repoRoot, retrievalMap, choice);
    pushObligation(obligations, seen, {
      obligation_id: `OBL-OPT-${choice.pattern_id}-${choice.question_id}-${choice.option_id}`,
      obligation_kind: 'other',
      plane_scope: 'cross_plane',
      capability_id: capability,
      description: choice.summary || `Realize the adopted option ${choice.option_id} for ${choice.pattern_id}/${choice.question_id}.`,
      sources: [{ path: rel(inputs.repoRoot, inputs.appDesignPathAbs), anchor: `adopted_option_choices pattern_id=${choice.pattern_id} question_id=${choice.question_id} option_id=${choice.option_id}` }],
      selected_pattern_ids: [choice.pattern_id],
    });
  }

  const resolvedTbps = Array.isArray(inputs.tbpResolution?.resolved_tbps) ? inputs.tbpResolution.resolved_tbps : [];
  for (const tbpIdRaw of resolvedTbps) {
    const tbpId = String(tbpIdRaw || '').trim();
    if (!tbpId) continue;
    const manifestRel = `architecture_library/phase_8/tbp/atoms/${tbpId}/tbp_manifest_v1.yaml`;
    const manifestAbs = path.join(inputs.repoRoot, manifestRel);
    if (!fs.existsSync(manifestAbs)) continue;
    const manifest = parseYamlString(fs.readFileSync(manifestAbs, 'utf8'), manifestAbs) || {};
    const obligationsFromManifest = Array.isArray(manifest?.extensions?.obligations) ? manifest.extensions.obligations : [];
    for (const item of obligationsFromManifest) {
      const obligationId = String(item?.obligation_id || '').trim();
      const title = String(item?.title || '').trim();
      const capabilityId = String(item?.required_capability || '').trim();
      const roleBindingKey = String(item?.role_binding_key || '').trim();
      if (!obligationId || !capabilityId) continue;
      pushObligation(obligations, seen, {
        obligation_id: obligationId,
        obligation_kind: 'other',
        plane_scope: inferPlaneScopeFromRoleBinding(manifest, roleBindingKey, obligationId, capabilityId),
        capability_id: capabilityId,
        description: `${title}${title.includes('(TBP:') ? '' : ` (TBP: ${tbpId})`}`,
        sources: [{ path: manifestRel, anchor: `extensions.obligations obligation_id=${obligationId}` }],
        selected_pattern_ids: [],
      });
    }
  }

  return obligations;
}

function writeYaml(absPath, obj) {
  const yaml = jsyaml.dump(obj, { lineWidth: -1, noRefs: true, sortKeys: false });
  fs.writeFileSync(absPath, yaml, 'utf8');
}

function writeIndex(absPath, obligations) {
  const header = 'obligation_id\tobligation_kind\tcapability_id\tplane_scope\tdescription';
  const rows = obligations.map((o) => [o.obligation_id, o.obligation_kind, o.capability_id, o.plane_scope, String(o.description || '').replace(/\t/g, ' ')].join('\t'));
  fs.writeFileSync(absPath, `${header}\n${rows.join('\n')}\n`, 'utf8');
}

const instanceName = process.argv[2];
if (!instanceName) die('Usage: node tools/caf/compile_pattern_obligations_v1.mjs <instance_name>', 2);

const repoRoot = resolveRepoRoot();
const layout = getInstanceLayout(repoRoot, instanceName);
const appDesignPathAbs = path.join(layout.designPlaybookDir, 'application_design_v1.md');
const cpDesignPathAbs = path.join(layout.designPlaybookDir, 'control_plane_design_v1.md');
const profilePathAbs = path.join(layout.specGuardrailsDir, 'profile_parameters_resolved.yaml');
const tbpResolutionPathAbs = path.join(layout.specGuardrailsDir, 'tbp_resolution_v1.yaml');
const contractsPathAbs = path.join(layout.designPlaybookDir, 'contract_declarations_v1.yaml');
const appModelPathAbs = path.join(layout.designPlaybookDir, 'application_domain_model_v1.yaml');
const systemModelPathAbs = path.join(layout.designPlaybookDir, 'system_domain_model_v1.yaml');
const systemSpecPathAbs = path.join(layout.specPlaybookDir, 'system_spec_v1.md');

const appPayload = readPlanningPayloadOrPacket(repoRoot, instanceName, appDesignPathAbs);
const cpPayload = readPlanningPayloadOrPacket(repoRoot, instanceName, cpDesignPathAbs);
const union = collectPayloadUnion([appPayload, cpPayload]);
const retrieval = loadRetrievalSurfaceMap(repoRoot, instanceName, appPayload);

const profile = parseYamlOrPacket(repoRoot, instanceName, profilePathAbs, 'resolved profile parameters');
const tbpResolution = parseYamlOrPacket(repoRoot, instanceName, tbpResolutionPathAbs, 'TBP resolution');
const contracts = parseYamlOrPacket(repoRoot, instanceName, contractsPathAbs, 'contract declarations');
const appModel = parseYamlOrPacket(repoRoot, instanceName, appModelPathAbs, 'application domain model');
const systemModel = parseYamlOrPacket(repoRoot, instanceName, systemModelPathAbs, 'system domain model');
readTextOrPacket(repoRoot, instanceName, systemSpecPathAbs, 'system spec grounding');

const obligations = buildObligations(repoRoot, instanceName, layout, {
  repoRoot,
  profile,
  profilePathAbs,
  tbpResolution,
  contracts,
  contractsPathAbs,
  appModel,
  appModelPathAbs,
  systemModel,
  systemModelPathAbs,
  systemSpecPathAbs,
  appDesignPathAbs,
  cpDesignPathAbs,
  appPayload,
  cpPayload,
  retrievalMap: retrieval.map,
  selectedPatterns: union.selectedPatterns,
  adoptedOptionChoices: union.adoptedOptionChoices,
});

const manifestInputs = Array.from(new Set((Array.isArray(tbpResolution?.resolved_tbps) ? tbpResolution.resolved_tbps : [])
  .map((tbpId) => String(tbpId || '').trim())
  .filter(Boolean)
  .map((tbpId) => `architecture_library/phase_8/tbp/atoms/${tbpId}/tbp_manifest_v1.yaml`)));

const generatedFromInputs = [
  rel(repoRoot, profilePathAbs),
  rel(repoRoot, tbpResolutionPathAbs),
  rel(repoRoot, path.join(layout.specGuardrailsDir, 'abp_pbp_resolution_v1.yaml')),
  rel(repoRoot, path.join(layout.specPlaybookDir, 'architecture_shape_parameters.yaml')),
  rel(repoRoot, systemSpecPathAbs),
  rel(repoRoot, path.join(layout.specPlaybookDir, 'application_spec_v1.md')),
  rel(repoRoot, appModelPathAbs),
  rel(repoRoot, systemModelPathAbs),
  rel(repoRoot, appDesignPathAbs),
  rel(repoRoot, cpDesignPathAbs),
  rel(repoRoot, contractsPathAbs),
  retrieval.relPath,
  ...manifestInputs,
];

const outObj = {
  schema_version: 'pattern_obligations_v1',
  generated_from: { inputs: generatedFromInputs },
  obligations,
};
const obligationsPathAbs = path.join(layout.designPlaybookDir, 'pattern_obligations_v1.yaml');
const indexPathAbs = path.join(layout.designPlaybookDir, 'pattern_obligations_index_v1.tsv');
writeYaml(obligationsPathAbs, outObj);
writeIndex(indexPathAbs, obligations);
process.stdout.write(`${rel(repoRoot, obligationsPathAbs)}\n`);
