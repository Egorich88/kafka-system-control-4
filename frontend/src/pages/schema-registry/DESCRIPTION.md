# Schema Registry

Профессиональная KSC-страница для Schema Registry: subjects, версии, schema viewer, compatibility, регистрация новой версии и lifecycle-операции.

## Структура

- `SchemaRegistryPage.tsx` — состояние и композиция.
- `services/schema-registry.api.ts` — HTTP API.
- `types/schema-registry.types.ts` — TypeScript-модели.
- `styles/schema-registry.css` — локальные стили.

## Backend endpoints

- `GET /api/schema-registry/subjects`
- `POST /api/schema-registry/subjects/:subject/versions`
- `DELETE /api/schema-registry/subjects/:subject`
- `DELETE /api/schema-registry/subjects/:subject/versions/:version`
- `PUT /api/schema-registry/subjects/:subject/compatibility`

Все запросы передают `X-Kafka-Bootstrap`.
