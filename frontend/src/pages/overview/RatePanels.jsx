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
 * @fileoverview Компактные панели Consumer rate и Producer rate.
 *
 * Используют тот же поток метрик throughput, поэтому новых запросов
 * к Kafka не создают и не дублируют данные существующего графика.
 */

import PanelInfo from '../../components/common/PanelInfo';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function RateTooltip({ active, payload, label, title }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rate-tooltip">
      <strong>{label}</strong>
      <span>{title}: {Number(payload[0].value || 0).toFixed(1)} msg/s</span>
    </div>
  );
}

function RateChart({ title, description, data, dataKey, className, unitLabel }) {
  const latest = data?.length ? data[data.length - 1]?.[dataKey] : 0;
  const chartData = data?.length ? data : [{ time: '—', [dataKey]: 0 }];

  return (
    <div className={`dashboard-panel rate-panel ${className}`}>
      <div className="panel-header rate-panel-header">
        <div className="panel-title-with-info">
          <PanelInfo title={title} description={description} />
          <span>{title}</span>
        </div>
        <strong>{Number(latest || 0).toFixed(1)} {unitLabel}</strong>
      </div>

      <div className="rate-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 4 }}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              height={24}
              minTickGap={24}
            />
            <YAxis
              width={38}
              domain={[0, 'auto']}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<RateTooltip title={title} />}
              cursor={{ stroke: 'var(--accent-color)', strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={className === 'consumer-rate' ? '#3b82f6' : '#8b5cf6'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function RatePanels({ data }) {
  return (
    <>
      <RateChart
        title="Consumer rate"
        description="Скорость чтения сообщений потребителями из Kafka. Показывает фактический исходящий поток сообщений из кластера за выбранный период."
        data={data}
        dataKey="outgoing"
        className="consumer-rate"
        unitLabel="msg/s"
      />
      <RateChart
        title="Producer rate"
        description="Скорость записи сообщений производителями в Kafka. Показывает фактический входящий поток сообщений в кластер за выбранный период."
        data={data}
        dataKey="incoming"
        className="producer-rate"
        unitLabel="msg/s"
      />
    </>
  );
}
