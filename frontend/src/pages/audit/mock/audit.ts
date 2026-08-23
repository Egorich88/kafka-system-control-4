/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

/**
 * =============================================================================
 * audit.ts
 * =============================================================================
 *
 * Mock-данные страницы Audit.
 *
 * ВАЖНО:
 *
 * Это временный источник данных.
 *
 * На первом этапе мы намеренно НЕ подключаем Kafka.
 *
 * Цель:
 *
 * 1. закончить UX;
 * 2. проверить таблицу;
 * 3. проверить фильтры;
 * 4. проверить Details Panel;
 * 5. проверить графики;
 * 6. проверить pagination;
 * 7. проверить export.
 *
 * После завершения frontend-части mock будет заменён API.
 * =============================================================================
 */

import type {
    AuditEvent
} from '../types/audit.types';


export const MOCK_AUDIT_EVENTS: AuditEvent[] = [

    {
        id: 'evt_01KJ7P8G6W42856Y8',
        timestamp: '2026-08-18T12:41:32',
        user: 'egor',
        action: 'create',
        resource: 'topic',
        message: 'Создана тема',
        objectName: 'orders.v2',
        result: 'success',
        ipAddress: '10.10.12.42',
        cluster: 'production-kafka',
        request: 'POST /api/topics',
        source: 'KSC UI',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        correlationId: '7b8f3a80-9c2d-4b2e-9f2e-1d8c',
        clientAddress: '10.10.12.42:54821',
        durationMs: 125,
        changes: [
            {
                field: 'Partitions',
                before: '3',
                after: '6'
            },
            {
                field: 'Replication Factor',
                before: '3',
                after: '3'
            },
            {
                field: 'Config.cleanup.policy',
                before: 'delete',
                after: 'compact'
            },
            {
                field: 'Config.retention.ms',
                before: '-',
                after: '604800000'
            }
        ]
    },

    {
        id: 'evt_01KJ7P8ACL00125',
        timestamp: '2026-08-18T12:38:17',
        user: 'ivanov',
        action: 'update',
        resource: 'acl',
        message: 'Обновлены ACL',
        objectName: 'orders',
        result: 'success',
        ipAddress: '10.10.12.15',
        cluster: 'production-kafka',
        request: 'PUT /api/acls',
        source: 'KSC UI',
        durationMs: 84
    },

    {
        id: 'evt_01KJ7P8CG00291',
        timestamp: '2026-08-18T12:35:04',
        user: 'admin',
        action: 'delete',
        resource: 'consumer-group',
        message: 'Удалена группа потребителей',
        objectName: 'billing-service',
        result: 'success',
        ipAddress: '10.10.11.33',
        cluster: 'production-kafka',
        request: 'DELETE /api/consumer-groups/billing-service',
        source: 'KSC UI',
        durationMs: 163
    },

    {
        id: 'evt_01KJ7P8D00455',
        timestamp: '2026-08-18T12:31:51',
        user: 'petrov',
        action: 'reset',
        resource: 'consumer-group',
        message: 'Сброс смещений',
        objectName: 'payments',
        result: 'warning',
        ipAddress: '10.10.13.55',
        cluster: 'production-kafka',
        request: 'POST /api/consumer-groups/payments/reset',
        source: 'KSC UI',
        durationMs: 391
    },

    {
        id: 'evt_01KJ7P8E00518',
        timestamp: '2026-08-18T12:29:13',
        user: 'unknown',
        action: 'delete',
        resource: 'topic',
        message: 'Удалена тема',
        objectName: 'users',
        result: 'error',
        ipAddress: '10.10.10.10',
        cluster: 'production-kafka',
        request: 'DELETE /api/topics/users',
        source: 'API',
        durationMs: 42
    },

    {
        id: 'evt_01KJ7P8F00617',
        timestamp: '2026-08-18T12:25:47',
        user: 'egor',
        action: 'create',
        resource: 'acl',
        message: 'Создан ACL',
        objectName: 'orders-write',
        result: 'success',
        ipAddress: '10.10.12.42',
        cluster: 'production-kafka',
        request: 'POST /api/acls',
        source: 'KSC UI',
        durationMs: 76
    },

    {
        id: 'evt_01KJ7P8G00732',
        timestamp: '2026-08-18T12:21:18',
        user: 'admin',
        action: 'update',
        resource: 'topic',
        message: 'Изменены настройки',
        objectName: 'invoice-events',
        result: 'success',
        ipAddress: '10.10.11.33',
        cluster: 'production-kafka',
        request: 'PUT /api/topics/invoice-events/config',
        source: 'KSC UI',
        durationMs: 109
    },

    {
        id: 'evt_01KJ7P8H00841',
        timestamp: '2026-08-18T12:18:37',
        user: 'service',
        action: 'create',
        resource: 'topic',
        message: 'Автосоздание темы',
        objectName: '__consumer_offsets',
        result: 'success',
        ipAddress: '10.10.10.50',
        cluster: 'production-kafka',
        request: 'POST /api/topics',
        source: 'System',
        durationMs: 51
    },

    {
        id: 'evt_01KJ7P8I00957',
        timestamp: '2026-08-18T12:15:22',
        user: 'ivanov',
        action: 'delete',
        resource: 'acl',
        message: 'Удалён ACL',
        objectName: 'old-permission',
        result: 'success',
        ipAddress: '10.10.12.15',
        cluster: 'production-kafka',
        request: 'DELETE /api/acls/old-permission',
        source: 'KSC UI',
        durationMs: 67
    },

    {
        id: 'evt_01KJ7P8J01063',
        timestamp: '2026-08-18T12:12:03',
        user: 'petrov',
        action: 'update',
        resource: 'broker',
        message: 'Обновлены настройки',
        objectName: 'broker-2',
        result: 'success',
        ipAddress: '10.10.13.55',
        cluster: 'production-kafka',
        request: 'PUT /api/brokers/2/config',
        source: 'KSC UI',
        durationMs: 143
    }

];