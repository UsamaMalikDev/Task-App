# Multi-stage build for NestJS server in monorepo

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/*/package*.json ./packages/*/

# Install dependencies
RUN npm ci --workspace=apps/server --workspace=packages/shared-types --workspace=packages/shared-utils

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/*/node_modules

# Copy source code
COPY . .

# Build shared packages first
RUN npm run build --workspace=packages/shared-types
RUN npm run build --workspace=packages/shared-utils

# Build the server application
RUN npm run build --workspace=apps/server

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application and dependencies
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared-types/dist ./node_modules/@test-be-project/shared-types/dist
COPY --from=builder /app/packages/shared-utils/dist ./node_modules/@test-be-project/shared-utils/dist

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/healthz || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]