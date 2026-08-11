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
 * ConsumerGroupsPage.tsx
 * =============================================================================
 *
 * Главная страница управления группами потребителей Kafka.
 *
 * На данном этапе реализуется каркас интерфейса.
 *
 * Страница состоит из:
 *
 * - панели инструментов;
 * - таблицы Consumer Groups;
 * - панели информации;
 * - графика Consumer Lag.
 *
 * =============================================================================
 */
import { useEffect, useMemo, useState } from 'react';
import type { ConsumerGroup } from './types/consumer-groups.types';
import { MOCK_CONSUMER_GROUPS } from './mock/consumerGroups';

import './styles/consumer-groups.css';

import ConsumerGroupsToolbar from './components/ConsumerGroupsToolbar';
import ConsumerGroupsTable from './components/ConsumerGroupsTable';
import ConsumerGroupDetails from './components/ConsumerGroupDetails';
import ConsumerLagChart from './components/ConsumerLagChart';
import ConsumerGroupsKpi from './components/ConsumerGroupsKpi';
import ConsumerDonutCharts from './components/ConsumerDonutCharts';

export default function ConsumerGroupsPage() {

    /*
     * ============================================================================
     * Поисковая строка.
     *
     * Хранит текст поиска Consumer Group.
     *
     * Позже будет передаваться в Toolbar.
     * ============================================================================
     */

    const [search, setSearch] = useState('');

    /*
     * ============================================================================
     * Фильтр состояния группы.
     *
     * Возможные значения:
     *
     * Все
     * Stable
     * Rebalancing
     * Empty
     * Dead
     *
     * ============================================================================
     */

    const [stateFilter, setStateFilter] = useState('all');
    /*
     * =============================================================================
     * Mock-данные Consumer Groups.
     *
     * На frontend-этапе используем единый источник mock-данных.
     *
     * Это важно, чтобы:
     *
     * • таблица;
     * • Details;
     * • Lag Chart;
     * • Donut Charts
     *
     * работали с одним и тем же набором групп.
     *
     * После подключения backend этот источник будет заменён
     * на данные из useConsumerGroups().
     * =============================================================================
     */
    const groups: ConsumerGroup[] = MOCK_CONSUMER_GROUPS;
    /*
     * =============================================================================
     * Выбранная Consumer Group.
     *
     * На первом рендере группа ещё не выбрана.
     *
     * После формирования filteredGroups ниже useEffect автоматически
     * выберет первую доступную группу.
     *
     * Это важно, потому что:
     *
     * • Details сразу получит выбранную группу;
     * • Consumer Lag сразу сможет построить график;
     * • пользователю не требуется вручную нажимать первую строку таблицы.
     *
     * При подключении backend данный механизм сохраняется —
     * изменится только источник массива groups.
     * =============================================================================
     */
    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroup | null>(null);
    /*
     * ============================================================================
     * Отфильтрованный список Consumer Groups.
     *
     * Пока фильтрация выполняется полностью на frontend.
     *
     * После реализации backend логика останется,
     * но источник данных изменится.
     * ============================================================================
     */

    const filteredGroups = useMemo(() => {

        return groups.filter(group => {

            const matchesSearch =
                group.name
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesState =
                stateFilter === 'all'
                    || group.state === stateFilter;

            return matchesSearch && matchesState;

        });

    }, [groups, search, stateFilter]);

/*
 * =============================================================================
 * Автоматический выбор первой группы.
 *
 * Если пользователь впервые открыл страницу и группа ещё не выбрана,
 * автоматически выбираем первую группу из текущего отображаемого списка.
 *
 * Это позволяет сразу показать:
 *
 * • информацию о группе;
 * • Consumer Lag;
 *
 * без дополнительного клика по таблице.
 *
 * Если выбранная группа исчезла из текущего результата фильтрации,
 * выбираем первую доступную группу.
 * =============================================================================
 */
useEffect(() => {

    if (filteredGroups.length === 0) {

        setSelectedGroup(null);

        return;

    }

    const selectedGroupStillExists =
        selectedGroup &&
        filteredGroups.some(
            group => group.name === selectedGroup.name
        );

    if (!selectedGroupStillExists) {

        setSelectedGroup(filteredGroups[0]);

    }

}, [filteredGroups, selectedGroup]);

    /**
     * ============================================================================
     * Временные данные.
     *
     * Используются исключительно до подключения backend.
     *
     * После реализации API будут заменены
     * данными из useConsumerGroups().
     *
     * ============================================================================
     */

    return (

        <div className="consumer-groups-page">
        {/*
         * ============================================================================
         * Заголовок страницы.
         * ============================================================================
         */}

        <h1 className="page-title">

            Группы потребителей

        </h1>

            {/*
             * ========================================================================
             * Верхняя KPI-панель.
             *
             * Пока отображает mock-данные.
             *
             * После подключения backend будет получать статистику
             * напрямую из useConsumerGroups().
             * ========================================================================
             */}

            <ConsumerGroupsKpi />

            <ConsumerGroupsToolbar

                search={search}

                onSearchChange={setSearch}

                stateFilter={stateFilter}

                onStateFilterChange={setStateFilter}

                totalGroups={filteredGroups.length}

            />

            <ConsumerGroupsTable

                groups={filteredGroups}

                selectedGroup={selectedGroup}

                onSelectGroup={setSelectedGroup}

            />

            <div className="consumer-bottom-layout">

                <ConsumerGroupDetails

                    group={selectedGroup}

                />

                <ConsumerLagChart

                    group={selectedGroup}

                />

            </div>
            {/*
             * =============================================================================
             * Нижняя аналитическая зона.
             *
             * Три кольцевых графика строятся на основе того же массива groups,
             * который используется таблицей.
             *
             * 1. Топики группы
             * 2. Распределение Lag
             * 3. Состояние групп
             *
             * Здесь намеренно не создаём отдельные mock-данные.
             * =============================================================================
             */}
            <ConsumerDonutCharts
                groups={groups}
            />

        </div>

    );

}