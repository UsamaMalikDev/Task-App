# Test BE Project - Full-Stack Monorepo

A complete full-stack application built with Next.js, NestJS, and MongoDB, organized as a monorepo with shared packages and Docker support.

## 🚀 Quick Start (One Command Setup)

```bash
# Clone the repository
git clone <your-repo-url>
cd "Task App"

# Run the setup script (installs everything and starts all services)
./setup.sh
```

That's it! The setup script will:
- ✅ Check Docker installation
- ✅ Create environment configuration
- ✅ Build all Docker images
- ✅ Start all services
- ✅ Verify everything is working

## 📱 Access Your Application

After running the setup script, you can access:

- **Client (Frontend)**: http://localhost:3000
- **Server API**: http://localhost:3001
- **Worker Service**: http://localhost:3003
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🏗️ Project Structure

```
Task App/
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
├── setup.sh              # One-command setup script
└── package.json          # Root workspace configuration
```

## 🛠️ Development Commands

### Using npm (Local Development)
```bash
# Install all dependencies
npm install

# Start all services in development mode
npm run dev

# Build all services
npm run build

# Run tests
npm run test

# Clean build artifacts
npm run clean
```

### Using Docker (Recommended)
```bash
# Start development environment with hot reloading
npm run docker:dev

# Start in background
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Clean everything (containers, volumes, images)
npm run docker:clean
```

### Individual Service Commands
```bash
# Client only
npm run dev:client
npm run build:client

# Server only
npm run dev:server
npm run build:server

# Worker only
npm run dev:worker
npm run build:worker
```

## 📦 Shared Packages

This monorepo includes shared packages that can be used across all services:

### Using Shared Types
```typescript
import { User, Task, TaskStatus } from '@test-be-project/shared-types';
```

### Using Shared Utils
```typescript
import { HTTP_METHODS, API_ENDPOINTS, formatDate } from '@test-be-project/shared-utils';
```

## 🔧 Environment Configuration

The setup script creates a `.env` file with default values. You can customize these:

```env
# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGO_DATABASE=testdb

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🐳 Docker Services

The application runs with the following Docker services:

- **mongodb**: MongoDB database
- **redis**: Redis cache
- **server**: NestJS API server
- **worker**: Background worker service
- **client**: Next.js frontend

## 🚨 Troubleshooting

### Services not starting?
```bash
# Check logs
npm run docker:logs

# Restart services
npm run docker:down
npm run docker:up
```

### Port conflicts?
Make sure ports 3000, 3001, 3003, 27017, and 6379 are available.

### Docker issues?
```bash
# Clean everything and start fresh
npm run docker:clean
./setup.sh
```

### Shared packages not working?
```bash
# Rebuild shared packages
npm run build:packages

# Reinstall dependencies
npm run clean
npm install
```

## 📚 Additional Resources

- [Monorepo Guide](MONOREPO_GUIDE.md) - Detailed monorepo documentation
- [Makefile](Makefile) - Alternative command shortcuts
- [Docker Compose](docker-compose.yml) - Production configuration
- [Docker Compose Override](docker-compose.override.yml) - Development configuration

## 🔐 Authentication & Security

### JWT Authentication
The application uses JWT (JSON Web Tokens) for secure authentication:

```typescript
// JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Security Features
- ✅ **JWT Token Authentication** - Secure user sessions
- ✅ **Password Hashing** - Bcrypt for password security
- ✅ **CORS Protection** - Configured for frontend communication
- ✅ **Input Validation** - Class-validator for request validation
- ✅ **Rate Limiting** - Throttling to prevent abuse
- ✅ **Cookie Security** - Secure HTTP-only cookies
- ✅ **Environment Variables** - Sensitive data protection

### Authentication Flow
1. **Registration**: User creates account with email/password
2. **Login**: User authenticates and receives JWT token
3. **Token Storage**: Secure cookie-based token storage
4. **Protected Routes**: JWT middleware validates requests
5. **Token Refresh**: Automatic token renewal mechanism

### Security Headers
```typescript
// CORS Configuration
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Database Security
- ✅ **MongoDB Authentication** - Username/password protection
- ✅ **Connection Encryption** - Secure database connections
- ✅ **Data Validation** - Mongoose schemas with validation
- ✅ **Index Security** - Proper database indexing

## 🏆 Best Practices

### Code Organization
- ✅ **Monorepo Structure** - Centralized code management
- ✅ **Shared Packages** - DRY principle with reusable code
- ✅ **TypeScript** - Type safety across all services
- ✅ **ESLint & Prettier** - Consistent code formatting
- ✅ **Modular Architecture** - Separation of concerns

### Development Workflow
- ✅ **Hot Reloading** - Instant development feedback
- ✅ **Environment Separation** - Dev/staging/production configs
- ✅ **Docker Development** - Consistent environments
- ✅ **Git Hooks** - Pre-commit validation
- ✅ **Testing Strategy** - Unit and integration tests

### Performance Optimization
- ✅ **Multi-stage Docker Builds** - Optimized container images
- ✅ **Redis Caching** - Fast data retrieval
- ✅ **Database Indexing** - Optimized queries
- ✅ **Code Splitting** - Efficient bundle loading
- ✅ **Lazy Loading** - On-demand resource loading

### Deployment Best Practices
- ✅ **Container Security** - Non-root users in containers
- ✅ **Health Checks** - Service monitoring and recovery
- ✅ **Logging** - Structured logging for debugging
- ✅ **Environment Variables** - Configuration management
- ✅ **Volume Persistence** - Data durability

### API Design
- ✅ **RESTful Endpoints** - Standard HTTP methods
- ✅ **Error Handling** - Consistent error responses
- ✅ **Request Validation** - Input sanitization
- ✅ **Response Formatting** - Standardized API responses
- ✅ **Documentation** - Swagger/OpenAPI specs

### Database Best Practices
- ✅ **Schema Validation** - Mongoose model validation
- ✅ **Connection Pooling** - Efficient database connections
- ✅ **Migration Scripts** - Database version control
- ✅ **Backup Strategy** - Data protection and recovery
- ✅ **Query Optimization** - Efficient database operations

### Security Best Practices
- ✅ **Input Sanitization** - XSS and injection prevention
- ✅ **Authentication Middleware** - Route protection
- ✅ **HTTPS Enforcement** - Encrypted communication
- ✅ **Secret Management** - Environment variable security
- ✅ **Regular Updates** - Dependency vulnerability management

## 🎯 Features

- ✅ **Monorepo Structure** - All services in one repository
- ✅ **Shared Packages** - Common code across services
- ✅ **Docker Support** - Easy deployment and development
- ✅ **Hot Reloading** - Development with live updates
- ✅ **TypeScript** - Full type safety
- ✅ **Modern Stack** - Next.js, NestJS, MongoDB, Redis
- ✅ **One-Command Setup** - Get started instantly
- ✅ **Security First** - JWT authentication and validation
- ✅ **Production Ready** - Optimized builds and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `./setup.sh`
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Happy coding! 🚀**