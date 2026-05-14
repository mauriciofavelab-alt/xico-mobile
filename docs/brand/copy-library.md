# XICO copy library · error states, empty states, push notifications

## Context

The /code-review pass earlier today flagged auth error messages as
"vague" and the audit identified several empty/error states with
default-React-Native copy. This file is the canonical source for the
non-editorial UI copy — strings that appear in error toasts, empty
states, and push notifications.

**Brand-rule**: never ship default React Native or Supabase strings.
Every user-facing string passes through XICO voice. The rules:

- short sentences
- specific cause + clear recovery
- no streak/guilt/loss aversion
- no exclamation marks (the manifesto is quiet, not loud)
- no emoji
- editorial-italic for soft tones (use sparingly)

Spanish first. English variants below each block for the international
audience (per the App Store listing manuscript). Both versions must
preserve the same tone.

---

## Authentication errors (app/auth.tsx · prior /code-review flagged these)

### Network failure submitting email

```
No salió. Revisa tu conexión y vuelve a pedirlo.
```
EN: `That didn't go through. Check your connection and try again.`

### Email format invalid

```
Ese correo no parece estar bien escrito. Revísalo.
```
EN: `That email doesn't look right. Take another look.`

### Rate limit (429 from Supabase)

```
Pediste varios en muy poco tiempo. Espera un minuto y vuelve.
```
EN: `Too many requests in a short window. Wait a minute and come back.`

### Generic 500 / unknown

```
Algo se nos rompió de este lado. Vuelve a intentar en un momento.
```
EN: `Something broke on our end. Try again in a moment.`

### Expired magic link (when user clicks an old link)

```
Ese enlace ya caducó. Pide uno nuevo desde la app.
```
EN: `That link has expired. Request a new one from the app.`

CTA on the expired-link screen:

```
Pedir uno nuevo
```
EN: `Get a new link`

### Successful link sent (success state, not error)

```
Te mandamos el enlace. Revisa tu correo.
```
EN: `We sent the link. Check your inbox.`

Secondary line (italic, smaller):

```
Si no llega en un minuto, mira en spam o pídelo otra vez.
```
EN: `If it doesn't arrive in a minute, check spam or request again.`

---

## Geo-permission denied (app/ruta/stop/[id].tsx)

The current copy: *"Para abrir el apunte XICO necesita saber que estás
aquí. Concede ubicación."* — fine but a touch wordy. Tighter version:

```
Para abrir este apunte XICO necesita saber que estás en el sitio. Concede ubicación.
```
EN: `To open this apunte XICO needs to know you're here. Grant location.`

### Geo-permission permanently denied (user said "Never")

```
Bloqueaste la ubicación. Cámbialo en Ajustes para abrir los apuntes.
```
EN: `Location is blocked. Change it in Settings to open the apuntes.`

CTA:

```
Abrir Ajustes
```
EN: `Open Settings`

### Too far from the stop (within geo permission, but > 50m)

```
Te faltan ~{N}m hasta el sitio. Cuando llegues, el apunte se abre solo.
```
EN: `~{N}m to go. The apunte opens on its own when you arrive.`

### GPS confused indoors / signal poor

```
La señal te ubica un poco lejos. Sal a la calle un segundo y vuelve.
```
EN: `Your signal puts you a bit far. Step outside for a second and come back.`

---

## Sello-earning failures

### Visit-token expired during walk

```
Llegaste tarde al apunte de hoy. Vuelve a abrirlo y XICO te lo guarda.
```
EN: `You arrived after the apunte's window closed. Reopen it and XICO will hold it for you.`

### Visit-token claimed too soon (425 anti-cheat — shouldn't reach user)

This case only fires in dev/testing. If it ever reaches the user UI,
something is wrong upstream — show a generic retry.

```
Eso tomó menos tiempo del esperado. Vuelve a intentar.
```
EN: `That happened faster than expected. Try again.`

### Already earned this sello (409 conflict)

```
Ya tienes este sello. Está guardado en tu Pasaporte.
```
EN: `You already have this sello. It lives in your Pasaporte.`

---

## Annotation submit (the 1-line note after a sello)

### Empty / character limit

```
Una línea, opcional. {N} / 280.
```
EN: `One line, optional. {N} / 280.`

