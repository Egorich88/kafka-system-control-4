FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o kafka-backend main.go

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/kafka-backend /usr/local/bin/
EXPOSE 8080
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.source="https://github.com/Egorich88/kafka-system-control-4"
CMD ["kafka-backend"]