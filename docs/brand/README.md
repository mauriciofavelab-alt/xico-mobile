# XICO · Brand operations

Practical brand assets for v1 launch — copy, templates, press materials.
The canonical brand *strategy* lives in `../00_XICO_CORE.md` and
`../01_XICO_BRAND_RULES.md`; this folder is the *operationalization*.

## Files

| File | Use |
|------|-----|
| [magic-link-email.md](./magic-link-email.md) | Supabase auth email template · HTML body + plain text + subject options. Paste into Supabase dashboard before TestFlight. The first XICO touchpoint every user sees. |
| [copy-library.md](./copy-library.md) | Error states, empty states, push notification templates. Spanish-first, English secondary. The source for every non-editorial string in the app. |
| [press-kit.md](./press-kit.md) | One-liner, 50-word paragraph, 150-word context paragraph, founder + editor bios, naming guidance, story angles. Send to journalists when they ask. |

## Workflow

When a new UI surface needs copy:
1. Check `copy-library.md` for an existing pattern
2. If none, write the copy in the same voice and add it back to the library
3. Cross-check against `../01_XICO_BRAND_RULES.md` voice rules

When the Supabase email or other infra string needs updating:
1. Edit `magic-link-email.md` (or add a new file in this folder)
2. Paste into Supabase dashboard manually (until programmatic sync exists)
3. Commit the docs change with a `docs(brand):` prefix

When a journalist or partner contacts:
1. Open `press-kit.md`
2. Pick the paragraph or assets that match their format
3. Reply

## Stale-content check

Things that change and need periodic re-sync:
- The inaugural editor (María Vázquez) — when a second Ruta ships,
  update press-kit "Editorial team" section
- The audience descriptors (Madrid Mexican community size) — update
  yearly as community grows
- The 150-word context paragraph — update when XICO's position evolves

This folder is NOT auto-synced to anywhere in v1. Treat it as the
source of truth that gets copy-pasted into production tools manually.
