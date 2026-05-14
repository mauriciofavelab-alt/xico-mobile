# XICO · Press kit

For journalists, editors, partners, and other people who ask "what is
XICO and what's the angle?" Send this. It's the single source of truth
for how XICO describes itself externally.

Last updated: 2026-05-14 · Madrid

---

## The one-liner (for tweet bios, App Store subtitles, headlines)

```
XICO — México en Madrid, semana a semana.
```

EN: `XICO — Mexico in Madrid, week by week.`

Backup line, when you need to clarify what kind of app it is without
sounding like a tourist guide:

```
Una publicación editorial sobre la presencia mexicana en Madrid, en formato app.
```

EN: `An editorial publication about the Mexican presence in Madrid, in app form.`

---

## The 50-word paragraph (for press release leads, partner emails)

> XICO es una publicación editorial sobre México en España, distribuida
> como app. Cada domingo, una editora mexicana publica una Ruta de cinco
> paradas en Madrid — galerías, mezcalerías, librerías. Caminar la Ruta
> llena un pasaporte cosmológico mexica. No es turismo. Es continuidad
> cultural diseñada para mexicanos en Europa.

EN:
> XICO is an editorial publication about Mexico in Spain, distributed
> as an app. Every Sunday, a Mexican editor publishes a Ruta of five
> stops across Madrid — galleries, mezcalerías, bookshops. Walking the
> Ruta fills a Mexica cosmological passport. It's not tourism. It's
> cultural continuity built for Mexicans living in Europe.

---

## The 150-word context paragraph (for feature pieces, deeper coverage)

> En 2024, Madrid se convirtió en uno de los centros más densos de la
> diáspora mexicana fuera de Estados Unidos. La oferta cultural creció
> rápido — Casa de México, restaurantes con estándar Sello Copil,
> galerías que muestran arte mexicano contemporáneo. Pero la
> infraestructura editorial no creció con ella. XICO llena ese hueco.
>
> Cada Ruta es escrita por una editora con nombre — María Vázquez en
> la primera semana, otros editores rotando. Cada parada tiene un
> despacho público que cualquiera puede leer, y un apunte privado que
> solo se abre cuando el usuario llega físicamente al sitio. El acto de
> caminar es parte del producto.
>
> La app evita las trampas habituales: nada de gamificación infantil,
> nada de FOMO, nada de notificaciones que empujan. La cosmología
> mexica (los cuatro rumbos: Mictlampa, Tlapallan, Huitzlampa,
> Cihuatlampa) estructura el sistema de progresión. XICO es premium,
> no por su precio, sino por su criterio.

EN equivalent available on request — for first English-language press
the paragraph translates almost 1:1.

---

## Founder

```
Mauricio Favela · Madrid · maufavela@hotmail.com
```

For press inquiries, use the same email until xico.app/contacto exists.

Founder bio one-line (for "About" sections):

```
Mauricio Favela es mexicano, vive en Madrid, y fundó XICO en 2026.
```

EN: `Mauricio Favela is Mexican, lives in Madrid, and founded XICO in 2026.`

---

## Editorial team

The first editor on record:

```
María Vázquez — editora inaugural, autora de la primera Ruta XICO.
```

EN: `María Vázquez — inaugural editor, author of the first XICO Ruta.`

Other editors are listed in `artifacts/api-server/src/seed.sql` and
the live app's `/api/editor-letters` endpoint. For press, name only
the editor on the piece being written about.

---

## Naming guidance

### Always use

- **XICO** — all caps, no hyphen, no period. Pronounced "SHEE-koh" (the
  Nahuatl etymology — *xictli* means "navel," "center"). The
  English-speaking press will mis-pronounce as "ZEE-koh" or
  "EEK-oh" — correct gently.

- **La Ruta** — feminine singular, capitalized. "La Ruta de esta
  semana." Not "the route" or "weekly route" in English copy;
  preserve as **La Ruta** italicized, like a brand term.

- **El Despacho** — masculine singular, capitalized. The daily editorial
  brief. In English, preserve as **El Despacho**.

- **El apunte / los apuntes** — lowercase, no italic. The geo-locked
  text at each stop.

- **El sello / los sellos** — lowercase. The earned marks in the
  Pasaporte.

- **Pasaporte de los Cuatro Rumbos** — the full name on first reference.
  "Pasaporte" alone afterward.

- **Rumbos** (proper noun) when referring to the cosmological system.
  Each rumbo has a Nahuatl name: **Mictlampa, Tlapallan, Huitzlampa,
  Cihuatlampa**. Always render with the Mexica origin attribution
  ("según la cosmología mexica del Códice Fejérváry-Mayer").

- **Mexicanos en Madrid** — primary audience descriptor. Preserve the
  Spanish "en" even in English copy when referring to the community
  specifically.

### Never use

- "Mexican-themed" — XICO is not themed, it's authored
- "Mexican-American" or "Hispanic" — these are US categories, not Spanish-context
- "Latino" — too broad; XICO is specifically Mexican
- "Cinco de Mayo," "Día de los Muertos themed" — XICO does not lean
  on tourist Mexico
- "App for Mexican culture" — XICO is a *publication*, not an *app for*

