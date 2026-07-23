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
 * Основная таблица Consumer Groups.
 *
 * Пункт 7:
 *  • Grafana-стиль полоски lag (чем больше — тем краснее)
 *  • Без «дёргания» строк при hover
 *  • Столбец «Действия»: глаз, карандаш, обновить, корзина
 * =============================================================================
 */

import {
    FiEye,
    FiEyeOff,
    FiEdit2,
    FiRefreshCw,
    FiTrash2
} from 'react-icons/fi';
import '../styles/consumer-table.css';
import type { ConsumerGroup } from '../types/consumer-groups.types';
import ConsumerStateBadge from './ConsumerStateBadge';
import {
    formatLag,
    getLagBarWidth,
    getLagLevel
} from '../utils/lag.utils';

interface Props {
    groups: ConsumerGroup[];
    selectedGroup: ConsumerGroup | null;
    onSelectGroup: (group: ConsumerGroup) => void;
    onToggleHidden: (name: string) => void;
    onEditGroup: (group: ConsumerGroup) => void;
    onRefreshGroup: (group: ConsumerGroup) => void;
    onDeleteGroup: (group: ConsumerGroup) => void;
}

export default function ConsumerGroupsTable({
    groups,
    selectedGroup,
    onSelectGroup,
    onToggleHidden,
    onEditGroup,
    onRefreshGroup,
    onDeleteGroup
}: Props) {
    const maxLag = Math.max(...groups.map(g => g.lag), 1);

    if (groups.length === 0) {
        return (
            <div className="consumer-table-empty">
                Группы не найдены
            </div>
        );
    }

    return (
        <div className="consumer-table-wrapper">
            <table className="consumer-groups-table">
                <thead>
                    <tr>
                        <th>Группа</th>
                        <th>Состояние</th>
                        <th>Участники</th>
                        <th>Топики</th>
                        <th>Отставание (Lag)</th>
                        <th>Координатор</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map(group => {
                        const lagLevel = getLagLevel(group.lag, maxLag);
                        const barWidth = getLagBarWidth(group.lag, maxLag);

                        return (
                            <tr
                                key={group.name}
                                onClick={() => onSelectGroup(group)}
                                className={
                                    selectedGroup?.name === group.name
                                        ? 'consumer-group-selected'
                                        : ''
                                }
                            >
                                <td className="consumer-group-name">
                                    {group.name}
                                </td>
                                <td>
                                    <ConsumerStateBadge state={group.state} />
                                </td>
                                <td>{group.members}</td>
                                <td className="consumer-topics-cell">
                                    {group.topics?.slice(0, 2).join(', ')}
                                    {(group.topics?.length ?? 0) > 2 && (
                                        <span className="topics-more">
                                            +{(group.topics?.length ?? 0) - 2}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="lag-cell">
                                        <span className={`lag-value lag-${lagLevel}`}>
                                            {formatLag(group.lag)}
                                        </span>
                                        <div className="lag-bar-track">
                                            <div
                                                className={`lag-bar-fill lag-${lagLevel}`}
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="consumer-coordinator">
                                    {group.coordinator}
                                </td>
                                <td
                                    className="consumer-actions-cell"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        className="action-icon-btn"
                                        title={
                                            group.hidden
                                                ? 'Показать группу'
                                                : 'Скрыть группу из списка'
                                        }
                                        onClick={() => onToggleHidden(group.name)}
                                    >
                                        {group.hidden
                                            ? <FiEyeOff />
                                            : <FiEye />
                                        }
                                    </button>
                                    <button
                                        type="button"
                                        className="action-icon-btn"
                                        title="Редактировать заметки группы"
                                        onClick={() => onEditGroup(group)}
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        type="button"
                                        className="action-icon-btn"
                                        title="Обновить данные группы"
                                        onClick={() => onRefreshGroup(group)}
                                    >
                                        <FiRefreshCw />
                                    </button>
                                    <button
                                        type="button"
                                        className="action-icon-btn danger"
                                        title="Удалить группу"
                                        onClick={() => onDeleteGroup(group)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
