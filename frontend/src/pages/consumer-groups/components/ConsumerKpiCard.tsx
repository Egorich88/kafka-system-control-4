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
 * ConsumerKpiCard.tsx
 * =============================================================================
 *
 * Универсальная KPI карточка страницы Consumer Groups.
 *
 * Используется для отображения:
 *
 * • Всего групп
 * • Активных
 * • Empty
 * • Stable
 * • Rebalancing
 * • Dead
 *
 * После подключения backend данные будут приходить
 * из useConsumerGroups().
 *
 * =============================================================================
 */

import '../styles/consumer-kpi-card.css';

import { IconType } from 'react-icons';

interface Props {

    title: string;

    value: number | string;

    description: string;

    color: string;

    icon: IconType;

}

export default function ConsumerKpiCard({

    title,

    value,

    description,

    color,

    icon: Icon

}: Props) {

    return (

        <div className="consumer-kpi-card">

            <div
                className="consumer-kpi-icon"
                style={{ background: `${color}20` }}
            >

                <Icon
                    size={26}
                    color={color}

                />

            </div>

            <div className="consumer-kpi-content">

                <div
                    className="consumer-kpi-title"
                    style={{ color }}
                >

                    {title}

                </div>

                <div className="consumer-kpi-value">

                    {value}

                </div>

                <div className="consumer-kpi-description">

                    {description}

                </div>

            </div>

        </div>

    );

}