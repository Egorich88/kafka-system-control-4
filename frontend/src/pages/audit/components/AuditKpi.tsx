/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

/**
 * =============================================================================
 * AuditKpi.tsx
 * =============================================================================
 *
 * KPI-карточки страницы Audit.
 * =============================================================================
 */

import {
    FiActivity,
    FiEdit3,
    FiAlertTriangle,
    FiXCircle,
    FiUsers
} from 'react-icons/fi';

import type {
    AuditStats
} from '../types/audit.types';


interface Props {

    stats: AuditStats;

}


export default function AuditKpi({
    stats
}: Props) {

    const cards = [

        {
            label: 'Всего событий',
            value: stats.totalEvents.toLocaleString('ru-RU'),
            icon: FiActivity,
            className: 'blue'
        },

        {
            label: 'Изменения',
            value: stats.changes.toLocaleString('ru-RU'),
            icon: FiEdit3,
            className: 'green'
        },

        {
            label: 'Предупреждения',
            value: stats.warnings.toLocaleString('ru-RU'),
            icon: FiAlertTriangle,
            className: 'orange'
        },

        {
            label: 'Ошибки',
            value: stats.errors.toLocaleString('ru-RU'),
            icon: FiXCircle,
            className: 'red'
        },

        {
            label: 'Активные пользователи',
            value: stats.activeUsers.toLocaleString('ru-RU'),
            icon: FiUsers,
            className: 'purple'
        }

    ];


    return (

        <section className="audit-kpi-grid">

            {cards.map(card => {

                const Icon = card.icon;

                return (

                    <div
                        className={`audit-kpi-card ${card.className}`}
                        key={card.label}
                    >

                        <div className="audit-kpi-header">

                            <span>
                                {card.label}
                            </span>

                            <Icon />

                        </div>

                        <strong>
                            {card.value}
                        </strong>

                        <small>
                            ↑ активность за период
                        </small>

                    </div>

                );

            })}

        </section>

    );

}