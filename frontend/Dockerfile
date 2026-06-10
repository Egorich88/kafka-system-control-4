# Stage 1: builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Stage 2: production (без root)
FROM nginx:alpine
RUN apk upgrade --no-cache

# Копируем обновлённый nginx.conf (где listen 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Переключаемся на непривилегированного пользователя nginx
USER nginx

# Слушаем порт 8080 (не root)
EXPOSE 8080

LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.source="https://github.com/Egorich88/kafka-system-control-4"

CMD ["nginx", "-g", "daemon off;"]