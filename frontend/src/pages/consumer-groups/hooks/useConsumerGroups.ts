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
 * useConsumerGroups.ts
 * =============================================================================
 *
 * Центральный Store страницы Consumer Groups.
 *
 * Назначение файла:
 * -----------------------------------------------------------------------------
 * Данный хук является единственной точкой управления состоянием страницы
 * Consumer Groups.
 *
 * Через него работают абсолютно все компоненты страницы:
 *
 * • Toolbar
 * • Таблица
 * • Детальная информация
 * • График Lag
 * • Pagination
 * • Поиск
 * • Фильтры
 * • Сортировка
 * • Reset Offset
 *
 * Благодаря этому бизнес-логика не размазывается по компонентам.
 *
 * После подключения backend именно этот файл будет выполнять запросы к API.
 *
 * =============================================================================
 */

import { useState } from 'react';

import type {
    ConsumerGroup
} from '../types/consumer-groups.types';

/**
 * Основной хук страницы Consumer Groups.
 */
export function useConsumerGroups() {

    /**
     * ===============================================================
     * ДАННЫЕ
     * ===============================================================
     */

    /**
     * Все группы потребителей,
     * полученные от backend.
     */
    const [groups, setGroups] = useState<ConsumerGroup[]>([]);

    /**
     * ===============================================================
     * СОСТОЯНИЕ ЗАГРУЗКИ
     * ===============================================================
     */

    /**
     * Выполняется запрос к backend.
     */
    const [loading, setLoading] = useState(false);

    /**
     * Ошибка получения данных.
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * ===============================================================
     * ВЫБРАННАЯ ГРУППА
     * ===============================================================
     */

    /**
     * Какая группа сейчас открыта справа.
     */
    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroup | null>(null);

    /**
     * ===============================================================
     * ПОИСК
     * ===============================================================
     */

    /**
     * Текст строки поиска.
     */
    const [searchText, setSearchText] =
        useState('');

    /**
     * ===============================================================
     * ФИЛЬТР
     * ===============================================================
     */

    /**
     * Фильтр состояния группы.
     *
     * Пока:
     *
     * all
     * stable
     * empty
     * dead
     */
    const [stateFilter, setStateFilter] =
        useState('all');

    /**
     * ===============================================================
     * СОРТИРОВКА
     * ===============================================================
     */

    /**
     * По какой колонке выполняется сортировка.
     */
    const [sortColumn, setSortColumn] =
        useState('groupId');

    /**
     * Направление сортировки.
     */
    const [sortDirection, setSortDirection] =
        useState<'asc' | 'desc'>('asc');

    /**
     * ===============================================================
     * ПАГИНАЦИЯ
     * ===============================================================
     */

    /**
     * Текущая страница.
     */
    const [page, setPage] = useState(1);

    /**
     * Размер страницы.
     */
    const [pageSize, setPageSize] = useState(25);

    /**
     * ===============================================================
     * МЕТОДЫ
     * ===============================================================
     */

    /**
     * Выбор группы.
     */
    const selectGroup = (group: ConsumerGroup) => {
        setSelectedGroup(group);
    };

    /**
     * Обновление строки поиска.
     */
    const updateSearch = (text: string) => {
        setSearchText(text);
        setPage(1);
    };

    /**
     * Обновление фильтра.
     */
    const updateFilter = (filter: string) => {
        setStateFilter(filter);
        setPage(1);
    };

    /**
     * Смена сортировки.
     */
    const updateSort = (
        column: string,
        direction: 'asc' | 'desc'
    ) => {

        setSortColumn(column);
        setSortDirection(direction);

    };

    /**
     * Переключение страницы.
     */
    const updatePage = (value: number) => {
        setPage(value);
    };

    /**
     * В будущем здесь будет загрузка backend.
     */
    const refresh = async () => {

        console.log(
            'Consumer Groups refresh will be implemented in Step 5.'
        );

    };

    /**
     * ===============================================================
     * Возвращаем наружу состояние страницы.
     * ===============================================================
     */

    return {

        groups,
        setGroups,

        loading,
        error,

        selectedGroup,

        searchText,
        stateFilter,

        sortColumn,
        sortDirection,

        page,
        pageSize,

        selectGroup,

        updateSearch,

        updateFilter,

        updateSort,

        updatePage,

        refresh

    };

}