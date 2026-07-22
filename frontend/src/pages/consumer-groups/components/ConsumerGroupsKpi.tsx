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
 * ConsumerGroupsKpi.tsx
 * =============================================================================
 *
 * Верхняя KPI-панель страницы Consumer Groups.
 *
 * Отображает:
 *
 * • Всего групп
 * • Активные
 * • Empty
 * • Stable
 * • Rebalancing
 * • Dead
 *
 * Пока используются mock-данные.
 *
 * После подключения backend значения будут вычисляться
 * автоматически из useConsumerGroups().
 *
 * =============================================================================
 */

import '../styles/consumer-kpi-grid.css';

import ConsumerKpiCard from './ConsumerKpiCard';

import {
    FiUsers,
    FiShield,
    FiRefreshCw,
    FiAlertOctagon,
    FiMinusCircle
} from 'react-icons/fi';
import { LuSkull } from "react-icons/lu";

export default function ConsumerGroupsKpi() {

    return (

        <div className="consumer-kpi-grid">

            <ConsumerKpiCard
                title="Всего групп"
                value={58}
                description="Всего"
                color="#3B82F6"
                icon={FiUsers}
            />

            <ConsumerKpiCard
                title="Активных"
                value={54}
                description="Работают"
                color="#22C55E"
                icon={FiUsers}
            />

            <ConsumerKpiCard
                title="Empty"
                value={2}
                description="Без участников"
                color="#94A3B8"
                icon={FiMinusCircle}
            />

            <ConsumerKpiCard
                title="Stable"
                value={50}
                description="Стабильные"
                color="#22C55E"
                icon={FiShield}
            />

            <ConsumerKpiCard
                title="Rebalancing"
                value={3}
                description="Перебалансировка"
                color="#F59E0B"
                icon={FiRefreshCw}
            />

            <ConsumerKpiCard
                title="Dead"
                value={1}
                description="Неактивные"
                color="#EF4444"
                icon={LuSkull}
            />

        </div>

    );

}