# Magic-link email · XICO voice

## Context

Every TestFlight user's first XICO touchpoint is the magic-link email sent
by Supabase. The default Supabase template is generic ("Magic link",
"Click here to confirm your sign in"). It breaks the manifesto's first-
impression promise. This file is the canonical XICO-voice replacement.

**Where to paste it**: Supabase dashboard → Project Settings → Auth →
Email Templates → "Magic Link" (or "Confirm signup" depending on flow).
Both the subject and the body need updating; Supabase exposes them as
separate fields.

**Supabase variables**: `{{ .ConfirmationURL }}` for the link,
`{{ .Email }}` for the recipient, `{{ .SiteURL }}` for the site root.
Keep them exactly as shown.

---

## Subject (one of these — A/B if you want)

**Option A · most XICO:**
```
Tu llave a XICO
```

**Option B · more explicit:**
```
XICO · enlace de entrada
```

**Option C · for users who might not remember signing up:**
```
Pediste entrar a XICO · aquí está
```

Recommendation: ship A. It assumes the relationship, doesn't explain.
Default to B if confused users start writing in.

---

## Body (HTML)

The Supabase HTML editor accepts standard HTML + the `{{ .ConfirmationURL }}` tag.
Keep the inline styles — many email clients strip `<style>` blocks.

```html
<!DOCTYPE html>
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
            <!-- Masthead -->
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

            <!-- Body -->
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

            <!-- CTA -->
            <tr>
              <td align="center" style="padding: 8px 0 32px 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 16px 32px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #F0ECE6; text-decoration: none; border: 1.5px solid #F0ECE6;">
                  Entrar a XICO
                </a>
              </td>
            </tr>

            <!-- Fallback URL -->
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

            <!-- Closer -->
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
</html>
```

---

## Plain-text fallback

Supabase sends a plain-text version alongside the HTML for clients that
don't render HTML. Keep this in the "Plain text" field if Supabase
exposes it; otherwise it auto-derives from the HTML.

```
XICO · Madrid · Edición 2026

Tu llave para entrar.

Toca el enlace de abajo (o pégalo en tu navegador) y entras directo.
El enlace caduca en una hora.

{{ .ConfirmationURL }}

Si no fuiste tú quien pidió esta entrada, ignora el correo. El enlace
caduca solo, no hay que hacer nada.

— El equipo XICO
Madrid, 2026
```

---

## Why this works (brand-rule audit)

**Manifesto cross-check**:
- "XICO no informa. Revela." → "Tu llave para entrar" reveals the relationship rather than informing about an action. ✓
- Curious without pedantry → no instructional explainer about magic links. ✓
- Elegant without coldness → "no hay que hacer nada" is warm. ✓
- Specific, not generic → "Madrid · Edición 2026" anchors the relationship in place + time. ✓

**Brandbook §3 typography**:
- Newsreader-equivalent (Georgia fallback in email — email clients don't load custom fonts reliably). The serif weight and italic preserve the editorial voice. ✓
- Inter-equivalent (Helvetica Neue / Arial fallback) for the eyebrow and CTA. ✓

**Color system §5**:
- Background `#080508` warm-black. ✓
- Foreground `#F0ECE6` warm bone-white. ✓
- Secondary `#C9C3B8` (italic body, captions). ✓
- Tertiary `#8C887F` (metadata, fallback URL). ✓

**Voice rules**:
- Short sentences. ✓
- Full proper names ("XICO", "el equipo XICO"). ✓
- No empty adjectives. ✓
- No streak/guilt/loss aversion. ✓

---

## Subject line specifically — the writing test

The default Supabase subject "Magic link" answers the question "what kind
of email is this?" XICO's subject answers a different question: "what
does this mean for me?" — "Tu llave a XICO" treats the user as already
in the relationship. They don't need to be told what a magic link is.

If you ever localize to English for the international audience: **"Your
key to XICO"** — same logic. Don't translate as "Your magic link."
