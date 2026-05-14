# XICO api-server · Railway-built Dockerfile
#
# Builds @workspace/api-server (pnpm monorepo). Esbuild bundles src/index.ts
# into dist/index.mjs with workspace lib deps inlined (api-zod, db) — runtime
# image is tiny.
#
# Path: railway.json dockerfilePath = "Dockerfile" (this file at repo root).
# Start: /start.sh (installed in stage 2, sets NODE_ENV + runs the bundle).
#
# Required runtime env (set in Railway dashboard):
#   PORT                       e.g. 8080
#   NODE_ENV                   production
#   SUPABASE_URL
#   SUPABASE_ANON_KEY
#   VISIT_TOKEN_SECRET         REQUIRED for Week 3+ sello flow (HS256 secret)
#   ELEVENLABS_API_KEY         for /api/tts

# ───────────────────────── Stage 1 · builder ─────────────────────────
FROM node:22-alpine AS builder

# Enable pnpm via corepack using the `packageManager` field in root package.json.
RUN corepack enable

WORKDIR /repo

# Copy workspace metadata first for better layer caching.
# When only source changes (not deps), `pnpm install` can use cached layer.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY artifacts/api-server/package.json artifacts/api-server/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/db/package.json lib/db/

# Install (includes workspace symlinks for @workspace/api-zod and @workspace/db).
# `--frozen-lockfile` ensures Railway can't drift from local pnpm-lock.yaml.
RUN pnpm install --frozen-lockfile

# Copy source and build the api-server bundle.
COPY artifacts/api-server/ artifacts/api-server/
COPY lib/api-zod/ lib/api-zod/
COPY lib/db/ lib/db/

# esbuild bundles src/index.ts → artifacts/api-server/dist/index.mjs.
RUN pnpm --filter @workspace/api-server build

# ───────────────────────── Stage 2 · runtime ─────────────────────────
FROM node:22-alpine AS runtime

# Copy the bundled output. Esbuild inlines workspace lib deps (api-zod, db)
# and most node_modules, with externals limited to the optional packages
# listed in build.mjs (none of which are in api-server's actual deps).
WORKDIR /app
COPY --from=builder /repo/artifacts/api-server/dist /app/dist

# Pino's worker transport (pino-pretty) is split out at build time by
# esbuild-plugin-pino. The plugin places the transport file next to
# dist/index.mjs, so the COPY above already includes it.

# Runtime needs no pnpm — only Node.
# /start.sh is a standalone file in the repo (not a heredoc) so this works on
# both classic Docker and BuildKit. Railway uses BuildKit but this is more
# portable.
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Railway sets $PORT at runtime; the server reads process.env.PORT.
# The healthcheck (railway.json) hits /api/health.
EXPOSE 8080

# NODE_ENV defaults to production. Railway can override.
ENV NODE_ENV=production

CMD ["/start.sh"]
