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
 * ConsumerGroupsTable.tsx
 * =============================================================================
 *
 * Основная таблица страницы Consumer Groups.
 *
 * На текущем этапе используются временные mock-данные.
 *
 * После реализации backend:
 *
 * useConsumerGroups()
 *
 * данный массив будет полностью удалён.
 *
 * =============================================================================
 */

import '../styles/consumer-table.css';

import type { ConsumerGroup } from '../types/consumer-groups.types';

/**
 * ---------------------------------------------------------------------------
 * Временные данные.
 *
 * Используются исключительно для построения интерфейса.
 *
 * После подключения backend будут удалены.
 * ---------------------------------------------------------------------------
 */
const mockGroups: ConsumerGroup[] = [
    {
        name: 'payment-service',
        state: 'Stable',
        lag: 0,
        members: 5,
        coordinator: 'broker-1'
    },
    {
        name: 'analytics',
        state: 'Rebalancing',
        lag: 184,
        members: 3,
        coordinator: 'broker-2'
    },
    {
        name: 'notifications',
        state: 'Empty',
        lag: 0,
        members: 0,
        coordinator: 'broker-1'
    }
];

export default function ConsumerGroupsTable() {

    return (

        <table className="consumer-groups-table">

            <thead>

                <tr>

                    <th>Группа</th>
                    <th>Состояние</th>
                    <th>Отставание</th>
                    <th>Участники</th>
                    <th>Координатор</th>

                </tr>

            </thead>

            <tbody>

                {mockGroups.map(group => (

                    <tr key={group.name}>

                        <td>{group.name}</td>

                        <td>{group.state}</td>

                        <td className="consumer-lag">
                            {group.lag}
                        </td>

                        <td>{group.members}</td>

                        <td className="consumer-coordinator">
                            {group.coordinator}
                        </td>

                    </tr>

                ))}

            </tbody>

        </table>

    );

}