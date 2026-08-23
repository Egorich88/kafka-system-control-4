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
    FiRefreshCw,
    FiClock,
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

import AuditRecentEvents
    from './components/AuditRecentEvents';

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

        resetFilters,

        refresh

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


    const handleRefresh = () => {

        refresh();

        toast.success(
            'Аудит обновлён'
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
                    Заголовок
                   ========================================================= */}

                <header className="audit-page-header">

                    <div>

                        <h1>
                            Аудит
                        </h1>

                        <p>
                            Обзор активности и событий безопасности в кластере
                        </p>

                    </div>


                    <div className="audit-header-actions">

                        <label className="audit-auto-refresh">

                            <span>
                                Автообновление
                            </span>

                            <input
                                type="checkbox"
                                defaultChecked
                            />

                        </label>


                        <button
                            type="button"
                            className="audit-period-button"
                        >

                            <FiClock />

                            Последние 24 часа

                        </button>


                        <button
                            type="button"
                            className="audit-header-button"
                            onClick={handleRefresh}
                            title="Обновить"
                        >

                            <FiRefreshCw />

                        </button>


                        <button
                            type="button"
                            className="audit-header-button"
                            onClick={() =>
                                handleExport('json')
                            }
                            title="Экспорт"
                        >

                            <FiDownload />

                        </button>

                    </div>

                </header>


                {/* =========================================================
                    KPI
                   ========================================================= */}

                <AuditKpi
                    stats={stats}
                />


                {/* =========================================================
                    Последние события + основной график
                   ========================================================= */}

                <div className="audit-top-grid">

                    <AuditRecentEvents

                        events={
                            filteredEvents
                        }

                        onSelect={
                            handleSelectEvent
                        }

                    />

                    <div className="audit-main-chart-wrapper">

                        <AuditOverviewCharts />

                    </div>

                </div>


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

                    onRefresh={
                        handleRefresh
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