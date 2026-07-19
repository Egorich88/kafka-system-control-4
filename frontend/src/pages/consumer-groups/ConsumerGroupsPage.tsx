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
import { useState } from 'react';
import type { ConsumerGroup } from './types/consumer-groups.types';

import './styles/consumer-groups.css';

import ConsumerGroupsToolbar from './components/ConsumerGroupsToolbar';
import ConsumerGroupsTable from './components/ConsumerGroupsTable';
import ConsumerGroupDetails from './components/ConsumerGroupDetails';
import ConsumerLagChart from './components/ConsumerLagChart';

export default function ConsumerGroupsPage() {
    /*
     * ============================================================================
     * Выбранная Consumer Group.
     *
     * Является центральным состоянием страницы.
     *
     * Все дочерние компоненты получают выбранную группу отсюда.
     *
     * Позже именно это состояние будет использоваться:
     *
     * • Consumer Details
     * • Members
     * • Offsets
     * • Offset Reset
     * • Lag Chart
     *
     * ============================================================================
     */

    const [selectedGroup, setSelectedGroup] =
        useState<ConsumerGroup | null>(null);

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

    return (

        <div className="consumer-groups-page">

            <ConsumerGroupsToolbar />

            <ConsumerGroupsTable

                groups={mockGroups}

                selectedGroup={selectedGroup}

                onSelectGroup={setSelectedGroup}

            />

            <div className="consumer-bottom-layout">

                <ConsumerGroupDetails

                    group={selectedGroup}

                />

                <ConsumerLagChart />

            </div>

        </div>

    );

}