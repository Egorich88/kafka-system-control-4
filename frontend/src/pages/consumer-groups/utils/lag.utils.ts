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
 * lag.utils.ts
 * =============================================================================
 *
 * Утилиты форматирования и визуализации Consumer Lag.
 *
 * Используется в таблице (полоски Grafana-стиля) и KPI.
 * =============================================================================
 */

/** Форматирует lag: 1240000 → "1.24M", 850 → "850" */
export function formatLag(value: number): string {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(0)}K`;
    }
    return String(value);
}

export type LagLevel = 'none' | 'low' | 'medium' | 'high';

/** Определяет уровень lag для цветовой индикации */
export function getLagLevel(lag: number, maxLag: number): LagLevel {
    if (lag === 0) return 'none';
    const ratio = maxLag > 0 ? lag / maxLag : 0;
    if (ratio >= 0.7) return 'high';
    if (ratio >= 0.3) return 'medium';
    return 'low';
}

/** Ширина полоски lag (0–100%) относительно maxLag в таблице */
export function getLagBarWidth(lag: number, maxLag: number): number {
    if (maxLag === 0 || lag === 0) return 0;
    return Math.min(100, Math.round((lag / maxLag) * 100));
}
