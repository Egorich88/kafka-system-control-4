/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

/**
 * =============================================================================
 * useAudit.ts
 * =============================================================================
 *
 * Главный hook страницы Audit.
 *
 * Сейчас используется mock.
 *
 * В следующем этапе именно этот файл станет точкой подключения API.
 *
 * То есть компоненты AuditPage и UI менять практически не придётся.
 *
 * Будет заменено:
 *
 * MOCK_AUDIT_EVENTS
 *
 * на:
 *
 * GET /api/audit
 * =============================================================================
 */

import {
    useMemo,
    useState
} from 'react';

import type {
    AuditEvent,
    AuditFilters
} from '../types/audit.types';

import {
    MOCK_AUDIT_EVENTS
} from '../mock/audit';

import {
    filterAuditEvents,
    calculateAuditStats
} from '../utils/audit.utils';


const DEFAULT_FILTERS: AuditFilters = {

    search: '',

    user: '',

    action: '',

    resource: '',

    result: '',

    dateFrom: '',

    dateTo: ''

};


export function useAudit() {

    const [
        events,
        setEvents
    ] = useState<AuditEvent[]>(
        MOCK_AUDIT_EVENTS
    );

    const [
        filters,
        setFilters
    ] = useState<AuditFilters>(
        DEFAULT_FILTERS
    );

    const [
        selectedEvent,
        setSelectedEvent
    ] = useState<AuditEvent | null>(
        MOCK_AUDIT_EVENTS[0] ?? null
    );

    const filteredEvents = useMemo(
        () =>
            filterAuditEvents(
                events,
                filters
            ),
        [
            events,
            filters
        ]
    );

    const stats = useMemo(
        () =>
            calculateAuditStats(
                filteredEvents
            ),
        [filteredEvents]
    );


    const updateFilter = (
        key: keyof AuditFilters,
        value: string
    ) => {

        setFilters(
            current => ({
                ...current,
                [key]: value
            })
        );

    };


    const resetFilters = () => {

        setFilters(
            DEFAULT_FILTERS
        );

    };


    const refresh = () => {

        /*
         * На mock-этапе просто создаём новый массив.
         *
         * Позже здесь будет запрос:
         *
         * await api.get('/api/audit')
         */
        setEvents(
            [...MOCK_AUDIT_EVENTS]
        );

    };


    return {

        events,

        filteredEvents,

        filters,

        stats,

        selectedEvent,

        setSelectedEvent,

        updateFilter,

        resetFilters,

        refresh

    };

}