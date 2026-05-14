# XICO · Operational Runbook

Step-by-step procedures for when something breaks in production. Sorted by what's most likely to fire first.

Last updated 2026-05-14 night. Living doc — update as new failure modes appear.

---

## 🔴 Critical · TestFlight build silently fails or stalls

**Symptoms**: `eas submit` says `✔ Scheduled iOS submission` but Build #N never appears in App Store Connect TestFlight tab. Or build appears as "Processing" for >2 hours.

**Likely cause** (90% of the time): the `eas submit` CLI was killed mid-upload (Ctrl+C, terminal closed, timeout) before the .ipa fully transferred to Apple.

**Fix**:
1. Check the submission status via the EAS submission URL from the submit output (e.g. `https://expo.dev/.../submissions/<uuid>`)
2. If it shows "failed" or "errored" → the upload didn't complete. Re-run `eas submit --platform ios --profile production --id <build-id>` and **DO NOT Ctrl+C** until you see `✔ Submitted your application to Apple App Store!`
3. If it shows "completed" but TestFlight is silent → Apple's TestFlight processing is slow. Wait up to 2 hours. If still nothing, email Apple Developer Support with the submission ID.

**Other less common causes**:
- Build number collision (Apple rejects same `version + buildNumber` twice) → check `eas build:list` for the previous TestFlight build's buildNumber, increment in `eas.json` or rely on `autoIncrement: true`
- Bundle identifier mismatch (rare) → confirm `app.json:ios.bundleIdentifier` matches the App Store Connect record
- Expired Distribution Certificate → check `eas credentials` → "Expiration Date" should be 2027-04-12 for the current cert

---

## 🔴 Critical · Railway API serving 500s or empty data

**Symptoms**: app screens stuck on loaders, `useQuery` infinite retry, `/api/articles` or `/api/ruta/current` returns 500 in browser.

**Triage**:
1. `curl https://xico-api-production.up.railway.app/api/health` → expect `{"ok":true}`
2. If health returns 200 but endpoints fail → likely Supabase connection issue (see next section)
3. If health returns 5xx or times out → Railway-side. Open Railway dashboard → check deploy logs

**Fix paths**:
- Railway deploy crashed → `git log` for recent server changes, check the build log for typing errors or missing deps
- Railway env vars missing → Railway dashboard → Variables → confirm `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VISIT_TOKEN_SECRET`, `ELEVENLABS_API_KEY` all set
- Railway IP changed and Supabase is blocking → very rare. Switch the API server to use the IPv4 pooler URL (`aws-0-eu-west-1.pooler.supabase.com:5432`)
- Deploy stuck in build phase → `railway redeploy` from CLI, or push an empty commit (`git commit --allow-empty -m "bump"` then `git push`)

**Rollback**:
- Railway dashboard → Deployments → previous successful deploy → "Redeploy this deployment"
- This is faster than fixing forward when production is bleeding

---

## 🟡 High · Supabase auth locked / anon key 401s

**Symptoms**: login emails not sending, `/api/sellos-rumbo` returns 401, magic-link clicks open the app but session is null.

