/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

/**
 * =============================================================================
 * AuditPage.tsx
 * =============================================================================
 *
 * Главная страница «Аудит».
 *
 * Архитектура:
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │ Header                                                                │
 * ├───────────────────────────────────────────────────────────────────────┤
 * │ KPI                                                                   │
 * ├──────────────────────────────┬────────────────────────────────────────┤
 * │ Последние события             │ Активность событий                    │
 * ├──────────────────────────────┴────────────────────────────────────────┤
 * │ Аналитические графики                                                 │
 * ├───────────────────────────────────────────────────────────────────────┤
 * │ Toolbar                                                               │
 * ├───────────────────────────────────────────────────────────────────────┤
 * │ Журнал аудита                                                         │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * При выборе строки таблицы:
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │ Основная страница                                      Details Panel  │
 * └───────────────────────────────────────────────────────────────────────┘
 *
 * HTTP-запросов здесь пока нет.
 *
 * Все данные проходят через useAudit().
 *
 * В дальнейшем backend подключается именно через этот hook.
 * =============================================================================
 */

import {
    useState
} from 'react';

import {
    FiDownload
} from 'react-icons/fi';

import {
    toast
} from 'react-hot-toast';

import type {
    AuditEvent
} from './types/audit.types';

import {
    useAudit
} from './hooks/useAudit';

import {
    exportAuditEvents
} from './utils/audit.utils';

import AuditKpi
    from './components/AuditKpi';


import AuditOverviewCharts
    from './components/AuditOverviewCharts';

import AuditToolbar
    from './components/AuditToolbar';

import AuditTable
    from './components/AuditTable';

import AuditDetailsPanel
    from './components/AuditDetailsPanel';

import './styles/audit.css';


export default function AuditPage() {

    const {

        filteredEvents,

        filters,

        stats,

        selectedEvent,

        setSelectedEvent,

        updateFilter,

        resetFilters

    } = useAudit();


    const [
        detailsOpen,
        setDetailsOpen
    ] = useState(
        true
    );


    const handleSelectEvent = (
        event: AuditEvent
    ) => {

        setSelectedEvent(
            event
        );

        setDetailsOpen(
            true
        );

    };


    const handleCloseDetails = () => {

        setDetailsOpen(
            false
        );

        setSelectedEvent(
            null
        );

    };



    const handleExport = (
        format: 'json' | 'csv' | 'txt'
    ) => {

        exportAuditEvents(
            filteredEvents,
            format
        );

        toast.success(
            `Экспорт ${format.toUpperCase()} выполнен`
        );

    };


    return (

        <div
            className={`audit-page ${
                detailsOpen
                    ? 'details-open'
                    : ''
            }`}
        >

            <main className="audit-content">

                {/* =========================================================
                    KPI
                   ========================================================= */}

                <AuditKpi
                    stats={stats}
                />


                {/* =========================================================
                    Аналитика

                    ВАЖНО: отдельного блока «Последние события» здесь нет.
                    Источником событий является единственный журнал ниже.
                   ========================================================= */}

                <AuditOverviewCharts />


                {/* =========================================================
                    Фильтры
                   ========================================================= */}

                <AuditToolbar

                    filters={
                        filters
                    }

                    onFilterChange={
                        updateFilter
                    }

                    onReset={
                        resetFilters
                    }

                    onExport={
                        handleExport
                    }

                    totalEvents={
                        filteredEvents.length
                    }

                />


                {/* =========================================================
                    Журнал аудита
                   ========================================================= */}

                <AuditTable

                    events={
                        filteredEvents
                    }

                    selectedEvent={
                        selectedEvent
                    }

                    onSelect={
                        handleSelectEvent
                    }

                />

            </main>


            {/* =============================================================
                Details Panel
               ============================================================= */}

            {detailsOpen &&
                selectedEvent && (

                    <AuditDetailsPanel

                        event={
                            selectedEvent
                        }

                        onClose={
                            handleCloseDetails
                        }

                    />

                )}

        </div>

    );

}