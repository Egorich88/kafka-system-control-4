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
 * Режимы:
 *   - "Топ топиков" – отображает несколько топиков (можно выбирать через клики и Ctrl).
 *   - "Выбрать топик" – показывает график только одного выбранного топика.
 *
 * Управление отображением линий:
 *   - Обычный клик по линии или строке → оставить только этот топик.
 *   - Если топик уже единственный → вернуть все топики.
 *   - Клик по пустому месту графика → вернуть все топики.
 *   - Ctrl + клик (мышь) → добавить/удалить топик к текущему набору (мультивыбор).
 *
 * Всплывающая подсказка (тултип) стилизована аналогично ThroughputPanel:
 *   - Отображает время и значения всех видимых топиков.
 *   - При наведении на график появляется вертикальная пунктирная синяя линия.
 *
 * Данные сейчас моковые, в будущем заменяются реальными метриками Kafka API.
 */

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import '../../styles/overview/topics-panel.css';

const MOCK_TOPICS = ['orders', 'payments', 'notifications', 'audit'];

const TOPIC_COLORS = {
  orders: '#3b82f6',
  payments: '#8b5cf6',
  notifications: '#22c55e',
  audit: '#f59e0b'
};

const MOCK_CHART_DATA = [
  { time: '12:00', orders: 1200, payments: 850, notifications: 600, audit: 300 },
  { time: '12:05', orders: 1500, payments: 900, notifications: 700, audit: 350 },
  { time: '12:10', orders: 1800, payments: 1100, notifications: 900, audit: 500 },
  { time: '12:15', orders: 1600, payments: 1200, notifications: 850, audit: 400 }
];

// =========================================================================
// Кастомный тултип (как в ThroughputPanel)
// =========================================================================
const TopicsTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="topics-tooltip">
      <div className="topics-tooltip-title">Время: {label}</div>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="topics-tooltip-row"
          style={{ color: entry.color || 'var(--text-primary)' }}
        >
          {entry.name}: <strong>{entry.value} msg/s</strong>
        </div>
      ))}
    </div>
  );
};

export default function TopicsPanel() {
  const [viewMode, setViewMode] = useState('top-topics');
  const [selectedTopic, setSelectedTopic] = useState('orders');
  const [visibleTopics, setVisibleTopics] = useState(MOCK_TOPICS);

  // -------------------------------------------------------------------------
  // Универсальный обработчик для выбора топика (линия / легенда)
  // -------------------------------------------------------------------------
  const handleTopicSelect = (topic, event) => {
    if (event && event.stopPropagation) event.stopPropagation();

    if (event && event.ctrlKey) {
      setVisibleTopics(prev =>
        prev.includes(topic)
          ? prev.filter(t => t !== topic)
          : [...prev, topic]
      );
      return;
    }

    if (visibleTopics.length === 1 && visibleTopics[0] === topic) {
      setVisibleTopics(MOCK_TOPICS);
    } else {
      setVisibleTopics([topic]);
    }
  };

  // -------------------------------------------------------------------------
  // Клик по пустому месту графика – возвращаем все топики
  // -------------------------------------------------------------------------
  const handleChartClick = () => {
    setVisibleTopics(MOCK_TOPICS);
  };

  const chartData =
    viewMode === 'single-topic'
      ? MOCK_CHART_DATA.map(item => ({
          time: item.time,
          [selectedTopic]: item[selectedTopic]
        }))
      : MOCK_CHART_DATA;

  const sortedTopics = [...MOCK_TOPICS].sort(
    (a, b) =>
      MOCK_CHART_DATA[MOCK_CHART_DATA.length - 1][b] -
      MOCK_CHART_DATA[MOCK_CHART_DATA.length - 1][a]
  );

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="topics-panel-header">
          <div className="topics-panel-title">Пропускная способность по топикам</div>
          <div className="topics-panel-controls">
            <select
              className="topics-select"
              value={viewMode}
              onChange={(e) => {
                const mode = e.target.value;
                setViewMode(mode);
                setVisibleTopics(mode === 'top-topics' ? MOCK_TOPICS : [selectedTopic]);
              }}
            >
              <option value="top-topics">Топ топиков</option>
              <option value="single-topic">Выбрать топик</option>
            </select>

            {viewMode === 'single-topic' && (
              <select
                className="topics-select"
                value={selectedTopic}
                onChange={(e) => {
                  const topic = e.target.value;
                  setSelectedTopic(topic);
                  setVisibleTopics([topic]);
                }}
              >
                {MOCK_TOPICS.map(topic => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="panel-body">
        <div className="topics-layout">
          <div className="topics-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={chartData}
                onClick={handleChartClick}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              >
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="4 4" />
                <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
                <Tooltip content={<TopicsTooltip />} />

                {(
                  viewMode === 'single-topic'
                    ? [selectedTopic]
                    : MOCK_TOPICS
                )
                  .filter(topic => visibleTopics.includes(topic))
                  .map(topic => (
                    <Line
                      key={topic}
                      type="natural"
                      dataKey={topic}
                      stroke={TOPIC_COLORS[topic]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: TOPIC_COLORS[topic] }}
                      onMouseDown={(e) => handleTopicSelect(topic, e)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="topics-legend">
            <div className="topics-legend-header">
              <span>Топик</span>
              <span>Сообщения/сек</span>
            </div>
            {sortedTopics.map(topic => (
              <div
                key={topic}
                className={`topics-legend-row ${
                  visibleTopics.length === 1 && visibleTopics[0] === topic ? 'active' : ''
                }`}
                onClick={(e) => handleTopicSelect(topic, e)}
              >
                <div className="topics-legend-left">
                  <span className="topics-legend-color" style={{ background: TOPIC_COLORS[topic] }} />
                  <span>{topic}</span>
                </div>
                <span className="topics-legend-value">
                  {MOCK_CHART_DATA[MOCK_CHART_DATA.length - 1][topic]} msg/s
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}