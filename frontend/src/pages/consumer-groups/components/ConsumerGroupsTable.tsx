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
import ConsumerStateBadge from './ConsumerStateBadge';
/**
 * ============================================================================
 * Свойства таблицы Consumer Groups.
 *
 * groups
 *     Список групп потребителей.
 *
 * selectedGroup
 *     Текущая выбранная группа.
 *
 * onSelectGroup
 *     Вызывается при выборе строки таблицы.
 *
 * ============================================================================
 */
interface Props {

    groups: ConsumerGroup[];

    selectedGroup: ConsumerGroup | null;

    onSelectGroup: (group: ConsumerGroup) => void;

}

/**
 * ---------------------------------------------------------------------------
 * Временные данные.
 *
 * Используются исключительно для построения интерфейса.
 *
 * После подключения backend будут удалены.
 * ---------------------------------------------------------------------------
 */

export default function ConsumerGroupsTable({

    groups,

    selectedGroup,

    onSelectGroup

}: Props) {

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

                {groups.map(group => (

                    <tr

                        key={group.name}

                        onClick={() => onSelectGroup(group)}

                        className={

                            selectedGroup?.name === group.name

                                ? 'consumer-group-selected'

                                : ''

                        }

                    >

                        <td>{group.name}</td>

                        <td>

                            <ConsumerStateBadge

                                state={group.state}

                            />

                        </td>

                        <td>

                            <span

                                className={

                                    group.lag > 100

                                        ? 'lag-high'

                                        : group.lag > 0

                                            ? 'lag-medium'

                                            : 'lag-low'

                                }

                            >

                                {group.lag}

                            </span>

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