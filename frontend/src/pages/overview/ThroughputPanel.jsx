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
 * @fileoverview Панель пропускной способности Kafka-кластера.
 * Отображает график входящих и исходящих сообщений.
 * Управление линиями: клик по линии – оставить только её,
 * клик по фону графика – показать обе линии.
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

function ThroughputTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const incomingItem = payload.find(p => p.dataKey === 'incoming');
  const outgoingItem = payload.find(p => p.dataKey === 'outgoing');

  return (
    <div className="throughput-tooltip">
      <div className="throughput-tooltip-title">Время: {label}</div>
      {incomingItem && (
        <div className="throughput-tooltip-row" style={{ color: '#3b82f6' }}>
          Входящие сообщения: <strong>{incomingItem.value} msg/s</strong>
        </div>
      )}
      {outgoingItem && (
        <div className="throughput-tooltip-row" style={{ color: '#8b5cf6' }}>
          Исходящие сообщения: <strong>{outgoingItem.value} msg/s</strong>
        </div>
      )}
    </div>
  );
}

export default function ThroughputPanel({ data }) {
  const [showIncoming, setShowIncoming] = useState(true);
  const [showOutgoing, setShowOutgoing] = useState(true);

  const latestPoint = data?.length ? data[data.length - 1] : null;

  const handleIncomingClick = () => {
    if (showIncoming && !showOutgoing) return;
    setShowIncoming(true);
    setShowOutgoing(false);
  };

  const handleOutgoingClick = () => {
    if (!showIncoming && showOutgoing) return;
    setShowIncoming(false);
    setShowOutgoing(true);
  };

  const handleChartClick = () => {
    if (showIncoming && showOutgoing) return;
    setShowIncoming(true);
    setShowOutgoing(true);
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-header throughput-header">
        <div className="throughput-title">
          Пропускная способность кластера
        </div>
        <div className="throughput-current-values">
          <span className="incoming-value">
            Входящие: {latestPoint?.incoming?.toFixed(1) ?? 0} msg/s
          </span>
          <span className="outgoing-value">
            Исходящие: {latestPoint?.outgoing?.toFixed(1) ?? 0} msg/s
          </span>
        </div>
      </div>

      <div className="panel-body throughput-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 30
            }}
            onClick={handleChartClick}
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

            <YAxis
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]}
              padding={{ top: 20 }}
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
                type="monotone"
                dataKey="incoming"
                name="Входящие сообщения"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#3b82f6' }}
                onClick={handleIncomingClick}
                style={{ cursor: 'pointer' }}
              />
            )}

            {showOutgoing && (
              <Line
                type="monotone"
                dataKey="outgoing"
                name="Исходящие сообщения"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#8b5cf6' }}
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