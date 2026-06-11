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

/*=========================================================================
            ПАНЕЛЬ ПРОПУСКНОЙ СПОСОБНОСТИ KAFKA-КЛАСТЕРА

    Отображает:
        * входящий поток сообщений
        * исходящий поток сообщений
        * график нагрузки

    Временной диапазон выбирается через панель управления Dashboard.
    В дальнейшем данные будут поступать из Kafka Monitoring API
============================================================================ */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

/* Tooltip остаётся без изменений */
function ThroughputTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="throughput-tooltip">
      <div className="throughput-tooltip-title">Время: {label}</div>
      <div className="throughput-tooltip-row">
        Входящие сообщения: <strong>{payload[0].value} msg/s</strong>
      </div>
      <div className="throughput-tooltip-row">
        Исходящие сообщения: <strong>{payload[1].value} msg/s</strong>
      </div>
    </div>
  );
}

export default function ThroughputPanel({
  data,                // массив точек { time, incoming, outgoing }
  showIncoming,
  showOutgoing,
  onToggleIncoming,
  onToggleOutgoing
}) {
  // последняя точка для отображения текущих значений
  const latestPoint = data?.[data.length - 1];

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="throughput-header-info">
          <div className="throughput-title">Пропускная способность кластера</div>
          <div className="throughput-current-values">
            <span className="incoming-value">
              Входящие: {latestPoint?.incoming ?? 0} msg/s
            </span>
            <span className="outgoing-value">
              Исходящие: {latestPoint?.outgoing ?? 0} msg/s
            </span>
            {/* Переключатели линий */}
            <div className="throughput-toggles">
              <button
                className={showIncoming ? 'toggle-button active' : 'toggle-button'}
                onClick={onToggleIncoming}
              >
                Входящие
              </button>
              <button
                className={showOutgoing ? 'toggle-button active' : 'toggle-button'}
                onClick={onToggleOutgoing}
              >
                Исходящие
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="panel-body throughput-chart">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="4 4" />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ThroughputTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
            {showIncoming && (
              <Line type="natural" dataKey="incoming" name="Входящие сообщения" stroke="#3b82f6" strokeWidth={2} dot={false} />
            )}
            {showOutgoing && (
              <Line type="natural" dataKey="outgoing" name="Исходящие сообщения" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
