FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Workspace config and lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Workspace library packages (api-server deps)
COPY lib/ ./lib/

# API server source
COPY artifacts/api-server/ ./artifacts/api-server/

# Install only api-server and its workspace dependencies
RUN pnpm install --filter @workspace/api-server... --frozen-lockfile

# Build
WORKDIR /app/artifacts/api-server
RUN node ./build.mjs

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/artifacts/api-server/dist/ ./dist/

EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
