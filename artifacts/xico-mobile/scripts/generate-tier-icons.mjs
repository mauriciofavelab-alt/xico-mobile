/**
 * generate-tier-icons.mjs
 *
 * Generates 4 PNG variants (1024×1024) of the rosetón cosmogram, one per
 * tier in the XICO pasaporte ladder. The icons are wired as iOS alternate
 * app icons via `expo-alternate-app-icons` (see `app.json`).
 *
 * Design rules (spec §4.1, brandbook §5):
 *   - Cream background `#EDE6D8` (Las Arboledas bone, Barragán)
 *   - 4 four-petal rosetón, rotated 0/90/180/270 from north
 *   - Unfilled petals: outline only in warm-dark `#5A574F` (textQuaternary,
 *     "decorative-only hairlines" per brandbook §1). Picked over magenta to
 *     avoid color collision with the oeste-filled petal.
 *   - Filled petals use their rumbo color · except oeste which renders in
 *     pillar magenta `#9C1A47` because bone-on-cream is invisible
 *     (spec §4.1 "Critical rendering rule from brandbook §5").
 *   - No shadows, no text, no XICO wordmark — the rosetón IS the identity
 *     at this tier.
 *
 * Tier mapping (matches TierLadder thresholds in constants/tierLadder.ts):
 *   - Iniciado:  no petals filled · no center · the empty cosmogram
 *   - Conocedor: norte + este filled (2 of 4)
 *   - Curador:   norte + este + sur filled (3 of 4)
 *   - Cronista:  all 4 petals + tlalxicco green center dot
 *
 * Petal-fill order (norte → este → sur → oeste) is canonical per spec §4.1
 * and matches RUMBO_ORDER in constants/rumbos.ts.
 *
 * Idempotent: re-running overwrites the 4 PNGs in place.
 *
 * Run from the xico-mobile directory:
 *   node scripts/generate-tier-icons.mjs
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "..", "assets", "alternate-icons");

// --- Palette --------------------------------------------------------------

const cream = "#EDE6D8"; // background — Cihuatlampa / Las Arboledas bone
const outline = "#5A574F"; // warm-dark textQuaternary — petal outlines only
const rumbos = {
  norte: "#0E1018", // Mictlampa — blackest visible petal
  este:  "#D9357B", // Tlapallan — Barragán pink (Casa Gilardi)
  sur:   "#234698", // Huitzlampa — Casa Azul ultramarine
  // Oeste rendered as pillar magenta because the rumbo's bone-cream
  // (#EDE6D8) would vanish on the cream background. Spec §4.1.
  oeste: "#9C1A47", // Casa Gilardi pool magenta (pillars.indice)
  center: "#3F5A3A", // Tlalxicco — Coyoacán garden verde
};

// --- Petal geometry --------------------------------------------------------

// A single petal pointing UP, drawn around the canvas center (512, 512).
// The path traces a teardrop from the canvas top down to center, formed by
// two quadratic curves that meet at the tip.
//
// Tip at (512, 150) · 362 units above center · ~71% of the radius. Leaves
// generous margin for iOS's 22% corner mask without clipping the petal.
//
// Control points at (650, 425) and (374, 425) give the petal its full
// rounded almond profile.
const PETAL_PATH = "M512,150 Q650,425 512,512 Q374,425 512,150 Z";

function petalSvg(angleDeg, fillColor, isFilled) {
  const transform = `rotate(${angleDeg} 512 512)`;
  if (isFilled) {
    return `<path d="${PETAL_PATH}" fill="${fillColor}" transform="${transform}"/>`;
  }
  return `<path d="${PETAL_PATH}" fill="none" stroke="${outline}" stroke-width="14" stroke-linejoin="round" transform="${transform}"/>`;
}

function rosetonSvg(state) {
  // Petal angles match canonical RUMBO_ORDER from constants/rumbos.ts:
  //   norte → 0° (up) · este → 90° (right) · sur → 180° (down) · oeste → 270° (left)
  const petals = [
    petalSvg(0,   rumbos.norte, state.norte),
    petalSvg(90,  rumbos.este,  state.este),
    petalSvg(180, rumbos.sur,   state.sur),
    petalSvg(270, rumbos.oeste, state.oeste),
  ].join("\n    ");

  const center = state.center
    ? `<circle cx="512" cy="512" r="56" fill="${rumbos.center}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${cream}"/>
    ${petals}
    ${center}
</svg>`;
}

// --- Tier states -----------------------------------------------------------

const tiers = {
  iniciado:  { norte: false, este: false, sur: false, oeste: false, center: false },
  conocedor: { norte: true,  este: true,  sur: false, oeste: false, center: false },
  curador:   { norte: true,  este: true,  sur: true,  oeste: false, center: false },
  cronista:  { norte: true,  este: true,  sur: true,  oeste: true,  center: true  },
};

// --- Render ----------------------------------------------------------------

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const [tier, state] of Object.entries(tiers)) {
    const svg = rosetonSvg(state);
    const outPath = path.join(OUT_DIR, `icon-${tier}.png`);
    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    const meta = await sharp(outPath).metadata();
    console.log(`OK  icon-${tier}.png  ${meta.width}x${meta.height}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
