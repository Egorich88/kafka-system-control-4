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
 * @fileoverview Панель отставания групп потребителей (Consumer Lag).
 * Отображает графики lag по группам потребителей за выбранный период.
 *
 * Управление видимостью линий:
 *   - Клик по строке легенды → оставить только эту группу.
 *   - Повторный клик на уже единственной группе → вернуть все активные группы.
 *   - Клик по пустому месту графика → вернуть все активные группы.
 *   - Ctrl + клик → добавить/удалить группу из текущего набора (мультивыбор).
 */

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import axios from 'axios';
import { useCluster } from '../../contexts/ClusterContext';

// =========================================================================
// Кастомный тултип
// =========================================================================
const LagTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const filtered = payload.filter(entry => entry.value > 0);
  if (filtered.length === 0) return null;

  return (
    <div className="topics-tooltip">
      <div className="topics-tooltip-title">Время: {label}</div>
      {filtered.map((entry) => (
        <div
          key={entry.dataKey}
          className="topics-tooltip-row"
          style={{ color: entry.color || 'var(--text-primary)' }}
        >
          {entry.name}: <strong>{entry.value.toFixed(1)} lag</strong>
        </div>
      ))}
    </div>
  );
};

// Генерация цвета для группы
const getGroupColor = (group, index) => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#a855f7'
  ];
  return colors[index % colors.length];
};

export default function ConsumerLagPanel({ timeRange = '15m', refreshKey }) {
  const { currentCluster } = useCluster();

  const [visibleGroups, setVisibleGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Загрузка данных с бэкенда
  // -------------------------------------------------------------------------
  const loadConsumerLagData = async () => {
    if (!currentCluster) return;
    setLoading(true);
    try {
      const headers = { 'X-Kafka-Bootstrap': currentCluster.brokers || currentCluster.bootstrapServers };
      const response = await axios.get(`/api/overview/consumer-lag?range=${timeRange}`, { headers });
      const points = response.data.points || [];

      const safePoints = points.map(p => ({
        ...p,
        value: Math.max(0, p.value || 0)
      }));
      setRawData(safePoints);

      const unique = [...new Set(safePoints.map(p => p.group))];
      setAllGroups(unique);

      const activeSet = new Set();
      for (const point of safePoints) {
        if (point.value > 0) {
          activeSet.add(point.group);
        }
      }
      const activeGroups = unique.filter(g => activeSet.has(g));
      setVisibleGroups(activeGroups.length > 0 ? activeGroups : []);
    } catch (err) {
      console.error('Ошибка загрузки данных consumer lag:', err);
      setRawData([]);
      setAllGroups([]);
      setVisibleGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumerLagData();
  }, [currentCluster, timeRange, refreshKey]);

  // -------------------------------------------------------------------------
  // Преобразование данных для Recharts
  // -------------------------------------------------------------------------
  const prepareChartData = () => {
    const timeMap = new Map();
    for (const point of rawData) {
      if (!timeMap.has(point.time)) {
        timeMap.set(point.time, { time: point.time });
      }
      const entry = timeMap.get(point.time);
      entry[point.group] = Math.max(0, point.value || 0);
    }
    return Array.from(timeMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  };

  const aggregatedData = prepareChartData();
  const lastPoint = aggregatedData.length > 0 ? aggregatedData[aggregatedData.length - 1] : {};

  // -------------------------------------------------------------------------
  // Обработчики кликов по легенде и фону графика
  // -------------------------------------------------------------------------
  const handleGroupSelect = (group, event) => {
    if (event && event.stopPropagation) event.stopPropagation();
    if (event && event.ctrlKey) {
      setVisibleGroups(prev =>
        prev.includes(group)
          ? prev.filter(g => g !== group)
          : [...prev, group]
      );
      return;
    }
    if (visibleGroups.length === 1 && visibleGroups[0] === group) {
      const activeSet = new Set();
      for (const point of rawData) {
        if (point.value > 0) activeSet.add(point.group);
      }
      const active = allGroups.filter(g => activeSet.has(g));
      setVisibleGroups(active.length > 0 ? active : allGroups);
    } else {
      setVisibleGroups([group]);
    }
  };

  const handleChartClick = () => {
    const activeSet = new Set();
    for (const point of rawData) {
      if (point.value > 0) activeSet.add(point.group);
    }
    const active = allGroups.filter(g => activeSet.has(g));
    setVisibleGroups(active.length > 0 ? active : allGroups);
  };

  // -------------------------------------------------------------------------
  // Состояния загрузки и отсутствия данных
  // -------------------------------------------------------------------------
  if (!currentCluster) return null;

  if (loading && rawData.length === 0) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="topics-panel-title">Отставание групп потребителей</div>
        </div>
        <div className="panel-body topics-placeholder">Загрузка данных...</div>
      </div>
    );
  }

  if (allGroups.length === 0 && !loading) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="topics-panel-title">Отставание групп потребителей</div>
        </div>
        <div className="panel-body topics-placeholder">Нет данных о группах за выбранный период</div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Рендер
  // -------------------------------------------------------------------------
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="topics-panel-title">Отставание групп потребителей</div>
      </div>

      <div className="panel-body">
        <div className="topics-layout">
          <div className="topics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={aggregatedData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 30
                }}
                onClick={handleChartClick}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              >
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="time"
                  height={45}
                  tickMargin={10}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                {/* Ось Y с нулём и подписью "Lag" */}
                <YAxis
                  domain={[0, 'auto']}
                  padding={{ top: 20 }}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: 'Lag',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'var(--text-secondary)', fontSize: 12 }
                  }}
                />
                <Tooltip content={<LagTooltip />} />

                {allGroups
                  .filter(group => visibleGroups.includes(group))
                  .map((group, idx) => (
                    <Line
                      key={group}
                      type="monotone"
                      dataKey={group}
                      stroke={getGroupColor(group, idx)}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 5,
                        stroke: '#fff',
                        strokeWidth: 2,
                        fill: getGroupColor(group, idx)
                      }}
                      onMouseDown={(e) => handleGroupSelect(group, e)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="topics-legend">
            <div className="topics-legend-header">
              <span>Группа</span>
              <span>Lag</span>
            </div>
            {visibleGroups.length === 0 ? (
              <div className="topics-legend-placeholder">Нет активных групп за выбранный период</div>
            ) : (
              visibleGroups.map(group => (
                <div
                  key={group}
                  className={`topics-legend-row ${
                    visibleGroups.length === 1 && visibleGroups[0] === group ? 'active' : ''
                  }`}
                  onClick={(e) => handleGroupSelect(group, e)}
                >
                  <div className="topics-legend-left">
                    <span
                      className="topics-legend-color"
                      style={{ background: getGroupColor(group, allGroups.indexOf(group)) }}
                    />
                    <span>{group}</span>
                  </div>
                  <span className="topics-legend-value">
                    {(lastPoint[group] || 0).toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}