#!/usr/bin/env node
import { runCafFlow } from '../lib_run_caf_flow_v1.mjs';
import {
  buildClaudePrintInvocationArgs,
  extractClaudePrintSessionMetadata,
  normalizeClaudeRunnerArgs,
} from '../lib_claude_runner_defaults_v1.mjs';
import { maybeRecoverLmStudioModelViaRest } from './lib_lmstudio_rest_recovery_v1.mjs';
import { buildClaudeLocalRunnerEnv, CLAUDE_LOCAL_DEFAULTS } from './lib_claude_local_config_v1.mjs';

const defaultAuthToken = CLAUDE_LOCAL_DEFAULTS.authToken;

function normalizeArgs(args) {
  return normalizeClaudeRunnerArgs(args);
}


function buildClaudeLocalEnv({ processEnv }) {
  return buildClaudeLocalRunnerEnv(processEnv);
}

await runCafFlow(import.meta.url, process.argv, {
  command: 'claude',
  displayName: 'Claude Local',
  versionArgs: ['--version'],
  usage: 'node tools/caf/cli/claude-local/run_caf_flow_v1.mjs <instance_name> [claude args...]',
  enableSessionResume: true,
  maxCleanInProgressRetries: 10,
  retryRunnerNoPacketWithoutPacket: true,
  maxRunnerNoPacketRetries: 10,
  extractRunMetadata(output) {
    return extractClaudePrintSessionMetadata(output);
  },
  normalizeArgs,
  buildRunnerEnv(context) {
    return buildClaudeLocalEnv(context);
  },
  async maybeRecoverFatalRunnerHttp400(context) {
    const runnerEnv = buildClaudeLocalEnv({ processEnv: process.env });
    return await maybeRecoverLmStudioModelViaRest({
      processEnv: process.env,
      runnerEnv,
      defaultAuthToken,
      logger: context?.logger,
      failureOutput: context?.err?.capturedOutput || '',
      recoveryAttempt: context?.recoveryAttempt || 1,
    });
  },
  buildInvocationArgs(cafCommand, runnerArgs, repoRoot, runContext) {
    return buildClaudePrintInvocationArgs(cafCommand, runnerArgs, repoRoot, runContext);
  },
});