# Production Dockerfile for Node.js GCP Cloud Tasks & WhatsApp Automation Backend
FROM node:20-alpine AS base

# Install dumb-init to handle signal termination cleanly
RUN apk add --no-cache dumb-init curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev --no-audit --no-fund

# Copy server source code and env
COPY server.js ./
COPY .env ./

# Expose port
EXPOSE 5005

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5005

# Healthcheck to verify server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5005/health || exit 1

# Run with dumb-init for graceful shutdown
USER node
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
