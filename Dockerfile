# Dockerfile for Skull King
#
# Notes for Hugging Face Docker Spaces:
# - Your app must listen on port 7860.
# - Alpine images have shown flaky npm behavior on Spaces; use Debian slim.

FROM node:20-bookworm-slim AS base

ENV CI=true
ENV npm_config_audit=false
ENV npm_config_fund=false
ENV npm_config_update_notifier=false

RUN npm i -g npm@11.11.0


FROM base AS client-builder
WORKDIR /app
COPY shared/ ./shared/
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build


FROM base AS server-builder
WORKDIR /app
COPY shared/ ./shared/
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/ ./server/
RUN cd server && npm run build


FROM node:20-bookworm-slim AS runtime
WORKDIR /app

COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=client-builder /app/client/dist ./client/dist

RUN chown -R 1000:1000 /app
USER 1000

ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server/dist/server/src/index.js"]
