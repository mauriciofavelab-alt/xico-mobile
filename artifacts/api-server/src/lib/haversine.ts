/**
 * Haversine distance in meters between two lat/lng points.
 *
 * Used to verify a user is physically within 50m of a Ruta stop before
 * issuing a visit_token JWT. Pure function — no I/O.
 *
 * Source: https://www.movable-type.co.uk/scripts/latlong.html
 */

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const aLat = toRad(a.lat);
  const bLat = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat) * Math.cos(bLat) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}
