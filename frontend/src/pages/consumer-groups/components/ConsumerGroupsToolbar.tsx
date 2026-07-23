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
 ConsumerGroupsToolbar.tsx

 Отвечает исключительно за верхнюю панель управления.

 Содержит:

 • поиск
 • фильтрацию
 • сортировку
 • обновление
 • экспорт
 • Offset Reset

 Никакой бизнес-логики здесь нет.

 Компонент только отображает элементы управления.
 *
 * =============================================================================
 */
import KSCSelect from '../../../components/ui/select/KSCSelect';
import '../styles/consumer-toolbar.css';
import { ChangeEvent } from 'react';
import { FiSearch } from 'react-icons/fi';
import { FiRefreshCw } from 'react-icons/fi';

/**
 * ============================================================================
 * Свойства панели управления Consumer Groups.
 *
 * search
 *      Текущее значение строки поиска.
 *
 * onSearchChange
 *      Изменение строки поиска.
 *
 * stateFilter
 *      Текущий выбранный фильтр состояния.
 *
 * onStateFilterChange
 *      Изменение фильтра.
 *
 * totalGroups
 *      Количество отображаемых групп.
 *
 * ============================================================================
 */

interface Props {

    search: string;

    onSearchChange: (value: string) => void;

    stateFilter: string;

    onStateFilterChange: (value: string) => void;

    totalGroups: number;

}

export default function ConsumerGroupsToolbar({

    search,

    onSearchChange,

    stateFilter,

    onStateFilterChange,

    totalGroups

}: Props) {

    return (

        <div className="consumer-toolbar">

            <div className="consumer-toolbar-left">

                <div className="consumer-toolbar-search-wrapper">

                    <FiSearch className="consumer-toolbar-search-icon" />

                    <input

                        className="consumer-toolbar-search"

                        placeholder="Поиск группы..."

                        value={search}

                        onChange={(event: ChangeEvent<HTMLInputElement>) =>

                            onSearchChange(event.target.value)

                        }

                    />

                </div>

                <KSCSelect

                    label="Статус:"

                    value={stateFilter}

                    onChange={onStateFilterChange}

                    options={[

                        {

                            value: 'all',

                            label: 'Все'

                        },

                        {

                            value: 'Stable',

                            label: 'Stable'

                        },

                        {

                            value: 'Rebalancing',

                            label: 'Rebalancing'

                        },

                        {

                            value: 'Empty',

                            label: 'Empty'

                        },

                        {

                            value: 'Dead',

                            label: 'Dead'

                        }

                    ]}

                />

            </div>

            <div className="consumer-toolbar-right">

                <button
                    className="consumer-toolbar-button secondary"
                >

                    <FiRefreshCw />

                    <span>Обновить</span>

                </button>

                <div className="consumer-toolbar-counter">

                    Всего групп: {totalGroups}

                </div>

            </div>

        </div>

    );

}