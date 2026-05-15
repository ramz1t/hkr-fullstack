build-api:
	docker build --build-arg DATABASE_URL="postgres://postgres:postgres@postgres:5432/hkr-fullstack?sslmode=disable" -f apps/api/Dockerfile -t casinoapp-api .

build-web-public:
	docker build --build-arg VITE_API_BASE_URL="/api" --build-arg VITE_JWT_ACCESS_TTL="900" --build-arg VITE_APP_NAME="casinoapp" --build-arg VITE_BASE_URL="/" -f apps/web-public/Dockerfile -t casinoapp-web-public .

build-web-admin:
	docker build --build-arg VITE_API_BASE_URL="/api" --build-arg VITE_JWT_ACCESS_TTL="900" --build-arg VITE_APP_NAME="casinoadmin" --build-arg VITE_BASE_URL="/admin/" -f apps/web-admin/Dockerfile -t casinoapp-web-admin .

init:
	@echo "Initializing database..."
	docker compose up -d postgres
	@echo "Waiting for database to be ready..."
	sleep 10
	@echo "Running database migrations..."
	docker run --rm --network hkr-fullstack_default -v "$(CURDIR):/app" -w /app -e DATABASE_URL="postgres://postgres:postgres@postgres:5432/hkr-fullstack?sslmode=disable" oven/bun:1 sh -c "cd packages/database && bunx prisma db push --accept-data-loss && cd ../../ && bun prisma:generate && bun prisma:seed"
	@echo "Building API..."
	$(MAKE) build-api
	@echo "Building web-public..."
	$(MAKE) build-web-public	
	@echo "Building web-admin..."
	$(MAKE) build-web-admin	
	@echo "Shutting down database..."
	docker compose down

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	$(MAKE) down
	$(MAKE) init
	
