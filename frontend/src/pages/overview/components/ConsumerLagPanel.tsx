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
 * @fileoverview Панель Consumer Lag на странице Overview.
 *
 * Содержит единый график lag и таблицу Group + Topic.
 * Статус Kafka Consumer Group показывается непосредственно рядом
 * с топиком, поэтому рост lag можно сразу сопоставить с состоянием
 * группы: Stable, Rebalancing, Empty или Dead.
 */

import PanelInfo from '../../../components/common/PanelInfo';
import PanelFullscreenButton from './PanelFullscreenButton';
import { useState, useEffect, useMemo } from 'react';
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
import { useCluster } from '../../../contexts/ClusterContext';

const TOPIC_COLORS = [
  '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#a855f7',
  '#14b8a6', '#f472b6'
];

const STATUS_META = {
  Stable: {
    label: 'Stable',
    className: 'consumer-status-stable',
    short: 'группа работает'
  },
  Rebalancing: {
    label: 'Rebalancing',
    className: 'consumer-status-rebalancing',
    short: 'идёт перераспределение'
  },
  Empty: {
    label: 'Empty',
    className: 'consumer-status-empty',
    short: 'нет активных консьюмеров'
  },
  Dead: {
    label: 'Dead',
    className: 'consumer-status-dead',
    short: 'группа удаляется'
  }
};

const getTopicColor = (topic, topics) =>
  TOPIC_COLORS[Math.max(0, topics.indexOf(topic)) % TOPIC_COLORS.length];

const formatLag = (value) =>
  new Intl.NumberFormat('ru-RU').format(Number(value || 0));

const formatChange = (value) => {
  const change = Number(value || 0);
  if (change > 0) return `↑ +${formatLag(change)}`;
  if (change < 0) return `↓ ${formatLag(change)}`;
  return '→ 0';
};

function LagTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const filtered = payload.filter((entry) => Number(entry.value) > 0);
  if (!filtered.length) return null;

  return (
    <div className="topics-tooltip">
      <div className="topics-tooltip-title">Время: {label}</div>
      {filtered.map((entry) => (
        <div
          key={entry.dataKey}
          className="topics-tooltip-row"
          style={{ color: entry.color || 'var(--text-primary)' }}
        >
          {entry.name}: <strong>{formatLag(entry.value)} lag</strong>
        </div>
      ))}
    </div>
  );
}