### Submit fail (network)

```
No salió. Tu línea sigue aquí, vuelve a guardarla en un momento.
```
EN: `That didn't go through. Your line is still here — save it again in a moment.`

### Submit success

```
Anotación guardada. El equipo la lee.
```
EN: `Note saved. The team reads them.`

(NB: don't say "we read them all" — the manifesto avoids overclaiming.)

---

## Empty states

### No Ruta this week (between drops, e.g. Saturday before Sunday 9am)

```
La Ruta de esta semana se publica el domingo a las 9.
```
EN: `This week's Ruta drops Sunday at 9 AM.`

Secondary line (italic):

```
Mientras tanto, El Despacho del día sigue ahí.
```
EN: `Meanwhile, El Despacho del día is still here.`

### No saved articles

```
Aún no has guardado nada. El icono de marcador en cualquier pieza la guarda aquí.
```
EN: `Nothing saved yet. The bookmark icon on any piece saves it here.`

### No annotations

```
No has dejado ninguna anotación. Al caminar una Ruta puedes dejar una línea por parada.
```
EN: `No annotations yet. Walking a Ruta lets you leave one line per stop.`

### No earned sellos (Pasaporte empty state)

The Rosetón itself is the visual empty state — 4 ghost petals. But if a
text overlay is needed:

```
Tu Pasaporte se llena al caminar. La primera Ruta es la de esta semana.
```
EN: `Your Pasaporte fills as you walk. The first Ruta is this week's.`

### Search returns no results (when search ships, v1.5+)

```
Ese término no tiene resultados aún. XICO sigue creciendo.
```
EN: `Nothing matches that yet. XICO keeps growing.`

### Offline / no internet

```
Sin conexión. Tu Pasaporte y los apuntes guardados siguen accesibles.
```
EN: `No connection. Your Pasaporte and saved apuntes are still available.`

---

## Re-entry welcome (after 7+ day absence)

Already shipped in `ReEntryWelcome.tsx`. Reference for consistency:

```
Hace {N} días que no te leíamos. No tienes nada que recuperar — la Ruta
sigue su curso, los lugares quedan.
```
EN: `It's been {N} days since we last read you. There's nothing to make up — the Ruta keeps going, the places stay.`

---

## Push notifications (v1.5+ when push ships)

Push isn't in v1, but when it lands, the editorial voice must hold.
These are the canonical templates. Always Spanish-first; English is a
secondary localization.

### Sunday Ruta drop (9:00 AM weekly)

Title:
```
La Ruta · Semana {N}
```

Body:
```
{Editor name} publica desde {primer barrio}. {N} paradas.
```

Example: `María Vázquez publica desde Lavapiés. 5 paradas.`

### A stop is within 200m of the user (opportunistic, opt-in only)

Title:
```
Estás cerca de {nombre del sitio}
```

Body:
```
{Editor name} dejó un apunte aquí. Camina dos calles más.
```

### Madrid Pulse · daily morning (8:00 AM, opt-in)

Title:
```
Madrid · hoy
```

Body:
```
{40-word madrid_pulse text, truncated to 100 chars}
```

### A sello is about to expire (NEVER — XICO doesn't do timed expiration)

This template doesn't exist. We don't do loss-aversion. If you ever
feel tempted to write "you'll lose this sello if you don't..." — stop.
Read the manifesto.

---

## Toast / snackbar conventions

- All toasts auto-dismiss in 4 seconds
- Critical errors stay until user dismisses
- Toast color: `Colors.surfaceHigher` background, accent stripe top
- Toast text: `TypeSize.meta` (13pt), `Fonts.serifItalic` for soft tones,
  `Fonts.sansSemibold` for action language

---

## Implementation note

This file is the brand-side spec. The application-side TypeScript
implementation should:

- Live in `artifacts/xico-mobile/constants/copy.ts` (does not exist yet — v1.1)
- Export an i18n-shaped object: `Copy.errors.auth.networkFailure.es`
- Be referenced by every UI surface that has user-facing strings
- Reject inline string literals via a lint rule (post-v1)

For v1, copy is inline in components. This document is the source-of-
truth-on-paper that components SHOULD eventually pull from.
