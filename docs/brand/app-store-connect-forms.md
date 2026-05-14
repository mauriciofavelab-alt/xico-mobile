# App Store Connect · web-form answers, paste-ready

When you go for the **public App Store submission** (not just TestFlight internal), App Store Connect asks dozens of questions across four screens. The marketing copy is already drafted in `app-store-listing.md` and the build-specific "What's New" lives in `testflight-build-11-whats-new.md`. This doc fills the remaining gaps — the per-question answers that ASC's web form requires.

**Order of operations:** open https://appstoreconnect.apple.com/apps/6763902487 → for each ASC tab listed below, scroll to the named section, paste/answer.

---

## TestFlight tab · Test Information (before any external testers)

This panel is required even for internal-only testers. Apple's Beta App Review reads it.

| Field | Paste this |
|---|---|
| **Beta App Description** | `XICO es una publicación editorial sobre México en Madrid. Cada domingo se publica una Ruta de 5 paradas escrita por una editora mexicana. Cada parada tiene un despacho público y un apunte privado que se abre solo cuando llegas al lugar (geolocalización con margen de 50m). Camínala y tu Pasaporte de los Cuatro Rumbos se llena.` |
| **Feedback Email** | `maufavela@hotmail.com` (or `feedback@xico.app` if domain registered) |
| **Marketing URL** | `https://xico.app` (or omit if not yet live) |
| **Privacy Policy URL** | `https://xico.app/privacidad` *(must resolve before going public — currently the landing page is committed but not deployed)* |
| **Sign-in required** | **Yes** |
| **Sign-in info** | `XICO usa magic-link sin contraseña. Introduce cualquier correo en la pantalla de login y recibirás un enlace de acceso. El enlace caduca en 1 hora. Para revisión: solicita el enlace con tu propio correo de App Store Connect; recibirás el enlace en ese buzón.` |
| **Contact Information · First name** | `Mauricio` |
| **Contact Information · Last name** | `Favela` |
| **Contact Information · Phone** | *(your number with +34 prefix)* |
| **Contact Information · Email** | `maufavela@hotmail.com` |
| **Notes for App Review** | See block below — copy the entire block as-is |

### Notes for App Review (paste verbatim into the Notes field)

```
XICO requires Spain (Madrid) location for "La Ruta" — the core walking
feature. Each of the 5 stops has a 50m geo-fence (haversine on lat/lng).
The "apunte in situ" text and the sello (passport stamp) only become
accessible when the device GPS reports a position within 50m of a stop.

To test the geo-locked flow without physically traveling to Madrid:

  1. Run the app in Xcode iOS Simulator.
  2. Xcode menu: Debug → Simulate Location → Custom Location...
  3. Enter the coordinates of any stop below.
  4. In the app, open the Ruta tab → tap the stop → the veil lifts,
     the apunte text appears, and the 30-second progress ring starts.
  5. After 30 seconds the sello drops into the Pasaporte.

Stop coordinates (all in Madrid):

  Stop 1 · Casa de México   · 40.4317, -3.7034
  Stop 2 · Punto MX           · 40.4297, -3.6810
  Stop 3 · Barracuda MX       · 40.4193, -3.6916
  Stop 4 · Corazón Agavero    · 40.4115, -3.7104
  Stop 5 · La Botica          · 40.4255, -3.7048

Sign-in: magic-link. Submit your reviewer email on the auth screen and
check your inbox for a one-tap login link. No password needed.

The app is Spanish-first. All copy is in Spanish (Castilian/Mexican).
```

---

## App Privacy tab · Data Type Questionnaire

Apple's privacy questionnaire requires you to declare every data type you collect, mark it Linked-to-User and Used-for-Tracking, and pick a Purpose from a fixed list. Below are the exact answers for each data type XICO touches. **All other data types: answer "Not Collected."**

### 1. Contact Info → Email Address

