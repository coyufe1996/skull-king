# Dockerfile for Skull King Monorepo

# Stage 1: Build Client
FROM node:20-alpine as client-builder
WORKDIR /app
COPY shared/ ./shared/
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Build Server
FROM node:20-alpine as server-builder
WORKDIR /app
COPY shared/ ./shared/
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/
RUN cd server && npm run build

# Stage 3: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules

# Copy built client static files
COPY --from=client-builder /app/client/dist ./client/dist

# Set permissions
RUN chown -R 1000:1000 /app

# Switch to non-root user
USER 1000

# Expose port 7860
EXPOSE 7860

# Start server
ENV NODE_ENV=production
ENV PORT=7860
CMD ["node", "server/dist/server/src/index.js"]
