// One-shot script · chromakey the cream surround on splash-icon.png to transparent.
//
// The burgundy XICO card sits centered on a cream (#F5EFE3-ish) field. This
// script reads the PNG, makes every pixel within a tolerance of the cream
// color fully transparent, and rewrites the file. After this lands, the
// splash backgroundColor in app.json reverts to #080508 (warm-black) and the
// cold launch shows the burgundy card centered on dark — no cream halo, no
// harsh cream-to-dark transition.
//
// Pure-JS pipeline via pngjs (already in node_modules via .pnpm; no native
// deps, no extra install). Run from artifacts/xico-mobile/:
//
//   node scripts/transparent-splash.mjs
//
// Idempotent — re-running on an already-transparent file is a no-op (the
// cream pixels are gone after the first pass).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "..", "assets", "images", "splash-icon.png");

const require = createRequire(import.meta.url);
// pngjs is a transitive dep but not hoisted in this workspace; resolve via
// its pnpm-isolated location. Path is stable since pngjs@3.4.0 is referenced
// by parse-png@2.1.0 which is part of expo's image pipeline.
const pngjsPath = join(
  __dirname,
  "..",
  "..",
  "..",
  "node_modules",
  ".pnpm",
  "pngjs@3.4.0",
  "node_modules",
  "pngjs",
);
const { PNG } = require(pngjsPath);

// Cream target & tolerance — actual fill in icon.png samples around
// (245, 239, 227). Tolerance 25 catches anti-aliased edges without nicking
// the burgundy card or the cream serif strokes of the XICO wordmark inside
// the burgundy field (those serifs are also cream, but they sit on burgundy
// not on the cream backdrop, so they survive — only contiguous-cream pixels
// get touched, but a contiguity test is overkill here; tolerance is enough
// because the wordmark serifs are surrounded by burgundy pixels which break
// any solid run of cream).
const CR = 245;
const CG = 239;
const CB = 227;
const TOLERANCE = 25;

function close(v, t, tol) {
  return Math.abs(v - t) <= tol;
}

const buffer = await readFile(target);
const png = PNG.sync.read(buffer);
const { width, height, data } = png;

let changed = 0;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (close(r, CR, TOLERANCE) && close(g, CG, TOLERANCE) && close(b, CB, TOLERANCE)) {
    data[i + 3] = 0;
    changed++;
  }
}

// Re-encode with alpha preserved
const out = PNG.sync.write(png);
await writeFile(target, out);

const total = width * height;
const pct = ((changed / total) * 100).toFixed(1);
console.log(`splash-icon.png · ${width}x${height} · ${changed.toLocaleString()} of ${total.toLocaleString()} px (${pct}%) made transparent`);
