// Copies Shaka Player next to the script build as ENGINE_FILE, without its sourcemap comment.
import { readFileSync, writeFileSync } from 'node:fs';
import { ENGINE_SOURCE, ENGINE_FILE, DIST } from './shaka-engine.mjs';

const code = readFileSync(ENGINE_SOURCE, 'utf8').replace(/\n\/\/# sourceMappingURL=.*\s*$/, '\n');
writeFileSync(`${DIST}/${ENGINE_FILE}`, code);
