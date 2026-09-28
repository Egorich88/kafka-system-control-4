# ksqlDB

Рабочее пространство ksqlDB по модели профессиональной Kafka Operations UI: SQL editor, выполнение statements, Streams, Tables, Queries и остановка running query.

## Структура

- `KsqlDbPage.tsx` — композиция страницы.
- `services/ksqldb.api.ts` — REST-взаимодействие.
- `types/ksqldb.types.ts` — TypeScript-модели.
- `styles/ksqldb.css` — локальные стили.

## Backend endpoints

- `GET /api/ksqldb/state`
- `POST /api/ksqldb/execute`
- `POST /api/ksqldb/queries/:id/terminate`

Все запросы передают `X-Kafka-Bootstrap`.

При отсутствии API UI использует demo-state и демонстрационный результат editor.
