.PHONY: build run migrate test docker-up docker-down swagger

APP_NAME=yemenapi
BUILD_DIR=./bin
MAIN_FILE=./cmd/api/main.go

build:
	go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_FILE)

run:
	go run $(MAIN_FILE)

dev:
	air -c .air.toml

migrate:
	go run $(MAIN_FILE) migrate

test:
	go test -v ./...

docker-up:
	docker-compose -f docker/docker-compose.yml up -d

docker-down:
	docker-compose -f docker/docker-compose.yml down

swagger:
	swag init -g $(MAIN_FILE) -o ./docs

lint:
	golangci-lint run

fmt:
	go fmt ./...

clean:
	rm -rf $(BUILD_DIR)
