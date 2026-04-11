#!/usr/bin/env node

export const CLAUDE_LOCAL_DEFAULTS = Object.freeze({
  baseUrl: 'http://rig90:1234',
  authToken: 'lm-studio',
  disableNonessentialTraffic: '1',
  disablePromptCaching: '1',
  apiTimeoutMs: '1800000',
  recovery: Object.freeze({
    enabled: '1',
    loadMode: 'use_server_defaults',
    modelKey: 'qwen/qwen3.5-35b-a3b',
    contextLength: '200000',
    offloadKvCacheToGpu: '1',
    flashAttention: '1',
    evalBatchSize: '512',
    numExperts: '10',
    maxReloadsPerStep: '10',
    pollMs: '2000',
    loadWaitTimeoutMs: '180000',
  }),
});

export const CLAUDE_LOCAL_ENV_SPECS = Object.freeze([
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_BASE_URL',
    category: 'runner',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.baseUrl,
    aliases: ['ANTHROPIC_BASE_URL'],
    description: 'Claude-local Anthropic-compatible base URL.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_AUTH_TOKEN',
    category: 'runner',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.authToken,
    aliases: ['ANTHROPIC_AUTH_TOKEN'],
    description: 'Claude-local auth token. LM Studio recovery only activates when the resolved token is lm-studio.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_DISABLE_NONESSENTIAL_TRAFFIC',
    category: 'runner',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.disableNonessentialTraffic,
    aliases: ['CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC'],
    description: 'Forwards the Claude nonessential-traffic toggle.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_DISABLE_PROMPT_CACHING',
    category: 'runner',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.disablePromptCaching,
    aliases: ['DISABLE_PROMPT_CACHING'],
    description: 'Forwards the Claude prompt-caching toggle.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_API_TIMEOUT_MS',
    category: 'runner',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.apiTimeoutMs,
    aliases: ['API_TIMEOUT_MS'],
    description: 'Forwards Claude API timeout in milliseconds.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_ENABLE_MODEL_RECOVERY',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.enabled,
    aliases: [],
    description: 'Enables LM Studio REST recovery for recoverable fatal 400 failures.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_LMSTUDIO_LOAD_MODE',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.loadMode,
    aliases: [],
    description: 'explicit = CAF sends load parameters; use_server_defaults = CAF asks LM Studio to load using server-side defaults only.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_MODEL_KEY',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.modelKey,
    aliases: [],
    description: 'LM Studio model key to reload.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_CONTEXT_LENGTH',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.contextLength,
    aliases: [],
    description: 'Explicit LM Studio load context length.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_OFFLOAD_KV_CACHE_TO_GPU',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.offloadKvCacheToGpu,
    aliases: [],
    description: 'Explicit LM Studio offload_kv_cache_to_gpu flag.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_FLASH_ATTENTION',
    category: 'recovery',
    defaultValue: '(unset)',
    aliases: [],
    description: 'Optional explicit LM Studio flash_attention flag.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_EVAL_BATCH_SIZE',
    category: 'recovery',
    defaultValue: '(unset)',
    aliases: [],
    description: 'Optional explicit LM Studio eval_batch_size.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_NUM_EXPERTS',
    category: 'recovery',
    defaultValue: '(unset)',
    aliases: [],
    description: 'Optional explicit LM Studio num_experts.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_MAX_RELOADS_PER_STEP',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.maxReloadsPerStep,
    aliases: [],
    description: 'Maximum automatic LM Studio reloads per routed step.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_POLL_MS',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.pollMs,
    aliases: [],
    description: 'LM Studio load-status polling interval in milliseconds.',
  }),
  Object.freeze({
    name: 'CAF_CLAUDE_LOCAL_RECOVERY_LOAD_WAIT_TIMEOUT_MS',
    category: 'recovery',
    defaultValue: CLAUDE_LOCAL_DEFAULTS.recovery.loadWaitTimeoutMs,
    aliases: [],
    description: 'How long CAF waits for LM Studio to report the reloaded model as ready.',
  }),
]);

export function firstDefined(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

export function readBoolean(value, fallback = false) {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(text)) return true;
  if (['0', 'false', 'no', 'off'].includes(text)) return false;
  return fallback;
}

export function readInteger(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
}

