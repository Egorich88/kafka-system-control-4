# Kafka Connect

Профессиональная KSC-страница управления Kafka Connect, ориентированная на documented Console-style workflows, но реализованная самостоятельно под архитектуру KSC.

## Структура

- `KafkaConnectPage.tsx` — композиция и состояние UI.
- `services/kafka-connect.api.ts` — HTTP API.
- `types/kafka-connect.types.ts` — TypeScript-модели.
- `styles/kafka-connect.css` — локальное оформление.

## Функции

- smart-table коннекторов;
- поиск и фильтр;
- статистика;
- задачи и worker;
- restart;
- pause/resume;
- delete;
- создание JSON-конфигурацией;
- просмотр конфигурации и последней ошибки.

## Backend endpoints

`GET /api/kafka-connect/connectors`

`POST /api/kafka-connect/connectors`

`POST /api/kafka-connect/connectors/:name/restart`

`POST /api/kafka-connect/connectors/:name/pause`

`POST /api/kafka-connect/connectors/:name/resume`

`DELETE /api/kafka-connect/connectors/:name`

Все запросы передают `X-Kafka-Bootstrap`.
