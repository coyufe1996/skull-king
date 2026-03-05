# Dockerfile for Skull King Monorepo

# Stage 1: Build Client
FROM node:20-alpine as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
COPY shared/ ../shared/
RUN npm run build

# Stage 2: Build Server
FROM node:20-alpine as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
COPY shared/ ../shared/
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Copy built server
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules

# Copy built client static files
COPY --from=client-builder /app/client/dist ./client/dist

# Set permissions for Hugging Face Spaces (optional but good practice)
RUN mkdir -p /app/server/dist && chown -R 1000:1000 /app

# Switch to non-root user (Hugging Face default)
USER 1000

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Start server
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=7860
CMD ["node", "dist/server/src/index.js"]
