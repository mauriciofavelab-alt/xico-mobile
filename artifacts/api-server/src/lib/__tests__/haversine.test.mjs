// Pure-function tests for haversineMeters.
// Run with: node src/lib/__tests__/haversine.test.mjs
// No framework — node:assert + ESM.

import assert from "node:assert/strict";
import { haversineMeters } from "../haversine.ts";

console.log("haversine tests");

// 1. Identity: same point → 0
{
  const d = haversineMeters({ lat: 40.4286, lng: -3.6885 }, { lat: 40.4286, lng: -3.6885 });
  assert.ok(d < 0.001, `same point should be 0, got ${d}`);
  console.log("  ✓ same point returns 0");
}

// 2. Casa de México → Punto MX (Madrid): both real stops in our inaugural Ruta.
//    Expected: ~1.2km (confirmed via Google Maps walking distance ~1.4km).
{
  const d = haversineMeters({ lat: 40.4286, lng: -3.6885 }, { lat: 40.4221, lng: -3.6741 });
  assert.ok(d > 1000 && d < 1500, `Casa de México → Punto MX should be 1000-1500m, got ${d}`);
  console.log(`  ✓ Casa de México → Punto MX = ${Math.round(d)}m`);
}

// 3. 50m sanity: a point ~50m due east of stop-001 (about 0.000585° in longitude at 40.4°N)
{
  const d = haversineMeters({ lat: 40.4286, lng: -3.6885 }, { lat: 40.4286, lng: -3.687915 });
  assert.ok(d > 45 && d < 55, `50m east should be ~50m, got ${d}`);
  console.log(`  ✓ ~50m east of stop-001 = ${Math.round(d)}m`);
}

// 4. 60m due north (about 0.000539° latitude)
{
  const d = haversineMeters({ lat: 40.4286, lng: -3.6885 }, { lat: 40.429139, lng: -3.6885 });
  assert.ok(d > 55 && d < 65, `60m north should be ~60m, got ${d}`);
  console.log(`  ✓ ~60m north of stop-001 = ${Math.round(d)}m`);
}

// 5. Antipode sanity: roughly π × R_earth ≈ 20,015 km
{
  const d = haversineMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 180 });
  assert.ok(d > 19_900_000 && d < 20_100_000, `antipode should be ~20015km, got ${d}`);
  console.log(`  ✓ antipode (0,0 → 0,180) = ${Math.round(d / 1000)}km`);
}

// 6. Symmetric: haversine(a, b) === haversine(b, a)
{
  const a = { lat: 40.4286, lng: -3.6885 };
  const b = { lat: 40.4221, lng: -3.6741 };
  const d1 = haversineMeters(a, b);
  const d2 = haversineMeters(b, a);
  assert.ok(Math.abs(d1 - d2) < 0.001, `symmetric, got d1=${d1} d2=${d2}`);
  console.log("  ✓ symmetric: haversine(a,b) === haversine(b,a)");
}

console.log("\n✓ haversine: all tests pass");
