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

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// Устойчивый тултип – показывает только те линии, данные о которых есть в payload
function ThroughputTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const incomingItem = payload.find(p => p.dataKey === 'incoming');
  const outgoingItem = payload.find(p => p.dataKey === 'outgoing');

  return (
    <div className="throughput-tooltip">
      <div className="throughput-tooltip-title">Время: {label}</div>
      {incomingItem && (
        <div className="throughput-tooltip-row">
          Входящие сообщения: <strong>{incomingItem.value} msg/s</strong>
        </div>
      )}
      {outgoingItem && (
        <div className="throughput-tooltip-row">
          Исходящие сообщения: <strong>{outgoingItem.value} msg/s</strong>
        </div>
      )}
    </div>
  );
}

export default function ThroughputPanel({ data }) {
  const [showIncoming, setShowIncoming] = useState(true);
  const [showOutgoing, setShowOutgoing] = useState(true);

  const latestPoint = data?.[data.length - 1];

  // Клик по линии входящих – оставляем только входящие
  const handleIncomingClick = () => {
    if (showIncoming && !showOutgoing) return; // уже только входящие
    setShowIncoming(true);
    setShowOutgoing(false);
  };

  // Клик по линии исходящих – оставляем только исходящие
  const handleOutgoingClick = () => {
    if (!showIncoming && showOutgoing) return; // уже только исходящие
    setShowIncoming(false);
    setShowOutgoing(true);
  };

  // Клик по фону графика – показываем обе линии
  const handleChartClick = () => {
    if (showIncoming && showOutgoing) return; // уже обе
    setShowIncoming(true);
    setShowOutgoing(true);
  };

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
          </div>
        </div>
      </div>
      <div className="panel-body throughput-chart">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} onClick={handleChartClick}>
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
            />
            <Tooltip
              content={<ThroughputTooltip />}
              cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            {showIncoming && (
              <Line
                type="natural"
                dataKey="incoming"
                name="Входящие сообщения"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                onClick={handleIncomingClick}
                style={{ cursor: 'pointer' }}
              />
            )}
            {showOutgoing && (
              <Line
                type="natural"
                dataKey="outgoing"
                name="Исходящие сообщения"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                onClick={handleOutgoingClick}
                style={{ cursor: 'pointer' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}