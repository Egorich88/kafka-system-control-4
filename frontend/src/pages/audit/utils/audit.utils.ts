/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

/**
 * =============================================================================
 * audit.utils.ts
 * =============================================================================
 *
 * Вспомогательные функции страницы Audit.
 *
 * Здесь находится логика:
 *
 * • фильтрации;
 * • форматирования;
 * • подсчёта статистики;
 * • экспорта.
 *
 * Компоненты UI не должны содержать эту бизнес-логику.
 * =============================================================================
 */

import type {
    AuditEvent,
    AuditFilters,
    AuditStats
} from '../types/audit.types';


/**
 * Фильтрация событий.
 */
export function filterAuditEvents(
    events: AuditEvent[],
    filters: AuditFilters
): AuditEvent[] {

    const search = filters.search
        .trim()
        .toLowerCase();

    return events.filter(event => {

        const matchesSearch =
            !search ||
            event.user.toLowerCase().includes(search) ||
            event.message.toLowerCase().includes(search) ||
            event.objectName.toLowerCase().includes(search) ||
            event.id.toLowerCase().includes(search) ||
            event.ipAddress.toLowerCase().includes(search);

        const matchesUser =
            !filters.user ||
            event.user === filters.user;

        const matchesAction =
            !filters.action ||
            event.action === filters.action;

        const matchesResource =
            !filters.resource ||
            event.resource === filters.resource;

        const matchesResult =
            !filters.result ||
            event.result === filters.result;

        const matchesFrom =
            !filters.dateFrom ||
            event.timestamp >= filters.dateFrom;

        const matchesTo =
            !filters.dateTo ||
            event.timestamp <= filters.dateTo;

        return (
            matchesSearch &&
            matchesUser &&
            matchesAction &&
            matchesResource &&
            matchesResult &&
            matchesFrom &&
            matchesTo
        );

    });

}


/**
 * Подсчёт KPI.
 */
export function calculateAuditStats(
    events: AuditEvent[]
): AuditStats {

    const users = new Set(
        events.map(event => event.user)
    );

    return {

        totalEvents: events.length,

        changes: events.filter(event =>
            ['create', 'update', 'delete', 'reset'].includes(
                event.action
            )
        ).length,

        warnings: events.filter(
            event => event.result === 'warning'
        ).length,

        errors: events.filter(
            event => event.result === 'error'
        ).length,

        activeUsers: users.size

    };

}


/**
 * Формат времени.
 */
export function formatAuditTime(
    timestamp: string
): string {

    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    ).format(
        new Date(timestamp)
    );

}


/**
 * Формат полной даты.
 */
export function formatAuditDate(
    timestamp: string
): string {

    return new Intl.DateTimeFormat(
        'ru-RU',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    ).format(
        new Date(timestamp)
    );

}


/**
 * Экспорт событий.
 */
export function exportAuditEvents(
    events: AuditEvent[],
    format: 'json' | 'csv' | 'txt'
): void {

    let content = '';
    let mimeType = 'text/plain';

    if (format === 'json') {

        content = JSON.stringify(
            events,
            null,
            2
        );

        mimeType = 'application/json';

    }

    if (format === 'csv') {

        const header = [
            'Time',
            'User',
            'Action',
            'Resource',
            'Object',
            'Result',
            'IP'
        ];

        const rows = events.map(event => [

            event.timestamp,
            event.user,
            event.action,
            event.resource,
            event.objectName,
            event.result,
            event.ipAddress

        ]);

        content = [
            header,
            ...rows
        ]
            .map(row => row.join(','))
            .join('\n');

        mimeType = 'text/csv';

    }

    if (format === 'txt') {

        content = events
            .map(event =>
                `${event.timestamp} | ${event.user} | ${event.message} | ${event.objectName} | ${event.result}`
            )
            .join('\n');

    }

    const blob = new Blob(
        [content],
        {
            type: mimeType
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download =
        `ksc-audit-${Date.now()}.${format}`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}