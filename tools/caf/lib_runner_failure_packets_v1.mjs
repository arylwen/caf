#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

import { getInstanceLayout } from './lib_instance_layout_v1.mjs';
import { cafBulletStampLine } from './lib_caf_version_v1.mjs';
import { ensureFeedbackPacketHeaderV1, nowDateYYYYMMDD, nowStampYYYYMMDD } from './lib_feedback_packets_v1.mjs';

function normalize(text) {
  return String(text || '').replace(/\r\n/g, '\n');
}

function trimBullet(text) {
  return String(text || '').replace(/^[-*\s]+/, '').trim();
}

function firstNonEmptyLine(text) {
  const lines = normalize(text).split('\n').map((line) => String(line || '').trim()).filter(Boolean);
  return lines[0] || '';
}

function findResetHint(text) {
  const src = normalize(text);
  const tryAgain = src.match(/try again at\s+([^\.\n]+)/i);
  if (tryAgain) return `Try again at ${trimBullet(tryAgain[1])}.`;
  const retryAfter = src.match(/retry after\s+([^\.\n]+)/i);
  if (retryAfter) return `Retry after ${trimBullet(retryAfter[1])}.`;
  const available = src.match(/available again\s+([^\.\n]+)/i);
  if (available) return `Available again ${trimBullet(available[1])}.`;
  return '';
}

export function classifyRunnerEnvironmentFailure(output) {
  const raw = normalize(output);
  const haystack = raw.toLowerCase();
  if (!haystack.trim()) return null;

  const usageLimit = haystack.includes("you've hit your usage limit")
    || haystack.includes('you have hit your usage limit')
    || haystack.includes('usage limit') && (haystack.includes('try again') || haystack.includes('admin'))
    || haystack.includes('monthly usage limit')
    || haystack.includes('usage quota') && haystack.includes('try again')
    || haystack.includes('rate limit reached') && haystack.includes('try again')
    || haystack.includes('rate limit exceeded') && haystack.includes('try again');

  if (!usageLimit) return null;

  const headline = firstNonEmptyLine(raw) || 'Runner reported that the current account/session has exhausted usage for now.';
  return {
    kind: 'usage_limit_exhausted',
    slug: 'runner-usage-limit-exhausted',
    headline,
    resetHint: findResetHint(raw),
    raw,
  };
}

export async function emitRunnerEnvironmentFailurePacket(repoRoot, instanceName, cafCommand, runnerName, output) {
  const failure = classifyRunnerEnvironmentFailure(output);
  if (!failure) return null;

  const layout = getInstanceLayout(repoRoot, instanceName);
  const packetsDir = path.join(layout.instRoot, 'feedback_packets');
  await fs.mkdir(packetsDir, { recursive: true });
  const packetAbs = path.join(packetsDir, `BP-${nowStampYYYYMMDD()}-${failure.slug}.md`);
  const resetLine = failure.resetHint ? `Reset window hint: ${failure.resetHint}` : 'Reset window hint: not surfaced by the runner output.';

  const evidenceLines = normalize(failure.raw)
    .split('\n')
    .map((line) => String(line || '').trimEnd())
    .filter((line) => line.trim().length > 0)
    .slice(0, 8)
    .map((line) => `  - ${line}`);
  if (!evidenceLines.length) evidenceLines.push('  - (runner produced no captured stderr/stdout text)');

  const body = [
    `# Feedback Packet - ${failure.slug.replace(/-/g, ' ')}`,
    '',
    `- Date: ${nowDateYYYYMMDD()}`,
    cafBulletStampLine(),
    '- Status: pending',
    `- Instance: ${instanceName}`,
    `- Stuck At: ${cafCommand}`,
    '- Severity: blocker',
    '',
    '## Observed Constraint',
    `${runnerName} reported a session/account usage limit while executing \
\`${cafCommand}\`. CAF cannot continue the current run until runner access is restored or an equivalent supported runner session is used from the same unchanged repo state.`,
    '',
    '## Minimal Fix Proposal',
    '- Do not hand-edit generated outputs or mark build/planning work complete just to bypass the blocked run.',
    '- Resume the same CAF command after the runner usage window resets.',
    '- If the project permits an alternate supported runner wrapper, rerun the same CAF command from that wrapper against the same unchanged repo state.',
    '- If access is org-managed, request more usage from the admin rather than mutating generated artifacts by hand.',
    '',
    '## Suggested Next Action',
    `- ${cafCommand}`,
    `- ${resetLine}`,
    '',
    '## Evidence',
    `- ${runnerName} reported usage-limit exhaustion:`,
    ...evidenceLines,
    '',
    '## Autonomous agent guidance',
    '- Preserve repo state and rerun from the same routed command once runner access is available again.',
    '- Treat this as an environment/access blocker, not as a signal to rewrite architecture/build outputs outside CAF.',
    '',
  ].join('\n');

  await fs.writeFile(packetAbs, ensureFeedbackPacketHeaderV1(body), 'utf8');
  return packetAbs;
}
