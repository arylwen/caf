#!/usr/bin/env node
import { runCafFlow } from '../lib_run_caf_flow_v1.mjs';
import {
  buildClaudePrintInvocationArgs,
  extractClaudePrintSessionMetadata,
  normalizeClaudeRunnerArgs,
} from '../lib_claude_runner_defaults_v1.mjs';

function normalizeArgs(args) {
  return normalizeClaudeRunnerArgs(args);
}

await runCafFlow(import.meta.url, process.argv, {
  command: 'claude',
  displayName: 'Claude Code',
  versionArgs: ['--version'],
  usage: 'node tools/caf/cli/claude/run_caf_flow_v1.mjs <instance_name> [claude args...]',
  enableSessionResume: true,
  extractRunMetadata(output) {
    return extractClaudePrintSessionMetadata(output);
  },
  normalizeArgs,
  buildInvocationArgs(cafCommand, runnerArgs, repoRoot, runContext) {
    return buildClaudePrintInvocationArgs(cafCommand, runnerArgs, repoRoot, runContext);
  },
});
