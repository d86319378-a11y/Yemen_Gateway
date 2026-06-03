# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git make

# Copy go mod files
COPY go.mod ./
RUN go mod download

# Copy source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/yemenapi ./cmd/api/main.go

# Runtime stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/bin/yemenapi /app/yemenapi

# Create non-root user
RUN addgroup -g 1000 -S yemenapi && \
    adduser -u 1000 -S yemenapi -G yemenapi && \
    mkdir -p /app/storage/documents /app/storage/qr /app/storage/uploads && \
    chown -R yemenapi:yemenapi /app/storage

USER yemenapi

EXPOSE 8080 9090

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["./yemenapi"]
