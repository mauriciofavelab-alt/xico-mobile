// Runner for pure-function tests under src/lib/__tests__.
// Pattern: src/lib/__tests__/<name>.test.mjs imports from ../<name>.ts.
// Run with: VISIT_TOKEN_SECRET=<any> node scripts/run-pure-tests.mjs
//
// Why not vitest/jest: project has no test framework installed, and adding one
// requires resolving the workspace dep tangle (decided 2026-05-14 in the
// implementation plan, §locked decisions #2). When we eventually need
// component or integration tests, revisit.

import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const testsDir = resolve(__dirname, "..", "src", "lib", "__tests__");

const files = readdirSync(testsDir).filter((f) => f.endsWith(".test.mjs"));
if (files.length === 0) {
  console.log("No test files found in", testsDir);
  process.exit(0);
}

if (!process.env.VISIT_TOKEN_SECRET) {
  process.env.VISIT_TOKEN_SECRET = "test-do-not-use-in-prod";
}

let failures = 0;
for (const file of files) {
  console.log(`\n──── ${file} ────`);
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", resolve(testsDir, file)],
    { stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) failures++;
}

if (failures > 0) {
  console.log(`\n✗ ${failures} suite(s) failed`);
  process.exit(1);
}
console.log("\n✓ All pure-function tests pass");
