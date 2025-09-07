# Makefile for Test BE Project

.PHONY: help install dev build start clean docker-build docker-up docker-down docker-logs docker-dev test lint

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation commands
install: ## Install all dependencies
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing client dependencies..."
	cd apps/client && npm install
	@echo "Installing server dependencies..."
	cd apps/server && npm install
	@echo "Installing worker dependencies..."
	cd apps/worker && npm install

install-client: ## Install client dependencies only
	cd apps/client && npm install

install-server: ## Install server dependencies only
	cd apps/server && npm install

install-worker: ## Install worker dependencies only
	cd apps/worker && npm install

# Development commands
dev: ## Start all services in development mode
	npm run dev

dev-client: ## Start client in development mode
	npm run dev:client

dev-server: ## Start server in development mode
	npm run dev:server

dev-worker: ## Start worker in development mode
	npm run dev:worker

# Build commands
build: ## Build all services
	npm run build

build-client: ## Build client only
	npm run build:client

build-server: ## Build server only
	npm run build:server

build-worker: ## Build worker only
	npm run build:worker

# Production commands
start: ## Start all services in production mode
	npm run start

start-client: ## Start client in production mode
	npm run start:client

start-server: ## Start server in production mode
	npm run start:server

start-worker: ## Start worker in production mode
	npm run start:worker

# Docker commands
docker-build: ## Build all Docker images
	docker-compose build

docker-up: ## Start all services with Docker
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## Show logs from all Docker services
	docker-compose logs -f

docker-dev: ## Start all services in development mode with Docker
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up

docker-restart: ## Restart all Docker services
	docker-compose restart

docker-clean: ## Remove all Docker containers, networks, and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

# Database commands
db-up: ## Start only database services
	docker-compose up -d mongodb redis

db-down: ## Stop database services
	docker-compose stop mongodb redis

db-logs: ## Show database logs
	docker-compose logs -f mongodb redis

# Utility commands
clean: ## Clean all node_modules and build artifacts
	npm run clean
	rm -rf apps/client/.next
	rm -rf apps/server/dist
	rm -rf apps/worker/dist

test: ## Run tests for all services
	@echo "Running client tests..."
	cd apps/client && npm test || true
	@echo "Running server tests..."
	cd apps/server && npm test || true
	@echo "Running worker tests..."
	cd apps/worker && npm test || true

lint: ## Run linting for all services
	@echo "Linting client..."
	cd apps/client && npm run lint || true
	@echo "Linting server..."
	cd apps/server && npm run lint || true
	@echo "Linting worker..."
	cd apps/worker && npm run lint || true

# Setup commands
setup: install ## Complete setup (install dependencies)
	@echo "Setup complete! Run 'make dev' to start development."

setup-docker: ## Setup with Docker
	@echo "Setting up with Docker..."
	docker-compose build
	@echo "Docker setup complete! Run 'make docker-dev' to start development."

# Health check
health: ## Check health of all services
	@echo "Checking client health..."
	curl -f http://localhost:3000/api/health || echo "Client not responding"
	@echo "Checking server health..."
	curl -f http://localhost:3001/health || echo "Server not responding"
	@echo "Checking worker health..."
	curl -f http://localhost:3003/health || echo "Worker not responding"
