#!/usr/bin/env node

import {
  buildClaudeLocalConfig,
  firstDefined,
} from './lib_claude_local_config_v1.mjs';

export function normalizeLmStudioRestBaseUrl(baseUrl) {
  const text = String(baseUrl || '').trim();
  if (!text) return '';

  let url = null;
  try {
    url = new URL(text);
  } catch {
    return text.replace(/\/+$/, '');
  }

  let pathname = url.pathname.replace(/\/+$/, '');
  for (const suffix of ['/v1/messages', '/v1/message', '/v1', '/api/v1']) {
    if (pathname.toLowerCase().endsWith(suffix)) {
      pathname = pathname.slice(0, pathname.length - suffix.length);
      break;
    }
  }
  if (!pathname) pathname = '/';
  url.pathname = pathname;
  url.search = '';
  url.hash = '';
  return String(url).replace(/\/+$/, '');
}

export function classifyLmStudioRecoverableFailure(output) {
  const haystack = String(output || '');
  const lower = haystack.toLowerCase();
  if (!lower) return { recoverable: false, code: '', reason: 'empty failure output' };

  if (
    lower.includes('failed to generate a valid tool call')
    || lower.includes('failed to parse tool call')
    || lower.includes('unexpected end of content')
    || (lower.includes('client disconnected') && lower.includes('tool call'))
  ) {
    return {
      recoverable: true,
      code: 'tool_call_truncated',
      reason: 'LM Studio tool-call generation was truncated or disconnected.',
    };
  }

  if (
    lower.includes('no models loaded')
    || lower.includes('please load a model')
    || lower.includes('load a model in the developer page')
  ) {
    return {
      recoverable: true,
      code: 'no_models_loaded',
      reason: 'LM Studio reported that no model was loaded.',
    };
  }

  if (
    lower.includes('model not loaded')
    || lower.includes('model is not loaded')
    || lower.includes('instance not found')
  ) {
    return {
      recoverable: true,
      code: 'model_not_loaded',
      reason: 'LM Studio reported that the requested model instance was unavailable.',
    };
  }

  return {
    recoverable: false,
    code: '',
    reason: 'runner failure did not match an LM Studio reload-recoverable signature',
  };
}

export function buildClaudeLocalLmStudioRecoveryProfile({ processEnv, runnerEnv, defaultAuthToken = 'lm-studio' } = {}) {
  const config = buildClaudeLocalConfig(processEnv || {});
  const baseUrl = firstDefined(
    runnerEnv?.ANTHROPIC_BASE_URL,
    config.runner.baseUrl,
  );
  const authToken = firstDefined(
    runnerEnv?.ANTHROPIC_AUTH_TOKEN,
    config.runner.authToken,
  );
  const restBaseUrl = normalizeLmStudioRestBaseUrl(baseUrl);
  const mode = config.recovery.loadMode === 'use_server_defaults' ? 'use_server_defaults' : 'explicit';
  const expectedToken = String(defaultAuthToken || '').trim();
  const enabledByToken = authToken === expectedToken && authToken === 'lm-studio';
  const enabledByEnv = Boolean(config.recovery.enabled);

  const profile = {
    enabled: Boolean(enabledByToken && enabledByEnv && restBaseUrl),
    reason: enabledByToken ? '' : 'auth token is not the LM Studio default token',
    mode,
    authToken,
    restBaseUrl,
    modelKey: config.recovery.modelKey,
    load: {
      context_length: config.recovery.contextLength,
      offload_kv_cache_to_gpu: config.recovery.offloadKvCacheToGpu,
      flash_attention: config.recovery.flashAttention,
      eval_batch_size: config.recovery.evalBatchSize,
      num_experts: config.recovery.numExperts,
    },
    maxReloadsPerStep: config.recovery.maxReloadsPerStep,
    pollMs: config.recovery.pollMs,
    loadWaitTimeoutMs: config.recovery.loadWaitTimeoutMs,
  };

  return profile;
}
