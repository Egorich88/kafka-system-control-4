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
 *
 * КЛЮЧЕВОЕ ОТЛИЧИЕ: каждая линия на графике = группа + топик.
 * Это позволяет видеть lag по каждому топику в отдельности,
 * а не суммарный lag по всей группе.
 *
 * Пример: если группа consumer-group-1 читает топики A, B, C,
 * то на графике будет 3 линии:
 *   - consumer-group-1 (topic-A)
 *   - consumer-group-1 (topic-B)
 *   - consumer-group-1 (topic-C)
 *
 * Это даёт максимальную прозрачность и упрощает отладку.
 *
 * Управление видимостью линий:
 *   - Клик по строке легенды → оставить только эту линию.
 *   - Повторный клик на единственной линии → вернуть все активные линии.
 *   - Клик по пустому месту графика → вернуть все активные линии.
 *   - Ctrl + клик → добавить/удалить линию из текущего набора (мультивыбор).
 *
 * Структура легенды:
 *   - Цветной кружок (индикатор линии графика)
 *   - Название: группа (топик)
 *   - Текущее значение lag справа
 */
import PanelInfo from '../../components/common/PanelInfo';
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
import { useCluster } from '../../contexts/ClusterContext';

// =========================================================================
// 1. КАСТОМНЫЙ ТУЛТИП ДЛЯ ГРАФИКА
// =========================================================================

/**
 * Тултип отображается при наведении на график.
 * Показывает время и значения lag для каждой линии.
 * Фильтрует нулевые значения для чистоты отображения.
 */
const LagTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  // Отфильтровываем нулевые значения
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

// =========================================================================
// 2. ГЕНЕРАЦИЯ ЦВЕТОВ ДЛЯ ЛИНИЙ
// =========================================================================

/**
 * Генерирует цвет для линии на основе индекса.
 * Используется предопределённая палитра для консистентности.
 *
 * @param {string} key - Ключ линии (группа + топик)
 * @param {number} index - Порядковый номер в списке
 * @returns {string} HEX-цвет
 */
const getLineColor = (key, index) => {
  const colors = [
    '#3b82f6', // Синий
    '#8b5cf6', // Фиолетовый
    '#22c55e', // Зелёный
    '#f59e0b', // Жёлтый
    '#ef4444', // Красный
    '#06b6d4', // Бирюзовый
    '#ec4899', // Розовый
    '#84cc16', // Салатовый
    '#f97316', // Оранжевый
    '#a855f7', // Пурпурный
    '#14b8a6', // Изумрудный
    '#f472b6', // Светло-розовый
  ];
  return colors[index % colors.length];
};

// =========================================================================
// 3. ОСНОВНОЙ КОМПОНЕНТ
// =========================================================================

