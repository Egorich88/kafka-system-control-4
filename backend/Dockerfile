FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o kafka-backend main.go

FROM alpine:latest
RUN apk add --no-cache bash openjdk11
COPY --from=builder /app/kafka-backend /usr/local/bin/
EXPOSE 8080
CMD ["kafka-backend"]