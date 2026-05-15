// scripts/source-lugar-photos.mjs · Build #11 photo program.
//
// Downloads + crops + resizes the 30 lugar photographs sourced from
// Wikimedia Commons (CC BY-SA / CC BY / CC0 / public domain) into
// `assets/lugares/<num>-<slug>.jpg`, target 1920×1080 16:9, JPEG q82.
// Writes `assets/lugares/_credits.json` with attribution metadata that
// the in-app `/credits` route renders for license compliance.
//
// Sources per the photo-sourcing-plan.md matrix. Where a venue has no
// public photo (restaurants, bars, private galleries) we use a tasteful
// close-up of the SUBJECT (mezcal, tlayuda, copal, dried chiles) — never
// pretending to be the venue. Despacho 028 (Tlatelolco) is the lone
// CDMX-referenced despacho · we use the Plaza de las Tres Culturas
// memorial photo per the plan.
//
// Run: `cd artifacts/xico-mobile && node scripts/source-lugar-photos.mjs`
// Requires `sharp` (already in package.json) and `curl` on PATH.

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "assets", "lugares");
fs.mkdirSync(outDir, { recursive: true });

/**
 * One entry per despacho (30 total) + the Tu Códice backdrop.
 * `url` is a Wikimedia Commons `Special:FilePath/<filename>` redirect —
 * always resolves to the actual file regardless of resolution. License +
 * photographer are recorded for the /credits screen; the source_url is
 * the human-readable Commons File: page anyone can visit to verify.
 *
 * `wcFile` is the bare filename without the "File:" prefix. Spaces become
 * underscores per Wikimedia convention.
 */
