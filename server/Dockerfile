# Production Dockerfile for Node.js GCP Cloud Tasks & WhatsApp Automation Backend
FROM node:22-alpine AS base

# Install dumb-init and curl for healthchecks
RUN apk add --no-cache dumb-init curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy server code and configs
COPY server.js whatappmanage.js ./
COPY .env* ./

# Expose backend port
EXPOSE 5005

# Set production environment
ENV NODE_ENV=production
ENV PORT=5005

# Healthcheck
HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5005/health || exit 1

# Run with dumb-init
USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
