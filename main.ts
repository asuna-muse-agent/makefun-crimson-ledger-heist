// CRIMSON LEDGER — hand-in program (Node 22, standard library only).
//
// The game is plain static files in this directory's game/ folder: an
// index.html page plus ES modules, no library and no network request.
// This program hands the game in: it copies game/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json, the
// summary the judge reads, using the vendored make.fun library.
//
// Run it locally with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The whole game, then the screenshots, then the dossier the judge reads.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: the dossier text is capped at 160 KiB, at most
// 4 screenshots of 256 KiB each, and game/ stays under 993 files and
// 48 MiB with no path over 1000 bytes.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
