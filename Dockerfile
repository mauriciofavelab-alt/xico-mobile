# XICO api-server · Railway Dockerfile
#
# This pattern is reproduced from the last known-good Railway build
# (deployment 05f84bee-0da7-466c-9f7c-cad6e6687136, 2026-05-07T21:17).
# Don't drift from this shape without verifying against a build log —
# Railway's BuildKit + esbuild-plugin-pino interplay is finicky.
#
# Build flow:
#   1. node:20-alpine + corepack pnpm@10.33.0 (matches root `packageManager`)
#   2. Copy workspace metadata + lib/ + artifacts/api-server/ for cache reuse
#   3. `pnpm install --filter @workspace/api-server...` resolves only the
#      api-server dep tree + its transitive workspace deps (api-zod, db)
#   4. Run esbuild bundle via `node ./build.mjs` → dist/index.mjs
#   5. Stage 1 ships just dist/ + /start.sh
#
# Required runtime env (set in Railway → xico-api → Variables):
#   PORT                 (Railway auto-sets)
#   NODE_ENV=production
#   SUPABASE_URL
#   SUPABASE_ANON_KEY
#   VISIT_TOKEN_SECRET   REQUIRED for Week 3+ sello flow. Generate with:
#                         openssl rand -base64 48
#   ELEVENLABS_API_KEY   (for /api/tts)

# ───────── builder ─────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Workspace metadata (cached layer when only source changes)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Workspace lib packages (api-zod + db both consumed as TS by api-server)
COPY lib/ ./lib/

# api-server source
COPY artifacts/api-server/ ./artifacts/api-server/

# Install only api-server's dep tree (the `...` pulls transitive workspace
# deps too, so @workspace/api-zod and @workspace/db come along).
RUN pnpm install --filter @workspace/api-server... --frozen-lockfile

# Bundle
WORKDIR /app/artifacts/api-server
RUN node ./build.mjs

# ───────── runtime ─────────
FROM node:20-alpine AS stage-1

WORKDIR /app

# Bundled output (includes pino-pretty / pino-worker / pino-file split out
# by esbuild-plugin-pino alongside index.mjs).
COPY --from=builder /app/artifacts/api-server/dist/ ./dist/

# Standalone start script (not heredoc, for classic-Docker compatibility).
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
ENV NODE_ENV=production

CMD ["/start.sh"]
