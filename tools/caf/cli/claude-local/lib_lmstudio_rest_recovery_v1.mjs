#!/usr/bin/env node

import {
  buildClaudeLocalLmStudioRecoveryProfile,
  classifyLmStudioRecoverableFailure,
} from './lib_lmstudio_load_profile_v1.mjs';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildHeaders(authToken) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (String(authToken || '').trim()) {
    headers.Authorization = `Bearer ${String(authToken).trim()}`;
  }
  return headers;
}

async function httpJson(method, url, authToken, body = undefined) {
  const response = await fetch(url, {
    method,
    headers: buildHeaders(authToken),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  if (!response.ok) {
    const detail = parsed ? JSON.stringify(parsed) : text || `${response.status} ${response.statusText}`;
    throw new Error(`LM Studio REST ${method} ${url} failed: ${response.status} ${response.statusText} ${detail}`);
  }
  return parsed;
}

function matchingLoadedInstance(modelRecord, profile) {
  const instances = Array.isArray(modelRecord?.loaded_instances) ? modelRecord.loaded_instances : [];
  return instances.find((instance) => {
    if (profile.mode !== 'explicit') return true;
    const config = instance?.config || {};
    const expected = profile.load || {};
    for (const [key, expectedValue] of Object.entries(expected)) {
      if (expectedValue === undefined) continue;
      if (config?.[key] !== expectedValue) return false;
    }
    return true;
  }) || null;
}

async function listModels(profile) {
  const payload = await httpJson('GET', `${profile.restBaseUrl}/api/v1/models`, profile.authToken);
  return Array.isArray(payload?.models) ? payload.models : [];
}

async function unloadLoadedInstances(profile, logger) {
  const models = await listModels(profile);
  const target = models.find((model) => String(model?.key || '') === profile.modelKey) || null;
  const instances = Array.isArray(target?.loaded_instances) ? target.loaded_instances : [];
  for (const instance of instances) {
    const instanceId = String(instance?.id || '').trim();
    if (!instanceId) continue;
    logger.note(`INFO: unloading LM Studio model instance ${instanceId}.`);
    await httpJson('POST', `${profile.restBaseUrl}/api/v1/models/unload`, profile.authToken, {
      instance_id: instanceId,
    });
  }
}

function buildLoadBody(profile) {
  const body = {
    model: profile.modelKey,
    echo_load_config: true,
  };
  if (profile.mode === 'explicit') {
    for (const [key, value] of Object.entries(profile.load || {})) {
      if (value === undefined) continue;
      body[key] = value;
    }
  }
  return body;
}

async function waitForLoadedModel(profile) {
  const deadline = Date.now() + Math.max(1000, Number(profile.loadWaitTimeoutMs || 180000));
  while (Date.now() <= deadline) {
    const models = await listModels(profile);
    const target = models.find((model) => String(model?.key || '') === profile.modelKey) || null;
    const instance = matchingLoadedInstance(target, profile);
    if (instance) return instance;
    await sleep(Math.max(250, Number(profile.pollMs || 2000)));
  }
  throw new Error(`Timed out waiting for LM Studio to load ${profile.modelKey}.`);
}

export async function maybeRecoverLmStudioModelViaRest({ processEnv, runnerEnv, defaultAuthToken = 'lm-studio', logger, failureOutput, recoveryAttempt = 1 } = {}) {
  const profile = buildClaudeLocalLmStudioRecoveryProfile({ processEnv, runnerEnv, defaultAuthToken });
  if (!profile.enabled) {
    return { recovered: false, reason: profile.reason || 'LM Studio recovery disabled' };
  }
  if (recoveryAttempt > Math.max(0, Number(profile.maxReloadsPerStep || 0))) {
    return { recovered: false, reason: `LM Studio recovery limit reached for step (${profile.maxReloadsPerStep}).` };
  }
  const failureClass = classifyLmStudioRecoverableFailure(failureOutput);
  if (!failureClass.recoverable) {
    return { recovered: false, reason: failureClass.reason };
  }

  logger.note(`WARN: attempting LM Studio model recovery via REST for ${profile.modelKey} (${recoveryAttempt}/${profile.maxReloadsPerStep}); reason=${failureClass.code}.`);
  await unloadLoadedInstances(profile, logger);
  const loadBody = buildLoadBody(profile);
  await httpJson('POST', `${profile.restBaseUrl}/api/v1/models/load`, profile.authToken, loadBody);
  const loadedInstance = await waitForLoadedModel(profile);
  const instanceId = String(loadedInstance?.id || '').trim();
  logger.note(`INFO: LM Studio model recovery completed for ${profile.modelKey}${instanceId ? ` (instance ${instanceId})` : ''}.`);
  return {
    recovered: true,
    reason: `reloaded ${profile.modelKey} via LM Studio REST after ${failureClass.code}`,
    failureClass,
    profile,
    loadedInstance,
  };
}
