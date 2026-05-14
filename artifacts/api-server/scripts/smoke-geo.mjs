// XICO · Geo smoke · pre-walk Ruta verification.
//
// Verifies the full visit-token → sello earn flow end-to-end against
// production, with the user's REAL or simulated location for a given stop.
// Catches three things before Mauricio walks the Ruta in Madrid:
//
//   1. Are the seeded stop lat/lng coordinates accurate? (haversine ≤ 50m)
//   2. Does the visit-token issuance work for an authenticated user?
//   3. Does the earliest_claim_ts anti-cheat (30s) actually fire?
//   4. Does the sello insert succeed and return the expected tier shape?
//
// Usage (from repo root):
//
//   node artifacts/api-server/scripts/smoke-geo.mjs \
//     --stop-id stop-001 \
//     --lat 40.4283 \
//     --lng -3.7128 \
//     --user-jwt "<paste your Supabase access_token>"
//
//   Optional:
//     --base https://xico-api-production.up.railway.app  (default)
//     --skip-claim                  · only test the visit-token issuance, don't earn the sello
//     --wait-seconds 35             · how long to sleep before the second claim
//                                     (default 35 · matches server's earliest_claim_ts + buffer)
//
// How to get a JWT for testing:
//   Sign in via the mobile app once, then on the device:
//
//   const { data: { session } } = await supabase.auth.getSession();
//   console.log(session.access_token);   // paste this as --user-jwt
//
//   OR via the REST auth flow with the anon key:
//   POST /auth/v1/otp { email } → check inbox → tap link → token returns
//
// Exit codes:
//   0  all green · the stop is reachable and the sello flow works
//   1  one or more checks failed · see ✗ lines for the specific issue
//
// No deps beyond Node 22+ globals (fetch built-in).

const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return fallback;
  return args[i + 1];
}
function boolFlag(name) {
  return args.includes(`--${name}`);
}

const BASE = flag("base", "https://xico-api-production.up.railway.app");
const STOP_ID = flag("stop-id");
const LAT = flag("lat");
const LNG = flag("lng");
const USER_JWT = flag("user-jwt");
const SKIP_CLAIM = boolFlag("skip-claim");
const WAIT_SECONDS = Number(flag("wait-seconds", 35));

if (!STOP_ID || !LAT || !LNG || !USER_JWT) {
  console.error("\nXICO geo smoke · pre-walk verification\n");
  console.error("Required:");
  console.error("  --stop-id  · e.g. stop-001");
  console.error("  --lat      · your GPS latitude (decimal degrees)");
  console.error("  --lng      · your GPS longitude (decimal degrees)");
  console.error("  --user-jwt · your Supabase access_token (Bearer JWT)\n");
  console.error("Optional:");
  console.error("  --base     · API root (default https://xico-api-production.up.railway.app)");
  console.error("  --skip-claim     · only test visit-token issuance");
  console.error("  --wait-seconds N · sleep before second claim (default 35)\n");
  console.error("Example:");
  console.error('  node artifacts/api-server/scripts/smoke-geo.mjs \\');
  console.error("    --stop-id stop-001 --lat 40.4283 --lng -3.7128 \\");
  console.error('    --user-jwt "eyJhbGc..."\n');
  process.exit(1);
}

let ok = 0;
let fail = 0;
function pass(label, detail) {
  console.log(`  ✓ ${label}${detail ? ` · ${detail}` : ""}`);
  ok++;
}
function bad(label, detail) {
  console.log(`  ✗ ${label}${detail ? ` · ${detail}` : ""}`);
  fail++;
}