| ASC question | Answer |
|---|---|
| Do you collect this data type? | **Yes** |
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track the user? | **No** |
| Purposes (multi-select) | ✅ App Functionality · *(only this one)* |

### 2. Location → Coarse Location

| ASC question | Answer |
|---|---|
| Do you collect this data type? | **Yes** |
| Is this data linked to the user's identity? | **No** *(we verify the user is within 50m of a stop, but we do NOT store the lat/lng — only the resulting boolean "is_at_stop" → sello row)* |
| Is this data used to track the user? | **No** |
| Purposes | ✅ App Functionality |

### 3. Location → Precise Location

| ASC question | Answer |
|---|---|
| Do you collect this data type? | **No** *(we request `When In Use` authorization with the system's coarse-precision permission — never precise)* |

### 4. User Content → Other User Content

The optional 1-line *anotación* a user can leave at a stop ("apunte mío").

| ASC question | Answer |
|---|---|
| Do you collect this data type? | **Yes** |
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track the user? | **No** |
| Purposes | ✅ App Functionality |

### 5. Identifiers → User ID

The Supabase Auth UUID assigned when a user requests a magic link.

| ASC question | Answer |
|---|---|
| Do you collect this data type? | **Yes** |
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track the user? | **No** |
| Purposes | ✅ App Functionality |

### 6. Usage Data → Product Interaction

The `emotional_events` table logs app opens, stop visits, sello earns, etc., for editorial analytics.

| ASC question | Answer |
|---|---|
| Do you collect this data type? | **Yes** |
| Is this data linked to the user's identity? | **Yes** |
| Is this data used to track the user? | **No** *(events stay within our Supabase instance; no third-party trackers, no ad attribution, no cross-app linking)* |
| Purposes | ✅ Analytics · ✅ App Functionality |

### All other categories → "Not Collected"

Health & Fitness, Financial Info, Sensitive Info, Photos/Videos, Audio, Browsing History, Search History, Diagnostics, Purchases, Contacts, Other Data — all answer **No** to "Do you collect this data type?"

### Final summary screen (what ASC will show your future users)

After saving the above, the App Store privacy nutrition label will display:

> **Data Linked to You** · Contact Info, User Content, Identifiers, Usage Data
> **Data Not Linked to You** · Location *(coarse)*
> **Data Used to Track You** · None

---

## App Information tab · Category, Age Rating, Content Rights

### Categories

| Field | Answer |
|---|---|
| Primary Category | **Lifestyle** *(manifesto-aligned · "tourist guide" framing rejected explicitly)* |
| Secondary Category | **News** *(editorial publication with named editors)* |

### Age Rating (Apple's wizard)

ASC opens a 17-question wizard. Answer:

| Wizard question | Answer |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| Mature/Suggestive Themes | **Infrequent/Mild** *(despachos mention mezcal, pulque, bars — never glorified, but present)* |
| Horror/Fear Themes | None |
| Medical/Treatment Information | None |
| Alcohol, Tobacco, or Drug Use or References | **Infrequent/Mild** *(mezcalerías and pulquerías are featured stops; the despachos reference these as cultural objects, not as consumption recommendations)* |
| Simulated Gambling | None |
| Sexual Content or Nudity | None |
| Graphic Sexual Content or Nudity | None |
| Contests | None |
| Unrestricted Web Access | No |
| Gambling and Contests | No |
| Frequent/Intense Sexual Content or Nudity | No |
| Made for Kids | **No** |
| Age Rating | Result: **17+** *(driven by the alcohol references)* |

### Content Rights

| Field | Answer |
|---|---|
| Does your app contain, show, or access third-party content? | **Yes** *(some despachos quote editors and reference cultural figures; this is editorial citation, not embedded content)* |
| Do you have all necessary rights to that third-party content? | **Yes** |

### Made for Kids

**No** · category is Lifestyle, age rating is 17+.

---

## App Review Information tab (for public App Store submission only)

This panel only matters for the **public release** (not internal TestFlight). When you click "Submit for Review" on the 1.0 record:

| Field | Answer |
|---|---|
| **Sign-in required** | **Yes** |
| **Username** | *(leave blank — magic-link auth, no username/password pair)* |
| **Password** | *(leave blank)* |
| **Notes for the reviewer** | Same block as the TestFlight Notes above — paste verbatim |
| **Contact First Name** | Mauricio |
| **Contact Last Name** | Favela |
| **Contact Phone** | *(your number with +34)* |
| **Contact Email** | `maufavela@hotmail.com` |

**Important:** ASC's review form requires both Username AND Password if "Sign-in required" is Yes. Since XICO uses magic-link (no password), put a placeholder in Password (e.g. `magic-link-no-password`) and explain in the Notes field. Alternatively, create a dedicated review-only Supabase account with a known password, document it in Notes, and ship a hidden one-time password flow for that account. *Recommendation: use the placeholder + Notes path for v1; build the dedicated review account if Apple pushes back.*

---

## Pricing and Availability

| Field | Answer |
|---|---|
| **Price** | Free |
| **Availability** | All countries · *(or limit to Spain + Mexico + US for v1; can expand later)* |
| **Pre-Order** | No |
| **Volume Purchase Program** | No |
| **Educational Discount** | No |

---

## Version Information (the 1.0 record)

| Field | Source |
|---|---|
| Version Number | `1.0.0` *(matches app.json:version)* |
| Build | `10` *(the build that's submitting right now)* |
| Subtitle | See `app-store-listing.md` |
| Promotional Text | See `app-store-listing.md` |
| Description | See `app-store-listing.md` |
| Keywords | See `app-store-listing.md` |
| Screenshots | Need to capture · see `app-store-listing.md` Screenshots Brief |
| App Previews | Skip for v1 *(optional video assets)* |
| Promotional Artwork | Skip for v1 *(used only for Apple feature consideration)* |

### What's New in This Version

Paste the **short** block from `testflight-build-11-whats-new.md` (the 290-char Spanish version). The "long" block is for the Beta App Description / press notes, not this field.

---

## Build (TestFlight tab)

Once the EAS submit completes:

1. Build 10 appears in TestFlight tab as "Processing" → wait 10-30 min.
2. Apple will email about export compliance — already handled (`ITSAppUsesNonExemptEncryption: false` in app.json).
3. Once processed, click the build → fill in the "What to test" field (the 290-char short version).
4. Internal testers: add yourself + anyone else in the Apple Developer team. They get a TestFlight invite immediately, no Apple review needed.
5. External testers: requires Beta App Review (24-48h). Defer until you have all the App Information / Privacy / Pricing screens filled.

---

## Submission order recommendation

```
TestFlight (internal only)
  → done as soon as build 10 finishes processing
  → no ASC review required
  → install on iPhone immediately for self-test

Public App Store submission
  → blocked on:
      · Privacy Policy URL resolving (xico.app/privacidad live, requires Vercel deploy)
      · Screenshots captured (≥3 device shots, 1290×2796)
      · App Review Information filled (this doc)
      · Privacy questionnaire saved (this doc)
      · Age rating wizard completed (this doc)
  → submit when all 5 above are green
  → Apple's first-app review: typically 24-48h
```

Internal TestFlight unblocks immediately. Public store is gated on the landing page going live (Privacy Policy URL) + screenshots.

---

## Checklist (paste into a TodoWrite or print)

- [ ] **TestFlight panel** filled → testers can install
- [ ] **Privacy questionnaire** saved → privacy nutrition label generated
- [ ] **Category** set to Lifestyle / News
- [ ] **Age rating** wizard answered → 17+
- [ ] **App Review Information** completed
- [ ] **Pricing** set to Free
- [ ] **Privacy Policy URL** resolves *(blocked on Vercel deploy)*
- [ ] **Screenshots** captured *(blocked on iOS Simulator session)*
- [ ] **What's New** field pasted (short version)
- [ ] **Submit for Review** clicked
