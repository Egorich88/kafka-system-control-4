FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o kafka-backend main.go

FROM alpine:latest
RUN apk add --no-cache bash openjdk21

# Копируем и распаковываем Kafka (например, версию 3.5.0)
COPY kafka_2.13-3.5.0.tgz /tmp/kafka.tgz
RUN tar -xzf /tmp/kafka.tgz -C /opt && \
    mv /opt/kafka_2.13-3.5.0 /opt/kafka && \
    rm /tmp/kafka.tgz
ENV PATH="/opt/kafka/bin:${PATH}"
COPY --from=builder /app/kafka-backend /usr/local/bin/
EXPOSE 8080
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.source="https://github.com/Egorich88/kafka-system-control-4"
CMD ["kafka-backend"]