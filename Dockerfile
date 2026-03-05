FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV CI=true
ENV npm_config_audit=false
ENV npm_config_fund=false
ENV npm_config_update_notifier=false
ENV npm_config_cache=/tmp/.npm
ENV npm_config_registry=https://registry.npmjs.org/

# Workaround for Hugging Face Docker build: npm 10/11 may crash with
# "Exit handler never called!". Downgrade npm and avoid `npm ci`.
RUN npm i -g npm@9.9.4

COPY shared/ ./shared/
COPY .npmrc ./
COPY package.json ./

COPY client/package.json ./client/
COPY server/package.json ./server/

RUN cd client && npm install --no-audit --no-fund --registry=https://registry.npmjs.org/ && test -f node_modules/.bin/tsc
RUN cd server && npm install --no-audit --no-fund --registry=https://registry.npmjs.org/ && test -f node_modules/.bin/tsc

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