async function jsonFetch(path, init = {}) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${USER_JWT}`,
    ...(init.headers ?? {}),
  };
  const r = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: r.status, body: text, json };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════════════════════════
console.log(`\n→ XICO geo smoke · ${BASE}`);
console.log(`  stop-id : ${STOP_ID}`);
console.log(`  coords  : ${LAT}, ${LNG}`);
console.log(`  jwt     : ${USER_JWT.slice(0, 24)}…${USER_JWT.slice(-8)}\n`);

// Step 0 · who am I? Sanity-check the JWT is valid.
console.log("Step 0 · auth sanity check");
const tierR = await jsonFetch("/api/profile/tier");
if (tierR.status === 401) {
  bad("/api/profile/tier · expected 200 with valid JWT", `got 401 — JWT may be expired or wrong`);
  process.exit(1);
}
if (tierR.status !== 200 || !tierR.json) {
  bad("/api/profile/tier", `status=${tierR.status} body=${tierR.body.slice(0, 100)}`);
  process.exit(1);
}
pass(
  "/api/profile/tier",
  `tier=${tierR.json.tier} total_sellos=${tierR.json.total} distinct_rumbos=${tierR.json.distinct_rumbos}`,
);
const tierBefore = tierR.json.tier;
const sellosBefore = tierR.json.total;

// Step 1 · request visit-token for the stop with the provided coords.
console.log("\nStep 1 · request visit-token (haversine ≤ 50m gate)");
const tokenR = await jsonFetch(`/api/ruta-stops/${encodeURIComponent(STOP_ID)}/visit-token`, {
  method: "POST",
  body: JSON.stringify({ lat: Number(LAT), lng: Number(LNG) }),
});

if (tokenR.status === 400 && tokenR.json?.distance_m != null) {
  bad(
    `/api/ruta-stops/${STOP_ID}/visit-token`,
    `you are ${Math.round(tokenR.json.distance_m)}m from the stop (max 50m). The seed coord may be wrong, OR you may not be at the stop yet.`,
  );
  console.log(`\n→ ${ok} OK · ${fail} FAIL\n`);
  process.exit(1);
}

if (tokenR.status !== 200 || !tokenR.json?.visit_token) {
  bad(`/api/ruta-stops/${STOP_ID}/visit-token`, `status=${tokenR.status} body=${tokenR.body.slice(0, 200)}`);
  process.exit(1);
}

const visitToken = tokenR.json.visit_token;
const apunte = tokenR.json.apunte_in_situ;
pass(
  `/api/ruta-stops/${STOP_ID}/visit-token`,
  `token issued · ${apunte ? `apunte_in_situ ${apunte.length} chars` : "no apunte"} · distance ${tokenR.json.distance_m ?? "n/a"}m`,
);

if (SKIP_CLAIM) {
  console.log(`\n→ skipping sello-claim per --skip-claim`);
  console.log(`\n→ ${ok} OK · ${fail} FAIL\n`);
  process.exit(fail > 0 ? 1 : 0);
}

// Step 2 · immediate claim should be rejected by earliest_claim_ts anti-cheat.
console.log("\nStep 2 · immediate sello claim (expect 425 · earliest_claim_ts not reached)");
const immediateR = await jsonFetch("/api/sellos-rumbo", {
  method: "POST",
  body: JSON.stringify({ visit_token: visitToken, stop_id: STOP_ID }),
});

if (immediateR.status === 425) {
  pass("/api/sellos-rumbo (immediate)", `correctly rejected · reason=${immediateR.json?.reason ?? "too_soon"}`);
} else if (immediateR.status === 200) {
  bad(
    "/api/sellos-rumbo (immediate)",
    `EXPECTED 425 (too_soon), got 200 — anti-cheat is BROKEN. Sello earned without waiting.`,
  );
} else if (immediateR.status === 409) {
  bad(
    "/api/sellos-rumbo (immediate)",
    `409 conflict — user already has a sello for this stop. To re-test, manually delete the row in sellos_rumbo.`,
  );
} else {
  bad("/api/sellos-rumbo (immediate)", `status=${immediateR.status} body=${immediateR.body.slice(0, 200)}`);
}

// Step 3 · wait, then claim again. Should succeed.
console.log(`\nStep 3 · waiting ${WAIT_SECONDS}s then re-claiming…`);
await sleep(WAIT_SECONDS * 1000);

const claimR = await jsonFetch("/api/sellos-rumbo", {
  method: "POST",
  body: JSON.stringify({ visit_token: visitToken, stop_id: STOP_ID }),
});

if (claimR.status === 200) {
  pass(
    "/api/sellos-rumbo (after wait)",
    `sello inserted · tier_changed=${claimR.json?.tier_changed ?? "?"} · new_tier=${claimR.json?.tier?.tier ?? "?"}`,
  );
} else if (claimR.status === 409) {
  pass("/api/sellos-rumbo (after wait)", `already earned (409) — earlier run succeeded`);
} else if (claimR.status === 410) {
  bad(
    "/api/sellos-rumbo (after wait)",
    `token expired during wait. Re-issue the visit-token (Step 1) and try again, or shorten --wait-seconds.`,
  );
} else {
  bad("/api/sellos-rumbo (after wait)", `status=${claimR.status} body=${claimR.body.slice(0, 200)}`);
}

// Step 4 · re-read tier. Should reflect +1 sello.
console.log("\nStep 4 · verify tier reflects the new sello");
const tierAfterR = await jsonFetch("/api/profile/tier");
if (tierAfterR.status === 200 && tierAfterR.json) {
  const delta = tierAfterR.json.total - sellosBefore;
  if (delta === 1) {
    pass("/api/profile/tier (after claim)", `total ${sellosBefore} → ${tierAfterR.json.total} (+1) · tier ${tierBefore} → ${tierAfterR.json.tier}`);
  } else if (delta === 0 && claimR.status === 409) {
    pass("/api/profile/tier (after claim)", `unchanged · sello already existed before this run`);
  } else {
    bad("/api/profile/tier (after claim)", `expected +1 sello, got delta=${delta}`);
  }
} else {
  bad("/api/profile/tier (after claim)", `status=${tierAfterR.status}`);
}

console.log(`\n→ ${ok} OK · ${fail} FAIL\n`);
process.exit(fail > 0 ? 1 : 0);
