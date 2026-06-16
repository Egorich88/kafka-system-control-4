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
 * @fileoverview Панель пропускной способности по топикам Kafka.
 *
 * Отображает графики только активных топиков (с положительной скоростью)
 * за выбранный временной период (передаётся через prop timeRange).
 *
 * Управление видимостью линий:
 *   - Клик по строке легенды → оставить только этот топик.
 *   - Повторный клик на уже единственном топике → вернуть все активные топики.
 *   - Клик по пустому месту графика → вернуть все активные топики.
 *   - Ctrl + клик → добавить/удалить топик из текущего набора (мультивыбор).
 *
 * Данные защищены от отрицательных значений (обрезаются до нуля на всех этапах).
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
import '../../styles/overview/topics-panel.css';
import { useCluster } from '../../contexts/ClusterContext';

// =========================================================================
// Кастомный тултип – показывает только положительные значения
// =========================================================================
const TopicsTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  // Отфильтровываем нулевые и отрицательные
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
          {entry.name}: <strong>{entry.value.toFixed(1)} сообщений/сек</strong>
        </div>
      ))}
    </div>
  );
};

// Генерация цвета для топика (циклически по 10 предустановленным)
const getTopicColor = (topic, index) => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#a855f7'
  ];
  return colors[index % colors.length];
};

export default function TopicsPanel({ timeRange = '15m', refreshKey }) {
  const { currentCluster } = useCluster();

  const [visibleTopics, setVisibleTopics] = useState([]);   // топики, отображаемые на графике и в легенде
  const [allTopics, setAllTopics] = useState([]);          // все топики из данных (для расчёта активных)
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Загрузка данных с бэкенда с учётом периода
  // -------------------------------------------------------------------------
  const loadTopicsData = async () => {
    if (!currentCluster) return;
    setLoading(true);
    try {
      const headers = { 'X-Kafka-Bootstrap': currentCluster.brokers || currentCluster.bootstrapServers };
      const response = await axios.get(`/api/overview/topics-throughput?range=${timeRange}`, { headers });
      const points = response.data.points || [];

      // Защита от отрицательных значений (обрезаем до нуля)
      const safePoints = points.map(p => ({
        ...p,
        value: Math.max(0, p.value || 0)
      }));
      setRawData(safePoints);

      // Все уникальные топики из полученных точек
      const unique = [...new Set(safePoints.map(p => p.topic))];
      setAllTopics(unique);

      // Определяем активные топики (значение > 0 хотя бы в одной точке)
      const activeSet = new Set();
      for (const point of safePoints) {
        if (point.value > 0) {
          activeSet.add(point.topic);
        }
      }
      const activeTopics = unique.filter(t => activeSet.has(t));

      // Если активные есть – показываем их, иначе – все топики (но легенда будет пуста)
      setVisibleTopics(activeTopics.length > 0 ? activeTopics : []);
    } catch (err) {
      console.error('Ошибка загрузки данных топиков:', err);
      setRawData([]);
      setAllTopics([]);
      setVisibleTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // Перезагружаем при смене кластера или периода
  useEffect(() => {
    loadTopicsData();
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
      // Второй уровень защиты: обрезаем отрицательные (на случай, если в rawData просочились)
      entry[point.topic] = Math.max(0, point.value || 0);
    }
    return Array.from(timeMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  };

  const aggregatedData = prepareChartData();
  const lastPoint = aggregatedData.length > 0 ? aggregatedData[aggregatedData.length - 1] : {};

  // -------------------------------------------------------------------------
  // Обработчики кликов по легенде и фону графика
  // -------------------------------------------------------------------------
  const handleTopicSelect = (topic, event) => {
    if (event && event.stopPropagation) event.stopPropagation();
    if (event && event.ctrlKey) {
      // Мультивыбор: добавляем или удаляем топик
      setVisibleTopics(prev =>
        prev.includes(topic)
          ? prev.filter(t => t !== topic)
          : [...prev, topic]
      );
      return;
    }
    if (visibleTopics.length === 1 && visibleTopics[0] === topic) {
      // Если уже только этот топик – возвращаем все активные
      const activeSet = new Set();
      for (const point of rawData) {
        if (point.value > 0) activeSet.add(point.topic);
      }
      const active = allTopics.filter(t => activeSet.has(t));
      setVisibleTopics(active.length > 0 ? active : allTopics);
    } else {
      // Оставляем только этот топик
      setVisibleTopics([topic]);
    }
  };

  const handleChartClick = () => {
    // Возвращаем все активные топики
    const activeSet = new Set();
    for (const point of rawData) {
      if (point.value > 0) activeSet.add(point.topic);
    }
    const active = allTopics.filter(t => activeSet.has(t));
    setVisibleTopics(active.length > 0 ? active : allTopics);
  };

  // -------------------------------------------------------------------------
  // Состояния загрузки и отсутствия данных
  // -------------------------------------------------------------------------
  if (!currentCluster) return null;

  if (loading && rawData.length === 0) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="topics-panel-title">Пропускная способность по топикам</div>
        </div>
        <div className="panel-body topics-placeholder">Загрузка данных...</div>
      </div>
    );
  }

  if (allTopics.length === 0 && !loading) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="topics-panel-title">Пропускная способность по топикам</div>
        </div>
        <div className="panel-body topics-placeholder">Нет данных о топиках за выбранный период</div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Рендер
  // -------------------------------------------------------------------------
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="topics-panel-title">Пропускная способность по топикам</div>
      </div>

      <div className="panel-body">
        <div className="topics-layout">
          {/* График */}
          <div className="topics-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={aggregatedData}
                onClick={handleChartClick}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              >
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<TopicsTooltip />} />

                {allTopics
                  .filter(topic => visibleTopics.includes(topic))
                  .map((topic, idx) => (
                    <Line
                      key={topic}
                      type="natural"
                      dataKey={topic}
                      stroke={getTopicColor(topic, idx)}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 5,
                        stroke: '#fff',
                        strokeWidth: 2,
                        fill: getTopicColor(topic, idx)
                      }}
                      onMouseDown={(e) => handleTopicSelect(topic, e)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Легенда – показывает только активные топики */}
          <div className="topics-legend">
            <div className="topics-legend-header">
              <span>Топик</span>
              <span>Сообщений/сек</span>
            </div>
            {visibleTopics.length === 0 ? (
              <div className="topics-legend-placeholder">Нет активных топиков за выбранный период</div>
            ) : (
              visibleTopics.map(topic => (
                <div
                  key={topic}
                  className={`topics-legend-row ${
                    visibleTopics.length === 1 && visibleTopics[0] === topic ? 'active' : ''
                  }`}
                  onClick={(e) => handleTopicSelect(topic, e)}
                >
                  <div className="topics-legend-left">
                    <span
                      className="topics-legend-color"
                      style={{ background: getTopicColor(topic, allTopics.indexOf(topic)) }}
                    />
                    <span>{topic}</span>
                  </div>
                  <span className="topics-legend-value">
                    {(lastPoint[topic] || 0).toFixed(1)}
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