/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import {
    FiChevronRight,
    FiCheckCircle,
    FiAlertTriangle,
    FiXCircle
} from 'react-icons/fi';

import type {
    AuditEvent
} from '../types/audit.types';

import {
    formatAuditTime
} from '../utils/audit.utils';


interface Props {

    events: AuditEvent[];

    selectedEvent: AuditEvent | null;

    onSelect: (
        event: AuditEvent
    ) => void;

}


export default function AuditTable({
    events,
    selectedEvent,
    onSelect
}: Props) {

    const getActionLabel = (
        action: AuditEvent['action']
    ) => {

        const labels = {

            create: 'Создание',
            update: 'Обновление',
            delete: 'Удаление',
            read: 'Чтение',
            reset: 'Сброс смещений',
            execute: 'Выполнение'

        };

        return labels[action];

    };


    const getResourceLabel = (
        resource: AuditEvent['resource']
    ) => {

        const labels = {

            topic: 'Topic',
            acl: 'ACL',
            'consumer-group': 'Consumer Group',
            broker: 'Broker',
            cluster: 'Cluster',
            configuration: 'Configuration'

        };

        return labels[resource];

    };


    return (

        <section className="audit-table-panel">

            <div className="audit-table-title-row">

                <div>

                    <h2>
                        Журнал аудита
                    </h2>

                    <span>
                        История действий пользователей и системы
                    </span>

                </div>

                <span className="audit-table-live">
                    ● LIVE
                </span>

            </div>


            <div className="audit-table-wrapper">

                <table className="audit-table">

                    <thead>

                        <tr>

                            <th>
                                Время
                            </th>

                            <th>
                                Пользователь
                            </th>

                            <th>
                                Действие
                            </th>

                            <th>
                                Ресурс
                            </th>

                            <th>
                                Объект
                            </th>

                            <th>
                                Результат
                            </th>

                            <th>
                                IP-адрес
                            </th>

                            <th />

                        </tr>

                    </thead>

                    <tbody>

                        {events.map(event => {

                            const selected =
                                selectedEvent?.id === event.id;

                            return (

                                <tr
                                    key={event.id}
                                    className={
                                        selected
                                            ? 'selected'
                                            : ''
                                    }
                                    onClick={() =>
                                        onSelect(event)
                                    }
                                >

                                    <td>
                                        {formatAuditTime(
                                            event.timestamp
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            {event.user}
                                        </strong>
                                    </td>

                                    <td>
                                        {getActionLabel(
                                            event.action
                                        )}
                                    </td>

                                    <td>
                                        <span className="audit-resource">
                                            {getResourceLabel(
                                                event.resource
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        {event.objectName}
                                    </td>

                                    <td>

                                        <span
                                            className={`audit-result ${event.result}`}
                                        >

                                            {event.result === 'success'
                                                ? <FiCheckCircle />
                                                : event.result === 'warning'
                                                    ? <FiAlertTriangle />
                                                    : <FiXCircle />
                                            }

                                            {event.result === 'success'
                                                ? 'Успешно'
                                                : event.result === 'warning'
                                                    ? 'Предупреждение'
                                                    : 'Ошибка'
                                            }

                                        </span>

                                    </td>

                                    <td>
                                        {event.ipAddress}
                                    </td>

                                    <td>
                                        <FiChevronRight />
                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>


                {events.length === 0 && (

                    <div className="audit-empty">

                        События по заданным фильтрам не найдены.

                    </div>

                )}

            </div>


            <div className="audit-pagination">

                <span>
                    Строк на странице:
                </span>

                <select defaultValue="25">

                    <option value="25">
                        25
                    </option>

                    <option value="50">
                        50
                    </option>

                    <option value="100">
                        100
                    </option>

                </select>


                <button>
                    ‹
                </button>

                <button className="active">
                    1
                </button>

                <button>
                    2
                </button>

                <button>
                    3
                </button>

                <span>
                    …
                </span>

                <button>
                    33
                </button>

                <button>
                    ›
                </button>

            </div>

        </section>

    );

}