export function buildClaudeLocalConfig(processEnv = {}) {
  return {
    runner: {
      baseUrl: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_BASE_URL,
        processEnv.ANTHROPIC_BASE_URL,
        CLAUDE_LOCAL_DEFAULTS.baseUrl,
      ),
      authToken: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_AUTH_TOKEN,
        processEnv.ANTHROPIC_AUTH_TOKEN,
        CLAUDE_LOCAL_DEFAULTS.authToken,
      ),
      disableNonessentialTraffic: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_DISABLE_NONESSENTIAL_TRAFFIC,
        processEnv.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC,
        CLAUDE_LOCAL_DEFAULTS.disableNonessentialTraffic,
      ),
      disablePromptCaching: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_DISABLE_PROMPT_CACHING,
        processEnv.DISABLE_PROMPT_CACHING,
        CLAUDE_LOCAL_DEFAULTS.disablePromptCaching,
      ),
      apiTimeoutMs: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_API_TIMEOUT_MS,
        processEnv.API_TIMEOUT_MS,
        CLAUDE_LOCAL_DEFAULTS.apiTimeoutMs,
      ),
    },
    recovery: {
      enabled: readBoolean(processEnv.CAF_CLAUDE_LOCAL_ENABLE_MODEL_RECOVERY, true),
      loadMode: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_LMSTUDIO_LOAD_MODE,
        CLAUDE_LOCAL_DEFAULTS.recovery.loadMode,
      ).toLowerCase(),
      modelKey: firstDefined(
        processEnv.CAF_CLAUDE_LOCAL_RECOVERY_MODEL_KEY,
        CLAUDE_LOCAL_DEFAULTS.recovery.modelKey,
      ),
      contextLength: readInteger(
        firstDefined(
          processEnv.CAF_CLAUDE_LOCAL_RECOVERY_CONTEXT_LENGTH,
          CLAUDE_LOCAL_DEFAULTS.recovery.contextLength,
        ),
        Number(CLAUDE_LOCAL_DEFAULTS.recovery.contextLength),
      ),
      offloadKvCacheToGpu: readBoolean(
        firstDefined(
          processEnv.CAF_CLAUDE_LOCAL_RECOVERY_OFFLOAD_KV_CACHE_TO_GPU,
          CLAUDE_LOCAL_DEFAULTS.recovery.offloadKvCacheToGpu,
        ),
        false,
      ),
      flashAttention: (() => {
        const raw = firstDefined(processEnv.CAF_CLAUDE_LOCAL_RECOVERY_FLASH_ATTENTION);
        return raw ? readBoolean(raw, false) : undefined;
      })(),
      evalBatchSize: (() => {
        const raw = firstDefined(processEnv.CAF_CLAUDE_LOCAL_RECOVERY_EVAL_BATCH_SIZE);
        return raw ? readInteger(raw, 0) : undefined;
      })(),
      numExperts: (() => {
        const raw = firstDefined(processEnv.CAF_CLAUDE_LOCAL_RECOVERY_NUM_EXPERTS);
        return raw ? readInteger(raw, 0) : undefined;
      })(),
      maxReloadsPerStep: readInteger(
        firstDefined(
          processEnv.CAF_CLAUDE_LOCAL_RECOVERY_MAX_RELOADS_PER_STEP,
          CLAUDE_LOCAL_DEFAULTS.recovery.maxReloadsPerStep,
        ),
        Number(CLAUDE_LOCAL_DEFAULTS.recovery.maxReloadsPerStep),
      ),
      pollMs: readInteger(
        firstDefined(
          processEnv.CAF_CLAUDE_LOCAL_RECOVERY_POLL_MS,
          CLAUDE_LOCAL_DEFAULTS.recovery.pollMs,
        ),
        Number(CLAUDE_LOCAL_DEFAULTS.recovery.pollMs),
      ),
      loadWaitTimeoutMs: readInteger(
        firstDefined(
          processEnv.CAF_CLAUDE_LOCAL_RECOVERY_LOAD_WAIT_TIMEOUT_MS,
          CLAUDE_LOCAL_DEFAULTS.recovery.loadWaitTimeoutMs,
        ),
        Number(CLAUDE_LOCAL_DEFAULTS.recovery.loadWaitTimeoutMs),
      ),
    },
  };
}

export function buildClaudeLocalRunnerEnv(processEnv = {}) {
  const config = buildClaudeLocalConfig(processEnv);
  return {
    ANTHROPIC_BASE_URL: config.runner.baseUrl,
    ANTHROPIC_AUTH_TOKEN: config.runner.authToken,
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: config.runner.disableNonessentialTraffic,
    DISABLE_PROMPT_CACHING: config.runner.disablePromptCaching,
    API_TIMEOUT_MS: config.runner.apiTimeoutMs,
  };
}
