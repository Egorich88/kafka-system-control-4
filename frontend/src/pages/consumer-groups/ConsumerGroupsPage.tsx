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
 * Главная страница Consumer Groups.
 *
 * На этом этапе mock-источник полностью заменён реальным backend API.
 *
 * Страница получает:
 * • список Consumer Groups;
 * • состояние, lag, topics, partitions и coordinator;
 * • подробные Members;
 * • реальные Offsets;
 * • реальный Consumer Lag через отдельный компонент графика.
 * =============================================================================
 */

import {
    useEffect,
    useMemo,
    useState
} from 'react';

import toast from 'react-hot-toast';

import { useCluster } from '../../contexts/ClusterContext';

import type {
    ConsumerGroup,
    ConsumerGroupDetails
} from './types/consumer-groups.types';

import {
    fetchConsumerGroupDetails,
    fetchConsumerGroups
} from './services/consumer-groups.api';

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


export default function ConsumerGroupsPage() {

    const { currentCluster } = useCluster();

    const [groups, setGroups] =
        useState<ConsumerGroup[]>([]);

    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroup | null>(null);

    const [selectedDetails, setSelectedDetails] =
        useState<ConsumerGroupDetails | null>(null);

    const [search, setSearch] =
        useState('');

    const [stateFilter, setStateFilter] =
        useState('all');

    const [sortBy, setSortBy] =
        useState<SortOption>('lag-desc');

    const [loading, setLoading] =
        useState(false);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [refreshing, setRefreshing] =
        useState(false);

    const [offsetResetOpen, setOffsetResetOpen] =
        useState(false);


    /* =========================================================================
       Загрузка списка групп
       ========================================================================= */

    const loadGroups = async (showToast = false) => {

        if (!currentCluster?.brokers) {
            setGroups([]);
            setSelectedGroup(null);
            setSelectedDetails(null);
            return;
        }

        setLoading(true);

        try {

            const data = await fetchConsumerGroups(
                currentCluster.brokers
            );

            setGroups(data);

            if (showToast) {
                toast.success('Список Consumer Groups обновлён');
            }

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось загрузить Consumer Groups';

            toast.error(message);
            setGroups([]);
            setSelectedGroup(null);
            setSelectedDetails(null);

        } finally {
            setLoading(false);
        }
    };


    /* =========================================================================
       При смене Kafka-кластера загружаем его реальные Consumer Groups.
       ========================================================================= */

    useEffect(() => {
        void loadGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentCluster?.brokers]);


    /* =========================================================================
       Загрузка подробностей выбранной группы.

       Важное отличие от старой версии:
       Details больше не использует mock Members/Offsets.
       ========================================================================= */

    useEffect(() => {

        if (!selectedGroup || !currentCluster?.brokers) {
            setSelectedDetails(null);
            return;
        }

        let cancelled = false;

        const loadDetails = async () => {

            setDetailsLoading(true);

            try {

                const details =
                    await fetchConsumerGroupDetails(
                        currentCluster.brokers,
                        selectedGroup.name
                    );

                if (!cancelled) {
                    setSelectedDetails(details);
                }

            } catch (error) {

                if (!cancelled) {

                    setSelectedDetails(null);

                    toast.error(
                        error instanceof Error
                            ? error.message
                            : 'Не удалось загрузить детали группы'
                    );
                }

            } finally {

                if (!cancelled) {
                    setDetailsLoading(false);
                }
            }
        };

        void loadDetails();

        return () => {
            cancelled = true;
        };

    }, [selectedGroup?.name, currentCluster?.brokers]);


    /* =========================================================================
       Фильтрация и сортировка таблицы.
       ========================================================================= */

    const filteredGroups = useMemo(() => {

        const result = groups.filter(group => {

            const matchesSearch =
                group.name
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesState =
                stateFilter === 'all' ||
                group.state === stateFilter;

            return matchesSearch &&
                matchesState &&
                !group.hidden;
        });

        return sortGroups(result, sortBy);

    }, [
        groups,
        search,
        stateFilter,
        sortBy
    ]);


    /* =========================================================================
       Если выбранная группа исчезла из результата — выбираем первую.
       ========================================================================= */

    useEffect(() => {

        if (filteredGroups.length === 0) {
            setSelectedGroup(null);
            return;
        }

        const exists =
            selectedGroup !== null &&
            filteredGroups.some(
                group => group.name === selectedGroup.name
            );

        if (!exists) {
            setSelectedGroup(filteredGroups[0]);
        }

    }, [filteredGroups, selectedGroup]);


    /* =========================================================================
       Обновление списка.
       ========================================================================= */

    const handleRefresh = async () => {

        if (refreshing) {
            return;
        }

        setRefreshing(true);

        try {
            await loadGroups(true);
        } finally {
            setRefreshing(false);
        }
    };


    /* =========================================================================
       Экспорт реальных данных.
       ========================================================================= */

    const handleExport = (format: ExportFormat) => {

        if (filteredGroups.length === 0) {
            toast.error('Нет групп для экспорта');
            return;
        }

        exportGroups(filteredGroups, format);

        toast.success(
            `Экспорт ${format.toUpperCase()} выполнен`
        );
    };


    /* =========================================================================
       Offset Reset.
       ========================================================================= */

    const handleOpenOffsetReset = () => {

        if (!selectedGroup) {
            toast.error('Сначала выберите Consumer Group');
            return;
        }

        setOffsetResetOpen(true);
    };


    /* =========================================================================
       Скрытие группы.
       Это пользовательское состояние интерфейса и пока хранится локально.
       ========================================================================= */

    const handleToggleHidden = (name: string) => {

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


    /* =========================================================================
       Обновление конкретной группы.
       ========================================================================= */

    const handleRefreshGroup = async (
        group: ConsumerGroup
    ) => {

        if (!currentCluster?.brokers) {
            return;
        }

        try {

            const [groupsData, details] =
                await Promise.all([
                    fetchConsumerGroups(currentCluster.brokers),
                    fetchConsumerGroupDetails(
                        currentCluster.brokers,
                        group.name
                    )
                ]);

            setGroups(groupsData);
            setSelectedDetails(details);

            const updatedGroup =
                groupsData.find(
                    item => item.name === group.name
                );

            if (updatedGroup) {
                setSelectedGroup(updatedGroup);
            }

            toast.success(
                `Данные «${group.name}» обновлены`
            );

        } catch (error) {

            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Не удалось обновить группу'
            );
        }
    };


    /* =========================================================================
       Удаление.

       Пока backend API удаления Consumer Group отдельно не добавляем:
       удаление здесь не должно создавать ложное ощущение удаления Kafka group.
       Поэтому действие отключаем через понятное уведомление.
       ========================================================================= */

    const handleDeleteGroup = (group: ConsumerGroup) => {
        toast(
            `Удаление Kafka Consumer Group «${group.name}» пока не подключено`
        );
    };


    return (

        <div className="consumer-groups-page">

            <h1 className="page-title">
                Группы потребителей
            </h1>

            <ConsumerGroupsKpi groups={groups} />

            {/* =================================================================
                Верхняя аналитика.

                Три диаграммы располагаются сразу под KPI.
                Так пользователь сначала видит состояние групп и основные
                показатели, а уже затем переходит к поиску и таблице.
               ================================================================= */}
            <ConsumerDonutCharts
                groups={groups}
            />

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
                onResetOffsets={handleOpenOffsetReset}
                refreshing={refreshing || loading}
            />

            <ConsumerGroupsTable
                groups={filteredGroups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onToggleHidden={handleToggleHidden}
                onRefreshGroup={handleRefreshGroup}
                onDeleteGroup={handleDeleteGroup}
            />

            {/* =================================================================
                Подробности выбранной группы и график Consumer Lag.

                Оставляем этот блок после таблицы: он относится к конкретной
                выбранной группе и не должен конкурировать с общей аналитикой.
               ================================================================= */}
            <div className="consumer-bottom-layout">

                <ConsumerGroupDetails
                    group={selectedGroup}
                    details={detailsLoading ? null : selectedDetails}
                />

                <ConsumerLagChart
                    group={selectedGroup}
                />

            </div>

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
