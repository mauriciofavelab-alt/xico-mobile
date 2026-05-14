# XICO · App Store Connect listing

Manuscript for copy/paste into App Store Connect → App Information +
TestFlight build metadata. Written in the XICO voice per the manifesto +
brandbook. Spanish-first to match the product surface; an English variant
is included for the international audience the manifesto names.

---

## Spanish (primary listing)

### App Name (30 chars max)
```
XICO
```
*(4 chars · the wordmark stands alone)*

### Subtitle (30 chars max)
```
México en Madrid, semana a semana
```
*(33 chars · trim:)*
```
México en Madrid, cada semana
```
*(28 chars ✓)*

### Promotional Text (170 chars · editable without resubmission · reset weekly)
```
Cada domingo, una Ruta nueva. Cinco paradas en Madrid escritas por editores mexicanos. Camínala y tu pasaporte se llena. No es turismo. Es continuidad.
```
*(159 chars ✓)*

### Description (4000 chars · permanent until next submission)
```
XICO es una publicación editorial sobre México en España. No te dice qué ver: te dice qué reconocer.

Cada domingo a las 9, una editora — María Vázquez, Sofía Niño de Rivera, Damián Ortega, Andrés Felipe Solano — publica una Ruta nueva. Cinco a siete paradas en Madrid: una galería, una mezcalería, una sala de Casa de México, un barrio en Lavapiés. Cada parada tiene un despacho público que puedes leer desde casa, y un apunte privado que se abre solo cuando llegas al sitio.

Caminar la Ruta llena tu Pasaporte de los Cuatro Rumbos — un rosetón mexica con cuatro pétalos: Mictlampa (memoria), Tlapallan (renovación), Huitzlampa (fuego celeste), Cihuatlampa (oficio). Cada semana tienes una nueva oportunidad de completarlo. Cada Ruta archiva en Tu Códice.

Esto no es una app de turismo. No hay puntos, no hay rachas, no hay notificaciones que te empujen. Hay editores con nombre, hay rutas escritas, hay lugares físicos donde reconocer algo de México sin tener que volver.

Pensado para dos audiencias:
· Mexicanos en Madrid buscando continuidad cultural sin folklore.
· Quien sea con curiosidad por una capital cultural que España todavía está aprendiendo a leer.

Características v1:
· La Ruta semanal · publicada los domingos a las 9 AM, escrita por editores mexicanos viviendo en Madrid.
· Pasaporte de los Cuatro Rumbos · gamificación cosmológica, no por puntos.
· El Despacho del día · una nota cultural cada mañana, con palabra náhuatl y lugar en Madrid.
· Carta del Equipo · selección personalizada según tus intereses culturales.
· Modo hora · la tipografía cambia entre madrugada, día y atardecer.
· Re-entrada emocional · si vuelves después de una ausencia, la app te recibe sin culpa.

XICO no informa. Revela.

— El equipo editorial XICO, Madrid 2026
```
*(~1750 chars · well under 4000)*

### Keywords (100 chars · comma-separated, no spaces around commas)
```
mexico,madrid,cultura,ruta,mezcal,arte,gastronomia,español,editorial,casa de mexico,oaxaca,diaspora
```
*(99 chars ✓)*

### What's New (4000 chars · per-build · for Build 5)
```
Build 5 — La inaugural Ruta de Madrid

· Cinco paradas escritas por María Vázquez: Casa de México, Punto MX, Barracuda MX, Corazón de Agave, La Tilica Mezcalería.
· Cada parada tiene su despacho público y su apunte in situ — un texto que solo aparece cuando llegas al sitio.
· El Pasaporte de los Cuatro Rumbos se llena al caminar.
· Modo hora — la app cambia de voz entre madrugada, día y atardecer.
· Re-entrada emocional — si vuelves después de siete días, te recibe sin pedirte explicaciones.

Esta es la primera Ruta. Habrá una nueva cada domingo.

— María Vázquez, editora · Madrid
```

### Support URL
```
https://xico.app/soporte
```
*(if domain not provisioned yet, use: `mailto:soporte@xico.app` or a Notion public page)*

