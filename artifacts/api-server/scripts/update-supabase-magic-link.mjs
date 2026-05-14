// One-shot · update Supabase magic-link email template (subject + body)
// via the Management API. Read docs/brand/magic-link-email.md as the source.
//
// Usage:
//   SUPABASE_PAT=sbp_... node artifacts/api-server/scripts/update-supabase-magic-link.mjs
//
// Or with the token inline (less safe, leaves it in shell history):
//   node artifacts/api-server/scripts/update-supabase-magic-link.mjs sbp_...
//
// After running: ROTATE THE TOKEN at
// https://supabase.com/dashboard/account/tokens.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = "jrnsodwpdupybxjlzybv";
const TOKEN = process.env.SUPABASE_PAT || process.argv[2];

if (!TOKEN) {
  console.error("Missing SUPABASE_PAT env var or first arg.");
  process.exit(1);
}

// Inline the HTML body so this script is hermetic (no path-walking surprises).
const subject = "Tu llave a XICO";
const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>XICO</title>
  </head>
  <body style="margin: 0; padding: 0; background: #080508; color: #F0ECE6; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #080508; padding: 48px 24px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 480px;">
            <tr>
              <td style="padding-bottom: 32px; border-bottom: 1px solid rgba(240,236,230,0.10);">
                <p style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #8C887F;">
                  Madrid · Edición 2026
                </p>
                <h1 style="margin: 12px 0 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 42px; letter-spacing: 8px; color: #F0ECE6; font-weight: 600;">
                  XICO
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 0 24px 0;">
                <p style="margin: 0 0 20px 0; font-family: Georgia, serif; font-size: 22px; line-height: 1.35; color: #F0ECE6; letter-spacing: -0.3px;">
                  Tu llave para entrar.
                </p>
                <p style="margin: 0 0 16px 0; font-family: Georgia, serif; font-style: italic; font-size: 16px; line-height: 1.7; color: #C9C3B8;">
                  Toca abajo y entras directo. El enlace caduca en una hora.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 8px 0 32px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #F0ECE6; text-decoration: none; border: 1.5px solid #F0ECE6;">
                  Entrar a XICO
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 0; border-top: 1px solid rgba(240,236,230,0.06);">
                <p style="margin: 0 0 8px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #8C887F;">
                  Si el botón no funciona
                </p>
                <p style="margin: 0; font-family: Georgia, serif; font-style: italic; font-size: 13px; line-height: 1.5; color: #C9C3B8; word-break: break-all;">
                  Copia y pega esta dirección en tu navegador:<br>
                  <span style="color: #8C887F;">{{ .ConfirmationURL }}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px 0 0 0;">
                <p style="margin: 0 0 8px 0; font-family: Georgia, serif; font-style: italic; font-size: 14px; line-height: 1.6; color: #C9C3B8;">
                  Si no fuiste tú quien pidió esta entrada, ignora el correo. El enlace caduca solo, no hay que hacer nada.
                </p>
                <p style="margin: 24px 0 0 0; font-family: Georgia, serif; font-size: 13px; line-height: 1.5; color: #8C887F;">
                  — El equipo XICO<br>
                  Madrid, 2026
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

const r = await fetch(url, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mailer_subjects_magic_link: subject,
    mailer_templates_magic_link_content: html,
  }),
});

const text = await r.text();
if (r.status >= 200 && r.status < 300) {
  console.log(`✓ Updated · status ${r.status}`);
  console.log(`  Subject: "${subject}"`);
  console.log(`  Body: ${html.length} chars of HTML`);
} else {
  console.error(`✗ Failed · status ${r.status}`);
  console.error(text.slice(0, 500));
  process.exit(1);
}

console.log("\n⚠ ROTATE THE SUPABASE PAT NOW at:");
console.log("   https://supabase.com/dashboard/account/tokens");
