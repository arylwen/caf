#!/usr/bin/env node

export function hasPermissionOverride(args) {
  return args.some((arg) => {
    const s = String(arg || '');
    return s === '--dangerously-skip-permissions'
      || s === '--allow-dangerously-skip-permissions'
      || s === '--enable-auto-mode'
      || s === '--permission-mode'
      || s.startsWith('--permission-mode=')
      || s === '--permission-prompt-tool'
      || s.startsWith('--permission-prompt-tool=');
  });
}

export function hasFlag(args, flagName) {
  return args.some((arg) => String(arg || '').trim() === flagName);
}

export function readOptionValue(args, optionName) {
  for (let index = 0; index < args.length; index += 1) {
    const current = String(args[index] || '').trim();
    if (!current) continue;
    if (current === optionName) {
      const next = args[index + 1];
      if (next === undefined) return '';
      return String(next || '').trim();
    }
    if (current.startsWith(`${optionName}=`)) {
      return current.slice(optionName.length + 1).trim();
    }
  }
  return '';
}

export function normalizeClaudeRunnerArgs(args, options = {}) {
  const out = [...args];
  const outputFormat = readOptionValue(out, '--output-format').toLowerCase();
  const hasOutputFormat = Boolean(outputFormat);
  const hasIncludePartialMessages = hasFlag(out, '--include-partial-messages');
  const hasVerbose = hasFlag(out, '--verbose');
  const hasPermissions = hasPermissionOverride(out);

  if (!hasOutputFormat) {
    out.push('--output-format', 'stream-json');
  }
  if ((!hasOutputFormat || outputFormat === 'stream-json') && !hasIncludePartialMessages) {
    out.push('--include-partial-messages');
  }
  if (!hasVerbose) {
    out.push('--verbose');
  }
  if (!hasPermissions && options.injectPermissionFlag !== false) {
    out.push('--dangerously-skip-permissions');
  }
  return out;
}

function buildClaudeContinuationPrompt(cafCommand) {
  return `Continue the current ${cafCommand} session from its existing state. Do not restart from scratch or relaunch a new /caf command. Finish the remaining in-progress work, or produce the appropriate CAF feedback packet if you are blocked.`;
}

export function buildClaudePrintInvocationArgs(cafCommand, runnerArgs, _repoRoot, runContext = {}) {
  const resumeMode = String(runContext?.sessionResumeMode || 'fresh').trim().toLowerCase();
  if (resumeMode === 'resume' && String(runContext?.sessionId || '').trim()) {
    return ['-p', buildClaudeContinuationPrompt(cafCommand), '--resume', String(runContext.sessionId).trim(), ...runnerArgs];
  }
  if (resumeMode === 'continue') {
    return ['-p', buildClaudeContinuationPrompt(cafCommand), '--continue', ...runnerArgs];
  }
  return ['-p', cafCommand, ...runnerArgs];
}

export function extractClaudePrintSessionMetadata(output) {
  const text = String(output || '');
  if (!text) return { sessionId: '', streamJsonDetected: false };

  const sessionIds = [];
  let streamJsonDetected = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = String(rawLine || '').trim();
    if (!line.startsWith('{') || !line.endsWith('}')) continue;
    try {
      const parsed = JSON.parse(line);
      streamJsonDetected = true;
      const sessionId = String(parsed?.session_id || '').trim();
      if (sessionId) sessionIds.push(sessionId);
    } catch {
      const match = line.match(/"session_id"\s*:\s*"([^"]+)"/);
      if (match && match[1]) {
        streamJsonDetected = true;
        sessionIds.push(String(match[1]).trim());
      }
    }
  }

  const unique = [...new Set(sessionIds.filter(Boolean))];
  return {
    sessionId: unique.length > 0 ? unique[unique.length - 1] : '',
    streamJsonDetected,
    sessionIds: unique,
  };
}
