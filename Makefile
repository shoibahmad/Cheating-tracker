.PHONY: help bootstrap test test-backend test-frontend lint lint-backend lint-frontend build run up down clean

help: ## Show this help message
	@echo "SecureEval Monorepo Automation Tasks:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Setup local environment and install locked dependencies
	bash scripts/bootstrap.sh

test: test-backend test-frontend ## Run all backend and frontend test suites

test-backend: ## Run backend tests with 75% coverage gate
	pytest backend/tests/ -v --cov=backend/app --cov-fail-under=75 --cov-report=term-missing

test-frontend: ## Run frontend tests with coverage gate
	npm run test:coverage --prefix frontend

lint: lint-backend lint-frontend ## Run backend and frontend linters

lint-backend: ## Run Ruff linter on backend
	ruff check backend/ --config pyproject.toml

lint-frontend: ## Run ESLint on frontend
	npm run lint --prefix frontend

build: ## Build production frontend bundle
	npm run build --prefix frontend

up: ## Start full stack via docker compose
	docker compose up --build

down: ## Tear down docker containers
	docker compose down

clean: ## Remove temporary build and test caches
	rm -rf frontend/dist frontend/coverage .coverage coverage.xml .pytest_cache
