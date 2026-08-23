/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import {
    FiSearch,
    FiRefreshCw,
    FiDownload,
    FiX
} from 'react-icons/fi';

import type {
    AuditFilters
} from '../types/audit.types';


interface Props {

    filters: AuditFilters;

    onFilterChange: (
        key: keyof AuditFilters,
        value: string
    ) => void;

    onReset: () => void;

    onRefresh: () => void;

    onExport: (
        format: 'json' | 'csv' | 'txt'
    ) => void;

    totalEvents: number;

}


export default function AuditToolbar({
    filters,
    onFilterChange,
    onReset,
    onRefresh,
    onExport,
    totalEvents
}: Props) {

    return (

        <section className="audit-toolbar">

            <div className="audit-toolbar-search">

                <FiSearch />

                <input
                    type="text"
                    placeholder="Поиск событий..."
                    value={filters.search}
                    onChange={event =>
                        onFilterChange(
                            'search',
                            event.target.value
                        )
                    }
                />

            </div>


            <select
                value={filters.user}
                onChange={event =>
                    onFilterChange(
                        'user',
                        event.target.value
                    )
                }
            >

                <option value="">
                    Пользователь
                </option>

                <option value="egor">
                    egor
                </option>

                <option value="admin">
                    admin
                </option>

                <option value="ivanov">
                    ivanov
                </option>

                <option value="petrov">
                    petrov
                </option>

                <option value="service">
                    service
                </option>

                <option value="unknown">
                    unknown
                </option>

            </select>


            <select
                value={filters.action}
                onChange={event =>
                    onFilterChange(
                        'action',
                        event.target.value
                    )
                }
            >

                <option value="">
                    Действие
                </option>

                <option value="create">
                    Создание
                </option>

                <option value="update">
                    Обновление
                </option>

                <option value="delete">
                    Удаление
                </option>

                <option value="reset">
                    Сброс
                </option>

                <option value="read">
                    Чтение
                </option>

            </select>


            <select
                value={filters.resource}
                onChange={event =>
                    onFilterChange(
                        'resource',
                        event.target.value
                    )
                }
            >

                <option value="">
                    Ресурс
                </option>

                <option value="topic">
                    Topic
                </option>

                <option value="acl">
                    ACL
                </option>

                <option value="consumer-group">
                    Consumer Group
                </option>

                <option value="broker">
                    Broker
                </option>

                <option value="cluster">
                    Cluster
                </option>

            </select>


            <select
                value={filters.result}
                onChange={event =>
                    onFilterChange(
                        'result',
                        event.target.value
                    )
                }
            >

                <option value="">
                    Результат
                </option>

                <option value="success">
                    Успешно
                </option>

                <option value="warning">
                    Предупреждение
                </option>

                <option value="error">
                    Ошибка
                </option>

            </select>


            <input
                type="datetime-local"
                value={filters.dateFrom}
                onChange={event =>
                    onFilterChange(
                        'dateFrom',
                        event.target.value
                    )
                }
            />


            <input
                type="datetime-local"
                value={filters.dateTo}
                onChange={event =>
                    onFilterChange(
                        'dateTo',
                        event.target.value
                    )
                }
            />


            <button
                type="button"
                className="audit-toolbar-button"
                onClick={onRefresh}
                title="Обновить"
            >

                <FiRefreshCw />

            </button>


            <div className="audit-export-wrapper">

                <button
                    type="button"
                    className="audit-toolbar-button"
                    onClick={() =>
                        onExport('json')
                    }
                    title="Экспорт JSON"
                >

                    <FiDownload />

                </button>

            </div>


            <button
                type="button"
                className="audit-reset-button"
                onClick={onReset}
                title="Сбросить фильтры"
            >

                <FiX />

                Сбросить

            </button>


            <span className="audit-total-counter">

                {totalEvents} событий

            </span>

        </section>

    );

}