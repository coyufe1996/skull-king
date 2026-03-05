FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV CI=true
ENV npm_config_audit=false
ENV npm_config_fund=false
ENV npm_config_update_notifier=false

# Copy root configuration
COPY .npmrc package.json package-lock.json* ./

# Copy workspace package.json files
COPY client/package.json ./client/
COPY server/package.json ./server/

# Install dependencies (workspaces will install everything at root)
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY client/ ./client/
COPY server/ ./server/

# Build client and server
RUN npm run build

# Runtime stage
FROM node:20-bookworm-slim AS runtime
WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Copy package.json files for runtime reference
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/

# Copy node_modules (hoisted at root)
COPY --from=builder /app/node_modules ./node_modules

# Set permissions
RUN chown -R 1000:1000 /app
USER 1000

ENV NODE_ENV=production
ENV PORT=7860
ENV CLIENT_DIST_PATH=client/dist
EXPOSE 7860

# Start the server
CMD ["node", "server/dist/server/src/index.js"]