**Triage**:
1. Test the anon key directly: `curl "https://jrnsodwpdupybxjlzybv.supabase.co/rest/v1/articles?select=id&limit=1" -H "apikey: <anon-key>"` → expect a 200 with one row
2. If 401 → the anon key was rotated. Update both Railway `SUPABASE_ANON_KEY` and `artifacts/xico-mobile/eas.json` `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Rebuild mobile.
3. If 200 but app still failing → RLS may have been re-enabled. Check via Supabase dashboard → Database → Tables → check the "RLS" column

**Magic-link emails not arriving**:
- Supabase dashboard → Authentication → Logs → see if the OTP requests are firing
- Check spam folders first
- Supabase free tier has rate limits (2 emails/hour per address). If hitting them, the user gets a generic 429
- If the email template was corrupted → rerun `node artifacts/api-server/scripts/update-supabase-magic-link.mjs <PAT>` to restore the XICO-voice template

---

## 🟡 High · ElevenLabs returns 401 / audio narrator silent

**Symptoms**: audio play button in the article screen shows "Generando narración..." forever, then "Escuchar" again. No audio plays.

**Verify**:
```bash
curl -sI "https://xico-api-production.up.railway.app/api/tts?text=Esta+es+una+prueba" | head -3
```

If `HTTP/1.1 401` → ElevenLabs side. Common causes:
- **Free-tier abuse detector** activated (the current state as of 2026-05-14). Fix: upgrade to Starter ($5/mo) at https://elevenlabs.io/app/subscription
- **API key revoked or expired**. Fix: generate a new key, update Railway `ELEVENLABS_API_KEY`
- **Voice ID retired** (rare). Check the [voice library](https://elevenlabs.io/app/voice-library) — current XICO voice ID is `EXAVITQu4vr4xnSDxMaL` (Bella, multilingual v2)

If `HTTP/1.1 500` → server-side. Check Railway logs for the error.

If `HTTP/1.1 200` but mobile still silent → probably a client-side caching issue. iOS may have cached an old failed response. Force-quit XICO + restart.

---

## 🟡 High · A Ruta stop venue closes or changes address

**Symptoms**: user reports "Casa de México is now at a different address" or similar.

**Fix**:
1. Verify the new address via Google Maps + OpenStreetMap Nominatim:
   ```bash
   curl -s "https://nominatim.openstreetmap.org/search?q=<URL-encoded+address>&format=json&limit=1" -H "User-Agent: xico-seed-update/1.0"
   ```
2. Update `artifacts/api-server/src/seed-ruta-rumbos.ts` with new `lat/lng/address`
3. Re-run the seed (Windows path issue: invoke directly, not via `import.meta.url` check):
   ```bash
   cd artifacts/api-server
   SUPABASE_URL=... SUPABASE_ANON_KEY=... npx tsx -e "import { seedRutaRumbos } from './src/seed-ruta-rumbos.ts'; seedRutaRumbos().then(()=>console.log('DONE')).catch(e=>{console.error(e); process.exit(1)});"
   ```
4. Verify via `curl https://xico-api-production.up.railway.app/api/ruta/current`
5. Commit the seed change

**No app rebuild needed.** The mobile app reads stop data fresh from the API on every Ruta screen mount.

---

## 🟡 High · Build #N rejected by Apple TestFlight Beta App Review

**Symptoms**: email from Apple saying the build was rejected. App Store Connect → TestFlight → Build #N shows "Rejected."

**Common causes + fixes**:

| Apple error code | Cause | Fix |
|---|---|---|
| `ITMS-90683` | Missing Info.plist usage description (e.g., new permission added without string) | Add the missing `NS<X>UsageDescription` to `app.json:ios.infoPlist`, commit, rebuild |
| `ITMS-91053` | Required Reason API used without PrivacyInfo.xcprivacy declaration | Usually Expo SDK ships these; if a new native module is added, declare the reason |
| `ITMS-90809` | UIWebView (deprecated) | Should not happen with React Native 0.81+. Update Expo SDK if it does. |
| Apple reviewer comment "unable to verify location-locked content" | Reviewer didn't know how to override location | Add the override instructions to App Store Connect → Test Information → Notes for review (drafted in `docs/brand/testflight-build-11-whats-new.md`) |
| "App crashes on launch" | Production-only crash you can't repro locally | Look at the Apple crash log in App Store Connect → TestFlight → Build #N → Crashes. Hermes symbolication needed (`expo build:list` to find the source map URL) |

---

## 🟢 Medium · Geolocation 50m gate is too tight

**Symptoms**: real users report "I'm at the venue but the app says I'm too far."

