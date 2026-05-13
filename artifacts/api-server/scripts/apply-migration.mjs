// Apply a SQL migration file against Supabase Postgres via the IPv4 pooler.
// Usage:
//   SUPABASE_DB_URL="postgresql://..." node scripts/apply-migration.mjs path/to/file.sql
//
// Connection notes:
//   - Direct host db.<ref>.supabase.co is IPv6-only and fails on many networks.
//   - Use the pooler: postgres.<ref>@aws-0-<region>.pooler.supabase.com:5432
//   - SSL required.

import postgres from "postgres";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL is required");
  process.exit(1);
}
const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migration.mjs <path/to/file.sql>");
  process.exit(1);
}

const sqlText = readFileSync(resolve(file), "utf8");

const sql = postgres(url, {
  ssl: "require",
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});

console.log(`→ Applying ${file} (${sqlText.length} chars)`);
try {
  await sql.unsafe(sqlText);
  console.log("✓ Migration applied successfully");
} catch (e) {
  console.error("✗ Migration failed:");
  console.error("  code:", e.code);
  console.error("  message:", e.message);
  if (e.position) console.error("  position:", e.position);
  if (e.detail) console.error("  detail:", e.detail);
  if (e.hint) console.error("  hint:", e.hint);
  process.exit(1);
} finally {
  await sql.end();
}
