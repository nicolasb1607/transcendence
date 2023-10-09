#Colors
GREEN = \033[0;32m
CYAN = \033[0;36m
NC = \033[0m


all:
	@echo "$(CYAN)frontend will be available at http://localhost:3000$(NC)"
	docker compose up --build

database:
	rm -rf database/data
	docker system prune -a --volumes --force
	cd ./sources/backend/source && pnpm run build:prisma
	docker compose build
	docker-compose up postgres

test :
#For local nestjs development, copy the following command in bash :
#export POSTGRES_USER=testuser && export POSTGRES_PASSWORD=testpass && export POSTGRES_DB=testdb && export POSTGRE_URL="postgres:5432" && export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost/${POSTGRES_DB}"
	mkdir -p ./sources/database/data/postgres
	cd ./sources/backend/source/ && pnpm update
	docker compose build
	docker compose up -d postgres
	cd ./sources/backend/source/ && pnpm build:prisma
	cd ./sources/backend/source/ && pnpm start:dev

up:
	docker compose up

down :
	docker compose -f ./docker-compose.yml down

clean : down
	./sources/clear_all.sh

re : down clean all

.PHONY : all test build up down clean