**Triage**:
1. Have the user open the Settings → Privacy → Location Services → XICO → set to "While Using" with "Precise Location" ON
2. Have them stand outside the venue (GPS is weak indoors)
3. If they're truly there but app says >50m, increase the radius:

**Quick fix** (server-side, no app rebuild):
- Edit `artifacts/api-server/src/routes/ruta-stops.ts` → the haversine threshold (currently 50)
- Bump to 80 or 100m
- Deploy Railway

**Better fix** (longer):
- Add `geo_radius_m` column to `ruta_stops` table
- Per-stop override (some venues are accurate-to-10m, others need 100m)
- Server reads the column instead of hardcoded 50

---

## 🟢 Medium · A user reports the magic-link email template looks broken

**Symptoms**: user sees the generic Supabase template instead of the XICO-voice email.

**Cause**: someone (you or Supabase support) reverted the template via the dashboard.

**Fix**:
```bash
cd artifacts/api-server
SUPABASE_PAT=<your-PAT> node scripts/update-supabase-magic-link.mjs
```

This re-applies the canonical template from the script. The script source is the source of truth for the email content — `docs/brand/magic-link-email.md` documents the rationale.

---

## 🟢 Medium · Apple TestFlight processing takes >2 hours

**Symptoms**: Build #N shows "Processing" indefinitely in App Store Connect TestFlight tab.

**Wait first**: 30 min normal. 2 hours unusual but possible. 24+ hours = problem.

**Diagnose**:
- App Store Connect → Activity → look for any rejection or warning email
- If nothing → Apple's TestFlight processing queue is backed up (their problem, not yours)
- After 4+ hours of silence → contact Apple Developer Support with the build's "Bundle ID + Version + Build Number"

---

## Reference · key URLs and credentials

(Sensitive. Treat this section as confidential.)

| Resource | URL or where |
|---|---|
| Railway API | https://xico-api-production.up.railway.app |
| Railway dashboard | https://railway.app/project (look for the XICO project) |
| Supabase dashboard | https://supabase.com/dashboard/project/jrnsodwpdupybxjlzybv |
| Supabase project ref | `jrnsodwpdupybxjlzybv` |
| App Store Connect | https://appstoreconnect.apple.com/apps/6763902487/ |
| EAS dashboard | https://expo.dev/accounts/maverik2002/projects/alux/ |
| EAS project slug | `alux` (legacy; original ALUX name) |
| iOS bundle ID | `com.xico.app` |
| iOS App Apple ID | `6763902487` |
| Apple Team ID | `B76TK6N9VU` |
| ElevenLabs voice ID (Bella) | `EXAVITQu4vr4xnSDxMaL` |
| ElevenLabs model | `eleven_multilingual_v2` |
| iPhone UDID in provisioning profile | `00008150-001650601122401C` |
| Apple Distribution Certificate expiry | 2027-04-12 |
| Provisioning Profile expiry | 2027-04-12 |

## Reference · scripts

| Need | Command |
|---|---|
| Production smoke (25 endpoints) | `cd artifacts/api-server && npm run smoke` |
| Geo smoke for a stop | `node artifacts/api-server/scripts/smoke-geo.mjs --stop-id stop-001 --lat 40.4301 --lng -3.7095 --user-jwt <token>` |
| Re-seed inaugural Ruta | `cd artifacts/api-server && npx tsx -e "import { seedRutaRumbos } from './src/seed-ruta-rumbos.ts'; seedRutaRumbos().then(()=>console.log('DONE')).catch(console.error)"` |
| Update Supabase magic-link template | `node artifacts/api-server/scripts/update-supabase-magic-link.mjs <PAT>` |
| Trigger production iOS build | `cd artifacts/xico-mobile && eas build --platform ios --profile production` |
| Submit a build to TestFlight | `cd artifacts/xico-mobile && eas submit --platform ios --profile production --id <build-id>` (LEAVE TERMINAL OPEN until `✔ Submitted`) |
