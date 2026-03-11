import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// eslint-disable-next-line import/no-commonjs
const yaml = require('./vendor/js-yaml.min.js');

export const SHAPE_LIFECYCLE_STATUS = Object.freeze({
  SEEDED_TEMPLATE_DEFAULT: 'seeded_template_default',
  PRD_PROMOTED: 'prd_promoted',
  ARCHITECT_CURATED: 'architect_curated',
});

export function normalizeScalar(v) {
  let s = String(v ?? '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function ensureMeta(shapeObj) {
  if (!shapeObj || typeof shapeObj !== 'object' || Array.isArray(shapeObj)) {
    return shapeObj;
  }
  if (!shapeObj.meta || typeof shapeObj.meta !== 'object' || Array.isArray(shapeObj.meta)) {
    shapeObj.meta = {};
  }
  return shapeObj;
}

export function getShapeLifecycleStatus(shapeObj) {
  return normalizeScalar(shapeObj?.meta?.lifecycle_shape_status);
}

export function isLifecycleReadyShapeStatus(status) {
  const s = normalizeScalar(status);
  return s === SHAPE_LIFECYCLE_STATUS.PRD_PROMOTED || s === SHAPE_LIFECYCLE_STATUS.ARCHITECT_CURATED;
}

export function annotateSeededTemplateDefault(shapeObj, source = 'caf-saas-init') {
  const obj = ensureMeta(shapeObj);
  if (!obj) return obj;
  if (!getShapeLifecycleStatus(obj)) {
    obj.meta.lifecycle_shape_status = SHAPE_LIFECYCLE_STATUS.SEEDED_TEMPLATE_DEFAULT;
  }
  if (!normalizeScalar(obj?.meta?.lifecycle_shape_source)) {
    obj.meta.lifecycle_shape_source = source;
  }
  if (!normalizeScalar(obj?.meta?.lifecycle_shape_contract)) {
    obj.meta.lifecycle_shape_contract = 'phase_8_prd_lifecycle_integration_v1';
  }
  return obj;
}

export function annotatePrdPromoted(shapeObj, sourcePrdPath, promotedAtIso) {
  const obj = ensureMeta(shapeObj);
  if (!obj) return obj;
  obj.meta.lifecycle_shape_status = SHAPE_LIFECYCLE_STATUS.PRD_PROMOTED;
  obj.meta.lifecycle_shape_source = 'caf-prd';
  obj.meta.lifecycle_shape_contract = 'phase_8_prd_lifecycle_integration_v1';
  if (normalizeScalar(sourcePrdPath)) {
    obj.meta.lifecycle_shape_source_prd_path = normalizeScalar(sourcePrdPath);
  }
  if (normalizeScalar(promotedAtIso)) {
    obj.meta.lifecycle_shape_promoted_at = normalizeScalar(promotedAtIso);
  }
  return obj;
}

export function dumpYamlStable(obj) {
  return yaml.dump(obj, { noRefs: true, lineWidth: 120 });
}