---

## Visual assets

Logo (the XICO wordmark) and color palette swatches live in:

```
artifacts/xico-mobile/assets/images/icon.png    · 1024x1024 app icon
artifacts/xico-mobile/constants/colors.ts        · canonical hex values
docs/01_XICO_BRAND_RULES.md                      · usage rules
```

For high-resolution exports (300 DPI for print press), contact Mauricio
directly. SVG vector versions are not yet exported as of v1 — defer to
when a press piece requires them.

The five primary brand colors (in print-press-ready format):

| Name | Hex | Use |
|------|-----|-----|
| Negro XICO | `#080508` | Background, primary surfaces |
| Magenta Barragán | `#9c1a47` | Pillar accent · Índice |
| Cobalto Interior | `#1a3d8a` | Pillar accent · Cultura |
| Ocre Casa Azul | `#b8820a` | Pillar accent · México Ahora |
| Hueso bone-white | `#F0ECE6` | Primary text on dark |

The Rumbos palette (cosmological, separate from pillars):

| Rumbo | Hex | Cardinal | Mexica meaning |
|-------|-----|----------|----------------|
| Mictlampa | `#0E1018` | Norte | Memoria, antepasados |
| Tlapallan | `#D9357B` | Este | Amanecer, renovación (Xipe Totec) |
| Huitzlampa | `#234698` | Sur | Sol guerrero (Huitzilopochtli) |
| Cihuatlampa | `#EDE6D8` | Oeste | Femenino, oficio, atardecer |

---

## Quotes (pre-approved, ready to drop into pieces)

The following are paragraphs Mauricio has either said in public or is
willing to be quoted on. A journalist can use these without follow-up.

**On the product premise:**
> "Los productos para diáspora caen siempre en lo mismo: nostalgia,
> mercado, restaurantes, o información cruda. XICO no es ninguna de las
> cuatro. Es una publicación editorial con frecuencia semanal que
> reconoce México en Madrid, sin disfrazarlo de turismo."

**On the cosmology:**
> "Usé los cuatro rumbos mexicas porque son la única estructura de
> progresión cultural que es ya nuestra. Niveles, puntos, badges — eso
> es ajeno. Mictlampa, Tlapallan, Huitzlampa y Cihuatlampa son
> cosmología real, no decoración."

**On why an app and not a website:**
> "La app permite que el lector llegue físicamente al sitio. Es la única
> forma de que el contenido cambie por presencia. Una página web no
> hace eso. Por eso XICO existe como app."

**On the audience tension (mexicanos vs. españoles curiosos):**
> "Tengo dos audiencias y no quiero elegir. Mexicanos en Madrid buscan
> continuidad cultural. Madrileños con criterio buscan una capital
> cultural que España todavía está aprendiendo a leer. Las dos audiencias
> leen el mismo texto. La diferencia está en lo que reconocen."

---

## Story angles a journalist can pitch

These are the angles XICO actively wants to be covered as. If a
journalist proposes one of these, lean in. If they propose something
else (e.g., "the Mexico-Spain food trend"), redirect to one of these.

1. **The diáspora-publishing angle** — Why a media product specifically
   for the Mexican community in Spain, when Spain itself doesn't have
   one. Connects to broader stories about second-generation Latin
   American diaspora media in Europe.

2. **The anti-gamification angle** — App design that refuses streaks,
   points, leaderboards, notifications. Why "non-coercive" is a
   business strategy.

3. **The cosmology-as-architecture angle** — Using the Codex
   Fejérváry-Mayer's four cardinal rumbos as a progression system. Why
   Mexica cosmology survived 500 years to structure a 2026 app.

4. **The editor-named-on-each-piece angle** — In an era of algorithmic
   feeds, naming every Ruta's editor is a deliberate counter-position.

5. **The physical-anchored-content angle** — The apunte_in_situ that
   only unlocks when you arrive at the location. Why content tied to
   place is more memorable than content tied to a phone.

### Story angles to deflect

- "An app to discover Mexican Madrid" — too tourist-guide-like; correct
  to "an editorial publication about the Mexican presence in Madrid"
- "Mauricio Favela's app" — Mauricio is the founder but XICO is not a
  founder-personality product; redirect to the editorial team
- "How AI helped build XICO" — true but irrelevant to the brand; the
  product question is editorial, not technical

---

## Contact priority

For press: Mauricio direct, `maufavela@hotmail.com`. Response
guaranteed within 48 hours.

For partnerships (restaurants, galleries, cultural spaces): same
address until a separate `partnerships@xico.app` exists.

For corrections or edits to published pieces about XICO: same.

For App Store, Google Play, technical/legal: same.

---

## What to send a journalist when they reply asking for more

A single email with:
1. This press kit as the email body OR a PDF export
2. The 1024x1024 app icon as an attachment
3. A screenshot of the Índice tab + a screenshot of an unlocked Stop
   screen (once those are captured during pre-TestFlight asset prep)
4. The full first Ruta from María Vázquez (the inaugural piece, as a
   reading sample — show them the editorial quality)
5. A link to xico.app once the landing page exists

Until xico.app exists, send the App Store listing URL after TestFlight
approval, or the Instagram handle if any.
