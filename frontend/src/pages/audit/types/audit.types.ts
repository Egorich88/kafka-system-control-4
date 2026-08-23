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
 * audit.types.ts
 * =============================================================================
 *
 * Типы данных страницы «Аудит».
 *
 * На первом frontend-этапе эти типы используются mock-данными.
 *
 * В дальнейшем структура будет использоваться непосредственно для
 * данных, которые будут приходить из backend API.
 *
 * Основная модель:
 *
 * AuditEvent
 *
 * Описывает одно действие пользователя или системное событие.
 * =============================================================================
 */

export type AuditResult =
    | 'success'
    | 'warning'
    | 'error';

export type AuditAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'read'
    | 'reset'
    | 'execute';

export type AuditResource =
    | 'topic'
    | 'acl'
    | 'consumer-group'
    | 'broker'
    | 'cluster'
    | 'configuration';

export interface AuditChange {

    /**
     * Название изменённого параметра.
     */
    field: string;

    /**
     * Значение до изменения.
     */
    before: string;

    /**
     * Значение после изменения.
     */
    after: string;

}

export interface AuditEvent {

    /**
     * Уникальный идентификатор события.
     */
    id: string;

    /**
     * Время возникновения события.
     */
    timestamp: string;

    /**
     * Имя пользователя.
     */
    user: string;

    /**
     * Человекочитаемое действие.
     */
    action: AuditAction;

    /**
     * Kafka-ресурс.
     */
    resource: AuditResource;

    /**
     * Человекочитаемое описание действия.
     */
    message: string;

    /**
     * Имя объекта Kafka.
     *
     * Например:
     *
     * orders.v2
     * payments
     * billing-service
     */
    objectName: string;

    /**
     * Результат выполнения действия.
     */
    result: AuditResult;

    /**
     * IP-адрес источника.
     */
    ipAddress: string;

    /**
     * Имя Kafka-кластера.
     */
    cluster: string;

    /**
     * HTTP/API endpoint, который вызвал действие.
     */
    request: string;

    /**
     * Источник действия.
     *
     * Например:
     *
     * KSC UI
     * API
     * System
     */
    source: string;

    /**
     * User Agent.
     */
    userAgent?: string;

    /**
     * Correlation ID.
     */
    correlationId?: string;

    /**
     * Client Address.
     */
    clientAddress?: string;

    /**
     * Продолжительность операции.
     */
    durationMs?: number;

    /**
     * Список изменений.
     */
    changes?: AuditChange[];

}

export interface AuditFilters {

    search: string;

    user: string;

    action: string;

    resource: string;

    result: string;

    dateFrom: string;

    dateTo: string;

}

export interface AuditStats {

    totalEvents: number;

    changes: number;

    warnings: number;

    errors: number;

    activeUsers: number;

}