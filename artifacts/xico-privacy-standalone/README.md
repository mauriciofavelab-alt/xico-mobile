# xico-privacy-standalone

Single-file privacy policy ready to publish at any public URL. Decouples the **App Store Connect Privacy Policy URL requirement** (a public-launch gatekeeper) from the **xico.app domain decision** (still open until the final name is locked).

`index.html` is self-contained: no build step, no JS framework, no external dependencies beyond two Google Font families loaded over CDN. Visually matches the editorial system (Newsreader serif, warm-black bg, cream text, magenta accent on hover).

## Why this exists

Apple's App Store submission gate requires a working Privacy Policy URL. The full Next.js landing page at `artifacts/xico-web/` provides one at `xico.app/privacidad`, but:
- `xico.app` hasn't been registered (name still TBD per `docs/v1.1-backlog.md` decision)
- Vercel deploy is gated on that registration
- The submission can't be filed until the URL resolves

This file decouples those concerns. Publish it at any URL that's free or near-free. Switch to `xico.app/privacidad` later when the domain and name decisions land.

## Deploy options · ordered fastest → most polished

### Option A · GitHub Gist (5 minutes, free, ugly URL)

1. Open https://gist.github.com/
2. Filename: `xico-privacy.html`
3. Paste the entire contents of `index.html`
4. Click "Create public gist"
5. Click the "Raw" button on the resulting page
6. URL looks like: `https://gist.githubusercontent.com/mauriciofavelab-alt/<hash>/raw/xico-privacy.html`
7. Open that URL in a browser; it renders as a styled HTML page

**Drawback:** the URL is long and shows a GitHub-namespaced domain, not yours. Apple accepts it; it's just not pretty.

### Option B · GitHub Pages on this repo (10 minutes, free, cleaner URL)

The repo `mauriciofavelab-alt/xico-mobile` is on GitHub. Enable Pages on a `gh-pages` branch with just this file:

```bash
cd C:\Users\mauriciofavelas\Downloads\XICO_LOCAL\xico
# Create an orphan branch with only the static HTML
git checkout --orphan gh-pages
git rm -rf .
cp artifacts/xico-privacy-standalone/index.html ./index.html
git add index.html
git commit -m "chore(pages): publish privacy policy at GitHub Pages"
git push origin gh-pages
git checkout master   # back to master

# Then enable Pages:
gh repo edit mauriciofavelab-alt/xico-mobile --enable-pages \
  --pages-source-branch gh-pages --pages-source-path /
```

After GitHub provisions the page (1-2 min), the URL is:

```
https://mauriciofavelab-alt.github.io/xico-mobile/
```

**Drawback:** still shows the GitHub username in the URL. Acceptable for Apple but reveals the dev side of the project.

### Option C · Cloudflare Pages with a free subdomain (15 minutes, free, prettiest URL)

Cloudflare Pages gives every project a `<project-name>.pages.dev` URL out of the box. Same logic as Vercel but pre-registered:

1. Open https://dash.cloudflare.com/sign-up if not registered (free tier, no credit card)
2. Create new Pages project → "Direct Upload"
3. Project name: `xico-privacidad` (becomes `xico-privacidad.pages.dev`)
4. Drag and drop `index.html` to the upload zone
5. Click "Deploy site"

URL after deploy:

```
https://xico-privacidad.pages.dev
```

**Why recommended:** the URL is brand-coherent without committing to a domain. If later you register `privacidad.xico.app` or `xico.app/privacidad`, you can 301-redirect the Pages URL.

### Option D · Vercel (the existing setup, but only for this one file)

If you'd rather keep one provider:

```bash
cd C:\Users\mauriciofavelas\Downloads\XICO_LOCAL\xico\artifacts\xico-privacy-standalone
npx vercel --prod
# Pick the default project name (vercel will use the folder name)
```

URL is `https://xico-privacy-standalone-<hash>.vercel.app`. Similar to Cloudflare. Slightly slower for static-only assets.

### Recommendation

**Option C (Cloudflare Pages).** Free, prettiest URL of the four, doesn't tie you to a registrar yet. ~15 minutes total once you have a Cloudflare account.

If you want zero setup and don't care about URL aesthetics, **Option A** (gist) works and ships in 5 minutes.

## What to paste into App Store Connect

Once any of the above resolves to a public URL:

1. Open `docs/brand/app-store-connect-forms.md`
2. Find the line referencing the Privacy Policy URL
3. Replace `https://xico.app/privacidad` with whatever URL you just published
4. In App Store Connect → 1.0 record → **Privacy Policy URL** field → paste the new URL

Apple validates the URL at submission time; if it resolves to readable text covering data collection, it passes.

## What to do later (when xico.app is registered)

1. Set up a 301 redirect from your temporary URL → `xico.app/privacidad`
2. Update the Privacy Policy URL in App Store Connect
3. The change is editable without resubmission (privacy URL is a metadata field, not a binary field)

## Maintenance

When the privacy policy changes (new data type collected, new infrastructure provider, etc.):

1. Edit `index.html` (and the Next.js page at `artifacts/xico-web/app/privacidad/page.tsx` to keep them in sync)
2. Update the "Última actualización" date at the top
3. Re-deploy to whichever provider you chose

Substantive changes (new data type, new provider) should also be announced inside the app per the policy itself.

## Out of scope

- Multi-language version (Spanish-first; English variant deferred to v1.1)
- Cookie banner (the standalone page sets no cookies; nothing to disclose)
- Newsletter signup (the page is pure read-only; no forms)
