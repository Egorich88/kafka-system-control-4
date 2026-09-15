/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * =============================================================================
 * @file constants.ts
 * =============================================================================
 * Предустановки периода и интервала обновления глобальной панели.
 * =============================================================================
 */

import type { RefreshInterval, RelativeTimeRange } from './types';

export const RELATIVE_TIME_RANGES: RelativeTimeRange[] = [
  { type: 'relative', id: '5m', label: 'Последние 5 минут' },
  { type: 'relative', id: '15m', label: 'Последние 15 минут' },
  { type: 'relative', id: '30m', label: 'Последние 30 минут' },
  { type: 'relative', id: '1h', label: 'Последний час' },
  { type: 'relative', id: '3h', label: 'Последние 3 часа' },
  { type: 'relative', id: '6h', label: 'Последние 6 часов' },
  { type: 'relative', id: '12h', label: 'Последние 12 часов' },
  { type: 'relative', id: '24h', label: 'Последние 24 часа' },
  { type: 'relative', id: '7d', label: 'Последние 7 дней' },
  { type: 'relative', id: '30d', label: 'Последние 30 дней' },
];

export const REFRESH_INTERVALS: RefreshInterval[] = [
  { value: 0, label: 'Выкл' },
  { value: 5, label: '5 с' },
  { value: 10, label: '10 с' },
  { value: 30, label: '30 с' },
  { value: 60, label: '1 мин' },
  { value: 300, label: '5 мин' },
  { value: 900, label: '15 мин' },
  { value: 1800, label: '30 мин' },
  { value: 3600, label: '1 час' },
];

export const DEFAULT_TIME_RANGE = RELATIVE_TIME_RANGES[1];
export const DEFAULT_REFRESH_INTERVAL = 10;

export const STORAGE_KEYS = {
  timeRange: 'ksc_dashboard_time_range',
  refreshInterval: 'ksc_dashboard_refresh_interval',
} as const;
