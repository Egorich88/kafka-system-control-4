<img width="1254" height="1254" alt="Startt" src="https://github.com/user-attachments/assets/834dcd94-cf62-42b7-97d7-055ec4a46647" />

# Odyssey

[Русский](README.md) | **English**

<p align="left">
  <a href="https://github.com/Egorich88/odyssey-kafka/blob/main/LICENSE">
    <img src="https://badgen.net/github/license/Egorich88/odyssey-kafka?color=blue&label=License" alt="License">
  </a>
  <a href="https://github.com/Egorich88/odyssey-kafka/releases">
    <img src="https://img.shields.io/github/v/release/Egorich88/odyssey-kafka?label=Latest%20Release" alt="GitHub release">
  </a>
  <a href="https://github.com/Egorich88/odyssey-kafka/actions/workflows/ci-cd.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/Egorich88/odyssey-kafka/ci-cd.yml?branch=main&label=CI%2FCD" alt="CI/CD">
  </a>
</p>

**Odyssey** is a modern, lightweight web interface **Kafka Monitoring & Management** for visual administration of Apache Kafka.
Built with Go and React from scratch: from console utilities to a production-ready microservice with automated CI/CD, containerization, release notifications and Kubernetes orchestration.

> The project was previously called Kafka System Control (KSC).
> The new name — Odyssey — reflects the essence of the tool: to be a reliable helm and map for the engineer in the stormy sea of Apache Kafka data.

## 🌊 Why Odyssey

**A strong brand instead of a faceless name**

The previous technical name described the essence well, but sounded overloaded. Odyssey is a short, memorable name that is easy to type in the console, quick to search for and forms a unique IT brand of infrastructure software.

**A metaphor for SRE and DevOps**

In Greek mythology, Odysseus was a great navigator and captain who passed through reefs, storms and traps. Apache Kafka is a vast and unpredictable sea of data, where every day storms with consumer lags, broker failures and expired SSL certificates. Odyssey acts as a reliable and precise helm for the engineer.

**Fintech expertise**

The tool is designed with strict requirements for security, performance and usability, based on years of experience operating high-load platforms in major banking ecosystems.

**Clear positioning**

Positioning Odyssey as **Kafka Monitoring & Management** immediately states that it is a visual, lightweight yet powerful tool for comprehensive control, analysis and management of message queues.

## ✨ Features and Development Status

### 📌 Implemented

- ✅ **Intuitive UI** — dark/light theme support, ergonomic sidebar, switching between multiple Kafka clusters.
- ✅ **Multi-cluster support** — adding clusters with support for various authentication types.
- ✅ **Topic management** — view, create, delete, dynamically change configurations (`retention.ms`, `cleanup.policy`, etc.).
- ✅ **Message search and filtering** — reading messages from a selected partition with filtering by offset, time range and limit.
- ✅ **Kafka certificate monitoring** — a full-featured panel for tracking expiration dates and metadata for JKS, PKCS12, PFX, P12, PEM, CRT, DER, KEY, P8 types (with filtering and visual statuses).
- ✅ **Release notifications** — automatic broadcast to Telegram and corporate channels on new version (with screenshot and changelog).
- ✅ **Release automation (CI/CD)** — fully automated build, code validation, publishing ready images to Docker Hub and generating changelogs on tag push.
- ✅ **Infrastructure packaging** — optimized Docker images for backend/frontend, ready-to-use Docker Compose and Terraform scripts for Kubernetes deployment (Yandex Cloud).

### 🔄 In progress

- 🛠️ **Overview (dashboard)** — ~90% done. Completing backend integration with the certificates panel, customizing criticality levels (`critical`) for the recent events panel.
- 🛠️ **Interactive topics** — extending functionality with direct message publishing via UI / Message Search.
- 🛠️ **Localization** — expanding language packs (currently Russian interface).

### 📝 In development

- ⏳ **"Brokers" page** (detailed monitoring of cluster node state).
- ⏳ **ACL** — visual management of access control lists.
- ⏳ **Consumer groups** — advanced view and offset reset.

## 🏗️ Architecture

![Architecture diagram](https://github.com/user-attachments/assets/ccdf7bc3-770c-4159-94f3-24129e8ed8bd)

| Component | Technologies |
|---|---|
| **Frontend** | React, Vite, Axios, CSS Modules, TypeScript |
| **Backend** | Go, Sarama (Kafka Admin API), net/http |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions, Docker Hub, Terraform, Yandex Cloud |
| **Orchestration** | Kubernetes (Yandex Managed Kubernetes) |
| **Notifications** | Telegram Bot API, MAX Bot API |

## 🚀 Quick Start

### Local development

1. Clone the repository:

    ```bash
    git clone https://github.com/Egorich88/odyssey-kafka.git
    cd odyssey-kafka
    ```

2. Start the backend (requires running Kafka on `localhost:9092`):

    ```bash
    cd backend
    go run main.go
    ```

3. Start the frontend (in another terminal):

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4. Open `http://localhost:5173` — the interface is ready.

### Docker Compose (all-in-one)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080/api/topics`

## 🔁 CI/CD (GitHub Actions)

The workflow is split into three independent automated stages:

- **verify** — triggered on any push to the `main` branch. Validates the build of backend and frontend components without publishing artifacts.
- **release** — runs strictly when a version tag `v*` is created. Builds and pushes production images to Docker Hub, generates GitHub Release.
- 🧪 **deploy-to-kubernetes** — manual deployment scenario via `workflow_dispatch` with the `deploy=true` flag.

Official images:
- `egorich27/kafka-control-backend`
- `egorich27/kafka-control-frontend`

## 🔔 Release Notifications

When a new `v*` tag is pushed, a notification is automatically sent to two channels of **"Odyssey - Kafka Monitoring & Management"**:

<img src="https://cdn.simpleicons.org/telegram/26A5E4" width="16" height="16" alt="Telegram"> **Telegram** — message with changelog and release screenshot.

<img src="https://github.com/user-attachments/assets/884de16b-5e86-4109-896c-19292cfd9d7e" width="16" height="16" alt="MAX" /> **MAX** — message with changelog and attached image.

Notifications are generated from commits between the previous and the current tag.
Screenshots are stored in `docs/screenshots/` and matched by name equal to the
tag (e.g. `v4.2.24.png`).

## 📦 Releases

Full version history is available on the
[Releases](https://github.com/Egorich88/odyssey-kafka/releases) page.

Each release includes:

- Ready-to-use Docker images.
- Detailed changelog, automatically generated from commits.
- Source code archive.

## 🤝 Author

🧑‍💻 **Egorich88**

The project was created as a demonstration of modern DevOps practices:
from console scripts to production-ready microservices with full CI/CD.

> "Movement – life!"

## 📄 License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

## ⚠️ Trademark

The name "Kafka" and the Kafka logo are registered trademarks of The Apache Software Foundation (ASF). Odyssey is an independent open-source tool designed to manage Apache Kafka clusters. Odyssey is not part of Apache Kafka, not endorsed or sponsored by ASF. All references to "Kafka" are used purely in a technical sense to denote compatible technology.

## Powered by

<img width="461" height="176" alt="Монтажная область 1" src="https://github.com/user-attachments/assets/65593be3-d1f2-4c96-90a3-210702ea3c29" />
