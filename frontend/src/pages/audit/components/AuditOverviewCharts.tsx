/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 * Licensed under the Apache License, Version 2.0.
 */

/**
 * Аналитика страницы Audit.
 *
 * Верхнего списка «Последние события» здесь нет — события отображаются
 * только в единственном журнале AuditTable. Это исключает дублирование.
 */

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
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

const chartColors = [
    '#2376ff',
    '#7c3aed',
    '#19c6a4',
    '#4ea1ff',
    '#f59e0b'
];

export default function AuditOverviewCharts() {
    return (
        <section className="audit-overview">
            <div className="audit-chart-panel audit-activity-chart">
                <div className="audit-panel-header">
                    <div>
                        <h2>Активность событий</h2>
                        <span>События за последние 24 часа</span>
                    </div>
                </div>

                <div className="audit-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                            <defs>
                                <linearGradient id="auditEventsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2376ff" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#2376ff" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="auditChangesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.28} />
                                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={10} />
                            <YAxis stroke="var(--text-secondary)" fontSize={10} />
                            <Tooltip />
                            <Area type="monotone" dataKey="events" stroke="#2376ff" fill="url(#auditEventsGradient)" strokeWidth={2.5} />
                            <Area type="monotone" dataKey="changes" stroke="#7c3aed" fill="url(#auditChangesGradient)" strokeWidth={2.5} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="audit-chart-panel">
                <div className="audit-panel-header">
                    <div>
                        <h2>Типы действий</h2>
                        <span>Распределение операций</span>
                    </div>
                </div>

                <div className="audit-donut-wrapper">
                    <ResponsiveContainer width="52%" height="100%">
                        <PieChart>
                            <Pie data={actionData} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                                {actionData.map((item, index) => (
                                    <Cell key={item.name} fill={chartColors[index]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="audit-legend">
                        {actionData.map((item, index) => (
                            <div key={item.name} className="audit-legend-row">
                                <span style={{ background: chartColors[index] }} />
                                <span>{item.name}</span>
                                <strong>{item.value}%</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="audit-chart-panel">
                <div className="audit-panel-header">
                    <div>
                        <h2>Активность пользователей</h2>
                        <span>Количество событий по пользователям</span>
                    </div>
                </div>

                <div className="audit-bar-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userData} layout="vertical" margin={{ left: 8, right: 12, top: 4, bottom: 4 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" fontSize={10} width={55} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#2376ff" radius={[0, 5, 5, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}
