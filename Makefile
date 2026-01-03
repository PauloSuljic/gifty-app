.PHONY: help backend-restore backend-test frontend-install frontend-build frontend-lint check

help:
	@echo "Available targets:"
	@echo "  make backend-restore   # cd backend && dotnet restore"
	@echo "  make backend-test      # cd backend && dotnet test"
	@echo "  make frontend-install  # cd frontend && npm ci"
	@echo "  make frontend-build    # cd frontend && npm run build"
	@echo "  make frontend-lint     # cd frontend && npm run lint"
	@echo "  make check             # run backend-test, frontend-build, frontend-lint"

backend-restore:
	cd backend && dotnet restore

backend-test:
	cd backend && dotnet test

frontend-install:
	cd frontend && npm ci

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

check: backend-test frontend-build frontend-lint
