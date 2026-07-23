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
 * consumerGroups.ts
 * =============================================================================
 *
 * Mock-данные Consumer Groups для разработки UI.
 * =============================================================================
 */

import type { ConsumerGroup } from '../types/consumer-groups.types';

export const MOCK_CONSUMER_GROUPS: ConsumerGroup[] = [
    {
        name: 'orders-service',
        state: 'Stable',
        lag: 1_240_000,
        members: 12,
        coordinator: 'broker-1:9092',
        topics: ['orders', 'payments', 'inventory', 'shipping', 'notifications', 'audit', 'events', 'metrics'],
        partitions: 24,
        protocol: 'range',
        hidden: false
    },
    {
        name: 'analytics-pipeline',
        state: 'Rebalancing',
        lag: 850_000,
        members: 8,
        coordinator: 'broker-2:9092',
        topics: ['events', 'metrics', 'clicks'],
        partitions: 16,
        protocol: 'cooperative-sticky',
        hidden: false
    },
    {
        name: 'payment-service',
        state: 'Stable',
        lag: 0,
        members: 5,
        coordinator: 'broker-1:9092',
        topics: ['payments'],
        partitions: 6,
        protocol: 'range',
        hidden: false
    },
    {
        name: 'notifications',
        state: 'Empty',
        lag: 0,
        members: 0,
        coordinator: 'broker-3:9092',
        topics: ['notifications'],
        partitions: 3,
        protocol: 'range',
        hidden: false
    },
    {
        name: 'legacy-import',
        state: 'Dead',
        lag: 42_000,
        members: 0,
        coordinator: 'broker-2:9092',
        topics: ['legacy-data'],
        partitions: 4,
        protocol: 'range',
        hidden: false
    },
    {
        name: 'inventory-sync',
        state: 'Stable',
        lag: 12_400,
        members: 4,
        coordinator: 'broker-1:9092',
        topics: ['inventory', 'stock-updates'],
        partitions: 8,
        protocol: 'range',
        hidden: false
    }
];
