# ---- build stage ----
FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    SENTRY_AUTH_TOKEN="" \
    SENTRY_ORG="" \
    SENTRY_PROJECT=""

# NEXT_PUBLIC_* инлайнятся в клиентский бандл во время БИЛДА (не в рантайме!).
# Dokploy передаёт их как --build-arg; без этого клиент получает
# пустые ключи и сайт «оживает» только после пересборки (классика переездов).
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ARG NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY=""
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ARG NEXT_PUBLIC_YANDEX_CLIENT_ID=""
ARG NEXT_PUBLIC_DROPBOX_CLIENT_ID=""
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_SITE_URL=""
ARG NEXT_PUBLIC_CHAT_ENABLED=""
ARG NEXT_PUBLIC_DEFAULT_TSA_URL=""
ARG NEXT_PUBLIC_INSSMART_TOKEN=""
ARG NEXT_PUBLIC_INSSMART_SECRET=""
ARG NEXT_PUBLIC_INSSMART_PRODUCT=""
ARG NEXT_PUBLIC_PROMO_ENDS_AT=""
ARG NEXT_PUBLIC_SITE_VERSION=""
ARG NEXT_PUBLIC_ADS_ENABLED=""
ARG NEXT_PUBLIC_RTB_BUILDER_SIDEBAR=""
ARG NEXT_PUBLIC_RTB_TEMPLATE_SELECT_FEED=""
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY=$NEXT_PUBLIC_SMARTCAPTCHA_SITE_KEY \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_YANDEX_CLIENT_ID=$NEXT_PUBLIC_YANDEX_CLIENT_ID \
    NEXT_PUBLIC_DROPBOX_CLIENT_ID=$NEXT_PUBLIC_DROPBOX_CLIENT_ID \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_CHAT_ENABLED=$NEXT_PUBLIC_CHAT_ENABLED \
    NEXT_PUBLIC_DEFAULT_TSA_URL=$NEXT_PUBLIC_DEFAULT_TSA_URL \
    NEXT_PUBLIC_INSSMART_TOKEN=$NEXT_PUBLIC_INSSMART_TOKEN \
    NEXT_PUBLIC_INSSMART_SECRET=$NEXT_PUBLIC_INSSMART_SECRET \
    NEXT_PUBLIC_INSSMART_PRODUCT=$NEXT_PUBLIC_INSSMART_PRODUCT \
    NEXT_PUBLIC_PROMO_ENDS_AT=$NEXT_PUBLIC_PROMO_ENDS_AT \
    NEXT_PUBLIC_SITE_VERSION=$NEXT_PUBLIC_SITE_VERSION \
    NEXT_PUBLIC_ADS_ENABLED=$NEXT_PUBLIC_ADS_ENABLED \
    NEXT_PUBLIC_RTB_BUILDER_SIDEBAR=$NEXT_PUBLIC_RTB_BUILDER_SIDEBAR \
    NEXT_PUBLIC_RTB_TEMPLATE_SELECT_FEED=$NEXT_PUBLIC_RTB_TEMPLATE_SELECT_FEED

COPY package.json package-lock.json ./

# npm ci с buildkit-кэшем (модули переиспользуются между сборками)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=10000

COPY . .

# .next/cache кэшируется между сборками (партиальный Webpack/Turbopack инкремент)
# NODE_OPTIONS: на VDS ~8 ГБ RAM, но рядом живут Supabase и Dokploy —
# дефолтный heap Node (~2 ГБ на 64-бит) роняет next build с exit 134 (SIGABRT).
# 3072 МБ — потолок, при котором сборка стабильна и не душит соседей.
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/app/.next/cache \
    npm run build

# ---- runtime stage ----
# Self-hosted (Dokploy/VDS): минимальный standalone-сервер Next без dev-зависимостей,
# под непривилегированным пользователем (аудит 2026-09-12: не root).
FROM node:22-bookworm-slim AS run

# NODE_OPTIONS нужен и в рантайме: ENV из build-стадии сюда не наследуется,
# без него heap ~2 ГБ и TSL-verify (12MB XML, ~400MB transient) роняет прод OOM (2026-09-28).
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=3072"

RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# node:22-*-slim содержит встроенного пользователя `node` (uid 1000) — используем его.
# standalone-бандл сам тянет прод-зависимости (traced); sharp/@img добавлены
# через outputFileTracingIncludes в next.config.mjs (динамический import в /api/avatar).
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
# /app/blanks читает public/blank-previews через fs в рантайме — public обязателен.
COPY --from=build --chown=node:node /app/public ./public

USER node

EXPOSE 3000

# /api/health — детерминированный 200 пока жив рантайм Next (не зависит от SSR-ошибок главной).
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

# node как PID 1: корректная передача SIGTERM (graceful stop в Dokploy),
# без лишнего npm-процесса-прослойки.
CMD ["node", "server.js"]
