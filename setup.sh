#!/bin/bash

# Test BE Project - One-Command Setup Script
# This script sets up the entire monorepo with Docker

set -e  # Exit on any error

echo "🚀 Setting up Test BE Project..."
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cat > .env << EOF
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
EOF
    echo "✅ Created .env file with default values"
else
    echo "✅ .env file already exists"
fi

# Build and start all services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting all services..."
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "⚠️  MongoDB might still be starting up"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "⚠️  Redis might still be starting up"
fi

# Check if services are responding
echo "🌐 Checking web services..."

# Wait a bit more for web services
sleep 5

# Check client
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Client is running at http://localhost:3000"
else
    echo "⚠️  Client might still be starting up"
fi

# Check server
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Server API is running at http://localhost:3001"
else
    echo "⚠️  Server API might still be starting up"
fi

# Check worker
if curl -f http://localhost:3003/health > /dev/null 2>&1; then
    echo "✅ Worker is running at http://localhost:3003"
else
    echo "⚠️  Worker might still be starting up"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "📱 Access your application:"
echo "   • Client:     http://localhost:3000"
echo "   • Server API: http://localhost:3001"
echo "   • Worker:     http://localhost:3003"
echo "   • MongoDB:    localhost:27017"
echo "   • Redis:      localhost:6379"
echo ""
echo "🛠️  Useful commands:"
echo "   • View logs:    docker-compose logs -f"
echo "   • Stop all:     docker-compose down"
echo "   • Restart:      docker-compose restart"
echo "   • Rebuild:      docker-compose build --no-cache"
echo ""
echo "📚 For more information, see MONOREPO_GUIDE.md"
echo ""
echo "Happy coding! 🚀"
