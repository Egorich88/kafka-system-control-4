# Kafka System Control 4.0 🚀

**Веб‑интерфейс для управления Apache Kafka** (React + Go).  
Проект переродился из консольных скриптов в современный микросервис с CI/CD, контейнеризацией и автоматическими релизами.

> ✅ **Работает**: веб‑интерфейс, Docker‑образы, Jenkins CI/CD, GitHub Releases.  
> ⏳ **В планах**: развёртывание в Kubernetes, автоматические релизы по тегам, полноценный GitOps.

---

## ✨ Возможности

- 🌐 **Управление топиками** – просмотр списка, создание через веб‑форму.
- 🐳 **Контейнеризация** – готовые Docker‑образы для бэкенда (Go) и фронтенда (React + Nginx).
- 🔁 **CI/CD** – Jenkins pipeline: сборка → пуш образов в Docker Hub → создание GitHub Release (вручную).
- 📦 **Релизы** – архив исходного кода каждой версии на GitHub.
- 🧩 **Модульность** – чёткое разделение на фронтенд, бэкенд и манифесты (K8s — заготовки).

---

## 📁 Структура проекта

kafka-system-control-4/
├── backend/ # Go‑бэкенд (REST API)
│ ├── main.go
│ ├── Dockerfile
│ └── go.mod
├── frontend/ # React‑фронтенд
│ ├── src/
│ ├── package.json
│ ├── Dockerfile
│ └── nginx.conf
├── jenkins/ # CI/CD
│ └── Jenkinsfile
├── k8s/ # (ПРИМЕР) манифесты для будущего K8s
│ └── ...
├── docker-compose.yml # для локального запуска
└── README.md


---

## 🚀 Быстрый старт

### Локально (без Docker)
```bash
# Бэкенд
cd backend
go run main.go

# Фронтенд (в другом терминале)
cd frontend
npm install
npm run dev

Затем откройте http://localhost:5173 – фронтенд будет обращаться к бэкенду на http://localhost:8080.

## Через Docker Compose

docker-compose up --build

- Фронтенд: http://localhost

- Бэкенд: http://localhost:8080/api/topics

---

🔁 CI/CD (Jenkins)
Что происходит автоматически при пуше в main?

Jenkins клонирует репозиторий.

Логинится в Docker Hub.

Собирает образы backend и frontend (тег = ${BUILD_NUMBER}).

Пушит образы в Docker Hub (egorich27/kafka-control-backend, egorich27/kafka-control-frontend).

Как создать GitHub Release (архив исходного кода)?

Откройте Jenkins‑задачу → Build with Parameters.

В поле TAG_NAME введите тег (например, v4.0.2).

Jenkins создаст релиз на GitHub с этим тегом.

Важно: автоматическая сборка по тегу не настроена (только ручной параметр) – это следующий шаг.

---

📌 Планы развития
Развёртывание в Kubernetes (StatefulSet для Kafka, PVC, Ingress).

Автоматические релизы при пуше тега (без ручного параметра).

Интеграция ArgoCD для GitOps.

Добавление удаления топиков и управления ACL через веб‑интерфейс.

🤝 Автор
Egorich88
Проект создан как пример современного DevOps‑подхода: от консольных утилит до микросервисов и CI/CD.

Лицензия: MIT
“Movement – life!”