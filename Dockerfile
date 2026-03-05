FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV CI=true
ENV npm_config_audit=false
ENV npm_config_fund=false
ENV npm_config_update_notifier=false
ENV npm_config_cache=/tmp/.npm

COPY shared/ ./shared/

COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

RUN cd client && npm ci
RUN cd server && npm ci

COPY client/ ./client/
COPY server/ ./server/

RUN cd client && npm run build
RUN cd server && npm run build


FROM node:20-bookworm-slim AS runtime
WORKDIR /app

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist

RUN chown -R 1000:1000 /app
USER 1000

ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["node", "server/dist/server/src/index.js"]
