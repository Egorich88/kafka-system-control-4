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
 * ConsumerLagChart.tsx
 * =============================================================================
 *
 * Пункт 9: График Consumer Lag с выбором периода (15м – 24ч).
 * =============================================================================
 */

import { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import KSCSelect from '../../../components/ui/select/KSCSelect';
import '../styles/consumer-chart.css';
import type { ConsumerGroup } from '../types/consumer-groups.types';
import { formatLag } from '../utils/lag.utils';

type TimeRange = '15m' | '30m' | '1h' | '6h' | '24h';

const RANGE_OPTIONS: { value: TimeRange; label: string; points: number }[] = [
    { value: '15m', label: 'Последние 15 минут', points: 15 },
    { value: '30m', label: 'Последние 30 минут', points: 30 },
    { value: '1h', label: 'Последний 1 час', points: 12 },
    { value: '6h', label: 'Последние 6 часов', points: 24 },
    { value: '24h', label: 'Последние 24 часа', points: 24 }
];

function generateMockLag(baseLag: number, points: number) {
    const now = Date.now();
    return Array.from({ length: points }, (_, i) => {
        const offset = (points - i - 1) * 60_000;
        const variance = Math.sin(i * 0.5) * baseLag * 0.3 + Math.random() * baseLag * 0.1;
        const lag = Math.max(0, Math.round(baseLag + variance - i * (baseLag / points / 2)));
        const time = new Date(now - offset);
        return {
            time: time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            lag
        };
    });
}

interface Props {
    group: ConsumerGroup | null;
}

export default function ConsumerLagChart({ group }: Props) {
    const [range, setRange] = useState<TimeRange>('15m');

    const rangeConfig = RANGE_OPTIONS.find(r => r.value === range)!;

    const data = useMemo(() => {
        if (!group) return [];
        return generateMockLag(group.lag || 100, rangeConfig.points);
    }, [group, rangeConfig.points]);

    if (!group) {
        return (
            <div className="consumer-chart">
                <div className="consumer-chart-header">
                    <div className="consumer-chart-title">Consumer Lag</div>
                </div>
                <div className="consumer-chart-empty">
                    Выберите группу
                </div>
            </div>
        );
    }

    return (
        <div className="consumer-chart">
            <div className="consumer-chart-header">
                <div className="consumer-chart-title">Consumer Lag</div>
                <KSCSelect
                    label=""
                    value={range}
                    onChange={(v) => setRange(v as TimeRange)}
                    options={RANGE_OPTIONS.map(r => ({
                        value: r.value,
                        label: r.label
                    }))}
                />
            </div>
            <div className="consumer-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                            tickFormatter={(v) => formatLag(v)}
                        />
                        <Tooltip
                            formatter={(value: number) => [formatLag(value), 'Lag']}
                            contentStyle={{
                                background: 'var(--panel-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 8
                            }}
                        />
                        <Area
                            dataKey="lag"
                            stroke="var(--accent-color)"
                            fill="var(--accent-color)"
                            fillOpacity={0.2}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
