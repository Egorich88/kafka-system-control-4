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
  { type: 'relative', id: '5m', label: '5 минут' },
  { type: 'relative', id: '15m', label: '15 минут' },
  { type: 'relative', id: '30m', label: '30 минут' },
  { type: 'relative', id: '1h', label: '1 час' },
  { type: 'relative', id: '3h', label: '3 часа' },
  { type: 'relative', id: '6h', label: '6 часов' },
  { type: 'relative', id: '12h', label: '12 часов' },
  { type: 'relative', id: '24h', label: '24 часа' },
  { type: 'relative', id: '7d', label: '7 дней' },
  { type: 'relative', id: '30d', label: '30 дней' },
];

export const REFRESH_INTERVALS: RefreshInterval[] = [
  { value: 0, label: 'Off' },
  { value: 5, label: '5s' },
  { value: 10, label: '10s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 300, label: '5m' },
  { value: 900, label: '15m' },
  { value: 1800, label: '30m' },
  { value: 3600, label: '1h' },
  { value: 86400, label: '1d' },
];

export const DEFAULT_TIME_RANGE = RELATIVE_TIME_RANGES[1];
export const DEFAULT_REFRESH_INTERVAL = 10;

export const STORAGE_KEYS = {
  timeRange: 'ksc_dashboard_time_range',
  refreshInterval: 'ksc_dashboard_refresh_interval',
} as const;
