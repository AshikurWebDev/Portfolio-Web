# Website + reverse proxy image. Build context: this folder (the frontend repository).
#
#   1. "build" runs `npm run build` with Node.
#   2. The final image is Caddy: it serves dist/, proxies /api, /mcp and /health to the
#      API container ("api:8080" on the Docker network), and gets HTTPS certificates itself.
#
# Used by the production compose file in the backend repository (deploy/docker-compose.yml).
# VITE_* values are baked into the JavaScript at build time, so changing the domain or the
# Google client id means rebuilding this image.

FROM node:22-bookworm-slim AS build
WORKDIR /web

ARG VITE_SITE_URL
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_SITE_URL=$VITE_SITE_URL \
    VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Install packages first (cached while package files stay the same).
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build

FROM caddy:2
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /web/dist /srv
