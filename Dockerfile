# Dockerfile for Skull King Monorepo

# Stage 1: Build Client
FROM node:18-alpine as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
COPY shared/ ../shared/
RUN npm run build

# Stage 2: Build Server
FROM node:18-alpine as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
COPY shared/ ../shared/
RUN npm run build

# Stage 3: Production Runtime
FROM node:18-alpine
WORKDIR /app

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules

# Copy built client static files
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 3001

# Start server
WORKDIR /app/server
ENV NODE_ENV=production
CMD ["node", "dist/server/src/index.js"]