const wcFile = (name) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name).replace(/'/g, "%27")}`;
const wcPage = (name) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name).replace(/'/g, "%27")}`;

const sources = [
  // 001 — Mercado de San Fernando (Lavapiés)
  {
    num: "001",
    slug: "mercado-san-fernando",
    lugar: "Mercado de San Fernando",
    wcFile: "Mercado de San Fernando (Madrid) 01.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 002 — Iglesia de San Ginés
  {
    num: "002",
    slug: "iglesia-san-gines",
    lugar: "Iglesia de San Ginés",
    wcFile: "Iglesia de San Ginés (Madrid).jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 003 — Chocolatería San Ginés (churros & chocolate close-up)
  {
    num: "003",
    slug: "chocolateria-san-gines",
    lugar: "Chocolatería San Ginés",
    wcFile: "Chocolate con churros - San Ginés - Madrid.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 004 — Real Jardín Botánico del Retiro
  {
    num: "004",
    slug: "jardin-botanico-retiro",
    lugar: "Jardín Botánico del Retiro",
    wcFile: "Real Jardín Botánico - Madrid - 001.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 005 — Museo Nacional de Antropología
  {
    num: "005",
    slug: "museo-antropologia",
    lugar: "Museo Nacional de Antropología",
    wcFile: "Madrid - Museo Nacional de Antropología 2.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 006 — La Lucerna (tlayuda generic close-up · not pretending to be the venue)
  {
    num: "006",
    slug: "la-lucerna",
    lugar: "La Lucerna",
    wcFile: "Tlayuda.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Tlayuda close-up · the dish La Lucerna serves; not a photo of the venue.",
  },
  // 007 — Mercado de La Paz
  {
    num: "007",
    slug: "mercado-la-paz",
    lugar: "Mercado de La Paz",
    wcFile: "Mercado de la Paz, interior.JPG",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 008 — Casa de México en España
  {
    num: "008",
    slug: "casa-de-mexico",
    lugar: "Casa de México en España",
    wcFile: "Casa de Mexico en Madrid 01.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 009 — La Corrala
  {
    num: "009",
    slug: "la-corrala",
    lugar: "La Corrala",
    wcFile: "La Corrala de Lavapiés.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 010 — Tienda artesanal Casa de México (Oaxacan textile context)
  {
    num: "010",
    slug: "tienda-casa-mexico",
    lugar: "Tienda artesanal Casa de México",
    wcFile: "Tapete de Lana de Teotitlan, Oaxaca.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Tapete zapoteca de Teotitlán del Valle · representa los textiles que la tienda vende.",
  },
  // 011 — Bar Brutal (mezcal context)
  {
    num: "011",
    slug: "bar-brutal",
    lugar: "Bar Brutal",
    wcFile: "Mezcal oaxaqueño.JPG",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Mezcal oaxaqueño · representa la carta de mezcales del bar, no es foto del local.",
  },
  // 012 — Fundación Juan March (Casa Barragán reference)
  {
    num: "012",
    slug: "fundacion-juan-march",
    lugar: "Fundación Juan March",
    wcFile: "Casa Liraldi Luis Barragán.JPG",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Casa Barragán · el sujeto del despacho de hoy, archivado en la Fundación.",
  },
  // 013 — PhotoEspaña
  {
    num: "013",
    slug: "photoespana",
    lugar: "PhotoEspaña",
    wcFile: "PHotoESPAÑA BN Negativo.jpg",
    photographer: "PhotoEspaña festival",
    license: "CC BY-SA 4.0",
  },
  // 014 — Museo Reina Sofía
  {
    num: "014",
    slug: "reina-sofia",
    lugar: "Museo Reina Sofía",
    wcFile: "Museo Reina Sofia-exterior.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 015 — Real Academia Española
  {
    num: "015",
    slug: "real-academia-espanola",
    lugar: "Real Academia Española",
    wcFile: "Sede de la Real Academia Española.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 016 — Museo de América
  {
    num: "016",
    slug: "museo-de-america",
    lugar: "Museo de América",
    wcFile: "Madrid - Museo de América 01.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 017 — Galería Elvira González (Mexican contemporary art context · Diego Rivera mural)
  {
    num: "017",
    slug: "galeria-elvira-gonzalez",
    lugar: "Galería Elvira González",
    wcFile: "Diego Rivera Mural Palacio Nacional Mexico.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Mural de Diego Rivera · representa el arte mexicano que la galería programa.",
  },
  // 018 — Librería La Central del Reina Sofía (reuses RS photo)
  {
    num: "018",
    slug: "libreria-reina-sofia",
    lugar: "Librería La Central del Reina Sofía",
    wcFile: "Exterior museo reina sofia in july 2018.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Reina Sofía · la librería está dentro del museo.",
  },
  // 019 — Círculo de Bellas Artes
  {
    num: "019",
    slug: "circulo-bellas-artes",
    lugar: "Círculo de Bellas Artes",
    wcFile: "Fachada del Círculo de Bellas Artes (Madrid).jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 020 — Taberna Carmencita (chile / pimentón context)
  {
    num: "020",
    slug: "taberna-carmencita",
    lugar: "Taberna Carmencita",
    wcFile: "Mulato chile pods (dried).JPG",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Chiles secos · el pimentón de La Vera comparte linaje con el chile ancho.",
  },
  // 021 — Bar Matos (La Latina · using Lavapiés street as Madrid-night context)
  {
    num: "021",
    slug: "bar-matos",
    lugar: "Bar Matos",
    wcFile: "Calle de Lavapiés (Madrid) 01.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Calle madrileña · contexto del barrio, no foto del bar.",
  },
  // 022 — Museo Nacional de Ciencias Naturales
  {
    num: "022",
    slug: "museo-ciencias-naturales",
    lugar: "Museo Nacional de Ciencias Naturales",
    wcFile: "Madrid - Museo Nacional de Ciencias Naturales 1.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 023 — Mercado de Antón Martín
  {
    num: "023",
    slug: "mercado-anton-martin",
    lugar: "Mercado de Antón Martín",
    wcFile: "Mercado de Antón Martín, fachada calle Santa Isabel.JPG",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 024 — Tienda Copal
  {
    num: "024",
    slug: "tienda-copal",
    lugar: "Tienda Copal",
    wcFile: "Aztec Copal Incense (9781556773).jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Copal · el producto que la tienda vende, no el local.",
  },
  // 025 — Reina Sofía (collection)
  {
    num: "025",
    slug: "reina-sofia-coleccion",
    lugar: "Reina Sofía",
    wcFile: "Museo Nacional Centro de Arte Reina Sofía, detalles del exterior, Madrid, España, 2016 08.JPG",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 026 — Biblioteca Nacional
  {
    num: "026",
    slug: "biblioteca-nacional",
    lugar: "Biblioteca Nacional",
    wcFile: "Madrid - Biblioteca Nacional 01.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 027 — Sala Caracol (live music context)
  {
    num: "027",
    slug: "sala-caracol",
    lugar: "Sala Caracol",
    wcFile: "Natalia Lafourcade en concierto.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
    note: "Música en vivo · contexto del lugar, no foto interior del local.",
  },
  // 028 — Tlatelolco (CDMX · the one despacho not in Madrid)
  {
    num: "028",
    slug: "tlatelolco",
    lugar: "Centro Cultural Universitario Tlatelolco",
    wcFile: "Plaza de las Tres Culturas - Panorámica.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  // 029 — Barra Tobalá (agave/maguey context)
  {
    num: "029",
    slug: "barra-tobala",
    lugar: "Barra Tobalá",
    wcFile: "AMPP D031 Plantation of Maguey, Agave Americana.jpg",
    photographer: "AMPP archive (public domain)",
    license: "Public Domain",
    note: "Plantación de maguey · el origen del mezcal que el bar sirve.",
  },
  // 030 — Casa de México en España (closing despacho)
  {
    num: "030",
    slug: "casa-de-mexico-cierre",
    lugar: "Casa de México en España",
    wcFile: "Casa de Mexico en Madrid 02.jpg",
    photographer: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
];

// Tu Códice backdrop — Madrid sunset / golden hour
const backdrop = {
  num: "_backdrop",
  slug: "tu-codice",
  lugar: "Madrid · golden hour",
  wcFile: "Atardecer en Madrid .jpg",
  photographer: "Wikimedia Commons contributor",
  license: "CC BY-SA 4.0",
};

async function processOne(s) {
  const url = wcFile(s.wcFile);
  const sourceUrl = wcPage(s.wcFile);
  const tmpPath = path.join(outDir, `_tmp-${s.num}.bin`);
  const outPath = path.join(outDir, `${s.num}-${s.slug}.jpg`);

  console.log(`→ ${s.num} · ${s.lugar}`);
  console.log(`  ${url}`);

  // Skip the heavy download + sharp pipeline if the final file already
  // exists (idempotent re-runs · fast). The credits record is still
  // returned so _credits.json is built from the full source list, not
  // just the newly-processed entries.
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1024) {
    console.log(`  skip · already exists (${Math.round(fs.statSync(outPath).size / 1024)} KB)`);
    return { ok: true, ...s, file: path.basename(outPath), source_url: sourceUrl };
  }

  // curl download — follow redirects. Wikimedia's UA policy requires an
  // identifiable user-agent with a contact URL/email; a generic "tool/1.0"
  // gets HTTP 429-throttled by upload.wikimedia.org. Format follows the
  // pattern they document.
  const res = spawnSync(
    "curl",
    [
      "-L",
      "--max-time",
      "60",
      "-A",
      "XicoPhotoSourcer/1.0 (https://xico.app; mauricio@xicotest) curl/8.0",
      "-o",
      tmpPath,
      url,
    ],
    { stdio: "inherit" },
  );
  if (res.status !== 0 || !fs.existsSync(tmpPath) || fs.statSync(tmpPath).size === 0) {
    console.warn(`  ✗ download failed for ${s.num}`);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    return { ok: false, ...s, source_url: sourceUrl };
  }

  // Crop + resize to 1920×1080 cover, JPEG q82.
  try {
    await sharp(tmpPath)
      .rotate() // auto-orient via EXIF before resize
      .resize(1920, 1080, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(outPath);
  } catch (e) {
    console.warn(`  ✗ sharp failed for ${s.num}: ${e.message}`);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    return { ok: false, ...s, source_url: sourceUrl };
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }

  const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`  ✓ ${path.basename(outPath)} · ${sizeKB} KB`);
  return { ok: true, ...s, file: path.basename(outPath), source_url: sourceUrl };
}

async function main() {
  const results = [];
  // Process serially to keep the curl + sharp pipeline simple and avoid
  // Wikimedia rate-limit edges. Each photo is ~1-2s so total ~ a minute.
  for (const s of sources) {
    const r = await processOne(s);
    results.push(r);
  }
  // Backdrop (separate · no num prefix · saved as _backdrop-tu-codice.jpg).
  // The backdrop's `num` is the literal string "_backdrop" so the file path
  // produced by processOne is already `_backdrop-tu-codice.jpg` — no rename
  // step needed. Just stamp the canonical filename on the result for the
  // credits manifest.
  const bd = await processOne({ ...backdrop });
  if (bd.ok) bd.file = `_backdrop-${backdrop.slug}.jpg`;
  results.push(bd);

  const credits = results
    .filter((r) => r.ok)
    .map((r) => ({
      file: r.file,
      lugar: r.lugar,
      photographer: r.photographer,
      license: r.license,
      source_url: r.source_url,
      ...(r.note ? { note: r.note } : {}),
    }));

  fs.writeFileSync(
    path.join(outDir, "_credits.json"),
    JSON.stringify(credits, null, 2) + "\n",
  );

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;
  console.log("");
  console.log(`✓ ${okCount} photos saved · ${failCount} failed`);
  console.log(`✓ wrote ${path.join(outDir, "_credits.json")}`);

  if (failCount > 0) {
    const failed = results.filter((r) => !r.ok);
    console.warn("");
    console.warn("Failed downloads (re-run after investigating):");
    for (const f of failed) console.warn(`  ${f.num} · ${f.lugar} · ${f.source_url}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
