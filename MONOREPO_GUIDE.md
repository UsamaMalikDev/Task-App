# Monorepo Guide

## 🏗️ Unified Repository Structure

This project is now organized as a **unified monorepo** with the following structure:

```
Test_BE_Project/
├── apps/                   # Application services
│   ├── client/            # Next.js frontend (Port: 3000)
│   ├── server/            # NestJS backend API (Port: 3001)
│   └── worker/            # NestJS background worker (Port: 3003)
├── packages/              # Shared packages
│   ├── shared-types/      # Common TypeScript types
│   └── shared-utils/      # Common utilities
├── scripts/               # Database and deployment scripts
├── docker-compose.yml     # Production Docker setup
├── docker-compose.override.yml # Development Docker setup
├── Makefile              # Convenience commands
└── package.json          # Root workspace configuration
```

## 🚀 Quick Start

### One-Command Setup (Recommended)
```bash
# Clone and setup everything with one command
./setup.sh
```

### Manual Setup
```bash
# 1. Install Dependencies
npm install

# 2. Start Development Environment
# With Docker (Recommended)
npm run docker:dev

# Or locally
npm run dev
```

### 3. Access Services
- **Client**: http://localhost:3000
- **Server API**: http://localhost:3001
- **Worker**: http://localhost:3003
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 📦 Workspace Management

### Root Commands
```bash
# Install all dependencies
npm install

# Run all services in development
npm run dev

# Build all services
npm run build

# Run tests for all services
npm run test

# Clean all build artifacts
npm run clean
```

### Individual Service Commands
```bash
# Client
cd apps/client && npm run dev

# Server
cd apps/server && npm run start:dev

# Worker
cd apps/worker && npm run start:dev
```

## 🐳 Docker Commands

```bash
# Development with hot reloading
make docker-dev

# Production deployment
make docker-build && make docker-up

# View logs
make docker-logs

# Stop all services
make docker-down
```

## 📁 Shared Packages

### Using Shared Types
```typescript
import { User, Task, TaskStatus, ApiResponse } from '@test-be-project/shared-types';
```

### Using Shared Utils
```typescript
import { HTTP_METHODS, API_ENDPOINTS, formatDate, isValidEmail } from '@test-be-project/shared-utils';
```

## 🔧 Development Workflow

1. **Make changes** to any service in `apps/`
2. **Share code** using packages in `packages/`
3. **Test locally** with `make dev`
4. **Deploy with Docker** using `make docker-dev`

## 🎯 Benefits of This Structure

- ✅ **Single repository** for all services
- ✅ **Shared code** through packages
- ✅ **Consistent tooling** across services
- ✅ **Easy deployment** with Docker
- ✅ **Simplified dependency management**
- ✅ **Unified development workflow**

## 📝 Adding New Services

1. Create new app in `apps/` directory
2. Add to workspace in root `package.json`
3. Update Docker Compose files
4. Add commands to Makefile

## 🔄 Adding Shared Packages

1. Create new package in `packages/` directory
2. Add to workspace configuration
3. Import in services that need it
4. Build and publish as needed
