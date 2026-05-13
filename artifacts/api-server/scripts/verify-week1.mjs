// Verification queries for Week 1 of the Ruta + Rumbos plan.
// Run after migration + seed.

import postgres from "postgres";
const url = process.env.SUPABASE_DB_URL;
if (!url) { console.error("SUPABASE_DB_URL required"); process.exit(1); }
const sql = postgres(url, { ssl: "require", max: 1 });

function ok(label, actual, expected) {
  const pass = actual === expected;
  console.log(`  ${pass ? "✓" : "✗"} ${label}: ${actual}${pass ? "" : ` (expected ${expected})`}`);
  return pass;
}

let allPass = true;

try {
  console.log("→ Verification gate · Week 1");

  const [{ count: rumbosCount }] = await sql`SELECT count(*)::int FROM rumbos`;
  allPass = ok("rumbos rows", rumbosCount, 4) && allPass;

  const [{ count: stopsWithRumbo }] = await sql`SELECT count(*)::int FROM ruta_stops WHERE rumbo_id IS NOT NULL`;
  allPass = ok("ruta_stops with rumbo", stopsWithRumbo, 5) && allPass;

  const [{ count: stopsWithGeo }] = await sql`SELECT count(*)::int FROM ruta_stops WHERE lat IS NOT NULL`;
  allPass = ok("ruta_stops with lat/lng", stopsWithGeo, 5) && allPass;

  const [{ count: stopsWithDespacho }] = await sql`SELECT count(*)::int FROM ruta_stops WHERE despacho_text IS NOT NULL`;
  allPass = ok("ruta_stops with despacho_text", stopsWithDespacho, 5) && allPass;

  const [{ count: stopsWithApunte }] = await sql`SELECT count(*)::int FROM ruta_stops WHERE apunte_in_situ IS NOT NULL`;
  allPass = ok("ruta_stops with apunte_in_situ", stopsWithApunte, 5) && allPass;

  const [{ count: pulseRows }] = await sql`SELECT count(*)::int FROM madrid_pulse`;
  allPass = ok("madrid_pulse rows", pulseRows, 30) && allPass;

  const [{ count: timeModeRows }] = await sql`SELECT count(*)::int FROM companion_phrases WHERE time_mode IN ('madrugada','atardecer')`;
  allPass = ok("companion_phrases time-mode rows", timeModeRows, 8) && allPass;

  const [{ count: emptyTables }] = await sql`
    SELECT count(*)::int FROM (
      SELECT 'sellos_rumbo' t, count(*) c FROM sellos_rumbo
      UNION ALL SELECT 'ruta_stop_notes',   count(*) FROM ruta_stop_notes
      UNION ALL SELECT 'emotional_events',  count(*) FROM emotional_events
      UNION ALL SELECT 'partners',          count(*) FROM partners
    ) s WHERE c = 0`;
  allPass = ok("empty-on-day-1 tables (sellos/notes/events/partners)", emptyTables, 4) && allPass;

  // Ruta marked correctly
  const ruta = await sql`SELECT id, week_key, editor_name, published_at FROM ruta WHERE id = 'ruta-001'`;
  console.log("\n  ruta-001 publication metadata:");
  console.log("   ", JSON.stringify(ruta[0]));

  // Rumbo distribution
  console.log("\n  Rumbo distribution across inaugural Ruta:");
  const dist = await sql`
    SELECT rs.order_num, rs.name, r.slug AS rumbo, r.nahuatl_name
    FROM ruta_stops rs JOIN rumbos r ON r.id = rs.rumbo_id
    WHERE rs.ruta_id = 'ruta-001' ORDER BY rs.order_num`;
  for (const row of dist) {
    console.log(`    ${row.order_num} · ${row.name.padEnd(30)} → ${row.rumbo.padEnd(6)} (${row.nahuatl_name})`);
  }

  // profile_tier sanity
  console.log("\n  profile_tier sanity (unknown UUID → iniciado/0):");
  const tier = await sql`SELECT profile_tier('00000000-0000-0000-0000-000000000000'::uuid) AS t`;
  console.log("   ", JSON.stringify(tier[0].t));

  console.log(`\n${allPass ? "✓ ALL CHECKS PASS" : "✗ SOME CHECKS FAILED"}`);
  process.exit(allPass ? 0 : 1);
} finally {
  await sql.end();
}
