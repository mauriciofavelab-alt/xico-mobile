# xico-web

The marketing landing page at **xico.app**. Built with Next.js 15 + Tailwind v4.

Three routes:

| Route | Purpose |
|---|---|
| `/` | Editorial-voice landing · masthead, standfirst, inaugural Ruta preview, "Disponible próximamente", footer |
| `/privacidad` | Privacy policy · matches the App Store Connect App Privacy questionnaire answers, RGPD-compliant |
| `/soporte` | Direct contact email + FAQ for the most common support cases |

## Design system

Tokens mirror `artifacts/xico-mobile/constants/colors.ts` and `editorial.ts`. The CSS variables in `app/globals.css` (under `@theme`) are the source of truth for this surface. Don't hardcode hex in components — extend the theme.

## Develop locally

```bash
cd artifacts/xico-web
pnpm install      # if first time
pnpm dev          # → http://localhost:3001
```

## Deploy to Vercel

First-time setup (interactive, just once):

```bash
cd artifacts/xico-web
npx vercel login                  # follow the prompts
npx vercel link                   # link this folder to a new Vercel project (recommend project name "xico-web")
npx vercel --prod                 # production deploy
```

After the first deploy, subsequent deploys are just:

```bash
npx vercel --prod
```

Vercel auto-detects Next.js. No build command override needed.

## Custom domain

After the first deploy succeeds, point `xico.app` (purchased separately) at the Vercel project:

1. Vercel dashboard → xico-web project → Settings → Domains
2. Add `xico.app` and `www.xico.app`
3. Vercel gives DNS records to set at your domain registrar
4. Once propagated (~5–60 min), `https://xico.app` resolves to this site

## Out of scope (v1.1+)

- Email capture / waitlist (currently directs to mailto:)
- Instagram embed / social proof carousel
- English variant of the landing page (Spanish first, intentional)
- Press kit page (`/prensa`) — content already drafted in `docs/brand/press-kit.md`
- The actual stop-detail microsites if shareable Ruta links ever ship
