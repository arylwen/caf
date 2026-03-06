/**
 * CAF instance layout helper (v1)
 *
 * Contract (no back-compat):
 * reference_architectures/<instance>/
 *   spec/
 *     guardrails/
 *     playbook/
 *     caf_meta/
 *   design/
 *     playbook/
 *   feedback_packets/
 */

import path from 'node:path';

export function getInstanceLayout(repoRoot, instanceName) {
  const instanceRoot = path.join(repoRoot, 'reference_architectures', instanceName);
  const specDir = path.join(instanceRoot, 'spec');
  const designDir = path.join(instanceRoot, 'design');

  const specGuardrailsDir = path.join(specDir, 'guardrails');
  const specPlaybookDir = path.join(specDir, 'playbook');
  const cafMetaDir = path.join(specDir, 'caf_meta');

  const designPlaybookDir = path.join(designDir, 'playbook');

  const feedbackDir = path.join(instanceRoot, 'feedback_packets');

  return {
    // Canonical names
    instanceRoot,
    specDir,
    designDir,
    specGuardrailsDir,
    specPlaybookDir,
    cafMetaDir,
    designPlaybookDir,
    feedbackDir,

    // Script-facing aliases (internal repo consistency; not a compatibility promise).
    instRoot: instanceRoot,
    feedbackPacketsDir: feedbackDir,
    specMetaDir: cafMetaDir,
  };
}
