// Pure-function tests for visitToken issue/verify.
// Run with: VISIT_TOKEN_SECRET=test-secret node src/lib/__tests__/visitToken.test.mjs

import assert from "node:assert/strict";

process.env.VISIT_TOKEN_SECRET = process.env.VISIT_TOKEN_SECRET ?? "test-secret-do-not-use-in-prod";

const { issueVisitToken, verifyVisitToken } = await import("../visitToken.ts");

console.log("visitToken tests");

const PROFILE = "11111111-1111-1111-1111-111111111111";
const STOP = "stop-001";

// 1. Happy path: token issued at t=0 is verifiable at t=31s
{
  const t0 = 1_700_000_000_000;
  const { token, earliest_claim_ts } = issueVisitToken({ profileId: PROFILE, stopId: STOP, now: t0 });
  assert.equal(earliest_claim_ts, t0 + 30_000);

  const result = verifyVisitToken(token, {
    expectedProfileId: PROFILE,
    expectedStopId: STOP,
    now: t0 + 31_000,
  });
  assert.ok(result.ok, `expected ok, got ${JSON.stringify(result)}`);
  if (result.ok) {
    assert.equal(result.payload.profile_id, PROFILE);
    assert.equal(result.payload.stop_id, STOP);
    assert.equal(result.payload.earliest_claim_ts, t0 + 30_000);
  }
  console.log("  ✓ issued + verified at t+31s");
}

// 2. Too soon: verify at t=15s (before earliest_claim_ts)
{
  const t0 = 1_700_000_000_000;
  const { token } = issueVisitToken({ profileId: PROFILE, stopId: STOP, now: t0 });
  const result = verifyVisitToken(token, {
    expectedProfileId: PROFILE,
    expectedStopId: STOP,
    now: t0 + 15_000,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "too_soon");
  console.log("  ✓ rejects claim before earliest_claim_ts (reason: too_soon)");
}

// 3. Expired: token issued "now"; verify with clock advanced 11min (past TTL)
{
  const tIssue = Date.now();
  const { token } = issueVisitToken({ profileId: PROFILE, stopId: STOP, now: tIssue });
  const result = verifyVisitToken(token, {
    expectedProfileId: PROFILE,
    expectedStopId: STOP,
    now: tIssue + 11 * 60 * 1000, // 11 min in the future = past TTL
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "expired");
  console.log("  ✓ rejects expired token (reason: expired)");
}

// 4. Wrong profile: token issued for A, verify expecting B
{
  const t0 = 1_700_000_000_000;
  const { token } = issueVisitToken({ profileId: PROFILE, stopId: STOP, now: t0 });
  const result = verifyVisitToken(token, {
    expectedProfileId: "99999999-9999-9999-9999-999999999999",
    expectedStopId: STOP,
    now: t0 + 31_000,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "invalid");
  console.log("  ✓ rejects mismatched profile (reason: invalid)");
}

// 5. Wrong stop: token issued for stop-001, verify expecting stop-002
{
  const t0 = 1_700_000_000_000;
  const { token } = issueVisitToken({ profileId: PROFILE, stopId: STOP, now: t0 });
  const result = verifyVisitToken(token, {
    expectedProfileId: PROFILE,
    expectedStopId: "stop-002",
    now: t0 + 31_000,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "invalid");
  console.log("  ✓ rejects mismatched stop (reason: invalid)");
}

// 6. Tampered signature: rejected
{
  const t0 = 1_700_000_000_000;
  const { token } = issueVisitToken({ profileId: PROFILE, stopId: STOP, now: t0 });
  // Flip a character in the signature segment (last of three "header.payload.sig" parts)
  const parts = token.split(".");
  const bad =
    parts[0] +
    "." +
    parts[1] +
    "." +
    parts[2].slice(0, -1) +
    (parts[2].slice(-1) === "A" ? "B" : "A");
  const result = verifyVisitToken(bad, {
    expectedProfileId: PROFILE,
    expectedStopId: STOP,
    now: t0 + 31_000,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "invalid");
  console.log("  ✓ rejects tampered signature (reason: invalid)");
}

// 7. Garbage input
{
  const result = verifyVisitToken("not-a-jwt-at-all", {
    expectedProfileId: PROFILE,
    expectedStopId: STOP,
    now: Date.now(),
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "invalid");
  console.log("  ✓ rejects garbage input (reason: invalid)");
}

// 8. Missing VISIT_TOKEN_SECRET throws
{
  const saved = process.env.VISIT_TOKEN_SECRET;
  delete process.env.VISIT_TOKEN_SECRET;
  let threw = false;
  try {
    issueVisitToken({ profileId: PROFILE, stopId: STOP });
  } catch (e) {
    threw = true;
    assert.match(e.message, /VISIT_TOKEN_SECRET/);
  }
  process.env.VISIT_TOKEN_SECRET = saved;
  assert.ok(threw, "expected issueVisitToken to throw without secret");
  console.log("  ✓ issue throws without VISIT_TOKEN_SECRET");
}

console.log("\n✓ visitToken: all tests pass");
