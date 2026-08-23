/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

/**
 * =============================================================================
 * AuditOverviewCharts.tsx
 * =============================================================================
 *
 * Аналитический блок Audit.
 *
 * Используем Recharts, который уже установлен в проекте.
 *
 * Графики:
 *
 * 1. Активность событий.
 * 2. Типы действий.
 * 3. Активность пользователей.
 * 4. Активность по ресурсам.
 *
 * Сейчас данные статические.
 * В будущем будут рассчитываться из API.
 * =============================================================================
 */

import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar
} from 'recharts';


const activityData = [

    { time: '00:00', events: 180, changes: 72 },
    { time: '04:00', events: 310, changes: 105 },
    { time: '06:00', events: 260, changes: 92 },
    { time: '08:00', events: 390, changes: 160 },
    { time: '10:00', events: 350, changes: 132 },
    { time: '12:00', events: 480, changes: 220 },
    { time: '14:00', events: 360, changes: 140 },
    { time: '16:00', events: 410, changes: 168 },
    { time: '18:00', events: 450, changes: 205 },
    { time: '20:00', events: 380, changes: 155 },
    { time: '22:00', events: 330, changes: 124 },
    { time: '24:00', events: 280, changes: 110 }

];


const actionData = [

    { name: 'Создание', value: 35 },
    { name: 'Обновление', value: 30 },
    { name: 'Удаление', value: 15 },
    { name: 'Чтение', value: 12 },
    { name: 'Другое', value: 8 }

];


const userData = [

    { name: 'egor', value: 3341 },
    { name: 'admin', value: 1987 },
    { name: 'ivanov', value: 1542 },
    { name: 'petrov', value: 1102 },
    { name: 'service', value: 872 }

];


const resourceData = [

    { name: 'Топики', value: 60 },
    { name: 'Consumer Groups', value: 20 },
    { name: 'ACL', value: 10 },
    { name: 'Брокеры', value: 5 },
    { name: 'Кластеры', value: 5 }

];


const chartColors = [
    '#2376ff',
    '#7c3aed',
    '#19c6a4',
    '#4ea1ff',
    '#8b5cf6'
];


export default function AuditOverviewCharts() {

    return (

        <section className="audit-overview">

            <div className="audit-chart-panel audit-activity-chart">

                <div className="audit-panel-header">

                    <div>

                        <h2>
                            Активность событий
                        </h2>

                        <span>
                            События за последние 24 часа
                        </span>

                    </div>

                </div>

                <div className="audit-chart">

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <AreaChart
                            data={activityData}
                        >

                            <defs>

                                <linearGradient
                                    id="auditEventsGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >

                                    <stop
                                        offset="0%"
                                        stopColor="#2376ff"
                                        stopOpacity={0.45}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#2376ff"
                                        stopOpacity={0}
                                    />

                                </linearGradient>

                                <linearGradient
                                    id="auditChangesGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >

                                    <stop
                                        offset="0%"
                                        stopColor="#7c3aed"
                                        stopOpacity={0.4}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#7c3aed"
                                        stopOpacity={0}
                                    />

                                </linearGradient>

                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.06)"
                            />

                            <XAxis
                                dataKey="time"
                                stroke="#758195"
                                fontSize={11}
                            />

                            <YAxis
                                stroke="#758195"
                                fontSize={11}
                            />

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="events"
                                stroke="#2376ff"
                                fill="url(#auditEventsGradient)"
                                strokeWidth={2}
                            />

                            <Area
                                type="monotone"
                                dataKey="changes"
                                stroke="#7c3aed"
                                fill="url(#auditChangesGradient)"
                                strokeWidth={2}
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>

            </div>


            <div className="audit-small-chart-grid">

                <div className="audit-chart-panel">

                    <div className="audit-panel-header">

                        <h2>
                            Типы действий
                        </h2>

                    </div>

                    <div className="audit-donut-wrapper">

                        <ResponsiveContainer
                            width="50%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={actionData}
                                    dataKey="value"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={3}
                                >

                                    {actionData.map(
                                        (_, index) => (

                                            <Cell
                                                key={index}
                                                fill={
                                                    chartColors[index]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>

                            </PieChart>

                        </ResponsiveContainer>


                        <div className="audit-legend">

                            {actionData.map(
                                (item, index) => (

                                    <div
                                        key={item.name}
                                        className="audit-legend-row"
                                    >

                                        <span
                                            style={{
                                                background:
                                                    chartColors[index]
                                            }}
                                        />

                                        <span>
                                            {item.name}
                                        </span>

                                        <strong>
                                            {item.value}%
                                        </strong>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>


                <div className="audit-chart-panel">

                    <div className="audit-panel-header">

                        <h2>
                            Активность пользователей
                        </h2>

                    </div>

                    <div className="audit-bar-chart">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={userData}
                                layout="vertical"
                                margin={{
                                    left: 10,
                                    right: 10
                                }}
                            >

                                <XAxis
                                    type="number"
                                    hide
                                />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#8b95a7"
                                    fontSize={11}
                                    width={60}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="value"
                                    fill="#2376ff"
                                    radius={[0, 5, 5, 0]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                <div className="audit-chart-panel">

                    <div className="audit-panel-header">

                        <h2>
                            Активность по ресурсам
                        </h2>

                    </div>

                    <div className="audit-donut-wrapper">

                        <ResponsiveContainer
                            width="50%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={resourceData}
                                    dataKey="value"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={3}
                                >

                                    {resourceData.map(
                                        (_, index) => (

                                            <Cell
                                                key={index}
                                                fill={
                                                    chartColors[index]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>

                            </PieChart>

                        </ResponsiveContainer>

                        <div className="audit-legend">

                            {resourceData.map(
                                (item, index) => (

                                    <div
                                        key={item.name}
                                        className="audit-legend-row"
                                    >

                                        <span
                                            style={{
                                                background:
                                                    chartColors[index]
                                            }}
                                        />

                                        <span>
                                            {item.name}
                                        </span>

                                        <strong>
                                            {item.value}%
                                        </strong>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

}