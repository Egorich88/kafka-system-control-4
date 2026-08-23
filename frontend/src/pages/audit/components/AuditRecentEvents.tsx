/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import {
    FiCheckCircle,
    FiAlertTriangle,
    FiXCircle,
    FiActivity,
    FiArrowRight
} from 'react-icons/fi';

import type {
    AuditEvent
} from '../types/audit.types';

import {
    formatAuditTime
} from '../utils/audit.utils';


interface Props {

    events: AuditEvent[];

    onSelect: (
        event: AuditEvent
    ) => void;

}


export default function AuditRecentEvents({
    events,
    onSelect
}: Props) {

    const recentEvents =
        events.slice(0, 5);


    const getResultIcon = (
        result: AuditEvent['result']
    ) => {

        if (result === 'success') {
            return <FiCheckCircle />;
        }

        if (result === 'warning') {
            return <FiAlertTriangle />;
        }

        return <FiXCircle />;

    };


    return (

        <section className="audit-panel audit-recent-panel">

            <div className="audit-panel-header">

                <div>

                    <h2>
                        Последние события
                    </h2>

                    <span>
                        Последние действия пользователей
                    </span>

                </div>

                <FiActivity />

            </div>


            <div className="audit-recent-list">

                {recentEvents.map(event => (

                    <button
                        type="button"
                        className="audit-recent-row"
                        key={event.id}
                        onClick={() =>
                            onSelect(event)
                        }
                    >

                        <span className="audit-recent-time">
                            {formatAuditTime(event.timestamp)}
                        </span>

                        <span className="audit-recent-status">
                            {getResultIcon(event.result)}
                        </span>

                        <span className="audit-recent-user">
                            {event.user}
                        </span>

                        <span className="audit-recent-message">
                            {event.message}
                        </span>

                        <span className="audit-recent-object">
                            {event.objectName}
                        </span>

                        <span
                            className={`audit-result ${event.result}`}
                        >
                            {event.result === 'success'
                                ? 'Успешно'
                                : event.result === 'warning'
                                    ? 'Предупреждение'
                                    : 'Ошибка'
                            }
                        </span>

                        <FiArrowRight className="audit-recent-arrow" />

                    </button>

                ))}

            </div>


            <button
                type="button"
                className="audit-view-all"
            >
                Посмотреть все события
                <FiArrowRight />
            </button>

        </section>

    );

}