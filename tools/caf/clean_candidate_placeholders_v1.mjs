#!/usr/bin/env node
/**
 * Deterministic mechanical cleanup for retrieval-phase artifacts.
 *
 * Usage:
 *   node tools/caf/clean_candidate_placeholders_v1.mjs <fileAbsOrRel>
 */

import path from 'node:path';
import { cleanFileInPlace } from './lib_clean_candidate_placeholders_v1.mjs';

async function main() {
  const fileAbsOrRel = process.argv[2];
  if (!fileAbsOrRel) {
    console.error('Usage: node tools/caf/clean_candidate_placeholders_v1.mjs <fileAbsOrRel>');
    process.exit(2);
  }
  const abs = path.resolve(process.cwd(), fileAbsOrRel);
  const { changed } = await cleanFileInPlace(abs);
  process.stdout.write(changed ? 'changed\n' : 'unchanged\n');
}

await main();
