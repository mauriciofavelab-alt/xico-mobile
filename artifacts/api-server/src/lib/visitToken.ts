/**
 * Visit-token JWTs · anti-fraud without trusting the client.
 *
 * Issued by `POST /api/ruta-stops/:id/visit-token` when the server verifies
 * the user is within 50m (haversine) of a stop's lat/lng. Redeemed by
 * `POST /api/sellos-rumbo` to earn a sello.
 *
 * Embedded claims:
 *   - profile_id          who is claiming the visit
 *   - stop_id             which ruta_stop_id (TEXT, e.g. "stop-001")
 *   - earliest_claim_ts   epoch ms — server rejects sello POSTs before this.
 *                         Client cannot fake this; closing the app, changing
 *                         the device clock, or claiming instantly all fail.
 *   - iat / exp           standard JWT — 10 minute window from issue
 *
 * The 30-second user-visible "ring fills" timer is purely UX. The server
 * enforces earliest_claim_ts. UI never displays the countdown number itself —
 * just a circular progress ring with no exposed value.
 *
 * Secret: process.env.VISIT_TOKEN_SECRET. Must be set in Railway before
 * Week 3 deployment. Separate from Supabase keys for independent rotation.
 */

import jwt from "jsonwebtoken";

const TOKEN_TTL_SECONDS = 600; // 10 min
const EARLIEST_CLAIM_DELAY_MS = 30_000; // 30s post-issue

export type VisitTokenPayload = {
  profile_id: string;
  stop_id: string;
  earliest_claim_ts: number;
};

function getSecret(): string {
  const s = process.env.VISIT_TOKEN_SECRET;
  if (!s) {
    throw new Error(
      "VISIT_TOKEN_SECRET environment variable is required (set in Railway and locally in .env)",
    );
  }
  return s;
}

export function issueVisitToken(args: {
  profileId: string;
  stopId: string;
  now?: number; // injectable for tests
}): { token: string; earliest_claim_ts: number } {
  const now = args.now ?? Date.now();
  const earliest_claim_ts = now + EARLIEST_CLAIM_DELAY_MS;

  const payload: VisitTokenPayload = {
    profile_id: args.profileId,
    stop_id: args.stopId,
    earliest_claim_ts,
  };

  const token = jwt.sign(payload, getSecret(), {
    algorithm: "HS256",
    expiresIn: TOKEN_TTL_SECONDS,
  });

  return { token, earliest_claim_ts };
}

export type VerifyResult =
  | { ok: true; payload: VisitTokenPayload }
  | { ok: false; reason: "expired" | "invalid" | "too_soon" };

export function verifyVisitToken(
  token: string,
  args: {
    expectedProfileId: string;
    expectedStopId: string;
    now?: number;
  },
): VerifyResult {
  const now = args.now ?? Date.now();
  let decoded: jwt.JwtPayload | string;
  try {
    decoded = jwt.verify(token, getSecret(), {
      algorithms: ["HS256"],
      // Inject clock for testability. In prod, args.now is omitted and the
      // jsonwebtoken library uses Date.now() internally.
      clockTimestamp: Math.floor(now / 1000),
    });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) return { ok: false, reason: "expired" };
    return { ok: false, reason: "invalid" };
  }

  if (typeof decoded === "string" || decoded === null) {
    return { ok: false, reason: "invalid" };
  }

  const payload = decoded as jwt.JwtPayload & Partial<VisitTokenPayload>;
  if (
    typeof payload.profile_id !== "string" ||
    typeof payload.stop_id !== "string" ||
    typeof payload.earliest_claim_ts !== "number"
  ) {
    return { ok: false, reason: "invalid" };
  }

  if (payload.profile_id !== args.expectedProfileId) return { ok: false, reason: "invalid" };
  if (payload.stop_id !== args.expectedStopId) return { ok: false, reason: "invalid" };
  if (now < payload.earliest_claim_ts) return { ok: false, reason: "too_soon" };

  return {
    ok: true,
    payload: {
      profile_id: payload.profile_id,
      stop_id: payload.stop_id,
      earliest_claim_ts: payload.earliest_claim_ts,
    },
  };
}
