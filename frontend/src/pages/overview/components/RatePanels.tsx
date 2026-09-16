/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

/**
 * @file RatePanels.tsx
 * Единая панель Consumer / Producer rate с двумя линиями.
 */

import PanelInfo from '../../../components/common/PanelInfo';
import PanelFullscreenButton from './PanelFullscreenButton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props { data: any[]; }

function RateTooltip({ active, payload, label }: any): JSX.Element | null {
  if (!active || !payload?.length) return null;
  return (
    <div className="rate-tooltip">
      <strong>{label}</strong>
      {payload.map((item: any) => (
        <span key={item.dataKey}>{item.dataKey === 'outgoing' ? 'Consumer rate' : 'Producer rate'}: {Number(item.value || 0).toFixed(1)} msg/s</span>
      ))}
    </div>
  );
}

export default function RatePanels({ data }: Props): JSX.Element {
  const latest = data?.[data.length - 1];
  const chartData = data?.length ? data : [{ time: '—', incoming: 0, outgoing: 0 }];

  return (
    <div className="dashboard-panel rate-panel combined-rate-panel">
      <div className="panel-header rate-panel-header">
        <div className="panel-title-with-info">
          <PanelInfo
            title="Consumer / Producer rate"
            description="Скорость чтения и записи сообщений Kafka. Consumer rate показывает исходящий поток, Producer rate — входящий поток."
          />
          <span>Consumer / Producer rate</span>
        </div>
        <div className="rate-current-values">
          <span>Consumer: {Number(latest?.outgoing || 0).toFixed(1)} msg/s</span>
          <span>Producer: {Number(latest?.incoming || 0).toFixed(1)} msg/s</span>
        </div>
        <PanelFullscreenButton />
      </div>
      <div className="rate-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 2 }}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} height={22} minTickGap={24} />
            <YAxis width={38} domain={[0, 'auto']} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<RateTooltip />} cursor={{ stroke: 'var(--accent-color)', strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="outgoing" name="Consumer rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="incoming" name="Producer rate" stroke="#8b5cf6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
