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
 * ============================================================
 * consumerGroup.ts
 * ============================================================
 *
 * Типы данных страницы Consumer Groups.
 *
 * Назначение:
 * описывает модель одной группы потребителей.
 *
 * Используется:
 * - таблицей
 * - панелью деталей
 * - API
 * ============================================================
 */

export type ConsumerGroupState =
    | 'Stable'
    | 'Rebalancing'
    | 'PreparingRebalance'
    | 'CompletingRebalance'
    | 'Dead'
    | 'Empty';

export interface ConsumerGroup {

    name: string;

    state: ConsumerGroupState;

    lag: number;

    members: number;

    coordinator: string;

    topics?: string[];

    partitions?: number;

    protocol?: string;

    /** Скрыта ли группа из таблицы (иконка «глаз») */
    hidden?: boolean;

}

export type OffsetResetMethod =
    | 'earliest'
    | 'latest'
    | 'datetime'
    | 'offset'
    | 'current';

export interface RebalanceEvent {

    time: string;

    reason: string;

    members: number;

    duration: string;

}
/**
 * ============================================================================
 * Участник Consumer Group.
 *
 * Пока используется mock.
 *
 * После backend полностью совпадет
 * со структурой API.
 * ============================================================================
 */

export interface ConsumerMember {

    id: string;

    clientId: string;

    host: string;

    partitions: string[];

}