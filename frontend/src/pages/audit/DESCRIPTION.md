# Audit — Аудит

## Kafka System Control 4.2.3

Страница `Audit` показывает историю действий пользователей и системных событий Kafka-кластера: **кто, когда, что и над каким объектом сделал и с каким результатом**.

На текущем frontend-этапе страница работает на mock-данных. Backend/Kafka подключается позже через `hooks/useAudit.ts`.

---

## Архитектура

```text
AuditPage.tsx
│
├── Header
│   ├── Автообновление
│   ├── Период
│   ├── Refresh
│   └── Export
│
├── AuditKpi
│   ├── Всего событий
│   ├── Изменения
│   ├── Предупреждения
│   ├── Ошибки
│   └── Активные пользователи
│
├── AuditOverviewCharts
│   ├── Активность событий
│   ├── Типы действий
│   └── Активность пользователей
│
├── AuditToolbar
│   ├── Search
│   ├── User
│   ├── Action
│   ├── Resource
│   ├── Result
│   ├── Date From / Date To
│   ├── Refresh / Export
│   └── Reset
│
├── AuditTable
│   └── ЕДИНСТВЕННЫЙ журнал аудита
│
└── AuditDetailsPanel
    ├── Основная информация
    ├── Изменения
    └── Дополнительно
```

### Важное UX-решение

Отдельный блок `Последние события` удалён. Он дублировал журнал аудита. Теперь пользователь получает аналитику сверху и один источник истины — `Журнал аудита` снизу. При клике по строке выбранное событие открывается в правой панели деталей.

---

## Структура файлов

- `AuditPage.tsx` — композиция страницы, состояние открытия панели деталей, refresh/export.
- `components/AuditKpi.tsx` — KPI-карточки.
- `components/AuditOverviewCharts.tsx` — три аналитических графика.
- `components/AuditToolbar.tsx` — поиск и фильтры.
- `components/AuditTable.tsx` — единственный журнал и пагинация.
- `components/AuditDetailsPanel.tsx` — правая панель выбранного события.
- `hooks/useAudit.ts` — единая точка данных; сейчас mock, позже API.
- `mock/audit.ts` — тестовые события.
- `types/audit.types.ts` — TypeScript-модели.
- `utils/audit.utils.ts` — фильтрация, статистика и экспорт.
- `styles/audit.css` — только импорт модульных CSS-файлов.
- `styles/audit-page.css` — базовая геометрия.
- `styles/audit-header.css` — header.
- `styles/audit-kpi.css` — KPI.
- `styles/audit-charts.css` — графики.
- `styles/audit-toolbar.css` — фильтры.
- `styles/audit-table.css` — журнал.
- `styles/audit-details.css` — details drawer.
- `styles/audit-responsive.css` — адаптивность.

---

## Темы

Audit не задаёт собственную тёмную тему. Все основные цвета берутся из переменных KSC: `--bg-primary`, `--bg-secondary`, `--card-bg`, `--border-color`, `--text-primary`, `--text-secondary`, `--input-bg`, `--selected-color`, `--menu-active-bg` и других.

Поэтому правая панель деталей автоматически становится светлой в `light` и тёмной в `dark`, сохраняя ту же структуру и контраст.

---

## Иконки

Для UI используются иконки из уже установленного `react-icons`. Самодельные SVG и декоративные дублирующие значки не используются. Для результата применяются простые `FiCheck`, `FiAlertTriangle` и `FiX`, а не дополнительные «круги с галочкой».

---

## Данные

Сейчас: `MOCK_AUDIT_EVENTS`.

Следующий этап: заменить mock внутри `useAudit.ts` на backend API, не переписывая компоненты страницы.