export default function ConsumerLagPanel({ timeRange = '15m', refreshKey }) {
  const { currentCluster } = useCluster();

  const [visibleLines, setVisibleLines] = useState([]);
  const [allLines, setAllLines] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadConsumerLagData = async () => {
    if (!currentCluster) return;

    setLoading(true);

    try {
      const headers = {
        'X-Kafka-Bootstrap':
          currentCluster.brokers || currentCluster.bootstrapServers
      };

      const response = await axios.get(
        `/api/overview/consumer-lag?range=${timeRange}`,
        { headers }
      );

      const points = (response.data.points || []).map((point) => ({
        ...point,
        value: Math.max(0, point.value || 0)
      }));

      const nextRows = response.data.rows || [];

      setRawData(points);
      setRows(nextRows);

      const lineSet = new Set();

      points.forEach((point) => {
        if (!point.topics || typeof point.topics !== 'object') return;

        Object.keys(point.topics).forEach((topic) => {
          lineSet.add(`${point.group} (${topic})`);
        });
      });

      const uniqueLines = Array.from(lineSet).sort();
      setAllLines(uniqueLines);

      const lastPoint = points[points.length - 1];
      const active = new Set();

      if (lastPoint?.topics) {
        Object.entries(lastPoint.topics).forEach(([topic, value]) => {
          if (Number(value) > 0) {
            active.add(`${lastPoint.group} (${topic})`);
          }
        });
      }

      setVisibleLines(active.size ? Array.from(active).sort() : uniqueLines);
    } catch (error) {
      console.error('Ошибка загрузки данных consumer lag:', error);
      setRawData([]);
      setRows([]);
      setAllLines([]);
      setVisibleLines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsumerLagData();
  }, [currentCluster, timeRange, refreshKey]);

  const chartData = useMemo(() => {
    const timeMap = new Map();

    rawData.forEach((point) => {
      if (!point.topics || typeof point.topics !== 'object') return;

      if (!timeMap.has(point.time)) {
        timeMap.set(point.time, { time: point.time });
      }

      const entry = timeMap.get(point.time);

      Object.entries(point.topics).forEach(([topic, value]) => {
        entry[`${point.group} (${topic})`] = Math.max(0, Number(value || 0));
      });
    });

    return Array.from(timeMap.values()).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  }, [rawData]);

  const lastPoint = chartData.length
    ? chartData[chartData.length - 1]
    : {};

  const topicNames = useMemo(() => {
    const names = new Set();

    rows.forEach((row) => names.add(row.topic));
    allLines.forEach((line) => {
      const match = line.match(/\((.*)\)$/);
      if (match) names.add(match[1]);
    });

    return Array.from(names).sort();
  }, [rows, allLines]);

  const handleLineSelect = (lineKey, event) => {
    event?.stopPropagation();

    if (event?.ctrlKey) {
      setVisibleLines((current) =>
        current.includes(lineKey)
          ? current.filter((key) => key !== lineKey)
          : [...current, lineKey]
      );
      return;
    }

    if (visibleLines.length === 1 && visibleLines[0] === lineKey) {
      const active = allLines.filter((key) => Number(lastPoint[key] || 0) > 0);
      setVisibleLines(active.length ? active : allLines);
      return;
    }

    setVisibleLines([lineKey]);
  };

  const resetVisibleLines = () => {
    const active = allLines.filter((key) => Number(lastPoint[key] || 0) > 0);
    setVisibleLines(active.length ? active : allLines);
  };

  if (!currentCluster) return null;

  return (
    <div className="dashboard-panel consumer-lag-panel">
      <div className="panel-header consumer-lag-header">
        <div className="consumer-lag-heading">
          <div className="panel-title-with-info">
            <PanelInfo
              title="Группы потребителей"
              description="Показывает историю consumer lag по связке Consumer Group + Topic. Статус группы помогает сразу определить причину проблемы: Stable — группа работает; Rebalancing — идёт перераспределение; Empty — нет активных консьюмеров; Dead — группа удаляется."
            />
            <span>Группы потребителей</span>
          </div>

          <div className="consumer-status-help" aria-label="Обозначения статусов">
            {Object.values(STATUS_META).map((status) => (
              <span
                key={status.label}
                className={`consumer-status-help-item ${status.className}`}
                title={status.short}
              >
                <i />
                {status.label}
              </span>
            ))}
          </div>
        </div>
      
        <PanelFullscreenButton />
      </div>

      <div className="consumer-lag-content">
        <div className="consumer-lag-chart">
          {loading && chartData.length === 0 ? (
            <div className="consumer-lag-placeholder">Загрузка данных...</div>
          ) : allLines.length === 0 ? (
            <div className="consumer-lag-placeholder">
              Нет данных о группах и топиках за выбранный период
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 10, left: 0, bottom: 26 }}
                onClick={resetVisibleLines}
              >
                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="time"
                  height={35}
                  tickMargin={8}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[0, 'auto']}
                  padding={{ top: 12 }}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<LagTooltip />} />

                {visibleLines.map((lineKey) => {
                  const match = lineKey.match(/\((.*)\)$/);
                  const topic = match ? match[1] : lineKey;
                  const color = getTopicColor(topic, topicNames);

                  return (
                    <Line
                      key={lineKey}
                      type="monotone"
                      dataKey={lineKey}
                      name={lineKey}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1, fill: color }}
                      onMouseDown={(event) => handleLineSelect(lineKey, event)}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="consumer-lag-table-wrap">
          <div className="consumer-lag-table">
            <div className="consumer-lag-table-header">
              <span>Группа потребителей</span>
              <span>Топик</span>
              <span>Статус</span>
              <span>Лаг</span>
              <span>Изменение</span>
              <span>Последняя активность</span>
            </div>

            {rows.length ? (
              rows.map((row) => {
                const status = STATUS_META[row.status] || {
                  label: row.status || 'Unknown',
                  className: 'consumer-status-unknown',
                  short: 'состояние не определено'
                };

                const topicColor = getTopicColor(row.topic, topicNames);

                return (
                  <div
                    className="consumer-lag-table-row"
                    key={`${row.group}-${row.topic}`}
                  >
                    <span className="consumer-group-name">{row.group}</span>

                    <span
                      className="consumer-topic-name"
                      style={{ '--topic-color': topicColor }}
                    >
                      <i />
                      {row.topic}
                    </span>

                    <span className={`consumer-status-badge ${status.className}`}>
                      {status.label}
                    </span>

                    <span className="consumer-lag-value">
                      {formatLag(row.lag)}
                    </span>

                    <span
                      className={`consumer-lag-change ${
                        row.change > 0
                          ? 'lag-change-up'
                          : row.change < 0
                            ? 'lag-change-down'
                            : 'lag-change-flat'
                      }`}
                    >
                      {formatChange(row.change)}
                    </span>

                    <span className="consumer-last-activity">
                      {row.lastActivity || '—'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="consumer-lag-table-empty">
                Нет данных для таблицы
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
