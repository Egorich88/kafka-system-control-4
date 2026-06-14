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
 * ============================================================================
 * TopicsPanel
 * ============================================================================
 *
 * Панель отображения пропускной способности топиков Kafka.
 *
 * Текущая версия:
 *
 * - реализует каркас панели
 * - реализует режимы отображения
 * - реализует выбор метрики
 *
 * Реальные данные будут подключены позже.
 *
 * Поддерживаемые режимы:
 *
 * 1. Top Topics
 *    Показывает самые активные топики кластера.
 *
 * 2. Single Topic
 *    Показывает один выбранный топик.
 *
 * Поддерживаемые метрики:
 *
 * - Сообщения/сек
 * - Байты/сек
 *
 * ============================================================================
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

export default function TopicsPanel() {

  /* Режим отображения панели.  top-topics single-topic */
  const [viewMode, setViewMode] = useState('top-topics');

  /* Выбранный топик. Позже список будет загружаться из Kafka. Сейчас используется временный набор данных. */
  const [selectedTopic, setSelectedTopic] = useState('orders');

  /* Временные данные. */
  const mockTopics = [ 'orders', 'payments', 'notifications', 'audit' ];

  const [visibleTopics, setVisibleTopics] = useState(mockTopics);

  /* Временные данные графика. Будут заменены данными Kafka API. */
    const mockData = [
      {
        time: '12:00',
        orders: 1200,
        payments: 850,
        notifications: 600,
        audit: 300
      },
      {
        time: '12:05',
        orders: 1500,
        payments: 900,
        notifications: 700,
        audit: 350
      },
      {
        time: '12:10',
        orders: 1800,
        payments: 1100,
        notifications: 900,
        audit: 500
      },
      {
        time: '12:15',
        orders: 1600,
        payments: 1200,
        notifications: 850,
        audit: 400
      }
    ];

    /* Цвет топиков */
    const topicColors = {
      orders: '#3b82f6',
      payments: '#8b5cf6',
      notifications: '#22c55e',
      audit: '#f59e0b'
    };

    /* Создаем данные для графика */
    const chartData =
      viewMode === 'single-topic'
        ? mockData.map(item => ({
            time: item.time,
            [selectedTopic]: item[selectedTopic]
          }))
        : mockData;

    /* Показывает только выбранный топик. */
    const handleTopicClick = (topic) => {

      if (
        visibleTopics.length === 1 &&
        visibleTopics[0] === topic
      ) {
        return;
      }

      setVisibleTopics([topic]);

    };

    /* Показывает все топики. */
    const handleChartClick = () => {

      if (
        visibleTopics.length === mockTopics.length
      ) {
        return;
      }

      setVisibleTopics(mockTopics);

    };

  return (
    <div className="dashboard-panel">

      {/* Заголовок панели */}
      <div className="panel-header">

        <div className="topics-panel-header">

          <div className="topics-panel-title">
            Пропускная способность по топикам
          </div>

          <div className="topics-panel-controls">

            {/* ==========================================
                Выбор режима отображения
            ========================================== */}
            <select
              className="topics-select"
              value={viewMode}
              onChange={(event) => setViewMode(event.target.value)}
            >
              <option value="top-topics">
                Топ топиков
              </option>

              <option value="single-topic">
                Выбрать топик
              </option>
            </select>

            {/* ==========================================
                Выбор конкретного топика.
                Показывается только в режиме Выбрать топик.
            ========================================== */}
            {viewMode === 'single-topic' && (
              <select
                className="topics-select"
                value={selectedTopic}
                onChange={(event) => setSelectedTopic(event.target.value)}
              >
                {mockTopics.map(topic => (
                  <option
                    key={topic}
                    value={topic}
                  >
                    {topic}
                  </option>
                ))}
              </select>
            )}

          </div>

        </div>

      </div>

      {/* ==========================================================
          Тело панели
      ========================================================== */}
      <div className="panel-body">

        <div className="topics-layout">

          <div className="topics-chart">

            <ResponsiveContainer width="100%" height={320}>

              <LineChart
                data={chartData}
                onClick={handleChartClick}
              >

                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="time"
                  tick={{ fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                {(
                   viewMode === 'single-topic'
                     ? [selectedTopic]
                     : mockTopics
                 )
                 .filter(
                   topic => visibleTopics.includes(topic)
                 )
                 .map(topic => (
                   <Line
                     key={topic}
                     type="natural"
                     dataKey={topic}
                     stroke={topicColors[topic]}
                     strokeWidth={2}
                     dot={false}
                     activeDot={{
                       r: 5,
                       stroke: '#ffffff',
                       strokeWidth: 2,
                       fill: topicColors[topic]
                     }}
                     onClick={() => handleTopicClick(topic)}
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

            {[...mockTopics]
              .sort(
                (a, b) =>
                  mockData[mockData.length - 1][b] -
                  mockData[mockData.length - 1][a]
              )
              .map(topic => (

              <div
                key={topic}
                className={`topics-legend-row ${
                  visibleTopics.length === 1 &&
                  visibleTopics[0] === topic
                    ? 'active'
                    : ''
                }`}
                onClick={() => handleTopicClick(topic)}
              >

                <div className="topics-legend-left">

                  <span
                    className="topics-legend-color"
                    style={{
                      background: topicColors[topic]
                    }}
                  />

                  <span>{topic}</span>

                </div>

                <span className="topics-legend-value">
                  {mockData[mockData.length - 1][topic]} msg/s
                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}