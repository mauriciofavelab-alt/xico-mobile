#!/bin/sh
# Entrypoint for the api-server Docker image. Path matches railway.json
# `deploy.startCommand: "/start.sh"`.
set -e
exec node --enable-source-maps /app/dist/index.mjs
