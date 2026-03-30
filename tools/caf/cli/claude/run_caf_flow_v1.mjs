#!/usr/bin/env node
import { runCafFlow } from '../lib_run_caf_flow_v1.mjs';

function hasPermissionOverride(args) {
  return args.some((arg) => {
    const s = String(arg);
    return s === '--dangerously-skip-permissions' || s === '--permission-mode' || s.startsWith('--permission-mode=') || s === '--permission-prompt-tool' || s.startsWith('--permission-prompt-tool=');
  });
}

function normalizeArgs(args) {
  const out = [...args];
  if (!hasPermissionOverride(out)) out.unshift('--dangerously-skip-permissions');
  return out;
}

await runCafFlow(import.meta.url, process.argv, {
  command: 'claude',
  displayName: 'Claude Code',
  versionArgs: ['--version'],
  usage: 'node tools/caf/cli/claude/run_caf_flow_v1.mjs <instance_name> [claude args...]',
  normalizeArgs,
  buildInvocationArgs(cafCommand, runnerArgs) {
    return ['-p', cafCommand, ...runnerArgs];
  },
});
