FROM node:20-bookworm-slim AS client-builder
WORKDIR /app
ENV CI=true
ENV npm_config_registry=https://registry.npmjs.org/

COPY .npmrc ./
COPY package.json ./
COPY shared/ ./shared/
COPY client/package*.json ./client/

WORKDIR /app/client
RUN npm install --no-audit --no-fund

COPY client/ ./
RUN npm run build


FROM node:20-bookworm-slim AS server-builder
WORKDIR /app
ENV CI=true
ENV npm_config_registry=https://registry.npmjs.org/

COPY .npmrc ./
COPY package.json ./
COPY shared/ ./shared/
COPY server/package*.json ./server/

WORKDIR /app/server
RUN npm install --no-audit --no-fund

COPY server/ ./
RUN npm run build


FROM node:20-bookworm-slim AS runtime
WORKDIR /app

COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=client-builder /app/client/dist ./client/dist
COPY package.json ./
COPY shared/ ./shared/

RUN chown -R 1000:1000 /app
USER 1000

ENV NODE_ENV=production
ENV CLIENT_DIST_PATH=client/dist
EXPOSE 7860

CMD ["node", "server/dist/server/src/index.js"]
