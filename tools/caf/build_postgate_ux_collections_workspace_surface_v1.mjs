#!/usr/bin/env node
import { internal_main } from './build_postgate_ux_collections_management_surface_v1.mjs';
export { internal_main };

const isEntrypoint = import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isEntrypoint) {
  internal_main().then((code) => process.exit(typeof code === 'number' ? code : 0)).catch((e) => {
    if (typeof e?.code === 'number') {
      process.stderr.write(`${e.message}
`);
      process.exit(e.code);
      return;
    }
    process.stderr.write(`${String(e?.stack || e)}
`);
    process.exit(1);
  });
}
