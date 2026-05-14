// XICO production API smoke suite.
//
// Runs the same verification battery from the 2026-05-14 critique session:
//   T1 · status-code surface · every public + auth-gated endpoint
//   T2 · time-mode fallback contract on companion/public
//   T3 · negative paths (400/404/401) + apunte_in_situ NOT exposed in ruta/current
//   T4 · ruta/current payload shape (week_key, editor, 5 stops, rumbo joined)
//
// Usage:
//   node scripts/smoke-production.mjs
//   node scripts/smoke-production.mjs --base http://localhost:8080   (alt env)
//
// Exit codes:
//   0  all green
//   1  one or more checks failed (printed with ✗ prefix)
//
// No deps beyond node 22+ globals (fetch built-in).

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const BASE =
  baseIdx >= 0 ? args[baseIdx + 1] : "https://xico-api-production.up.railway.app";

let ok = 0;
let fail = 0;

function pass(label) {
  console.log(`  ✓ ${label}`);
  ok++;
}
function bad(label, detail = "") {
  console.log(`  ✗ ${label}${detail ? ` · ${detail}` : ""}`);
  fail++;
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: r.status, body: text, json };
}

async function expectStatus(label, path, status, bodyGrep) {
  const r = await get(path);
  if (r.status !== status) {
    bad(label, `expected ${status} got ${r.status}`);
    return;
  }
  if (bodyGrep && !r.body.includes(bodyGrep)) {
    bad(label, `body missing '${bodyGrep}'`);
    return;
  }
  pass(`${label} · ${status}`);
}

// ═══════════════════════════════════════════════════════════════════════════
console.log(`\n→ XICO production smoke · ${BASE}\n`);

// T1 · status-code surface
console.log("T1 · status-code surface");
await expectStatus("/api/health", "/api/health", 200, '"ok":true');
await expectStatus("/api/rumbos", "/api/rumbos", 200, "Mictlampa");
await expectStatus("/api/ruta", "/api/ruta", 200, "ruta-001");
await expectStatus("/api/ruta/current", "/api/ruta/current", 200, "Mictlampa");
await expectStatus("/api/madrid-pulse/today", "/api/madrid-pulse/today", 200, "date_key");
await expectStatus(
  "/api/editor-letters?interest=Gastronomía",
  "/api/editor-letters?interest=Gastronom%C3%ADa",
  200,
  "editor_name",
);
await expectStatus("/api/companion/public", "/api/companion/public", 200, "phrase");
await expectStatus("/api/articles", "/api/articles", 200, "id");
await expectStatus("/api/spots", "/api/spots", 200, "name");
await expectStatus("/api/events", "/api/events", 200, "title");

// Auth-gated · expect 401 without bearer
console.log("\n  auth-gated (no bearer · expect 401):");
await expectStatus("/api/despacho", "/api/despacho", 401, "Unauthorized");
await expectStatus("/api/profile/tier", "/api/profile/tier", 401, "Unauthorized");
await expectStatus("/api/sellos-rumbo", "/api/sellos-rumbo", 401, "Unauthorized");

// T2 · time-mode fallback contract
console.log("\nT2 · time-mode fallback");
const tm1 = await get("/api/companion/public?time_mode=madrugada");
if (tm1.json?.time_mode_effective === "madrugada") {
  pass("madrugada serves time-specific phrase");
} else {
  bad("madrugada fallback", JSON.stringify(tm1.json));
}
const tm2 = await get("/api/companion/public?time_mode=atardecer");
if (tm2.json?.time_mode_requested === "atardecer" && tm2.json?.time_mode_effective === "dia") {
  pass("atardecer correctly falls back to dia for Iniciado/intellectual");
} else {
  bad("atardecer fallback", JSON.stringify(tm2.json));
}
const tm3 = await get("/api/companion/public?time_mode=garbage");
if (tm3.json?.time_mode_requested === "dia") {
  pass("invalid time_mode sanitized to dia");
} else {
  bad("invalid time_mode sanitization", JSON.stringify(tm3.json));
}

// T3 · negative paths + security
console.log("\nT3 · negative paths + apunte security");
await expectStatus("/api/editor-letters (no param)", "/api/editor-letters", 400, "interest");
await expectStatus("/api/ruta-stops/nonexistent", "/api/ruta-stops/nonexistent-stop", 404, "Stop not found");

const rutaCurrent = await get("/api/ruta/current");
if (rutaCurrent.status === 200 && rutaCurrent.json) {
  // CRITICAL · apunte_in_situ must NEVER appear in the public payload
  const leaked = rutaCurrent.json.stops?.some((s) => "apunte_in_situ" in s);
  if (leaked) {
    bad("CRITICAL · apunte_in_situ LEAKED in /api/ruta/current payload");
  } else {
    pass("apunte_in_situ correctly omitted from public payload");
  }

  // T4 shape
  const r = rutaCurrent.json;
  if (r.week_key === "2026-W19") pass("ruta week_key = 2026-W19");
  else bad("ruta week_key", r.week_key);
  if (r.editor_name === "María Vázquez") pass("ruta editor = María Vázquez");
  else bad("ruta editor", r.editor_name);
  if (r.stops?.length === 5) pass("ruta has 5 stops");
  else bad("ruta stop count", String(r.stops?.length));
  const allRumboed = r.stops?.every((s) => s.rumbo?.slug);
  if (allRumboed) pass("all 5 stops have rumbo joined");
  else bad("stops missing rumbo", JSON.stringify(r.stops?.map((s) => s.rumbo)));
  const allGeoed = r.stops?.every((s) => s.lat && s.lng);
  if (allGeoed) pass("all 5 stops have lat/lng");
  else bad("stops missing geo", "");
  const allDespachoed = r.stops?.every((s) => s.despacho_text && s.despacho_text.length > 400);
  if (allDespachoed) pass("all 5 stops have despacho_text (>400 chars)");
  else bad("stops missing despacho_text", "");
} else {
  bad("ruta/current shape · could not parse", String(rutaCurrent.status));
}

// Verdict
console.log(`\n→ ${ok} OK · ${fail} FAIL\n`);
process.exit(fail === 0 ? 0 : 1);
