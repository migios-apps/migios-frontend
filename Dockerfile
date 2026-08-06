# Migios (Vite SPA) — built, then served statically by nginx. Build context = this folder.
#   docker build \
#     --build-arg VITE_PUBLIC_API_URL_V1=https://api.example.com \
#     --build-arg VITE_APP_CLIENT_ID=1 \
#     --build-arg VITE_APP_CLIENT_SECRET=secret \
#     -t migios-shadcn .
# node 22: vite 8 requires ^20.19.0 || >=22.12.0.
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Vite inlines these into the JS bundle at BUILD time — they must be present here,
# not at runtime. Changing one means rebuilding the image.
ARG VITE_PUBLIC_API_URL_V1
ARG VITE_APP_CLIENT_ID
ARG VITE_APP_CLIENT_SECRET
ARG VITE_BASENAME=
# Vite mode + build-version tag: production | staging | development
ARG BUILD_MODE=production
ENV VITE_PUBLIC_API_URL_V1=${VITE_PUBLIC_API_URL_V1} \
    VITE_APP_CLIENT_ID=${VITE_APP_CLIENT_ID} \
    VITE_APP_CLIENT_SECRET=${VITE_APP_CLIENT_SECRET} \
    VITE_BASENAME=${VITE_BASENAME}

# Calls vite directly instead of `npm run build:prod`: that script chains `prebuild`
# (eslint + prettier), which is a CI gate — a lint nit should not fail a deploy.
RUN npx vite build --mode "${BUILD_MODE}" \
 && ENV_CONFIG="${BUILD_MODE}" npm run generate-build

FROM nginx:alpine AS runner
# Port nginx listens on inside the container. The nginx entrypoint runs envsubst over
# /etc/nginx/templates/*.template at startup, so this stays the single source of truth.
# The filter keeps envsubst away from nginx's own $uri variables. No trailing regex
# anchor on purpose: a literal $ here would be read as a Dockerfile variable.
ENV APP_PORT=57370 \
    NGINX_ENVSUBST_FILTER=^APP_PORT

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE ${APP_PORT}

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider "http://localhost:${APP_PORT}/health" || exit 1
