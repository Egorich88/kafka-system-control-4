/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

/**
 * =============================================================================
 * ConsumerOffsets.tsx
 * =============================================================================
 *
 * Панель отображения оффсетов выбранной Consumer Group.
 *
 * Пока используются mock-данные.
 *
 * После подключения backend здесь будет отображаться:
 *
 * • Topic
 * • Partition
 * • Current Offset
 * • End Offset
 * • Lag
 *
 * Эта панель станет основой мастера Offset Reset.
 * =============================================================================
 */

import '../styles/consumer-offsets.css';

import type { ConsumerGroup } from '../types/consumer-groups.types';

interface Props {

    group: ConsumerGroup | null;

}

export default function ConsumerOffsets({

    group

}: Props) {

    if (!group) {

        return (

            <div className="consumer-offsets">

                Выберите группу

            </div>

        );

    }

    return (

        <div className="consumer-offsets">

            <div className="consumer-offsets-title">

                Offset'ы

            </div>

            <table className="consumer-offsets-table">

                <thead>

                    <tr>

                        <th>Топик</th>

                        <th>Партиция</th>

                        <th>Offset</th>

                        <th>Конец</th>

                        <th>Lag</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>payments</td>

                        <td>0</td>

                        <td>1200</td>

                        <td>1200</td>

                        <td>0</td>

                    </tr>

                    <tr>

                        <td>payments</td>

                        <td>1</td>

                        <td>1188</td>

                        <td>1200</td>

                        <td>12</td>

                    </tr>

                </tbody>

            </table>

        </div>

    );

}