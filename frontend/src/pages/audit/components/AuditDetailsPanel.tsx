/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import {
    FiX,
    FiCheckCircle,
    FiAlertTriangle,
    FiXCircle,
    FiCopy
} from 'react-icons/fi';

import type {
    AuditEvent
} from '../types/audit.types';

import {
    formatAuditDate
} from '../utils/audit.utils';


interface Props {

    event: AuditEvent | null;

    onClose: () => void;

}


export default function AuditDetailsPanel({
    event,
    onClose
}: Props) {

    if (!event) {
        return null;
    }


    const resultIcon =
        event.result === 'success'
            ? <FiCheckCircle />
            : event.result === 'warning'
                ? <FiAlertTriangle />
                : <FiXCircle />;


    const resultLabel =
        event.result === 'success'
            ? 'Успешно'
            : event.result === 'warning'
                ? 'Предупреждение'
                : 'Ошибка';


    const copyEventId = async () => {

        await navigator.clipboard.writeText(
            event.id
        );

    };


    return (

        <aside className="audit-details-panel">

            <div className="audit-details-header">

                <div>

                    <span>
                        ДЕТАЛИ СОБЫТИЯ
                    </span>

                    <h2>
                        {event.message}
                    </h2>

                </div>

                <button
                    type="button"
                    onClick={onClose}
                    title="Закрыть"
                >

                    <FiX />

                </button>

            </div>


            <div className="audit-details-result">

                <span>
                    {resultIcon}
                </span>

                <strong>
                    {event.message}
                </strong>

                <em
                    className={`audit-result ${event.result}`}
                >
                    {resultLabel}
                </em>

            </div>


            <section className="audit-details-section">

                <h3>
                    Основная информация
                </h3>


                <div className="audit-detail-grid">

                    <span>
                        Пользователь
                    </span>

                    <strong>
                        {event.user}
                    </strong>


                    <span>
                        Время
                    </span>

                    <strong>
                        {formatAuditDate(
                            event.timestamp
                        )}
                    </strong>


                    <span>
                        Действие
                    </span>

                    <strong>
                        {event.action.toUpperCase()}
                    </strong>


                    <span>
                        Ресурс
                    </span>

                    <strong>
                        {event.resource.toUpperCase()}
                    </strong>


                    <span>
                        Объект
                    </span>

                    <strong>
                        {event.objectName}
                    </strong>


                    <span>
                        Кластер
                    </span>

                    <strong>
                        {event.cluster}
                    </strong>


                    <span>
                        IP-адрес
                    </span>

                    <strong>
                        {event.ipAddress}
                    </strong>


                    <span>
                        Результат
                    </span>

                    <strong
                        className={`audit-detail-status ${event.result}`}
                    >
                        {resultLabel}
                    </strong>


                    <span>
                        Event ID
                    </span>

                    <strong className="audit-event-id">
                        {event.id}
                    </strong>

                </div>

            </section>


            {event.changes &&
                event.changes.length > 0 && (

                    <section className="audit-details-section">

                        <h3>
                            Изменения
                        </h3>

                        <div className="audit-changes">

                            <div className="audit-change-header">

                                <span>
                                    Параметр
                                </span>

                                <span>
                                    Before
                                </span>

                                <span>
                                    After
                                </span>

                            </div>


                            {event.changes.map(change => (

                                <div
                                    className="audit-change-row"
                                    key={change.field}
                                >

                                    <span>
                                        {change.field}
                                    </span>

                                    <code>
                                        {change.before}
                                    </code>

                                    <code className="after">
                                        {change.after}
                                    </code>

                                </div>

                            ))}

                        </div>

                    </section>

                )}


            <section className="audit-details-section">

                <h3>
                    Дополнительно
                </h3>

                <div className="audit-detail-grid">

                    <span>
                        Request
                    </span>

                    <strong>
                        {event.request}
                    </strong>


                    <span>
                        Источник
                    </span>

                    <strong>
                        {event.source}
                    </strong>


                    <span>
                        Duration
                    </span>

                    <strong>
                        {event.durationMs ?? 0} ms
                    </strong>


                    <span>
                        Correlation ID
                    </span>

                    <strong>
                        {event.correlationId ?? '—'}
                    </strong>

                </div>

            </section>


            <button
                type="button"
                className="audit-copy-button"
                onClick={copyEventId}
            >

                <FiCopy />

                Копировать Event ID

            </button>

        </aside>

    );

}