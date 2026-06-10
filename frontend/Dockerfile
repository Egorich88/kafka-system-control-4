# Stage 1: builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Используем npm ci для детерминированной установки (требует package-lock.json)
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Stage 2: production
FROM nginx:alpine
# Обновляем пакеты системы
RUN apk upgrade --no-cache
# Создаём непривилегированного пользователя (если нужен строгий режим)
# и перенастраиваем порт – но для простоты оставим стандартного nginx
# Воркеры nginx уже работают от пользователя nginx, менеджер – root.
# Если хотите полностью без root – раскомментируйте следующие строки и поменяйте порт в nginx.conf:
# RUN sed -i 's/listen 80;/listen 8080;/' /etc/nginx/conf.d/default.conf
# EXPOSE 8080
# USER nginx

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.source="https://github.com/Egorich88/kafka-system-control-4"

CMD ["nginx", "-g", "daemon off;"]