# syntax=docker/dockerfile:1

FROM oven/bun:1 AS bun

FROM node:24-slim AS build
WORKDIR /app
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
COPY package.json bun.lock ./
# `nuxt prepare` needs the sources, and the build runs it anyway.
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
RUN bun run build

FROM node:24-alpine
WORKDIR /app
# Inside the container the server listens on every interface; compose.yaml publishes it on 127.0.0.1 only.
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3210 \
    WHATSAPP_TEMPLATES_DIR=/data/accounts
RUN mkdir -p /data/accounts && chown node:node /data/accounts
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3210
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:3210/').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
VOLUME /data/accounts
CMD ["node", ".output/server/index.mjs"]
