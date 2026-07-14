/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import { ConsumerGroup } from '../types/consumerGroup';

/**
 * Временные данные.
 *
 * После подключения backend
 * будут полностью удалены.
 */

export const consumerGroupsMock: ConsumerGroup[] = [

    {
        name: 'orders',
        state: 'Stable',
        lag: 15,
        members: 3,
        coordinator: 'broker-1'
    },

    {
        name: 'payments',
        state: 'Stable',
        lag: 0,
        members: 2,
        coordinator: 'broker-2'
    },

    {
        name: 'analytics',
        state: 'PreparingRebalance',
        lag: 124,
        members: 5,
        coordinator: 'broker-2'
    },

    {
        name: 'logs',
        state: 'Dead',
        lag: 0,
        members: 0,
        coordinator: 'broker-3'
    }

];