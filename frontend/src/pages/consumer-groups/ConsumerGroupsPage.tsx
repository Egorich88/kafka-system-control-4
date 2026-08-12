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
 * Текущий frontend-этап использует mock-данные.
 *
 * Структура страницы:
 *
 * • заголовок страницы;
 * • KPI Consumer Groups;
 * • Toolbar:
 *      - поиск;
 *      - фильтр состояния;
 *      - сортировка;
 *      - обновление;
 *      - экспорт;
 *      - сброс оффсетов;
 * • таблица Consumer Groups;
 * • подробная информация выбранной группы;
 * • график Consumer Lag;
 * • три аналитических кольцевых графика;
 * • боковая панель Offset Reset.
 *
 * ВАЖНО:
 *
 * Компоненты страницы отвечают за композицию и состояние интерфейса.
 *
 * HTTP-запросы здесь не выполняются.
 *
 * После подключения backend источник groups будет заменён
 * на useConsumerGroups().
 *
 * =============================================================================
 */

import {
    useEffect,
    useMemo,
    useState
} from 'react';

import toast from 'react-hot-toast';

import type {
    ConsumerGroup
} from './types/consumer-groups.types';

import {
    MOCK_CONSUMER_GROUPS
} from './mock/consumerGroups';

import {
    exportGroups,
    sortGroups,
    type ExportFormat,
    type SortOption
} from './utils/consumer-groups.utils';

import './styles/consumer-groups.css';

import ConsumerGroupsKpi
    from './components/ConsumerGroupsKpi';

import ConsumerGroupsToolbar
    from './components/ConsumerGroupsToolbar';

import ConsumerGroupsTable
    from './components/ConsumerGroupsTable';

import ConsumerGroupDetails
    from './components/ConsumerGroupDetails';

import ConsumerLagChart
    from './components/ConsumerLagChart';

import ConsumerDonutCharts
    from './components/ConsumerDonutCharts';

import OffsetResetWizard
    from './components/OffsetResetWizard';


/**
 * =============================================================================
 * ConsumerGroupsPage
 * =============================================================================
 *
 * Главный контейнер страницы Consumer Groups.
 *
 * На frontend-этапе здесь хранится только состояние интерфейса.
 *
 * Backend будет подключён позже через useConsumerGroups().
 * =============================================================================
 */

