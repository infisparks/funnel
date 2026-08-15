# Root Production Dockerfile for Backend Deployment on Coolify / Docker
FROM node:22-alpine AS base

# Install dumb-init and curl for healthcheck
RUN apk add --no-cache dumb-init curl

# Set working directory
WORKDIR /app

# Copy server package configuration
COPY server/package.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy backend source files
COPY server/server.js server/whatappmanage.js ./
COPY server/.env* ./

# Expose backend port
EXPOSE 5005

# Environment defaults
ENV NODE_ENV=production
ENV PORT=5005

# Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5005/health || exit 1

# Run with dumb-init for graceful shutdown
USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
