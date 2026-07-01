# СТЕЙДЖ 1: СБОРКА
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей (для кеширования)
COPY go.mod go.sum ./

# Скачиваем зависимости
RUN go mod download

# ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ SARAMA ДО ПОСЛЕДНЕЙ ВЕРСИИ
RUN go get -u github.com/IBM/sarama@latest && go mod tidy

# Копируем остальной код
COPY . .

# Собираем статический бинарник без CGO
RUN CGO_ENABLED=0 GOOS=linux go build -o kafka-backend .

# СТЕЙДЖ 2: ФИНАЛЬНЫЙ ОБРАЗ
FROM alpine:latest

# Обновляем системные пакеты и устанавливаем ca-certificates
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

# Создаём непривилегированного пользователя
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Копируем бинарник из сборщика
COPY --from=builder /app/kafka-backend /usr/local/bin/

# Переключаемся на непривилегированного пользователя
USER appuser

EXPOSE 8080

LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.source="https://github.com/Egorich88/kafka-system-control-4"

CMD ["kafka-backend"]