export default function ConsumerGroupsPage() {

    /*
     * ============================================================================
     * Mock-данные Consumer Groups
     * ============================================================================
     *
     * Используем локальное состояние, а не напрямую MOCK_CONSUMER_GROUPS.
     *
     * Это необходимо потому, что действия таблицы уже начинают менять
     * состояние интерфейса:
     *
     * • скрытие группы;
     * • удаление группы;
     * • обновление;
     *
     * После подключения backend этот state будет заменён
     * состоянием из useConsumerGroups().
     * ============================================================================
     */

    const [groups, setGroups] =
        useState<ConsumerGroup[]>(
            MOCK_CONSUMER_GROUPS
        );


    /*
     * ============================================================================
     * Поиск Consumer Group
     * ============================================================================
     */

    const [search, setSearch] =
        useState('');


    /*
     * ============================================================================
     * Фильтр состояния
     * ============================================================================
     *
     * Возможные значения:
     *
     * all
     * Stable
     * Rebalancing
     * Empty
     * Dead
     * ============================================================================
     */

    const [stateFilter, setStateFilter] =
        useState('all');


    /*
     * ============================================================================
     * Сортировка
     * ============================================================================
     *
     * Начальное значение соответствует Toolbar:
     *
     * Lag (desc)
     * ============================================================================
     */

    const [sortBy, setSortBy] =
        useState<SortOption>('lag-desc');


    /*
     * ============================================================================
     * Выбранная Consumer Group
     * ============================================================================
     *
     * При первом открытии страницы автоматически выбирается
     * первая доступная группа.
     *
     * Благодаря этому:
     *
     * • Details сразу заполнен;
     * • Consumer Lag сразу отображается;
     * • пользователю не требуется первый клик по таблице.
     * ============================================================================
     */

    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroup | null>(null);


    /*
     * ============================================================================
     * Состояние обновления
     * ============================================================================
     *
     * Пока backend отсутствует, используем только визуальное состояние.
     *
     * После подключения API здесь будет отображаться реальное состояние
     * загрузки данных.
     * ============================================================================
     */

    const [refreshing, setRefreshing] =
        useState(false);


    /*
     * ============================================================================
     * Состояние Offset Reset Wizard
     * ============================================================================
     */

    const [offsetResetOpen, setOffsetResetOpen] =
        useState(false);


    /*
     * ============================================================================
     * Фильтрация Consumer Groups
     * ============================================================================
     *
     * Поиск и фильтр выполняются на frontend.
     *
     * После подключения backend UI останется прежним,
     * изменится только источник данных.
     * ============================================================================
     */

    const filteredGroups = useMemo(() => {

        const result = groups.filter(group => {

            /*
             * Поиск по имени Consumer Group.
             */

            const matchesSearch =
                group.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );


            /*
             * Фильтр состояния.
             */

            const matchesState =
                stateFilter === 'all' ||
                group.state === stateFilter;


            /*
             * Скрытые группы не показываем в основной таблице.
             *
             * При этом они остаются в общем массиве groups,
             * чтобы не ломать аналитические графики.
             */

            const isVisible =
                !group.hidden;


            return (
                matchesSearch &&
                matchesState &&
                isVisible
            );

        });


        /*
         * Применяем сортировку после фильтрации.
         */

        return sortGroups(
            result,
            sortBy
        );

    }, [
        groups,
        search,
        stateFilter,
        sortBy
    ]);


    /*
     * ============================================================================
     * Автоматический выбор первой группы
     * ============================================================================
     *
     * Срабатывает:
     *
     * • при первом открытии страницы;
     * • после изменения фильтра;
     * • после удаления выбранной группы;
     * • после её скрытия.
     *
     * Если выбранная группа всё ещё присутствует,
     * выбор пользователя сохраняется.
     * ============================================================================
     */

    useEffect(() => {

        if (filteredGroups.length === 0) {

            setSelectedGroup(null);

            return;

        }


        const selectedStillExists =
            selectedGroup !== null &&
            filteredGroups.some(
                group =>
                    group.name === selectedGroup.name
            );


        if (!selectedStillExists) {

            setSelectedGroup(
                filteredGroups[0]
            );

        }

    }, [
        filteredGroups,
        selectedGroup
    ]);


    /*
     * ============================================================================
     * Обновление списка
     * ============================================================================
     *
     * Пока backend не подключён.
     *
     * Имитируем короткое обновление интерфейса,
     * чтобы кнопка Toolbar уже имела корректное поведение.
     *
     * Позже здесь будет:
     *
     * await refresh();
     * ============================================================================
     */

    const handleRefresh = () => {

        if (refreshing) {
            return;
        }


        setRefreshing(true);


        window.setTimeout(() => {

            setRefreshing(false);

            toast.success(
                'Список Consumer Groups обновлён'
            );

        }, 500);

    };


    /*
     * ============================================================================
     * Экспорт Consumer Groups
     * ============================================================================
     *
     * Используем уже существующую функцию exportGroups().
     *
     * Toolbar отвечает только за выбор формата.
     * Реальная подготовка файла находится в utils.
     * ============================================================================
     */

    const handleExport = (
        format: ExportFormat
    ) => {

        if (filteredGroups.length === 0) {

            toast.error(
                'Нет групп для экспорта'
            );

            return;

        }


        exportGroups(
            filteredGroups,
            format
        );


        toast.success(
            `Экспорт ${format.toUpperCase()} выполнен`
        );

    };


    /*
     * ============================================================================
     * Открытие Offset Reset
     * ============================================================================
     *
     * Если группа выбрана — открываем Wizard именно для неё.
     * ============================================================================
     */

    const handleOpenOffsetReset = () => {

        if (!selectedGroup) {

            toast.error(
                'Сначала выберите Consumer Group'
            );

            return;

        }


        setOffsetResetOpen(true);

    };


    /*
     * ============================================================================
     * Скрытие / отображение группы
     * ============================================================================
     *
     * Иконка Eye в таблице изменяет только frontend-состояние.
     *
     * После подключения backend здесь можно будет добавить
     * сохранение пользовательского состояния.
     * ============================================================================
     */

    const handleToggleHidden = (
        name: string
    ) => {

        setGroups(currentGroups =>
            currentGroups.map(group =>
                group.name === name
                    ? {
                        ...group,
                        hidden: !group.hidden
                    }
                    : group
            )
        );

    };


    /*
     * ============================================================================
     * Редактирование группы
     * ============================================================================
     *
     * На текущей модели ConsumerGroup нет полей,
     * которые действительно можно редактировать.
     *
     * Поэтому не создаём фиктивный редактор.
     *
     * Кнопка останется подготовленной,
     * а полноценное редактирование появится после определения
     * соответствующей модели и backend API.
     * ============================================================================
     */

    const handleEditGroup = (
        group: ConsumerGroup
    ) => {

        toast(
            `Редактирование «${group.name}» будет подключено отдельно`
        );

    };


    /*
     * ============================================================================
     * Обновление конкретной группы
     * ============================================================================
     *
     * Пока backend отсутствует, обновляем только выбранную группу
     * визуально через повторную запись объекта.
     * ============================================================================
     */

    const handleRefreshGroup = (
        group: ConsumerGroup
    ) => {

        setGroups(currentGroups =>
            currentGroups.map(item =>
                item.name === group.name
                    ? {
                        ...item
                    }
                    : item
            )
        );


        toast.success(
            `Данные «${group.name}» обновлены`
        );

    };


    /*
     * ============================================================================
     * Удаление группы
     * ============================================================================
     *
     * На mock-этапе удаляем группу из локального состояния.
     *
     * Backend deleteGroup() будет подключён позже.
     * ============================================================================
     */

    const handleDeleteGroup = (
        group: ConsumerGroup
    ) => {

        const confirmed =
            window.confirm(
                `Удалить Consumer Group «${group.name}»?`
            );


        if (!confirmed) {
            return;
        }


        setGroups(currentGroups =>
            currentGroups.filter(
                item =>
                    item.name !== group.name
            )
        );


        toast.success(
            `Группа «${group.name}» удалена`
        );

    };


    /*
     * ============================================================================
     * Рендер страницы
     * ============================================================================
     */

    return (

        <div className="consumer-groups-page">

            {/*
             * ====================================================================
             * Заголовок страницы
             * ====================================================================
             */}

            <h1 className="page-title">

                Группы потребителей

            </h1>


            {/*
             * ====================================================================
             * KPI-панель
             * ====================================================================
             */}

            <ConsumerGroupsKpi />


            {/*
             * ====================================================================
             * Toolbar
             * ====================================================================
             *
             * Здесь соединяем все управляющие действия страницы
             * с состоянием родительского компонента.
             * ====================================================================
             */}

            <ConsumerGroupsToolbar

                search={search}

                onSearchChange={setSearch}

                stateFilter={stateFilter}

                onStateFilterChange={setStateFilter}

                sortBy={sortBy}

                onSortChange={setSortBy}

                totalGroups={filteredGroups.length}

                onRefresh={handleRefresh}

                onExport={handleExport}

                onResetOffsets={
                    handleOpenOffsetReset
                }

                refreshing={refreshing}

            />


            {/*
             * ====================================================================
             * Основная таблица Consumer Groups
             * ====================================================================
             */}

            <ConsumerGroupsTable

                groups={filteredGroups}

                selectedGroup={selectedGroup}

                onSelectGroup={setSelectedGroup}

                onToggleHidden={
                    handleToggleHidden
                }

                onEditGroup={
                    handleEditGroup
                }

                onRefreshGroup={
                    handleRefreshGroup
                }

                onDeleteGroup={
                    handleDeleteGroup
                }

            />


            {/*
             * ====================================================================
             * Нижняя область:
             *
             * слева  — подробная информация;
             * справа — Consumer Lag.
             * ====================================================================
             */}

            <div className="consumer-bottom-layout">

                <ConsumerGroupDetails

                    group={selectedGroup}

                />

                <ConsumerLagChart

                    group={selectedGroup}

                />

            </div>


            {/*
             * ====================================================================
             * Нижняя аналитическая зона.
             *
             * Используем полный массив groups,
             * а не filteredGroups.
             *
             * Поэтому аналитика показывает состояние всего набора mock-групп,
             * а не только текущего результата поиска.
             * ====================================================================
             */}

            <ConsumerDonutCharts

                groups={groups}

            />


            {/*
             * ====================================================================
             * Offset Reset Wizard.
             *
             * Отображается поверх страницы только после нажатия
             * «Сбросить оффсеты».
             *
             * Сам компонент отвечает за UI и последовательность шагов.
             * ====================================================================
             */}

            <OffsetResetWizard

                group={selectedGroup}

                open={offsetResetOpen}

                onClose={() =>
                    setOffsetResetOpen(false)
                }

            />

        </div>

    );

}