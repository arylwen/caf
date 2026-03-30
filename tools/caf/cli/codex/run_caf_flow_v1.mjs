#!/usr/bin/env node
import { runCafFlow } from '../lib_run_caf_flow_v1.mjs';

const codexCommand = process.platform === 'win32' ? 'codex.cmd' : 'codex';

function hasModelArg(args) {
  return args.some((arg, idx) => arg === '-m' || arg === '--model' || String(arg).startsWith('--model='));
}

function hasReasoningArg(args) {
  return args.some((arg) => String(arg).includes('model_reasoning_effort'));
}

function normalizeArgs(args) {
  const prefix = [];
  if (!hasModelArg(args)) prefix.push('-m', 'gpt-5.3-codex');
  if (!hasReasoningArg(args)) prefix.push('-c', 'model_reasoning_effort="medium"');
  return [...prefix, ...args];
}

await runCafFlow(import.meta.url, process.argv, {
  command: codexCommand,
  displayName: 'Codex',
  versionArgs: ['--version'],
  usage: 'node tools/caf/cli/codex/run_caf_flow_v1.mjs <instance_name> [codex args...]',
  normalizeArgs,
  buildInvocationArgs(cafCommand, runnerArgs, repoRoot) {
    return ['-C', repoRoot, 'exec', '--full-auto', ...runnerArgs, cafCommand];
  },
});
