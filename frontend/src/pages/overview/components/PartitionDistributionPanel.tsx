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
 * @fileoverview Кольцевая визуализация распределения партиций.
 *
 * Внешнее кольцо показывает здоровье партиций, внутреннее — роли реплик.
 * Показатели намеренно разделены на два кольца: лидер/фолловер и
 * healthy/under-replicated/offline не являются взаимоисключающими
 * категориями и поэтому не складываются в один общий процент.
 */

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import PanelInfo from '../../../components/common/PanelInfo';
import PanelFullscreenButton from './PanelFullscreenButton';

const ROLE_COLORS = ['#3b82f6', '#8b5cf6'];
const HEALTH_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const formatPercent = (value, total) =>
  total > 0 ? `${((value / total) * 100).toFixed(0)}%` : '0%';

function DistributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="partition-tooltip">
      <strong>{payload[0].payload.name}</strong>
      <span>{payload[0].value} реплик/партиций</span>
    </div>
  );
}

export default function PartitionDistributionPanel({ data }) {
  const total = data?.partitionsTotal || 0;
  const roleTotal = data?.replicasTotal || 0;

  const roleData = [
    { name: 'Лидер', value: data?.leaders || 0 },
    { name: 'Фолловер', value: data?.followers || 0 }
  ];

  const healthData = [
    { name: 'Синхронизированы', value: data?.healthy || 0 },
    { name: 'Under Replicated', value: data?.underReplicated || 0 },
    { name: 'Offline', value: data?.offline || 0 }
  ];

  const legend = [
    {
      name: 'Лидер',
      value: data?.leaders || 0,
      total: roleTotal,
      color: ROLE_COLORS[0]
    },
    {
      name: 'Фолловер',
      value: data?.followers || 0,
      total: roleTotal,
      color: ROLE_COLORS[1]
    },
    {
      name: 'Under Replicated',
      value: data?.underReplicated || 0,
      total,
      color: HEALTH_COLORS[1]
    },
    {
      name: 'Offline',
      value: data?.offline || 0,
      total,
      color: HEALTH_COLORS[2]
    }
  ];

  return (
    <div className="dashboard-panel partition-distribution-panel">
      <div className="panel-header">
        <div className="panel-title-with-info">
          <PanelInfo
            title="Распределение партиций"
            description="Внутреннее кольцо показывает роли реплик: Leader и Follower. Внешнее кольцо показывает здоровье партиций: синхронизированные, Under Replicated и Offline. Проценты ролей считаются от общего числа реплик, проценты здоровья — от числа партиций."
          />
          <span>Распределение партиций</span>
        </div>
      
        <PanelFullscreenButton />
      </div>

      <div className="partition-distribution-body">
        <div className="partition-donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<DistributionTooltip />} />

              <Pie
                data={healthData}
                dataKey="value"
                nameKey="name"
                innerRadius="67%"
                outerRadius="94%"
                paddingAngle={1}
                stroke="none"
              >
                {healthData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      entry.name === 'Синхронизированы'
                        ? HEALTH_COLORS[0]
                        : entry.name === 'Under Replicated'
                          ? HEALTH_COLORS[1]
                          : HEALTH_COLORS[2]
                    }
                  />
                ))}
              </Pie>

              <Pie
                data={roleData}
                dataKey="value"
                nameKey="name"
                innerRadius="42%"
                outerRadius="63%"
                paddingAngle={1}
                stroke="none"
              >
                {roleData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === 'Лидер' ? ROLE_COLORS[0] : ROLE_COLORS[1]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="partition-donut-center">
            <strong>{total}</strong>
            <span>Кол-во</span>
          </div>
        </div>

        <div className="partition-legend">
          {legend.map((item) => (
            <div className="partition-legend-row" key={item.name}>
              <span className="partition-legend-name">
                <i style={{ background: item.color }} />
                {item.name}
              </span>
              <strong>{formatPercent(item.value, item.total)}</strong>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
