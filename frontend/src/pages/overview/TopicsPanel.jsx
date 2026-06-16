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
 * Выбор топика в режиме "single-topic" осуществляется через поле поиска с лупой,
 * аналогично полю «Поиск топика» в панели поиска сообщений.
 */

import { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import Dropdown from '../../components/common/Dropdown';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import axios from 'axios';
import '../../styles/overview/topics-panel.css';
import { useCluster } from '../../contexts/ClusterContext';

// =========================================================================
// Компонент выбора топика с поиском (как в SearchToolbar)
// =========================================================================
const TopicSearchDropdown = ({
  topics,           // полный список топиков (массив строк)
  selectedTopic,    // текущий выбранный топик (строка)
  onSelect          // колбэк при выборе топика (принимает строку)
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Фильтрация топиков по поисковому запросу
  const filteredTopics = topics.filter(topic =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(''); // очищаем поиск при закрытии
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // При выборе топика
  const handleSelect = (topic) => {
    onSelect(topic);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Текст, отображаемый в поле (выбранный топик или пусто)
  const displayValue = selectedTopic || '';

  return (
    <div ref={wrapperRef} className="topic-dropdown-wrapper">
      <div
        className={`topic-dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <FiSearch className="topic-dropdown-search-icon" />
        <input
          type="text"
          className="topic-dropdown-input"
          placeholder="Поиск топика..."
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="topic-dropdown-chevron">
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>
      {isOpen && (
        <div className="topic-dropdown-menu">
          <div className="topic-dropdown-list">
            {filteredTopics.length > 0 ? (
              filteredTopics.map(topic => (
                <div
                  key={topic}
                  className={`topic-dropdown-item ${selectedTopic === topic ? 'active' : ''}`}
                  onClick={() => handleSelect(topic)}
                >
                  {topic}
                </div>
              ))
            ) : (
              <div className="topic-dropdown-item disabled">Ничего не найдено</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// Кастомный тултип – показывает только положительные значения
// =========================================================================
const TopicsTooltip = ({ active, payload, label }) => {
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
          {entry.name}: <strong>{entry.value} msg/s</strong>
        </div>
      ))}
    </div>
  );
};

// Генерация цвета для топика
const getTopicColor = (topic, index) => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#a855f7'
  ];
  return colors[index % colors.length];
};

export default function TopicsPanel() {
  const { currentCluster } = useCluster();
  const [viewMode, setViewMode] = useState('top-topics');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [visibleTopics, setVisibleTopics] = useState([]);
  const [topicsList, setTopicsList] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Загрузка данных с бэкенда
  // -------------------------------------------------------------------------
  const loadTopicsData = async () => {
    if (!currentCluster) return;
    setLoading(true);
    try {
      const headers = { 'X-Kafka-Bootstrap': currentCluster.brokers || currentCluster.bootstrapServers };
      const response = await axios.get('/api/overview/topics-throughput', { headers });
      const points = response.data.points || [];
      setRawData(points);
      const unique = [...new Set(points.map(p => p.topic))];
      setTopicsList(unique);
      if (unique.length > 0 && !selectedTopic) {
        setSelectedTopic(unique[0]);
        setVisibleTopics(unique);
      } else if (unique.length === 0) {
        setTopicsList([]);
        setVisibleTopics([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки данных топиков:', err);
      setRawData([]);
      setTopicsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopicsData();
  }, [currentCluster]);

  // -------------------------------------------------------------------------
  // Преобразование данных для графика
  // -------------------------------------------------------------------------
  const prepareChartData = () => {
    const timeMap = new Map();
    for (const point of rawData) {
      if (!timeMap.has(point.time)) {
        timeMap.set(point.time, { time: point.time });
      }
      const entry = timeMap.get(point.time);
      entry[point.topic] = point.value;
    }
    return Array.from(timeMap.values()).sort((a, b) => a.time.localeCompare(b.time));
  };

  const aggregatedData = prepareChartData();
  const lastPoint = aggregatedData.length > 0 ? aggregatedData[aggregatedData.length - 1] : {};

  // Активные топики (хотя бы одна точка > 0)
  const activeTopicsSet = new Set();
  for (const point of rawData) {
    if (point.value > 0) {
      activeTopicsSet.add(point.topic);
    }
  }
  const activeTopics = topicsList.filter(topic => activeTopicsSet.has(topic));
  const legendTopics = [...activeTopics].sort((a, b) =>
    (lastPoint[b] || 0) - (lastPoint[a] || 0)
  );

  const graphData =
    viewMode === 'single-topic'
      ? aggregatedData.map(item => ({
          time: item.time,
          [selectedTopic]: item[selectedTopic] || 0
        }))
      : aggregatedData;

  // -------------------------------------------------------------------------
  // Выпадающие меню
  // -------------------------------------------------------------------------
  const modeItems = [
    { id: 'top-topics', name: 'Топ топиков' },
    { id: 'single-topic', name: 'Выбрать топик' }
  ];
  const currentMode = modeItems.find(m => m.id === viewMode);

  const handleModeChange = (item) => {
    const mode = item.id;
    setViewMode(mode);
    setVisibleTopics(mode === 'top-topics' ? topicsList : [selectedTopic]);
  };

  // Обработчик выбора топика из кастомного компонента
  const handleTopicSelectFromDropdown = (topic) => {
    setSelectedTopic(topic);
    setVisibleTopics([topic]);
  };

  // -------------------------------------------------------------------------
  // Обработчики выбора линий (клик по линии/легенде/фону)
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
      setVisibleTopics(topicsList);
    } else {
      setVisibleTopics([topic]);
    }
  };

  const handleChartClick = () => {
    setVisibleTopics(topicsList);
  };

  // -------------------------------------------------------------------------
  // Состояния загрузки и пустых данных
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

  if (topicsList.length === 0 && !loading) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="topics-panel-title">Пропускная способность по топикам</div>
        </div>
        <div className="panel-body topics-placeholder">Нет данных о топиках</div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Рендер
  // -------------------------------------------------------------------------
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="topics-panel-header">
          <div className="topics-panel-title">Пропускная способность по топикам</div>
          <div className="topics-panel-controls">
            <Dropdown
              selectedItem={currentMode}
              items={modeItems.filter(item => item.id !== viewMode)}
              onSelect={handleModeChange}
            />
            {viewMode === 'single-topic' && (
              <TopicSearchDropdown
                topics={topicsList}
                selectedTopic={selectedTopic}
                onSelect={handleTopicSelectFromDropdown}
              />
            )}
          </div>
        </div>
      </div>

      <div className="panel-body">
        <div className="topics-layout">
          <div className="topics-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={graphData}
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

                {(
                  viewMode === 'single-topic'
                    ? [selectedTopic]
                    : topicsList
                )
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

          <div className="topics-legend">
            <div className="topics-legend-header">
              <span>Топик</span>
              <span>Сообщения/сек</span>
            </div>
            {legendTopics.length === 0 ? (
              <div className="topics-legend-placeholder">Нет активных топиков за выбранный период</div>
            ) : (
              legendTopics.map(topic => (
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
                      style={{ background: getTopicColor(topic, topicsList.indexOf(topic)) }}
                    />
                    <span>{topic}</span>
                  </div>
                  <span className="topics-legend-value">
                    {lastPoint[topic] || 0} msg/s
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