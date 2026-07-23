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
 * consumer-groups.utils.ts
 * =============================================================================
 *
 * Сортировка, фильтрация и экспорт Consumer Groups.
 * =============================================================================
 */

import type { ConsumerGroup } from '../types/consumer-groups.types';

export type SortOption =
    | 'lag-desc'
    | 'lag-asc'
    | 'name-asc'
    | 'name-desc'
    | 'members-desc'
    | 'state-asc';

export function sortGroups(
    groups: ConsumerGroup[],
    sortBy: SortOption
): ConsumerGroup[] {
    const sorted = [...groups];

    switch (sortBy) {
        case 'lag-desc':
            return sorted.sort((a, b) => b.lag - a.lag);
        case 'lag-asc':
            return sorted.sort((a, b) => a.lag - b.lag);
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case 'members-desc':
            return sorted.sort((a, b) => b.members - a.members);
        case 'state-asc':
            return sorted.sort((a, b) => a.state.localeCompare(b.state));
        default:
            return sorted;
    }
}

export type ExportFormat = 'json' | 'csv' | 'txt';

export function exportGroups(
    groups: ConsumerGroup[],
    format: ExportFormat
): void {
    const timestamp = new Date().toISOString().slice(0, 10);
    let content: string;
    let mime: string;
    let ext: string;

    if (format === 'json') {
        content = JSON.stringify(groups, null, 2);
        mime = 'application/json;charset=utf-8';
        ext = 'json';
    } else if (format === 'csv') {
        const header = 'name,state,lag,members,coordinator,topics,partitions';
        const rows = groups.map(g =>
            [
                g.name,
                g.state,
                g.lag,
                g.members,
                g.coordinator,
                g.topics?.join(';') ?? '',
                g.partitions ?? 0
            ].join(',')
        );
        content = [header, ...rows].join('\n');
        mime = 'text/csv;charset=utf-8';
        ext = 'csv';
    } else {
        content = groups
            .map(g =>
                `${g.name} | ${g.state} | lag=${g.lag} | members=${g.members} | coordinator=${g.coordinator}`
            )
            .join('\n');
        mime = 'text/plain;charset=utf-8';
        ext = 'txt';
    }

    const blob = new Blob([content], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consumer-groups-${timestamp}.${ext}`;
    link.click();
    window.URL.revokeObjectURL(url);
}
