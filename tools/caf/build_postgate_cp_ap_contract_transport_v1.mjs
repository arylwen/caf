#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { resolveRepoRoot } from './lib_repo_root_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, resolveFeedbackPacketsBySlugSync } from './lib_feedback_packets_v1.mjs';
import { resolveConcreteRoleBindingPathsForInstance } from './lib_tbp_role_bindings_v1.mjs';

const NAME_RE = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;
const BOUNDARY_ID_SNAKE = 'bnd_cp_ap_01';
const ROLE_KEYS = {
  sharedTransport: 'cp_ap_contract_shared_transport_module',
  apEmitter: 'cp_ap_contract_ap_http_emitter',
  cpHandler: 'cp_ap_contract_cp_http_handler',
  apEnvelope: 'cp_ap_contract_ap_envelope',
  cpEnvelope: 'cp_ap_contract_cp_envelope',
  cpBoundaryRouter: 'cp_ap_contract_cp_boundary_router',
};
let WRITE_ALLOWED_ROOTS = null;

function isWithin(childAbs, parentAbs) {
  const rel = path.relative(parentAbs, childAbs);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}
class CafExit extends Error { constructor(code, msg) { super(msg); this.code = code; } }
function die(msg, code = 1) { throw new CafExit(code, msg); }
function nowDateYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
function nowStampYYYYMMDD() {
  const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
async function ensureDir(dirAbs) { await fs.mkdir(dirAbs, { recursive: true }); }
async function writeUtf8(fileAbs, text) {
  const ok = (WRITE_ALLOWED_ROOTS || []).some((rootAbs) => isWithin(fileAbs, rootAbs));
  if (!ok) die(`Write blocked by guardrails: ${fileAbs}`, 98);
  await fs.writeFile(fileAbs, text, { encoding: 'utf-8' });
}
async function readUtf8(p) { return await fs.readFile(p, { encoding: 'utf-8' }); }
function safeRel(repoRoot, absPath) { return path.relative(repoRoot, absPath).replace(/\\/g, '/'); }

async function writeFeedbackPacket(repoRoot, instanceName, slug, observedConstraint, minimalFixLines, evidenceLines) {
  const packetsDir = path.join(repoRoot, 'reference_architectures', instanceName, 'feedback_packets');
  await ensureDir(packetsDir);
  const fp = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${slug}.md`);
  const body = [
    '# Feedback Packet - cp-ap contract transport postgate',
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    `- Instance: ${instanceName}`,
    '- Stuck At: tools/caf/build_postgate_cp_ap_contract_transport_v1.mjs',
    `- Observed Constraint: ${observedConstraint}`,
    '- Gap Type: Contract transport drift',
    '',
    '## Minimal Fix Proposal',
    ...minimalFixLines.map((l) => `- ${l}`),
    '',
    '## Evidence',
    ...evidenceLines.map((l) => `- ${l}`),
    '',
  ].join('\n');
  await writeUtf8(fp, ensureFeedbackPacketHeaderV1(body));
  return fp;
}

async function detectLegacyLocalPolicySurface(paths) {
  const { legacyCpRouterPath, uiApiPath, uxApiPath, apClientPath } = paths;
  if (!existsSync(legacyCpRouterPath)) return false;
  const [legacyCpText, uiText, uxText, apText] = await Promise.all([
    readUtf8(legacyCpRouterPath),
    existsSync(uiApiPath) ? readUtf8(uiApiPath) : Promise.resolve(''),
    existsSync(uxApiPath) ? readUtf8(uxApiPath) : Promise.resolve(''),
    existsSync(apClientPath) ? readUtf8(apClientPath) : Promise.resolve(''),
  ]);
  const legacyRouterHasLocalPolicyEndpoints = legacyCpText.includes('router = APIRouter(prefix="/cp"')
    && legacyCpText.includes('/internal/policy/evaluate')
    && legacyCpText.includes('class PolicyEvaluationRequest')
    && legacyCpText.includes('action: str')
    && legacyCpText.includes('resource: str');
  const browserPreviewUsesLocalPolicyEndpoints = [uiText, uxText].some((text) =>
    text.includes('/cp/internal/policy/evaluate') || text.includes('/cp/internal/policy/admin-probe'));
  const apContractStillUsesLegacyContractScaffold = apText.includes('/cp/contracts/bnd-cp-ap-01/evaluate');
  return legacyRouterHasLocalPolicyEndpoints && browserPreviewUsesLocalPolicyEndpoints && apContractStillUsesLegacyContractScaffold;
}

async function resolveRoleSurfaces(repoRoot, instanceName, companionRoot, roleKey) {
  const matches = await resolveConcreteRoleBindingPathsForInstance(repoRoot, instanceName, roleKey, { boundary_id_snake: BOUNDARY_ID_SNAKE });
  return matches.map((match) => ({
    ...match,
    relative_path: String(match.concrete_path || '').replace(/\\/g, '/'),
    absolute_path: match.concrete_path ? path.join(companionRoot, match.concrete_path) : null,
  }));
}

function chooseExistingSurface(surfaces) {
  return surfaces.find((surface) => surface.absolute_path && existsSync(surface.absolute_path)) || null;
}

function envelopeHasRequiredFields(text) {
  return ['tenant_id', 'principal_id', 'correlation_id', 'payload'].every((token) => text.includes(token));
}

export async function internal_main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? argv : [];
  if (args.length < 1) die('Usage: node tools/caf/build_postgate_cp_ap_contract_transport_v1.mjs <instance_name>', 2);
  const instanceName = args[0];
  if (!NAME_RE.test(instanceName)) die(`Invalid instance_name: ${instanceName}`, 2);
  const repoRoot = resolveRepoRoot();
  const instRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  WRITE_ALLOWED_ROOTS = [path.join(instRoot, 'feedback_packets')];

  const companionRoot = path.join(repoRoot, 'companion_repositories', instanceName, 'profile_v1');
  const legacyCpRouterPath = path.join(companionRoot, 'code', 'cp', 'adapters', 'inbound', 'http', 'router.py');
  const uiApiPath = path.join(companionRoot, 'code', 'ui', 'src', 'api.js');
  const uxApiPath = path.join(companionRoot, 'code', 'ux', 'src', 'api.js');

  const roleSurfaces = {
    sharedTransport: await resolveRoleSurfaces(repoRoot, instanceName, companionRoot, ROLE_KEYS.sharedTransport),
    apEmitter: await resolveRoleSurfaces(repoRoot, instanceName, companionRoot, ROLE_KEYS.apEmitter),
    cpHandler: await resolveRoleSurfaces(repoRoot, instanceName, companionRoot, ROLE_KEYS.cpHandler),
    apEnvelope: await resolveRoleSurfaces(repoRoot, instanceName, companionRoot, ROLE_KEYS.apEnvelope),
    cpEnvelope: await resolveRoleSurfaces(repoRoot, instanceName, companionRoot, ROLE_KEYS.cpEnvelope),
    cpBoundaryRouter: await resolveRoleSurfaces(repoRoot, instanceName, companionRoot, ROLE_KEYS.cpBoundaryRouter),
  };

  const present = Object.fromEntries(Object.entries(roleSurfaces).map(([k, v]) => [k, chooseExistingSurface(v)]));
  const sharedTransportPostureReady = Boolean(present.sharedTransport && present.apEmitter && present.cpBoundaryRouter);
  const splitContractPostureReady = Boolean(present.apEmitter && present.cpHandler && present.apEnvelope && present.cpEnvelope);

  if (!sharedTransportPostureReady && !splitContractPostureReady) {
    const apEmitterPath = present.apEmitter?.absolute_path || path.join(companionRoot, 'code', 'ap', 'contracts', BOUNDARY_ID_SNAKE, 'http_client.py');
    const usesLegacyLocalPolicySurface = await detectLegacyLocalPolicySurface({ legacyCpRouterPath, uiApiPath, uxApiPath, apClientPath: apEmitterPath });
    if (usesLegacyLocalPolicySurface) {
      resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-ap-contract-transport-missing');
      resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-ap-contract-transport-drift');
      return 0;
    }

    const evidence = [];
    if (!present.apEmitter) evidence.push(`Missing role-bound AP HTTP emitter: ${ROLE_KEYS.apEmitter}`);
    if (!present.cpHandler) evidence.push(`Missing role-bound CP HTTP handler: ${ROLE_KEYS.cpHandler}`);
    if (!present.apEnvelope) evidence.push(`Missing role-bound AP envelope: ${ROLE_KEYS.apEnvelope}`);
    if (!present.cpEnvelope) evidence.push(`Missing role-bound CP envelope: ${ROLE_KEYS.cpEnvelope}`);
    if (!present.sharedTransport) evidence.push(`Missing role-bound shared transport module: ${ROLE_KEYS.sharedTransport}`);
    if (!present.cpBoundaryRouter) evidence.push(`Missing role-bound CP boundary router: ${ROLE_KEYS.cpBoundaryRouter}`);

    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-cp-ap-contract-transport-missing',
      'BND-CP-AP-01 transport ownership surfaces are missing for both the shared-transport posture and the split contract-scaffolding posture',
      [
        'Materialize either the role-bound shared transport posture (shared transport + AP emitter + CP boundary router) or the role-bound split contract-scaffolding posture (AP emitter + CP handler + AP/CP envelopes).',
        'Keep boundary realization ownership in TBP role bindings and contract obligations instead of hardcoding file paths in the postgate.',
      ],
      evidence,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 31);
  }

  const readOptional = async (surface) => (surface?.absolute_path && existsSync(surface.absolute_path) ? readUtf8(surface.absolute_path) : '');
  const [sharedTransportText, apEmitterText, cpHandlerText, apEnvelopeText, cpEnvelopeText, cpBoundaryRouterText, uiText, uxText] = await Promise.all([
    readOptional(present.sharedTransport),
    readOptional(present.apEmitter),
    readOptional(present.cpHandler),
    readOptional(present.apEnvelope),
    readOptional(present.cpEnvelope),
    readOptional(present.cpBoundaryRouter),
    existsSync(uiApiPath) ? readUtf8(uiApiPath) : Promise.resolve(''),
    existsSync(uxApiPath) ? readUtf8(uxApiPath) : Promise.resolve(''),
  ]);

  const issues = [];
  if (sharedTransportPostureReady) {
    if (!sharedTransportText.includes('payload') || !sharedTransportText.includes('correlation_id')) {
      issues.push(`${present.sharedTransport.relative_path}: shared transport posture must define the canonical payload/correlation envelope fields`);
    }
    if (!apEmitterText.includes('to_transport_payload(')) {
      issues.push(`${present.apEmitter.relative_path}: AP emitter must serialize through the shared transport module when the shared-transport posture is materialized`);
    }
    if (!cpBoundaryRouterText.includes('parse_transport_payload(')) {
      issues.push(`${present.cpBoundaryRouter.relative_path}: CP boundary router must parse through the shared transport module when the shared-transport posture is materialized`);
    }
  }

  if (splitContractPostureReady) {
    if (!/ContractRequestEnvelope/.test(apEmitterText) || !/ContractResponseEnvelope/.test(apEmitterText) || !apEmitterText.includes('payload')) {
      issues.push(`${present.apEmitter.relative_path}: split contract-scaffolding posture must use ContractRequestEnvelope/ContractResponseEnvelope with payload`);
    }
    if (!/ContractRequestEnvelope/.test(cpHandlerText) || !/ContractResponseEnvelope/.test(cpHandlerText)) {
      issues.push(`${present.cpHandler.relative_path}: split contract-scaffolding posture must use ContractRequestEnvelope/ContractResponseEnvelope`);
    }
    if (!envelopeHasRequiredFields(apEnvelopeText)) {
      issues.push(`${present.apEnvelope.relative_path}: AP envelope must define tenant_id, principal_id, correlation_id, and payload`);
    }
    if (!envelopeHasRequiredFields(cpEnvelopeText)) {
      issues.push(`${present.cpEnvelope.relative_path}: CP envelope must define tenant_id, principal_id, correlation_id, and payload`);
    }
  }

  const browserPreviewsBoundaryEndpoint = [uiText, uxText].some((text) => text.includes('/cp-ap/policy/evaluate'));
  if (browserPreviewsBoundaryEndpoint) {
    if (![uiText, uxText].some((text) => text.includes('tenant_id') && text.includes('principal_id') && text.includes('correlation_id') && text.includes('payload'))) {
      issues.push('Browser-facing preview helpers that post to /cp-ap/policy/evaluate must emit the shared boundary envelope fields tenant_id, principal_id, correlation_id, and payload.action');
    }
    if ([uiText, uxText].some((text) => /body:\s*\{\s*action\s*[,}]/.test(text))) {
      issues.push('Browser-facing preview helpers that post to /cp-ap/policy/evaluate must not emit a flat { action } request body');
    }
  }

  if (issues.length > 0) {
    const fp = await writeFeedbackPacket(
      repoRoot,
      instanceName,
      'build-postgate-cp-ap-contract-transport-drift',
      'BND-CP-AP-01 request transport is not single-sourced or envelope-consistent across the resolved contract posture',
      [
        'When the shared-transport posture is materialized, keep AP emission and CP parsing on the shared transport module.',
        'When the split contract-scaffolding posture is materialized, keep AP and CP envelopes structurally aligned and preserve the canonical boundary envelope fields.',
      ],
      issues,
    );
    die(`Fail-closed. Wrote feedback packet: ${safeRel(repoRoot, fp)}`, 32);
  }

  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-ap-contract-transport-missing');
  resolveFeedbackPacketsBySlugSync(path.join(instRoot, 'feedback_packets'), 'build-postgate-cp-ap-contract-transport-drift');
  return 0;
}

const isEntrypoint = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntrypoint) {
  internal_main().then((code) => process.exit(typeof code === 'number' ? code : 0)).catch((e) => {
    if (typeof e?.code === 'number') {
      process.stderr.write(`${e.message}\n`);
      process.exit(e.code);
      return;
    }
    process.stderr.write(`${String(e?.stack || e)}\n`);
    process.exit(1);
  });
}
