# Kafka System Control-4
<div align="left">
<a href="https://github.com/kafbat/kafka-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License"/></a>
<a href="https://github.com/Egorich88/kafka-system-control-4/releases">
  <img src="https://img.shields.io/github/v/release/Egorich88/kafka-system-control-4" alt="Latest Release">
</a>
<img width="1254" height="1254" alt="image" src="https://github.com/user-attachments/assets/4d3f6079-6787-42f1-9d54-9b508c35cd06" />



**Веб‑интерфейс для управления Apache Kafka** (React + Go).  
Проект переродился из консольных скриптов в современный микросервис с CI/CD (GitHub Actions), контейнеризацией и автоматическими релизами.

> ✅ **Работает**: веб‑интерфейс с боковым меню, тёмная тема, переключение кластеров, управление топиками, Docker‑образы, CI/CD через GitHub Actions, автоматические GitHub Releases.  
> ⏳ **В планах**: управление ACL и группами потребителей, поиск сообщений, мониторинг.

 # Архитектура

 <img width="1520" height="882" alt="image" src="https://github.com/user-attachments/assets/ccdf7bc3-770c-4159-94f3-24129e8ed8bd" />



---

## ✨ Возможности

- 🖥️ **Современный интерфейс** – боковое меню, тёмная тема, выбор активного кластера.
- 🌐 **Управление топиками** – просмотр списка, создание через веб‑форму.
- 🐳 **Контейнеризация** – готовые Docker‑образы для бэкенда (Go) и фронтенда (React + Nginx).
- 🔁 **CI/CD (GitHub Actions)** – при пуше в `main` или создании тега `v*`:
  - Сборка образов backend и frontend
  - Пуш в Docker Hub
  - (при теге) создание GitHub Release с архивом исходного кода
- 📦 **Релизы** – архив исходного кода каждой версии на GitHub.
- 🧩 **Модульность** – чёткое разделение на фронтенд, бэкенд и манифесты (K8s — заготовки).

---

## 📁 Структура проекта
<img width="570" height="884" alt="image" src="https://github.com/user-attachments/assets/141caba8-cc4e-42e2-841d-6b0532f80874" />

---

## ⚙️ Быстрый старт (локально)

### 1️⃣ Клонируйте репозиторий

```bash
git clone https://github.com/Egorich88/kafka-system-control-4.git
cd kafka-system-control-4
```

### 2️⃣ Запустите бэкенд и фронтенд в режиме разработки
# Бэкенд (требуется работающая Kafka на localhost:9092)

```bash
cd backend
go run main.go
```

# Фронтенд (в другом терминале)
```bash
cd frontend
npm install
npm run dev
```

Затем откройте http://localhost:5173 – фронтенд будет обращаться к бэкенду на http://localhost:8080.

### 3️⃣ (Альтернатива) Запуск через Docker Compose
```bash
docker-compose up --build
```

- Фронтенд: http://localhost
- Бэкенд: http://localhost:8080/api/topics

### 🔁 CI/CD (GitHub Actions)
Что происходит автоматически при пуше в main?

GitHub Actions клонирует репозиторий.

Логинится в Docker Hub.

Собирает образы backend и frontend (теги: latest, main, sha-<коммит>).

Пушит образы в Docker Hub (egorich27/kafka-control-backend, egorich27/kafka-control-frontend).

При пуше тега (например, v4.1.0) – дополнительно автоматически создаётся GitHub Release с архивом исходного кода.

### 🚀 Планы развития
*   [x] Веб‑интерфейс (React + Go)
*   [x] Docker‑образы и CI/CD (GitHub Actions)
*   [x] Автоматические релизы по тегам
*   [x] Переключение кластеров (фронтенд + бэкенд)
*   [x] Развёртывание в Kubernetes (Yandex Cloud)
*   [ ] Управление ACL и группами потребителей
*   [ ] Поиск сообщений (по ключу/оффсету)
*   [ ] Мониторинг и метрики

### 📜 История версий
###  v4.1.0 (2026-05-12)
🔧 Изменения:

✅ Полный переход на Apache License 2.0

✅ Полностью переработан UI: боковое меню, тёмная тема, переключение кластеров

✅ Собственный логотип (public/logo.svg)

✅ Улучшена документация и CI/CD


### v4.0.2 (2026-05-05)
🔧 Изменения:

✅ Полный отказ от Jenkins – CI/CD перенесён на GitHub Actions

✅ Автоматические релизы при пуше тега

✅ Упрощена инфраструктура – больше не нужен отдельный сервер Jenkins

✅ Все секреты теперь хранятся в GitHub Secrets

### v4.0.1 (2026-05-02)
🐛 Исправления:

Настройка CI/CD через Jenkins (промежуточная версия)

### v4.0.0 (2026-05-01)
🎉 Первый релиз веб-версии:

✅React + Go микросервисы

✅Docker-образы на Docker Hub

✅Ручное создание релизов

### 🤝 Автор
Egorich88
Проект создан как пример современного DevOps‑подхода: от консольных утилит до микросервисов и CI/CD.
«Movement – life!»

### 📄 Лицензия
Этот проект распространяется под лицензией Apache License 2.0. См. файл LICENSE для подробной информации.

### ⚠️ Товарный знак
Название «Kafka» и логотип Kafka являются зарегистрированными товарными знаками The Apache Software Foundation (ASF).
Проект Kafka System Control (KSC) — это независимый инструмент с открытым исходным кодом, разработанный для управления кластерами Apache Kafka.
KSC не является частью Apache Kafka, не поддерживается и не спонсируется ASF.
Все упоминания «Kafka» и «Кафка» используются исключительно в техническом смысле для обозначения совместимой технологии.