### Marketing URL (optional)
```
https://xico.app
```
*(or Instagram if site isn't ready: `https://instagram.com/xico.madrid`)*

### Privacy Policy URL (REQUIRED · cannot ship without)
```
https://xico.app/privacidad
```
*(if no domain, host a Notion/Markdown page anywhere public and link it — Apple just needs the URL to resolve to a privacy policy describing data collection)*

### Category
- Primary: **Travel** OR **Lifestyle**
- Secondary: **News**

*(Travel is risky — manifesto explicitly rejects "tourist guide" framing. Lifestyle + News is more honest. Lifestyle primary.)*

### Age Rating
- 17+ (alcohol references in stops mention mezcal/bars). Trigger the Apple wizard for "Mature/Suggestive Themes — Infrequent/Mild" → 17+.

---

## English (international audience variant · optional for v1, important for v2)

### Subtitle
```
Mexico in Madrid, week by week
```

### Promotional Text
```
Every Sunday, a new Ruta. Five stops in Madrid, written by Mexican editors. Walk it and your passport fills. Not tourism. Continuity.
```

### Description (excerpt — translate full Spanish version when localizing)
```
XICO is an editorial publication about Mexico in Spain. It doesn't tell you what to see; it tells you what to recognize.

Every Sunday at 9, a Mexican editor publishes a new Ruta — five to seven stops across Madrid. Each stop has a public despacho you can read anywhere, and a private apunte that only opens when you arrive at the location.

Walking the Ruta fills your Passport of the Four Cardinal Directions — a Mexica four-petal medallion. Each week, a new chance to complete it.

This is not a tourism app. No points, no streaks, no notifications pushing you. Just named editors, written routes, and physical places where you can recognize something of Mexico without having to go back.
```

---

## Screenshots brief (6.7" device · 1290×2796 · need at least 3, up to 10)

Suggested 5-shot reel:

1. **Mi Lectura tab** — Roseton at week-1 partial state (2/5 ticks on Norte/Este petals), Carta del Equipo above. Caption overlay: *"Tu pasaporte se llena al caminar."*
2. **/ruta listing** — Masthead "Semana 19" + 5 stop cards. Caption: *"Cinco paradas en Madrid, cada domingo."*
3. **/ruta/stop/[id] · en_camino** — monumental "Casa de México en España" hero, lock chip top-right. Caption: *"Apunte cerrado · ábrelo en el sitio."*
4. **/ruta/stop/[id] · llegada with apunte visible** — same stop, veil lifted, apunte text visible. Caption: *"Lo que solo puedes leer estando ahí."*
5. **Re-entrada welcome screen** — "Hace 8 días que no te leíamos." Caption: *"Una app que te recibe sin pedirte explicaciones."*

Generate via iOS simulator screenshot capture + Figma frame for the caption overlay.

---

## Privacy answers (App Privacy section)

### Data Collected
- **Email address** · purpose: app functionality (auth via magic link)
- **Coarse location** · purpose: app functionality (geo-verifying stop visits, NOT for ads/analytics)
- **User content** · the optional 1-line anotación the user writes about a stop
- **Identifiers** · Supabase auth UUID

### NOT Collected
- Precise location (we use coarse — 50m radius check, never logged)
- Contacts, photos, browsing history, advertising data, health data
- No third-party trackers

### Data Linked to User
- Email + Supabase ID + their sellos + their anotaciones — required for the product to function (cross-device sync)

### Data Used to Track You
- NONE.

---

## Submission runbook (you execute these locally)

```powershell
# From repo root:
cd artifacts/xico-mobile

# 1. Generate an Apple App-Specific Password
# Open https://appleid.apple.com/account/manage
# Sign in with maufavela@hotmail.com (use the NEW password after you rotate)
# → Sign-In & Security → App-Specific Passwords → Generate Password
# Label: "EAS CLI · XICO"
# Copy the 4×4 alphanumeric password (e.g., abcd-efgh-ijkl-mnop)

# 2. Verify EAS CLI is logged into your Expo account
eas whoami
# If not logged in:  eas login

# 3. Build the iOS binary (takes ~15 min on Apple's hosted builders)
eas build --platform ios --profile production

# 4. Once the build completes, submit to TestFlight
eas submit --platform ios --profile production
# It will prompt:
#   - "Apple ID:" → maufavela@hotmail.com (or hit enter; it's in eas.json)
#   - "Apple ID password:" → paste the APP-SPECIFIC PASSWORD (not your primary Apple password)
# EAS uploads the .ipa to App Store Connect.
# TestFlight processing takes 10-30 minutes.

# 5. While processing, paste this file's copy into App Store Connect
# https://appstoreconnect.apple.com → My Apps → XICO →
#   1.0 Prepare for Submission → fill description, keywords, screenshots
#   Privacy → fill privacy questionnaire per "Data Collected" above
#   TestFlight → once build appears, add internal tester (yourself), submit for Beta App Review

# 6. After Apple approves (24-48h), invite external testers via TestFlight
```

---

## Critical pre-submission checklist

- [ ] App icon (1024×1024) is the XICO wordmark or Mexica glyph — NOT default Expo icon
- [ ] Splash matches: black `#080508` bg + centered logo
- [ ] Apple ID password ROTATED (see security flag in chat)
- [ ] App-Specific Password generated for EAS CLI use
- [ ] Privacy Policy URL resolves to a real page
- [ ] Support URL resolves (or mailto:)
- [ ] Build version matches `app.json:version` (currently "1.0.0")
- [ ] At least 3 device screenshots uploaded (1290×2796 for 6.7" devices)
- [ ] Internal tester (you) added in TestFlight
- [ ] EXPO_PUBLIC_DOMAIN points to `xico-api-production.up.railway.app` ✓ (verified in eas.json)
- [ ] VISIT_TOKEN_SECRET set in Railway env (for the sello flow to work)