export default function ConsumerLagPanel({ timeRange = '15m', refreshKey }) {
  const { currentCluster } = useCluster();

  // ===== Состояния компонента =====
  const [visibleLines, setVisibleLines] = useState([]); // Активные линии (группа+топик)
  const [allLines, setAllLines] = useState([]); // Все доступные линии
  const [rawData, setRawData] = useState([]); // Сырые данные с бэкенда
  const [loading, setLoading] = useState(false);

  // ===== Загрузка данных с бэкенда =====
  const loadConsumerLagData = async () => {
    if (!currentCluster) return;
    setLoading(true);

    try {
      const headers = {
        'X-Kafka-Bootstrap': currentCluster.brokers || currentCluster.bootstrapServers
      };

      const response = await axios.get(
        `/api/overview/consumer-lag?range=${timeRange}`,
        { headers }
      );

      const points = response.data.points || [];

      // Обезопашиваем данные (убираем отрицательные значения)
      const safePoints = points.map(p => ({
        ...p,
        value: Math.max(0, p.value || 0)
      }));

      setRawData(safePoints);

      // ===== КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: формируем линии =====
      // Каждая линия = группа (топик)
      // Собираем все уникальные комбинации группа+топик
      const lineSet = new Set();
      const lineTopicsMap = {}; // Для хранения топиков по группам (для отображения)

      for (const point of safePoints) {
        if (point.topics && typeof point.topics === 'object') {
          // Для каждой точки данных перебираем топики
          Object.keys(point.topics).forEach(topic => {
            // Формируем ключ: группа (топик)
            const lineKey = `${point.group} (${topic})`;
            lineSet.add(lineKey);

            // Сохраняем информацию о группе и топике
            if (!lineTopicsMap[lineKey]) {
              lineTopicsMap[lineKey] = {
                group: point.group,
                topic: topic,
                displayName: lineKey
              };
            }
          });
        }
      }

      // Преобразуем Set в массив и сортируем для стабильности
      const uniqueLines = Array.from(lineSet).sort();
      setAllLines(uniqueLines);

      // Определяем активные линии (с положительным lag в последней точке)
      const activeSet = new Set();

      // Находим последнюю точку времени
      const lastTime = safePoints.length > 0
        ? safePoints[safePoints.length - 1].time
        : null;

      if (lastTime) {
        // Берём только последние данные
        const lastPoints = safePoints.filter(p => p.time === lastTime);

        for (const point of lastPoints) {
          if (point.topics && typeof point.topics === 'object') {
            Object.keys(point.topics).forEach(topic => {
              const value = point.topics[topic] || 0;
              if (value > 0) {
                const lineKey = `${point.group} (${topic})`;
                activeSet.add(lineKey);
              }
            });
          }
        }
      }

      // Если есть активные линии - показываем их, иначе все
      const initialVisible = activeSet.size > 0
        ? Array.from(activeSet).sort()
        : uniqueLines;

      setVisibleLines(initialVisible);

    } catch (err) {
      console.error('Ошибка загрузки данных consumer lag:', err);
      setRawData([]);
      setAllLines([]);
      setVisibleLines([]);
    } finally {
      setLoading(false);
    }
  };

  // Перезагружаем при смене кластера, периода или обновлении
  useEffect(() => {
    loadConsumerLagData();
  }, [currentCluster, timeRange, refreshKey]);

  // ===== Подготовка данных для Recharts =====
  // Группируем данные по времени, создавая объект { time, lineKey1: value, lineKey2: value, ... }
  const prepareChartData = useMemo(() => {
    const timeMap = new Map();

    for (const point of rawData) {
      if (!point.topics || typeof point.topics !== 'object') continue;

      // Для каждой точки времени
      if (!timeMap.has(point.time)) {
        timeMap.set(point.time, { time: point.time });
      }

      const entry = timeMap.get(point.time);

      // Для каждого топика в точке
      Object.keys(point.topics).forEach(topic => {
        const lineKey = `${point.group} (${topic})`;
        const value = Math.max(0, point.topics[topic] || 0);
        entry[lineKey] = value;
      });
    }

    // Сортируем по времени
    return Array.from(timeMap.values())
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [rawData]);

  // Получаем последнюю точку для отображения значений в легенде
  const lastPoint = prepareChartData.length > 0
    ? prepareChartData[prepareChartData.length - 1]
    : {};

  // ===== Обработчики кликов =====

  /**
   * Обработчик клика по строке легенды
   * - Обычный клик: оставить только эту линию
   * - Ctrl+клик: добавить/удалить линию из набора
   * - Повторный клик на единственной линии: вернуть все активные
   */
  const handleLineSelect = (lineKey, event) => {
    if (event && event.stopPropagation) event.stopPropagation();

    // Ctrl + клик: мультивыбор
    if (event && event.ctrlKey) {
      setVisibleLines(prev =>
        prev.includes(lineKey)
          ? prev.filter(key => key !== lineKey)
          : [...prev, lineKey]
      );
      return;
    }

    // Если линия уже одна и кликаем по ней - возвращаем все активные
    if (visibleLines.length === 1 && visibleLines[0] === lineKey) {
      // Находим все линии с положительным lag в последней точке
      const activeSet = new Set();
      for (const key of allLines) {
        const value = lastPoint[key] || 0;
        if (value > 0) {
          activeSet.add(key);
        }
      }
      setVisibleLines(activeSet.size > 0 ? Array.from(activeSet).sort() : allLines);
    } else {
      // Обычный клик: оставляем только эту линию
      setVisibleLines([lineKey]);
    }
  };

  /**
   * Обработчик клика по фону графика
   * Возвращает все активные линии
   */
  const handleChartClick = () => {
    const activeSet = new Set();
    for (const key of allLines) {
      const value = lastPoint[key] || 0;
      if (value > 0) {
        activeSet.add(key);
      }
    }
    setVisibleLines(activeSet.size > 0 ? Array.from(activeSet).sort() : allLines);
  };

  // ===== Состояния загрузки =====
  if (!currentCluster) return null;

  if (loading && rawData.length === 0) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
            <div className="topics-panel-title">
                <PanelInfo
                    title="Отставание групп потребителей"
                    description="Показывает consumer lag — разницу между последним доступным сообщением в Kafka и текущей позицией consumer group. Значение помогает определить, успевают ли потребители обрабатывать поток сообщений и где возникает накопление необработанных данных."
                />

                <span>
                    Отставание групп потребителей
                </span>
            </div>
        </div>
        <div className="panel-body topics-placeholder">⏳ Загрузка данных...</div>
      </div>
    );
  }

  if (allLines.length === 0 && !loading) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="topics-panel-title">
            <PanelInfo
              title="Отставание групп потребителей"
              description="Показывает consumer lag — разницу между последним доступным сообщением в Kafka и текущей позицией consumer group. Значение помогает определить, успевают ли потребители обрабатывать поток сообщений и где возникает накопление необработанных данных."
            />

            <span>
              Отставание групп потребителей
            </span>
          </div>
        </div>

        <div className="panel-body topics-placeholder">
          Нет данных о группах и топиках за выбранный период
        </div>
      </div>
    );
  }

  // ===== Рендер компонента =====
  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="topics-panel-title">
          <PanelInfo
            title="Отставание групп потребителей"
            description="Показывает consumer lag — разницу между последним доступным сообщением в Kafka и текущей позицией consumer group. Значение помогает определить, успевают ли потребители обрабатывать поток сообщений и где возникает накопление необработанных данных."
          />

          <span>
            Отставание групп потребителей
          </span>
        </div>
      </div>

      <div className="panel-body">
        <div className="topics-layout">

          {/* ===== ГРАФИК ===== */}
          <div className="topics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={prepareChartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 30
                }}
                onClick={handleChartClick}
                cursor={{
                  stroke: '#3b82f6',
                  strokeWidth: 1,
                  strokeDasharray: '4 4'
                }}
              >
                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="time"
                  height={45}
                  tickMargin={10}
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  domain={[0, 'auto']}
                  padding={{ top: 20 }}
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<LagTooltip />} />

                {/* ===== ОТРИСОВКА ЛИНИЙ ===== */}
                {/* Каждая линия = группа (топик) */}
                {allLines
                  .filter(lineKey => visibleLines.includes(lineKey))
                  .map((lineKey, idx) => {
                    const color = getLineColor(lineKey, idx);
                    return (
                      <Line
                        key={lineKey}
                        type="monotone"
                        dataKey={lineKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 5,
                          stroke: '#fff',
                          strokeWidth: 2,
                          fill: color
                        }}
                        onMouseDown={(e) => handleLineSelect(lineKey, e)}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ===== ЛЕГЕНДА ===== */}
          <div className="topics-legend">
            <div className="topics-legend-header">
              <span>Группа (топик)</span>
              <span>Отставание</span>
            </div>

            {visibleLines.length === 0 ? (
              <div className="topics-legend-placeholder">
                Нет активных линий для отображения
              </div>
            ) : (
              visibleLines.map((lineKey, idx) => {
                const color = getLineColor(lineKey, idx);
                const value = lastPoint[lineKey] || 0;

                return (
                  <div
                    key={lineKey}
                    className={`topics-legend-row ${
                      visibleLines.length === 1 && visibleLines[0] === lineKey
                        ? 'active'
                        : ''
                    }`}
                    onClick={(e) => handleLineSelect(lineKey, e)}
                  >
                    <div className="topics-legend-left">
                      {/* Цветной индикатор */}
                      <span
                        className="topics-legend-color-dot"
                        style={{
                          background: color,
                          boxShadow: `0 0 6px ${color}40`
                        }}
                      />
                      {/* Название: группа (топик) */}
                      <span className="topics-legend-line-name">
                        {lineKey}
                      </span>
                    </div>
                    {/* Значение lag */}
                    <span className="topics-legend-value">
                      {value.toFixed(1)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}